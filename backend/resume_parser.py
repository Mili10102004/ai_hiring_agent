from flask import request, jsonify
from PyPDF2 import PdfReader
from PyPDF2.errors import PdfReadError
import google.generativeai as genai
import os
import json
import logging
from dotenv import load_dotenv
try:
    import pdfplumber
except ImportError:
    pdfplumber = None

# ==========================
# CONFIGURATION
# ==========================

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Configure logging
logging.basicConfig(level=logging.INFO, filename="app.log")
logger = logging.getLogger(__name__)

MODEL = "models/gemini-1.5-flash"
model = genai.GenerativeModel(MODEL)

SECTION_ALIASES = {
    "Profile Summary": ["summary", "objective", "career objective", "description", "about me", "professional summary"],
    "Technical Skills": ["skills", "technical expertise", "core competencies", "strengths"],
    "Non-Technical Skills": ["soft skills", "other skills", "general skills"],
    "Work Experience": ["experience", "professional experience", "employment history", "career journey"],
    "Education": ["academics", "qualifications", "scholastics"],
    "Projects": ["projects", "academic projects", "personal projects"],
    "Internships": ["internships", "training", "work placements"],
    "Certifications": ["certifications", "certificates", "licenses", "accreditations", "credentials", "achievements"],
    "Languages": ["languages", "linguistic skills","Spoken Languages", "Written Languages"],
    "GitHub": ["github", "git hub", "portfolio", "source code"],
    "LinkedIn": ["linkedin", "linked in", "professional profile"],
}

def normalize_section(section_name: str) -> str:
    section_name = section_name.lower()
    for std, aliases in SECTION_ALIASES.items():
        if section_name == std.lower() or section_name in [a.lower() for a in aliases]:
            return std
    return section_name.title()

def extract_pdf_text(file):
    text = ""
    try:
        reader = PdfReader(file)
        for page in reader.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text += extracted_text + "\n"
    except PdfReadError as e:
        logger.error(f"PyPDF2 error: {e}")
        if pdfplumber:
            logger.info("Falling back to pdfplumber for text extraction")
            try:
                file.seek(0)
                with pdfplumber.open(file) as pdf:
                    for page in pdf.pages:
                        extracted_text = page.extract_text()
                        if extracted_text:
                            text += extracted_text + "\n"
            except Exception as e:
                logger.error(f"pdfplumber error: {e}")
        else:
            logger.warning("pdfplumber not installed; skipping fallback")
    return text

def resumes_details(resume_text: str) -> dict:
    prompt = f"""
    You are an ATS-friendly resume parsing assistant.
    Given the following resume text:
    {resume_text}
    1. Recognize resume sections even if headings differ. Use the following aliases:
       - Profile Summary: summary, objective, career objective, description, about me, professional summary
       - Technical Skills: skills, technical expertise, core competencies, strengths
       - Non-Technical Skills: soft skills, other skills, general skills
       - Work Experience: experience, professional experience, employment history, career journey
       - Education: academics, qualifications, scholastics
       - Projects: projects, academic projects, personal projects
       - Internships: internships, training, work placements
       - Certifications: certifications, certificates, licenses, accreditations, credentials, achievements
       - GitHub: github, git hub, portfolio, source code
       - LinkedIn: linkedin, linked in, professional profile
    2. Extract details into this standardized JSON format:
    {{
      "Full Name": "",
      "Contact Number": "",
      "Email Address": "",
      "GitHub": "",
      "LinkedIn": "",
      "Location": "",
      "Profile Summary": "",
      "Technical Skills": [],
      "Non-Technical Skills": [],
      "Education": [
        {{
          "Degree": "",
          "Institution": "",
          "Years": ""
        }}
      ],
      "Work Experience": [
        {{
          "Company Name": "",
          "Job Title": "",
          "Years of Experience": "",
          "Responsibilities": []
        }}
      ],
      "Projects": ["project description 1", "project description 2"],
      "Internships": ["internship description 1", "internship description 2"],
      "Certifications": ["certification name 1", "certification name 2"],
      "Languages": [],
      "Suggested Resume Category": "",
      "Recommended Job Roles": []
    }}
    3. Ensure missing sections are returned as empty fields instead of being omitted.
    4. For Projects, Internships, and Certifications, return a list of strings describing each item, not objects.
    5. For Certifications, extract each certification as a separate string, including the name and, if available, the issuing organization or year (e.g., "AWS Certified Developer - Amazon, 2023").
    6. For GitHub and LinkedIn, extract the full URL (e.g., "https://github.com/username", "https://linkedin.com/in/username") if present, otherwise return an empty string.
    7. Return valid JSON only.
    """
    try:
        response = model.generate_content(prompt)
        raw_text = response.text
        cleaned = raw_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned)
        logger.info("Parsed resume data: %s", data)
        return data
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        return {"error": "Failed to parse resume data"}
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return {"error": "An unexpected error occurred"}

def ats_score(data: dict, job_keywords: set = None) -> int:
    if job_keywords is None:
        job_keywords = {"python", "java", "sql", "communication", "teamwork"}
    score = 0
    max_score = 100
    if data.get("Profile Summary"):
        score += 10
    resume_skills = set(data.get("Technical Skills", []) + data.get("Non-Technical Skills", []))
    matches = resume_skills.intersection(job_keywords)
    score += min(len(matches) * 2, 20)
    if data.get("Education"):
        score += 15
    if data.get("Work Experience") or data.get("Projects"):
        score += 20
    elif data.get("Internships"):
        score += 10
    if data.get("Certifications"):
        score += 10
    if data.get("Languages"):
        score += 5
    if data.get("GitHub") or data.get("LinkedIn"):
        score += 5
    return min(score, max_score)

def parse_resume_file(file):
    text = extract_pdf_text(file)
    if not text.strip():
        return {"error": "No text could be extracted from the PDF"}
    data = resumes_details(text)
    if not data:
        return {"error": "Resume parsing failed"}
    if "error" in data:
        return data
    score = ats_score(data)
    data['ats_score'] = score
    return data
