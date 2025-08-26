import os
import uuid
import re
from llm_api import generate_questions, fallback_response
from data_utils import store_candidate_info, get_candidate_info, clear_session



# Sentiment/uncertainty detection

# Sentiment analysis for technical answers
def analyze_sentiment(text):
    uncertain_phrases = [
        "don't know", "do not know", "not sure", "no idea", "sorry", "can't answer", "cannot answer", "unsure", "I am not familiar", "I am unfamiliar", "I haven't used", "never used", "I don't have experience", "I am not confident"
    ]
    positive_phrases = [
        "yes", "i know", "i am confident", "i have experience", "i am familiar", "i am comfortable", "i have used", "i am good at", "i am skilled"
    ]
    text_lower = text.lower()
    if any(phrase in text_lower for phrase in uncertain_phrases):
        return "uncertain"
    elif any(phrase in text_lower for phrase in positive_phrases):
        return "positive"
    else:
        return "neutral"

sessions = {}
done_keywords = ['exit', 'quit', 'bye', 'end', 'finish']

def is_valid_email(email):
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email) is not None

def is_valid_phone(phone):
    pattern = r"^\+?\d{10,15}$"
    return re.match(pattern, phone) is not None

def get_location_from_pincode(pincode):
    # Example: Use India postal API, or Google Maps API for global
    # For demo, use a mock response
    # You can replace with a real API call if needed
    if len(pincode) == 6 and pincode.isdigit():
        # Simulate a valid pincode
        return {"city": "Sample City", "state": "Sample State", "country": "Sample Country"}
    return None

import random

