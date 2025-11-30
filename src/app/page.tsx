
'use client';

import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, FilePlus, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // Proactively prefetch the Tailor path to reduce click latency
  useEffect(() => {
    // Prefetch Path 1 (/tailor) so it opens faster on click
    router.prefetch('/tailor');
    // Prefetch Path 2 (/build) for faster load
    router.prefetch('/build');
  }, [router]);

  const navigate = (path: '/tailor' | '/build') => {
    router.push(path);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex justify-center text-center">
             <div className="max-w-3xl">
                <h2 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  Your Resume. Smarter.
                </h2>
                <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                  Instantly tailor your existing resume for any job, or craft a brand-new one from scratch in minutes. Stop guessing, start impressing.
                </p>
             </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {/* Path 1: Tailor for a Specific Job */}
            <Card className="flex flex-col overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl bg-card">
              <CardHeader className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Search className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline text-xl font-bold text-foreground">
                    Tailor for a Job
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col p-6 pt-0">
                <CardDescription className="flex-grow text-muted-foreground">
                  Upload your resume and a job description to get a tailored version, an ATS score, and a full application kit.
                </CardDescription>
                <Button
                  className="mt-6 w-full"
                  onClick={() => navigate('/tailor')}
                >
                  Start Tailoring <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Path 2: Build From Scratch */}
            <Card className="flex flex-col overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl bg-card">
              <CardHeader className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FilePlus className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline text-xl font-bold text-foreground">
                    Build from Scratch
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col p-6 pt-0">
                <CardDescription className="flex-grow text-muted-foreground">
                  No resume? No problem. Create a polished, professional resume with our step-by-step guided builder.
                </CardDescription>
                 <Button
                  className="mt-6 w-full"
                  onClick={() => navigate('/build')}
                >
                  Start Building <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
