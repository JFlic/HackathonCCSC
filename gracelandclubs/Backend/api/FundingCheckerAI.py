# app.py
from fastapi import FastAPI, UploadFile, File
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from pydantic import BaseModel
from typing import List
import docx
import PyPDF2
import io

app = FastAPI()

# Load model and tokenizer
model_name = "mistralai/Mistral-7B-Instruct-v0.2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,  # Use float16 for memory efficiency
    device_map="auto"  # Automatically handle device placement
)

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
    return f"""<s>[INST] Here is an appropriation form content:

{form_content}

{FUNDING_REQUIREMENTS}[/INST]"""

@app.post("/analyze-form")
async def analyze_form(file: UploadFile = File(...)):
    # Read and extract text from the uploaded file
    content = await file.read()
    text = extract_text(content, file.content_type)
    
    # Generate prompt and get model response
    prompt = generate_prompt(text)
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        outputs = model.generate(
            inputs["input_ids"],
            max_new_tokens=500,
            temperature=0.7,
            top_p=0.95,
            do_sample=True
        )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Parse the response (assuming model returns JSON-formatted string)
    # In practice, you might need more robust parsing
    try:
        import json
        analysis = json.loads(response)
    except:
        analysis = {
            "issues": ["Error parsing model response"],
            "recommendations": ["Please try again"]
        }
    
    return analysis