def handle_message(message, session_id=None):
    # Start new session if needed
    if not session_id or session_id not in sessions:
        session_id = str(uuid.uuid4())
        sessions[session_id] = {'stage': 'greeting', 'info': {}, 'questions': [], 'asked': []}
        return {
            'session_id': session_id,
            'response': "Hello! I'm TalentScout's Hiring Assistant. I'll help screen your profile. Let's start with your full name.",
            'next': 'full_name'
        }
    # Check for end keywords
    if any(k in message.lower() for k in done_keywords):
        return end_conversation(session_id)
    ctx = sessions[session_id]
    stage = ctx['stage']
    info = ctx['info']
    # Info collection stages
    prompts = [
        ('full_name', random.choice([
            "What's your full name?",
            "May I have your full name, please?",
            "Let's start with your name."
        ])),
        ('email', None),
        ('country_code', 'Please select your country code (e.g., +91 for India, +1 for USA):'),
        ('phone', None),
        ('experience', random.choice([
            "How many years of professional experience do you have?",
            "Could you share your total years of experience?",
            "What's your experience level in years?"
        ])),
        ('position', random.choice([
            "What position(s) are you interested in applying for?",
            "Which roles are you targeting?",
            "What job titles are you seeking?"
        ])),
        ('location', random.choice([
            "What's your current city or area?",
            "Where are you currently based?",
            "Please provide your city or locality."
        ])),
        ('pincode', 'Please enter your area pincode for verification:'),
        ('location_confirm', None),
        ('tech_stack', 'Please select the technologies you are proficient in (e.g., Python, Java, React, SQL, etc.).'),
        ('resume_upload', None)
    ]
    for idx, (key, next_prompt) in enumerate(prompts):
        if stage == key:
            # Email validation
            if key == 'email':
                if not is_valid_email(message):
                    return {'session_id': session_id, 'response': random.choice([
                        'That does not look like a valid email. Could you please re-enter?',
                        'Please provide a valid email address.',
                        'Oops! That email seems invalid. Try again.'
                    ]), 'next': 'email'}
                info[key] = message
                ctx['stage'] = 'country_code'
                return {'session_id': session_id, 'response': prompts[idx+1][1], 'next': 'country_code'}
            # Country code selection
            elif key == 'country_code':
                info[key] = message
                ctx['stage'] = 'phone'
                return {'session_id': session_id, 'response': 'Now enter your phone number (digits only):', 'next': 'phone'}
            # Phone validation
            elif key == 'phone':
                phone_full = info.get('country_code', '') + message
                if not is_valid_phone(phone_full):
                    return {'session_id': session_id, 'response': random.choice([
                        'That does not look like a valid phone number. Please try again.',
                        'Please enter a valid phone number with country code.',
                        'Oops! Invalid phone number. Try again.'
                    ]), 'next': 'phone'}
                info[key] = phone_full
                ctx['stage'] = prompts[idx+1][0]
                return {'session_id': session_id, 'response': prompts[idx+1][1], 'next': prompts[idx+1][0]}
            # City/area validation
            elif key == 'location':
                if len(message.strip()) < 2 or message.strip().isdigit():
                    return {'session_id': session_id, 'response': 'Please enter a valid city or area name:', 'next': 'location'}
                info[key] = message
                ctx['stage'] = 'pincode'
                return {'session_id': session_id, 'response': prompts[idx+1][1], 'next': 'pincode'}
            # Pincode verification
            elif key == 'pincode':
                location_info = get_location_from_pincode(message)
                if not location_info:
                    return {'session_id': session_id, 'response': 'Invalid pincode. Please enter a valid pincode:', 'next': 'pincode'}
                info['pincode'] = message
                info['location_info'] = location_info
                ctx['stage'] = 'location_confirm'
                confirm_msg = f"We found: {location_info['city']}, {location_info['state']}, {location_info['country']}. Is this correct? (yes/no)"
                return {'session_id': session_id, 'response': confirm_msg, 'next': 'location_confirm'}
            # Location confirmation
            elif key == 'location_confirm':
                if message.strip().lower() == 'yes':
                    ctx['stage'] = prompts[idx+2][0]
                    return {'session_id': session_id, 'response': prompts[idx+2][1], 'next': prompts[idx+2][0]}
                else:
                    ctx['stage'] = 'location'
                    return {'session_id': session_id, 'response': 'Please re-enter your area/city:', 'next': 'location'}
            # Tech stack selection (expects list from frontend)
            elif key == 'tech_stack':
                # Accept comma-separated or list
                if isinstance(message, list):
                    techs = message
                else:
                    techs = [t.strip() for t in message.split(',') if t.strip()]
                if not techs:
                    return {'session_id': session_id, 'response': 'Please select at least one technology you are proficient in:', 'next': 'tech_stack'}
                info[key] = techs
                ctx['stage'] = 'resume_upload'
                return {'session_id': session_id, 'response': 'If you wish, you can upload your resume now. Otherwise, type "skip" to continue.', 'next': 'resume_upload'}
            # Resume upload (optional)
            elif key == 'resume_upload':
                # This would be handled by a separate endpoint, but you can trigger it here
                ctx['stage'] = 'questions'
                techs = info.get('tech_stack', [])
                # Experience-based question selection
                exp = info.get('experience', '0')
                try:
                    exp_years = int(str(exp).strip())
                except Exception:
                    exp_years = 0
                all_questions = []
                for tech in techs:
                    if exp_years == 0:
                        qs = generate_questions(f"basic {tech}")
                    elif exp_years == 1:
                        qs = generate_questions(f"junior {tech}")
                    elif exp_years == 2:
                        qs = generate_questions(f"intermediate {tech}")
                    elif exp_years <= 5:
                        qs = generate_questions(f"advanced {tech}")
                    else:
                        qs = generate_questions(f"expert {tech}")
                    all_questions.extend(qs[:5])
                ctx['questions'] = all_questions
                ctx['asked'] = []
                return {'session_id': session_id, 'response': f"Thank you! Let's assess your skills. First question: {all_questions[0]}", 'next': 'answer', 'question': all_questions[0]}
            # Default: store info and move to next
            else:
                info[key] = message
                if idx+1 < len(prompts):
                    ctx['stage'] = prompts[idx+1][0]
                    return {'session_id': session_id, 'response': prompts[idx+1][1], 'next': prompts[idx+1][0]}
                else:
                    # Generate technical questions
                    ctx['stage'] = 'questions'
                    techs = info.get('tech_stack', '')
                    questions = generate_questions(techs)
                    ctx['questions'] = questions
                    ctx['asked'] = []
                    return {'session_id': session_id, 'response': f"Thank you! Let's assess your skills. First question: {questions[0]}", 'next': 'answer', 'question': questions[0]}
    # Asking technical questions
    if stage == 'questions':
        sentiment = analyze_sentiment(message)
        ctx['asked'].append(message)
        def is_short_or_vague(ans):
            return len(ans.strip()) < 15 or ans.strip().lower() in ['yes', 'no', 'maybe', 'not sure', 'don\'t know', 'idk']

        if len(ctx['asked']) <= len(ctx['questions']):
            # If answer is short/vague, ask for clarification before next question
            if is_short_or_vague(message) and sentiment != "uncertain":
                followup = random.choice([
                    "Could you please elaborate a bit more on your previous answer?",
                    "Would you mind sharing more details about your response?",
                    "Can you expand on that a little?"
                ])
                return {'session_id': session_id, 'response': followup, 'next': 'answer', 'question': ctx['questions'][len(ctx['asked'])-1]}
            # Otherwise, move to next question with sentiment-based prompt
            if len(ctx['asked']) < len(ctx['questions']):
                next_q = ctx['questions'][len(ctx['asked'])]
                if sentiment == "uncertain":
                    gentle_reply = random.choice([
                        "Thank you for your honesty. No worries! Let's move to the next question: ",
                        "No problem! Let's continue with the next question: ",
                        "Appreciate your candor. Here's the next question: "
                    ]) + next_q
                    return {'session_id': session_id, 'response': gentle_reply, 'next': 'answer', 'question': next_q}
                elif sentiment == "positive":
                    positive_reply = random.choice([
                        "Great! You seem confident. Here's the next question: ",
                        "Awesome! Let's move on: ",
                        "Excellent! Next up: "
                    ]) + next_q
                    return {'session_id': session_id, 'response': positive_reply, 'next': 'answer', 'question': next_q}
                else:
                    return {'session_id': session_id, 'response': f"Next question: {next_q}", 'next': 'answer', 'question': next_q}
            else:
                store_candidate_info(session_id, info, ctx['asked'])
                ctx['stage'] = 'done'
                return {
                    'session_id': session_id,
                    'response': random.choice([
                        "Thank you for completing the technical questions! Your responses have been submitted. Our team will review your application and contact you if you are shortlisted. We appreciate your time and interest in TalentScout.",
                        "Your answers have been received. Our team will review and get in touch if you are shortlisted. Thank you for your time!",
                        "All done! We'll review your application and reach out if you are a match. Thanks for applying to TalentScout!"
                    ]),
                    'next': 'end',
                    'submit': True
                }
    # Fallback
    return {'session_id': session_id, 'response': fallback_response(message), 'next': 'fallback'}

def end_conversation(session_id):
    clear_session(session_id)
    return {'session_id': session_id, 'response': "Conversation ended. Thank you for using TalentScout!", 'next': 'end'}

def get_privacy_notice():
    return {
        'notice': "All candidate data is handled securely and in compliance with privacy standards. No real personal data is stored."
    }
