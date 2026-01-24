
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
import { ArrowRight, FileText, Gauge, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/tailor');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex justify-center text-center">
            <div className="max-w-3xl space-y-6">
              <h2 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Tailor your resume to the job
              </h2>
              <p className="text-lg text-muted-foreground md:text-xl">
                Upload your resume and a job description to get an ATS-ready rewrite, cover letter, and interview prep in one flow.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button size="lg" onClick={() => router.push('/tailor')}>
                  Start tailoring <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link href="/tailor">See the tailoring flow</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="flex flex-col overflow-hidden border border-primary/10 shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl bg-card">
              <CardHeader className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Gauge className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline text-xl font-bold text-foreground">
                    ATS-grade rewrite
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col p-6 pt-0">
                <CardDescription className="flex-grow text-muted-foreground">
                  Score your resume against the job, auto-integrate the right keywords, and see exactly what changed.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col overflow-hidden border border-primary/10 shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl bg-card">
              <CardHeader className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline text-xl font-bold text-foreground">
                    Full application kit
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col p-6 pt-0">
                <CardDescription className="flex-grow text-muted-foreground">
                  Get a tailored resume, cover letter, skill gap analysis, and likely interview Q&amp;A in one click.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col overflow-hidden border border-primary/10 shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl bg-card">
              <CardHeader className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Wand2 className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline text-xl font-bold text-foreground">
                    Live editing & exports
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col p-6 pt-0">
                <CardDescription className="flex-grow text-muted-foreground">
                  Edit sections inline, preview in multiple templates, and export polished PDFs without leaving the flow.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
