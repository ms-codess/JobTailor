
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { generateHash } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const ResumeInputForm = dynamic(() => import('@/components/job-tailor/resume-input-form').then(mod => mod.ResumeInputForm), {
  ssr: false,
  loading: () => (
     <Card className="shadow-lg">
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-1/3 mt-4" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-12 w-full mt-6" />
      </CardContent>
    </Card>
  )
});


export default function TailorPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleGenerateFull = (
    resumeText: string,
    jobDescription: string
  ) => {
    if (!resumeText || !jobDescription) {
       toast({
        title: 'Missing Data',
        description: 'Could not find resume or job description to generate a full report.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
        const cacheKey = generateHash(resumeText + jobDescription);
        
        // Store the raw data so the report page can pick it up.
        // The report page will handle caching of the generated report itself.
        localStorage.setItem(`resume_${cacheKey}`, resumeText);
        localStorage.setItem(`jd_${cacheKey}`, jobDescription);
        
        // Navigate to the report page with the key
        router.push(`/tailor/report?key=${cacheKey}`);
    } catch (error: any) {
        console.error("Failed to save to localStorage or redirect", error);
        toast({
          title: 'Navigation Error',
          description: error.message || 'Could not navigate to the report page.',
          variant: 'destructive',
        });
        setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl animate-fade-in-up">
              Tailor Your Resume 
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Upload your resume and a job description to get instant, optimized application materials.
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-4xl px-4 pb-20">
          <div className="flex flex-col gap-8">
            <ResumeInputForm
              onSubmit={handleGenerateFull}
              loading={loading}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

    





