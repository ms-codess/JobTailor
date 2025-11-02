
'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Briefcase, Sparkles, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

interface ResumeInputFormProps {
  onSubmit: (resumeText: string, jobDescription: string) => void;
  loading: boolean;
  initialResume?: string;
  initialJobDescription?: string;
}

export function ResumeInputForm({
  onSubmit,
  loading,
  initialResume = '',
  initialJobDescription = '',
}: ResumeInputFormProps) {
  const [resume, setResume] = useState(initialResume);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setResume(initialResume);
  }, [initialResume]);

  useEffect(() => {
    setJobDescription(initialJobDescription);
  }, [initialJobDescription]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume.trim()) {
      toast({
        title: 'Missing Resume',
        description: 'Please upload or paste your resume.',
        variant: 'destructive',
      });
      return;
    }
    if (!jobDescription.trim()) {
       toast({
        title: 'Missing Job Description',
        description: 'Please paste the job description.',
        variant: 'destructive',
      });
      return;
    }
    onSubmit(resume, jobDescription);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    toast({ title: 'Extracting text from your file...' });

    try {
      let text = '';
      if (file.type === 'application/pdf') {
        const { processPdf } = await import('@/lib/pdf-processor');
        text = await processPdf(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const mammoth = (await import('mammoth')).default;
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (file.type === 'text/plain') {
        text = await file.text();
      } else {
        toast({ title: 'Unsupported File Type', description: 'Please upload a PDF, DOCX, or TXT file.', variant: 'destructive' });
        setIsExtracting(false);
        return;
      }
      setResume(text);
      toast({ title: 'Success', description: 'Extracted text from your resume.' });
    } catch (error: any) {
      toast({ title: 'Extraction Failed', description: error.message || 'Could not extract text from the file.', variant: 'destructive' });
    } finally {
      setIsExtracting(false);
      // Reset file input
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-foreground flex items-center">
          <Sparkles className="mr-2 h-6 w-6 text-primary" />
          Start Here
        </CardTitle>
         <CardDescription>
            Upload your resume, then paste the job description.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit}>
          <div className="space-y-6">
             <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2"><FileText className="h-5 w-5" /> Your Resume</h3>
                 <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isExtracting || loading}>
                    {isExtracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                    {isExtracting ? 'Extracting...' : 'Upload Resume'}
                    </Button>
                    <p className='text-xs text-center text-muted-foreground self-center'>Supports PDF, DOCX, TXT</p>
                 </div>
                 <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                  disabled={isExtracting || loading}
                />
                <Textarea
                    placeholder="Or paste your resume text here..."
                    className="min-h-[150px]"
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    disabled={loading || isExtracting}
                />
              </div>

               <div className="space-y-2">
                 <h3 className="font-medium flex items-center gap-2"><Briefcase className="h-5 w-5" /> Job Description</h3>
                <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[150px]"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    disabled={loading || isExtracting}
                />
              </div>
          </div>
          <Button
            type="submit"
            className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading || isExtracting || !resume || !jobDescription}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Full Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

    
