# Entry point for Flask Hiring Assistant backend
from flask import Flask, request, jsonify
from chatbot import handle_message, end_conversation, get_privacy_notice
from resume_parser import parse_resume_file
import os

app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    session_id = data.get('session_id', None)
    response = handle_message(user_message, session_id)
    return jsonify(response)

@app.route('/end', methods=['POST'])
def end():
    data = request.json
    session_id = data.get('session_id', None)
    response = end_conversation(session_id)
    return jsonify(response)

@app.route('/privacy', methods=['GET'])
def privacy():
    return jsonify(get_privacy_notice())

@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['resume']
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF resumes are supported"}), 400
    result = parse_resume_file(file)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)

@app.route('/api/logs', methods=['POST'])
def save_logs():
    data = request.json
    log_entry = f"""
CANDIDATE SCREENING SUMMARY
==========================

Personal Information:
- Name: {data.get('name', '')}
- Email: {data.get('email', '')}
- Phone: {data.get('phone', '')}
- Location: {data.get('location', '')}
- Experience: {data.get('experience', '')}
- Position: {data.get('position', '')}

Technical Stack:
- {', '.join(data.get('techStack', []))}

Screening Date: {data.get('submittedAt', '')}

"""
    log_path = os.path.join(os.path.dirname(__file__), "app.log")
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(log_entry)
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
