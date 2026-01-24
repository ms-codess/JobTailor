# JobTailor - Targeted Resume Tailoring

JobTailor is an AI-powered web app that tailors your existing resume to a specific job description. Upload your resume and the job details to get an ATS-ready rewrite plus the supporting materials you need to apply with confidence.  
[Open the web application](https://job-tailor-delta.vercel.app/)

---

## Features
- Smart resume tailoring: Upload your resume (PDF/DOCX/TXT) and a job description to get an optimized resume with a refreshed ATS score.
- Full application kit: Generates a tailored resume, cover letter, skill gap analysis with suggested certifications, and likely interview Q&A.
- Live preview and editing: Edit sections inline, see template-based previews (Classic, Modern, Creative), and keep changes cached locally.
- Fast exports: Download polished PDFs (and cover letters) directly from the tailoring flow.

---

## How it works
1) Go to the Tailor flow (`/tailor`).
2) Upload your resume and paste the job description.
3) Generate the full report, edit anything inline, and export your files.

---

## Tech Stack
- Frontend: Next.js 15, TypeScript, TailwindCSS, ShadCN UI
- AI: Google Gemini-2.5-flash

---

## Getting Started

### Prerequisites
- Node.js 18+
- Gemini API key

### Installation
1. Clone the repository.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Set up your environment variables. Create a `.env` file in the root of the project and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```
4. Run the development server:
    ```bash
    npm run dev
    ```
5. Open [http://localhost:9002](http://localhost:9002) in your browser.
