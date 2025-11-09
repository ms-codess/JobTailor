'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { FormData as ResumeFormData } from '@/types/resume';
import { useRouter } from 'next/navigation';

const ResumeEditor = dynamic(() => import('@/components/job-tailor/resume-editor').then(mod => mod.ResumeEditor), {
  ssr: false,
});

// No template preview on this page per new flow

export default function BuildPage() {
  const router = useRouter();

  const [resumeData, setResumeData] = useState<ResumeFormData>({
    basics: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      photo: '',
      links: [{ label: '', url: '' }],
    },
    education: [{ school: '', degree: '', year: '' }],
    experience: [{ company: '', role: '', years: '', description: '' }],
    skills: [],
    certifications: [],
    languages: [],
    customSections: [{ title: '', content: '' }],
  });

  // Load existing draft to continue editing
  useEffect(() => {
    try {
      const raw = localStorage.getItem('build_resume_draft');
      if (raw) {
        const parsed = JSON.parse(raw);
        setResumeData(parsed);
      }
    } catch {}
  }, []);
  const handleContinue = () => {
    try {
      localStorage.setItem('build_resume_draft', JSON.stringify(resumeData));
    } catch {}
    router.push('/build/preview');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-6 md:py-10">
          <div className="mx-auto">
            <div className="p-0">
              <ResumeEditor noScroll resumeData={resumeData} setResumeData={setResumeData} />
            </div>
            <div className="flex justify-end mt-6">
              <Button size="lg" onClick={handleContinue}
              >
                Continue to Preview <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
