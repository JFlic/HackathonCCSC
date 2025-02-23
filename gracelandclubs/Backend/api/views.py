import os
import io
import json
import sqlite3
import torch
import re
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import make_password
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from urllib.parse import unquote_plus
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, BitsAndBytesConfig
from api.models import User, Clubs, Event
from .serializers import RegisterSerializer, EventSerializer, LoginSerializer, UserSerializer
from django.db.utils import IntegrityError
from rest_framework import generics
from django.shortcuts import get_object_or_404
import docx
from PyPDF2 import PdfReader

# --- Utility Functions ---
def get_tokens_for_user(user):
    """Generate JWT tokens for authentication."""
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}

def fetch_data_from_sql(query, db_path):
    """Execute a SQL query and return structured results."""
    try:
        if not os.path.exists(db_path):
            return {"error": "Database file not found."}
        
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            rows = cursor.fetchall()
            columns = [description[0] for description in cursor.description]
        
        return {"columns": columns, "data": rows}
    
    except sqlite3.Error as e:
        return {"error": f"SQL Error: {str(e)}"}
    except Exception as e:
        return {"error": f"General Error: {str(e)}"}

# --- AI Model Setup ---
class ModelLoader:
    """Lazily load the AI model and tokenizer to save memory."""
    model = None
    tokenizer = None

    @classmethod
    def get_model(cls):
        if cls.model is None or cls.tokenizer is None:
            try:
                cls.tokenizer = AutoTokenizer.from_pretrained(settings.MODEL_DIRECTORY)
                cls.model = AutoModelForSeq2SeqLM.from_pretrained(
                    settings.MODEL_DIRECTORY,
                    device_map='auto'
                )
            except Exception as e:
                raise ImportError(f"Could not load AI model: {str(e)}")
        return cls.model, cls.tokenizer

