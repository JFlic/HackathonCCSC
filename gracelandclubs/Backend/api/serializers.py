from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from api.models import User, Clubs, Event

User = get_user_model()  # ✅ CORRECT

# ✅ Club Serializer (Fix image_url naming)
class ClubSerializer(serializers.ModelSerializer):
    """Serializer for Club model"""
    class Meta:
        model = Clubs
        fields = ["id", "name", "description", "image_url"]  # ✅ Fix: Use image_url (not imageurl)

# ✅ Event Serializer (Fix club reference)
class EventSerializer(serializers.ModelSerializer):
    club_name = serializers.ReadOnlyField(source="club.name")  # ✅ Allows returning club name in JSON response

    class Meta:
        model = Event
        fields = ["id", "name", "description", "date", "image_url", "club", "club_name"]  # ✅ Consistency fix

# ✅ Full User Serializer
class UserSerializer(serializers.ModelSerializer):
    club_list = ClubSerializer(many=True, read_only=True, source="clubs")  # ✅ Fix: Use related_name="clubs"

    class Meta:
        model = User
        fields = ["id", "username", "email", "club_list"]  # ✅ Avoid using '__all__'

# ✅ User Registration Serializer
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])  # Hash the password
        user.save()
        return user

# ✅ User Login Serializer
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
