
# AI Hiring Agent

A full-stack intelligent Hiring Assistant chatbot for candidate screening, built with React (frontend) and Flask (backend). This project uses Gemini 1.5 Flash and Serper API for advanced candidate evaluation, resume parsing, sentiment analysis, and adaptive technical questioning.

## Features
- **Conversational Candidate Screening:** Interactive chat-based flow for collecting candidate info, resume, and technical answers.
- **Resume Parsing:** Extracts and analyzes PDF resumes using LLMs.
- **Sentiment Analysis:** Detects uncertainty or lack of confidence in candidate responses.
- **Experience-Based Questions:** Adapts technical questions based on years of experience.
- **Validation:** Enforces valid email, phone, and other required fields.
- **Application Logging:** Stores all submitted applications in `backend/applications.json`.
- **Recruiter Dashboard:** View all applications in a sidebar for easy review.

## Folder Structure
```
backend/         # Flask backend (API, resume parsing, logs)
frontend/        # React frontend (UI, chat, dashboard)
```

## Getting Started

### Backend
1. Navigate to the backend folder:
   ```powershell
   cd backend
   ```
2. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
3. Set up your `.env` file with API keys (do NOT commit this file):
   ```env
   GEMINI_API_KEY=your_gemini_key
   SERPER_API_KEY=your_serper_key
   ```
4. Run the backend:
   ```powershell
   python app.py
   ```

### Frontend
1. Navigate to the frontend folder:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the development server:
   ```powershell
   npm run dev
   ```

## Deployment
- **Hugging Face Spaces:**
  - Link this repo to a new Space.
  - Add API keys as Hugging Face Secrets.
  - Backend will read secrets from environment variables.

## Privacy & Security
- **API Keys:** Never commit `.env` or secret files. Use environment variables for all secrets.
- **Public Repo:** All sensitive info must be kept out of the codebase.

## Application Storage
- All submitted applications are stored in `backend/applications.json` as a JSON list.

## Contributing
1. Fork the repo and create your feature branch.
2. Commit your changes.
3. Push to your branch and open a pull request.

## License
MIT

---
For questions or support, open an issue or contact the repo owner.
