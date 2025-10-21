# JobTailor — Your Career Assistant

JobTailor is an AI-powered web application designed to act as a personal career assistant. It helps job seekers optimize their applications by intelligently tailoring their resume for any job description, or building a new one from scratch.

---

##  Features at a Glance
**Smart Resume Tailoring** → Upload a resume and a job description to get an optimized, tailored version and a new ATS score.

**AI-Powered Resume Builder** → Upload a document (PDF, DOCX)  and let AI structure it into a professional resume.

**Live Template-Based Preview** → See your resume update in real-time with a choice of professional templates (Classic, Modern, Creative).

**AI-Powered Polishing** → Instantly rewrite and improve any section of your resume with one click.

**Detailed ATS Analysis** → Get a realistic ATS score breakdown based on role match, experience, and skills.

---

##  The 2 Paths of JobTailor

### 1️⃣ Tailor for a Specific Job

- Upload your **resume** (PDF/DOCX/TXT) + paste a **job description**.
-  **Full Report Generation**: AI generates a complete application kit, including:
  - An initial ATS score of your original resume.
  - A fully tailored resume with an improved ATS score.
  - A professional cover letter.
  - A skill-gap analysis with suggested certifications.
  - A list of likely interview questions and answers.
- ✏️ **Live Editing**: Tweak or regenerate sections in real-time and see the preview update instantly.
- 📥 **Download** your polished resume (PDF) and cover letter.

---

### 2️⃣ Build a Resume from Scratch


✍️ **Manual Builder & AI Polishing**: Manually enter your details and use the "AI Polish" feature on any section to instantly improve it.
🎨 **Template Picker**: Choose and live-preview different professional designs (Classic, Modern, Creative) and regional formats (North American, European).
📂 **Export as PDF/DOCX**: Download your finished resume, ready to be used for applications or in the "Tailor" path.

---

##  Tech Stack
- **Frontend** → Next.js 15, TypeScript, TailwindCSS, ShadCN UI
- **AI Layer** → Google Gemini-2.5-flash

---

##  Getting Started

### Prerequisites
- Node.js 18+
- Gemini API key

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables. Create a `.env` file in the root of the project and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:9002](http://localhost:9002) in your browser.
