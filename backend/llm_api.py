import os
import google.generativeai as genai
import requests
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
SERPER_API_KEY = os.getenv('SERPER_API_KEY')

genai.configure(api_key=GEMINI_API_KEY)

def generate_questions(tech_stack):
    prompt = f"""
    You are a technical interviewer. Generate 3-5 technical questions for a candidate based on their tech stack: {tech_stack}. Questions should assess proficiency in each technology listed. Return as a numbered list.
    """
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    # Parse response to list
    questions = response.text.strip().split('\n')
    questions = [q for q in questions if q.strip()]
    return questions

def fallback_response(user_input):
    prompt = f"""
    You are a hiring assistant. If you do not understand the user's input, respond politely and ask them to clarify or rephrase, without deviating from the hiring context.
    User input: {user_input}
    """
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    return response.text.strip()

# Optional: Serper API for web search augmentation

def web_search(query):
    url = "https://google.serper.dev/search"
    headers = {"X-API-KEY": SERPER_API_KEY}
    data = {"q": query}
    resp = requests.post(url, json=data, headers=headers)
    return resp.json()
