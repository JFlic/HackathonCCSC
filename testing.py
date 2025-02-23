
from transformers import AutoTokenizer, AutoModelForCausalLM
import os
save_directory = "./gemma-7b-local"

# Load the tokenizer and model from the local directory
tokenizer = AutoTokenizer.from_pretrained(save_directory)
model = AutoModelForCausalLM.from_pretrained(save_directory)

# Define your input prompt
input_text = "Tell me what my nutrion should be"

# Tokenize the input text
input_ids = tokenizer(input_text, return_tensors="pt").input_ids

# Generate text
outputs = model.generate(input_ids, max_length=50, num_return_sequences=1)

# Decode and print the generated text
generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(generated_text)
