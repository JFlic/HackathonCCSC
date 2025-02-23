# app.py
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List
import docx
import PyPDF2
import io
import json
import openai
from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Initialize OpenAI client with API key from .env
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)

# Verify API key is loaded
if not os.getenv('OPENAI_API_KEY'):
    raise ValueError("OpenAI API key not found. Please check your .env file.")

FUNDING_REQUIREMENTS = """
Please analyze this appropriation form against these requirements:
1. Must specify if funding is one-time or recurring
2. All form fields must be filled out
3. Must show alternative funding sources
4. Must benefit a large number of people
5. No transportation or gas money reimbursements allowed
6. Must have specific date for spending
7. Must include campus advertising plan

For each requirement, indicate if it is met or not met. If not met, explain what needs to be added.
Format your response as a JSON object with 'issues' and 'recommendations' arrays.
"""

def extract_text(file_content: bytes, file_type: str) -> str:
    """Extract text from various file formats."""
    if file_type == "application/pdf":
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = " ".join(page.extract_text() for page in pdf_reader.pages)
    elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        doc = docx.Document(io.BytesIO(file_content))
        text = " ".join(paragraph.text for paragraph in doc.paragraphs)
    else:  # Assume text file
        text = file_content.decode('utf-8')
    return text

def generate_prompt(form_content: str) -> str:
    """Generate the prompt for the AI model."""
    return f"""You are an assistant that analyzes funding request forms. 
Please analyze the following appropriation form content:

{form_content}

{FUNDING_REQUIREMENTS}

Remember to format your response as a valid JSON object with 'issues' and 'recommendations' arrays."""

async def analyze_with_openai(prompt: str) -> dict:
    """Send prompt to OpenAI and get analysis."""
    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",  # or another appropriate model
            messages=[
                {"role": "system", "content": "You are a funding request analyzer that responds in JSON format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Extract the response text
        response_text = response.choices[0].message.content
        
        # Parse JSON response
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract JSON-like content
            import re
            json_pattern = r'\{.*\}'
            match = re.search(json_pattern, response_text, re.DOTALL)
            if match:
                return json.loads(match.group())
            else:
                return {
                    "issues": ["Error parsing model response"],
                    "recommendations": ["The model response was not in valid JSON format"]
                }
                
    except Exception as e:
        return {
            "issues": [f"Error calling OpenAI API: {str(e)}"],
            "recommendations": ["Please try again later"]
        }

@app.post("/analyze-form")
async def analyze_form(file: UploadFile = File(...)):
    """Endpoint to analyze uploaded funding request forms."""
    try:
        # Read and extract text from the uploaded file
        content = await file.read()
        text = extract_text(content, file.content_type)
        
        # Generate prompt and get OpenAI analysis
        prompt = generate_prompt(text)
        analysis = await analyze_with_openai(prompt)
        
        return analysis
        
    except Exception as e:
        return {
            "issues": [f"Error processing form: {str(e)}"],
            "recommendations": ["Please check the file format and try again"]
        }

# Additional endpoint for health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "api_key_configured": bool(os.getenv('OPENAI_API_KEY'))}