# --- Django API Views ---
class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    def create(self, request, *args, **kwargs):
        """Handle POST request to create an event"""
        club_name = self.kwargs.get("club_name")
        club = get_object_or_404(Clubs, name=club_name)

        event_data = request.data.copy()
        event_data["club"] = club.id  # ✅ Associate event with correct club

        serializer = self.get_serializer(data=event_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get_queryset(self):
        """Filter events by club, year, and month"""
        club_name = self.kwargs.get("club_name")  # ✅ Extract club_name from URL
        year = self.kwargs.get("year")
        month = self.kwargs.get("month")

        # Get the club by name
        club = get_object_or_404(Clubs, name=club_name)

        # Filter events for the specified club, year, and month
        return Event.objects.filter(club=club, date__year=year, date__month=month)

    def get(self, request, *args, **kwargs):
        """Handle GET request with correct arguments"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ClubMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, club_name):
        """Fetch all members of a club"""
        club = get_object_or_404(Clubs, name=club_name)
        members = club.members.all()
        
        if not members.exists():
            return Response({"message": "No members found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, club_name):
        """Remove a member from a club"""
        club = get_object_or_404(Clubs, name=club_name)
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, email=email)

        if user not in club.members.all():
            return Response({"error": "User is not a member of this club"}, status=status.HTTP_400_BAD_REQUEST)

        club.members.remove(user)
        return Response({"message": f"User {user.email} removed from {club.name}"}, status=status.HTTP_200_OK)
class SearchUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Search users by name or email"""
        query = request.GET.get("query", "").strip()
        if not query:
            return Response({"error": "Query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.filter(email__icontains=query) | User.objects.filter(username__icontains=query)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AddMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, club_name):
        """Add a user to a club"""
        club = get_object_or_404(Clubs, name=club_name)
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, email=email)

        if user in club.members.all():
            return Response({"error": "User is already a member of this club"}, status=status.HTTP_400_BAD_REQUEST)

        club.members.add(user)
        return Response({"message": f"User {user.email} added to {club.name}"}, status=status.HTTP_200_OK)
class AllEventsView(generics.ListAPIView):
    serializer_class = EventSerializer

    def get_queryset(self):
        """
        Returns all events in a given month & year.
        Example: GET /events/?year=2025&month=2
        """
        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")

        if year and month:
            return Event.objects.filter(date__year=year, date__month=month)
        return Event.objects.all()  # Return all events if no filters provided
class EventDetailView(APIView):
    """Retrieve, Update, or Delete an Event"""
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        """Get details of a single event."""
        event = Event.objects.filter(id=event_id).first()
        if not event:
            return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = EventSerializer(event)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, event_id):
        """Update an existing event."""
        event = Event.objects.filter(id=event_id).first()
        if not event:
            return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = EventSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, event_id):
        """Delete an event."""
        event = Event.objects.filter(id=event_id).first()
        if not event:
            return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

        event.delete()
        return Response({"message": "Event deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
class RegisterView(APIView):
    """User registration with JWT token generation."""
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            password = serializer.validated_data["password"]
            password2 = request.data.get("password2")

            # ✅ Ensure passwords match before proceeding
            if password != password2:
                return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Check if username or email already exists
            if User.objects.filter(username=serializer.validated_data["username"]).exists():
                return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=serializer.validated_data["email"]).exists():
                return Response({"error": "Email already in use"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                # ✅ Create user instance properly
                user = User(
                    username=serializer.validated_data["username"],
                    email=serializer.validated_data["email"],
                )
                user.set_password(password)  # ✅ Use `set_password()` for security
                user.save()

                # ✅ Assign Club if provided (fixing owner issue)
                club_name = request.data.get("clubName", "").strip()
                if club_name:
                    club, created = Clubs.objects.get_or_create(name=club_name, defaults={"owner": user})
                    if created:
                        club.owner = user  # Ensure the owner is set for new clubs
                        club.save()
                    user.clubs.add(club)  # ✅ Assign user to the club

                # ✅ Refresh user from DB before authentication
                user.refresh_from_db()

                # ✅ Authenticate user immediately after registration
                authenticated_user = authenticate(username=user.username, password=password)
                if authenticated_user:
                    token = get_tokens_for_user(authenticated_user)
                    return Response(
                        {
                            "message": "User registered and logged in successfully",
                            "user": UserSerializer(user).data,
                            "token": token
                        }, 
                        status=status.HTTP_201_CREATED
                    )
                else:
                    return Response({"error": "User created but authentication failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            except IntegrityError:
                return Response(
                    {"error": "An error occurred while creating the user"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """User authentication and JWT token issuance."""
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'], 
                password=serializer.validated_data['password']
            )

            if user:
                return Response(
                    {
                        "message": "Login successful",
                        "user": UserSerializer(user).data,
                        "token": get_tokens_for_user(user)
                    }, 
                    status=status.HTTP_200_OK
                )
            
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    """Fetch user details for authenticated users."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
class AnalyzeFormView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file uploaded.'}, status=400)

        file = request.FILES['file']
        file_type = file.content_type
        content = file.read()

        text = self.extract_text(content, file_type)
        prompt = self.generate_prompt(text)

        model, tokenizer = ModelLoader.get_model()
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

        with torch.no_grad():
            outputs = model.generate(inputs["input_ids"], max_new_tokens=500, temperature=0.7, top_p=0.95, do_sample=True)

        response = tokenizer.decode(outputs[0], skip_special_tokens=True)

        try:
            analysis = json.loads(response)
        except json.JSONDecodeError:
            analysis = {"issues": ["Error parsing model response"], "recommendations": ["Please try again"]}

        return JsonResponse(analysis)

    @staticmethod
    def extract_text(file_content: bytes, file_type: str) -> str:
        """Extract text from different file formats."""
        if file_type == "application/pdf":
            pdf_reader = PdfReader(io.BytesIO(file_content))
            return " ".join(page.extract_text() for page in pdf_reader.pages if page.extract_text())
        elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            doc = docx.Document(io.BytesIO(file_content))
            return " ".join(paragraph.text for paragraph in doc.paragraphs)
        return file_content.decode('utf-8')
# --- SQL Query Execution ---
@csrf_exempt
def execute_sql_query(request):
    """Execute SQL query from a POST request."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method. Only POST allowed.'}, status=405)

    try:
        data = json.loads(request.body)
        query = data.get("query")
        db_path = settings.DATABASES['default']['NAME']

        if not query:
            return JsonResponse({"error": "Missing required parameter: 'query'"}, status=400)

        sql_result = fetch_data_from_sql(query, db_path)
        if "error" in sql_result:
            return JsonResponse({"error": sql_result["error"]}, status=400)

        return JsonResponse(sql_result, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

