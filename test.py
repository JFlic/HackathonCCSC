hf_token = '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'
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import os
import torch

# Specify the model name
model_name = "google/flan-t5-small"

# Retrieve the Hugging Face token from the environment variable

# Check if the token is available
if hf_token is None:
    raise ValueError("Hugging Face token not found. Please set the HF_TOKEN environment variable.")

# Define the directory to save the model and tokenizer
save_directory = "./flan-t5-local"

# Check if model exists locally, else download
if not os.path.exists(save_directory):
    print("Downloading FLAN-T5 model...")
    tokenizer = AutoTokenizer.from_pretrained(model_name, token=hf_token)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name, token=hf_token)

    # Save the tokenizer and model locally
    tokenizer.save_pretrained(save_directory)
    model.save_pretrained(save_directory)
    print("Model saved locally.")

# Load the tokenizer and model from the local directory
print("Loading model from local storage...")
tokenizer = AutoTokenizer.from_pretrained(save_directory)
model = AutoModelForSeq2SeqLM.from_pretrained(save_directory)

# Define your input prompt
input_text = "Explain the importance of databases in AI."

# Tokenize the input text
input_ids = tokenizer(input_text, return_tensors="pt").input_ids

# Move model to available device
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
input_ids = input_ids.to(device)

# Generate text with optimized settings
outputs = model.generate(
    input_ids,
    max_new_tokens=100,  # Use max_new_tokens instead of max_length for better control
    temperature=0.7,  # Controls randomness
    top_p=0.9,  # Nucleus sampling for better quality
    do_sample=True,  # Enables sampling (instead of greedy decoding)
)

# Decode and print the generated text
generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
print("Generated Response:\n", generated_text)
