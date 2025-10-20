
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Award, Info, Link as LinkIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { GenerateTailoredResumeOutput, CoverLetterOutput, SkillAnalysisOutput, InterviewPrepOutput } from '@/ai/flows/generate-tailored-resume';


interface FullReportDisplayProps {
  report: GenerateTailoredResumeOutput & Partial<CoverLetterOutput> & Partial<SkillAnalysisOutput> & Partial<InterviewPrepOutput>;
  initialTab: "cover-letter" | "keywords" | "certifications" | "interview-qa";
}

export function FullReportDisplay({ report, initialTab }: FullReportDisplayProps) {
  const [coverLetterText, setCoverLetterText] = useState(report.coverLetter);
  const { toast } = useToast();

  const handleDownloadCoverLetter = async () => {
    if (!coverLetterText) return;
    try {
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      // Split text into lines to respect the PDF's width
      const textLines = pdf.splitTextToSize(coverLetterText, 180);
      pdf.text(textLines, 15, 20);
      pdf.save('cover-letter.pdf');
    } catch (e: any) {
      toast({
        title: 'Download Failed',
        description: e.message || 'Could not download cover letter.',
        variant: 'destructive'
      });
    }
  };


  return (
    <div className="w-full">
        <Tabs defaultValue={initialTab} className="w-full">
            <TabsContent value="cover-letter">
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Cover Letter</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Textarea 
                            value={coverLetterText}
                            onChange={(e) => setCoverLetterText(e.target.value)}
                            className="min-h-[400px] text-sm"
                            />
                        <Button onClick={handleDownloadCoverLetter}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Cover Letter
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="keywords">
                 <Card>
                    <CardHeader>
                        <CardTitle>Integrated Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-muted-foreground">These keywords and skills from the job description have been integrated into your tailored resume.</p>
                        {report.integratedKeywords && report.integratedKeywords.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                            {report.integratedKeywords.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                            ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Info className="h-4 w-4" />
                            <span>No specific keywords were integrated. This may happen if your resume is already a strong match.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="certifications">
                 <Card>
                    <CardHeader>
                        <CardTitle>Suggested Courses & Certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-muted-foreground">Consider these courses or certifications to fill skill gaps and strengthen your profile.</p>
                        {report.suggestedCertifications && report.suggestedCertifications.length > 0 ? (
                            <ul className="space-y-3">
                            {report.suggestedCertifications.map((cert, index) => (
                                <li key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted">
                                <Award className="h-5 w-5 text-amber-500 mt-0.5 shrink-0"/>
                                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline flex items-center gap-1.5">
                                    {cert.name}
                                    <LinkIcon className="h-3 w-3" />
                                </a>
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Info className="h-4 w-4" />
                            <span>No specific certifications were suggested for this role.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="interview-qa">
                <Card className="max-h-[500px] overflow-y-auto">
                    <CardHeader>
                        <CardTitle>Interview Q&A</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {report.interviewQA && report.interviewQA.length > 0 ? (
                            report.interviewQA.map((qa, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-secondary/50">
                                <h4 className="font-semibold mb-2">{qa.question}</h4>
                                <p className="text-sm text-muted-foreground">{qa.answer}</p>
                            </div>
                            ))
                        ) : (
                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Info className="h-4 w-4" />
                                <span>No interview questions were generated.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
  );
}

    