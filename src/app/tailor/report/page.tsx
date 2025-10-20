
'use client';

import { useState, useRef, useEffect, Suspense, ChangeEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Loader2, Download, ChevronDown, Upload, User as UserIcon, Link as LinkIcon, Trash2, Wand2, Edit, FileText, CheckSquare, Award, MessageSquareQuote, Info, AlertTriangle, Brain, ThumbsUp, ThumbsDown, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  generateTailoredResume,
  GenerateTailoredResumeOutput,
  generateCoverLetter,
  CoverLetterOutput,
  generateSkillAnalysis,
  SkillAnalysisOutput,
  generateInterviewPrep,
  InterviewPrepOutput,
  GenerateTailoredResumeInput,
} from '@/ai/flows/generate-tailored-resume';
import {
  suggestCareerPath,
  SuggestCareerPathOutput,
} from '@/ai/flows/suggest-career-path';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import type { FormData as ResumeFormData } from '@/app/build/page';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  aiResumePolishing,
  AiResumePolishingOutput,
} from '@/ai/flows/ai-resume-polishing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { jobHuntingFacts } from '@/lib/job-hunting-facts';
import { AtsScoreBreakdown } from '@/components/job-tailor/ats-score-breakdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AtsExplanation } from '@/components/job-tailor/ats-explanation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ResumeEditor = dynamic(() => import('@/components/job-tailor/resume-editor').then(mod => mod.ResumeEditor), {
    loading: () => (
        <Card className="flex-grow">
            <ScrollArea className="h-[calc(100vh-24rem)]">
            <CardContent className="space-y-8 pt-6">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                 <Skeleton className="h-8 w-1/3 mb-4 mt-8" />
                 <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                </div>
            </CardContent>
            </ScrollArea>
        </Card>
    ),
    ssr: false
});

const TemplateLoader = () => (
    <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-1/2 mx-auto" />
      <Skeleton className="h-4 w-3/4 mx-auto" />
      <div className="space-y-6 pt-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
  
const ClassicTemplate = dynamic(() => import('@/components/resume-templates/classic-template').then(mod => mod.ClassicTemplate), { loading: () => <TemplateLoader /> });
const ModernTemplate = dynamic(() => import('@/components/resume-templates/modern-template').then(mod => mod.ModernTemplate), { loading: () => <TemplateLoader /> });
const CreativeTemplate = dynamic(() => import('@/components/resume-templates/creative-template').then(mod => mod.CreativeTemplate), { loading: () => <TemplateLoader /> });
const EuropeanClassicTemplate = dynamic(() => import('@/components/resume-templates/european-classic-template').then(mod => mod.EuropeanClassicTemplate), { loading: () => <TemplateLoader /> });
const EuropeanModernTemplate = dynamic(() => import('@/components/resume-templates/european-modern-template').then(mod => mod.EuropeanModernTemplate), { loading: () => <TemplateLoader /> });
const EuropeanCreativeTemplate = dynamic(() => import('@/components/resume-templates/european-creative-template').then(mod => mod.EuropeanCreativeTemplate), { loading: () => <TemplateLoader /> });


export type PolishContext = {
  section: string;
  content: string;
  onUpdate: (newContent: string) => void;
};

type FullReportData = GenerateTailoredResumeOutput & Partial<CoverLetterOutput> & Partial<SkillAnalysisOutput> & Partial<InterviewPrepOutput>;


function ReportContent() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [fullReport, setFullReport] = useState<FullReportData | null>(null);
  const [template, setTemplate] = useState('classic');
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState('north-american');
  const [resumeData, setResumeData] = useState<ResumeFormData | null>(null);
  const [randomFact, setRandomFact] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');
  const [careerPathData, setCareerPathData] = useState<SuggestCareerPathOutput | null>(null);
  const [loadingCareerPath, setLoadingCareerPath] = useState(false);
  const [loadingTabs, setLoadingTabs] = useState({
    'cover-letter': false,
    'skill-analysis': false,
    'interview-prep': false,
  });
  const [isExporting, setIsExporting] = useState(false);


  useEffect(() => {
    if (loading) {
      setRandomFact(jobHuntingFacts[Math.floor(Math.random() * jobHuntingFacts.length)]);
      const interval = setInterval(() => {
        setRandomFact(jobHuntingFacts[Math.floor(Math.random() * jobHuntingFacts.length)]);
      }, 5000); // Change fact every 5 seconds
      return () => clearInterval(interval);
    }
  }, [loading]);
  
  const generateAdditionalReportData = async (cacheKey: string, input: GenerateTailoredResumeInput) => {
      const existingReportStr = localStorage.getItem(`report_${cacheKey}`);
      const parsedReport = existingReportStr ? JSON.parse(existingReportStr) : {};

      const needsCoverLetter = !parsedReport.coverLetter;
      const needsSkillAnalysis = !parsedReport.integratedKeywords;
      const needsInterviewPrep = !parsedReport.interviewQA;

      if (!needsCoverLetter && !needsSkillAnalysis && !needsInterviewPrep) {
        setFullReport(current => ({...current, ...parsedReport}));
        return;
      }
      
      setLoadingTabs({
          'cover-letter': needsCoverLetter,
          'skill-analysis': needsSkillAnalysis,
          'interview-prep': needsInterviewPrep,
      });

      try {
          const promises = [];
          if (needsCoverLetter) promises.push(generateCoverLetter(input).catch(e => ({error: 'coverLetter', details: e})));
          if (needsSkillAnalysis) promises.push(generateSkillAnalysis(input).catch(e => ({error: 'skillAnalysis', details: e})));
          if (needsInterviewPrep) promises.push(generateInterviewPrep(input).catch(e => ({error: 'interviewPrep', details: e})));

          const results = await Promise.all(promises);
          
          let newReportData: Partial<FullReportData> = {};
          let hadError = false;
          results.forEach(result => {
              if (result.error) {
                hadError = true;
                console.error(`Failed to generate ${result.error}`, result.details);
              } else if ('coverLetter' in result) {
                newReportData.coverLetter = result.coverLetter;
              } else if ('integratedKeywords' in result) {
                newReportData = {...newReportData, ...result};
              } else if ('interviewQA' in result) {
                newReportData.interviewQA = result.interviewQA;
              }
          });

          if(hadError) {
             toast({
              title: 'Partial report generated',
              description: 'Some parts of the report could not be generated. Please try again later.',
              variant: 'destructive',
            });
          }

          setFullReport(prev => {
              if (!prev) return null;
              const updatedReport = { ...prev, ...newReportData } as FullReportData;
              // Update cache with all available data
              const finalCache = { ...parsedReport, ...updatedReport };
              localStorage.setItem(`report_${cacheKey}`, JSON.stringify(finalCache));
              return updatedReport;
          });

      } catch (e: any) {
          toast({
              title: 'Failed to load additional materials',
              description: e.message || 'Some parts of the report could not be generated.',
              variant: 'destructive',
          });
      } finally {
          setLoadingTabs({
              'cover-letter': false,
              'skill-analysis': false,
              'interview-prep': false,
          });
      }
  };


  useEffect(() => {
    const cacheKey = searchParams.get('key');
    if (!cacheKey) {
        toast({
            title: 'Error',
            description: 'Missing report key. Please go back and try again.',
            variant: 'destructive',
        });
        setLoading(false);
        return;
    }

    const generateReport = async () => {
        setLoading(true);

        const cachedReport = localStorage.getItem(`report_${cacheKey}`);
        const resumeText = localStorage.getItem(`resume_${cacheKey}`);
        const jobDescription = localStorage.getItem(`jd_${cacheKey}`);

        if (!resumeText || !jobDescription) {
            toast({
                title: 'Error',
                description: 'Could not find the required data to generate a report. Please try again.',
                variant: 'destructive',
            });
            router.push('/tailor');
            return;
        }
        
        const input = { resumeText, jobDescription };

        if (cachedReport) {
            const reportData = JSON.parse(cachedReport);
            setFullReport(reportData);
            setResumeData(reportData.tailoredResume);
            setLoading(false);
            toast({ title: 'Loaded from cache!', description: 'This report was loaded from your previous session.' });
            generateAdditionalReportData(cacheKey, input);
            return;
        }


        try {
            const response = await generateTailoredResume({
                resumeText,
                jobDescription,
            });
            setFullReport(response);
            setResumeData(response.tailoredResume);
            localStorage.setItem(`report_${cacheKey}`, JSON.stringify(response));

            generateAdditionalReportData(cacheKey, { resumeText, jobDescription });

        } catch (e: any) {
            toast({
                title: 'Generation Failed',
                description: e.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };
    
    generateReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, toast]);

  useEffect(() => {
    if (loading || !fullReport || careerPathData) return;

    const fetchCareerPath = async () => {
      const cacheKey = searchParams.get('key');
      if (!cacheKey) return;

      setLoadingCareerPath(true);
      const cachedCareerPath = localStorage.getItem(`careerpath_${cacheKey}`);
      if (cachedCareerPath) {
        setCareerPathData(JSON.parse(cachedCareerPath));
        setLoadingCareerPath(false);
        return;
      }
      
      const resumeText = localStorage.getItem(`resume_${cacheKey}`);
      if (!resumeText) {
          setLoadingCareerPath(false);
          return;
      }

      try {
        const result = await suggestCareerPath({ resumeText });
        setCareerPathData(result);
        localStorage.setItem(`careerpath_${cacheKey}`, JSON.stringify(result));
      } catch (e: any) {
        console.error("Failed to generate career path in background:", e.message);
      } finally {
        setLoadingCareerPath(false);
      }
    }
    
    fetchCareerPath();
  }, [loading, fullReport, careerPathData, searchParams]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && resumeData) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeData({ ...resumeData, basics: { ...resumeData.basics, photo: reader.result as string }});
      };
      reader.readAsDataURL(file);
    }
  };


  const renderTemplate = () => {
    if (!resumeData) return null;

    const regionHasPhoto = ['european', 'middle-east-asia-africa'].includes(region);
    
    if (regionHasPhoto) {
      switch (template) {
        case 'classic':
          return <EuropeanClassicTemplate data={resumeData} />;
        case 'modern':
          return <EuropeanModernTemplate data={resumeData} />;
        case 'creative':
          return <EuropeanCreativeTemplate data={resumeData} />;
        default:
          return <EuropeanClassicTemplate data={resumeData} />;
      }
    }

    switch (template) {
        case 'classic':
          return <ClassicTemplate data={resumeData} />;
        case 'modern':
          return <ModernTemplate data={resumeData} />;
        case 'creative':
          return <CreativeTemplate data={resumeData} />;
        default:
          return <ClassicTemplate data={resumeData} />;
    }
  };

    const handleExportPDF = async () => {
    const input = resumePreviewRef.current;
    if (!input) {
      toast({ title: 'Error', description: 'Could not find resume preview to export.', variant: 'destructive' });
      return;
    }
    
    setIsExporting(true);
    toast({ title: 'Generating PDF...', description: 'Please wait a moment.' });

    try {
        const [jsPDF, html2canvas] = await Promise.all([
          import('jspdf').then(m => m.default),
          import('html2canvas').then(m => m.default),
        ]);

        // Temporarily scale up for high-resolution capture
        const originalTransform = input.style.transform;
        input.style.transform = 'scale(1)';
        input.style.transformOrigin = 'top left';

        const canvas = await html2canvas(input, {
          scale: 2, // Capture at 2x resolution
          useCORS: true,
          logging: false,
          width: input.offsetWidth,
          height: input.offsetHeight,
          windowWidth: input.scrollWidth,
          windowHeight: input.scrollHeight
        });

        // Restore original scale
        input.style.transform = originalTransform;
        
        const imgData = canvas.toDataURL('image/png');
        
        // A4 dimensions in mm are 210 x 297
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasAspectRatio = canvas.width / canvas.height;
        
        let imgWidth = pdfWidth;
        let imgHeight = pdfWidth / canvasAspectRatio;

        if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight;
            imgWidth = imgHeight * canvasAspectRatio;
        }

        const x = (pdfWidth - imgWidth) / 2;
        const y = 0; // Align to top

        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        pdf.save('resume.pdf');
    } catch (error) {
        console.error("Failed to export PDF", error);
        toast({ title: 'PDF Export Failed', description: 'An unexpected error occurred during PDF generation.', variant: 'destructive' });
    } finally {
        setIsExporting(false);
    }
};

  const handleExportDOCX = async () => {
    if (!resumeData) return;
    setIsExporting(true);
    toast({ title: 'Generating Word document...', description: 'Please wait a moment.' });

    try {
      const { saveAs } = (await import('file-saver'));
      const { generateDocx } = await import('@/lib/docx-generator');
      const blob = await generateDocx(resumeData);
      saveAs(blob, 'resume.docx');
    } catch (error) {
      console.error("Failed to export DOCX", error);
      toast({ title: 'Word Export Failed', description: 'An unexpected error occurred during document generation.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCoverLetter = async () => {
    if (!fullReport?.coverLetter) return;

    try {
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF();
        const textLines = pdf.splitTextToSize(fullReport.coverLetter, 180);
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


 const renderApplyRecommendation = (score: number) => {
    const isLowScore = score < 50;
    const recommendation = isLowScore
      ? {
          Icon: ThumbsDown,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          title: "Recommendation: Don't Apply Yet",
          text: "Your resume is not a strong match for this role. Check the 'Career Path' tab for job recommendations that better suit your experience, or use the application materials to improve your application for this role.",
        }
      : {
          Icon: ThumbsUp,
          color: "text-green-600",
          bgColor: "bg-green-500/10",
          title: "Recommendation: Ready to Apply!",
          text: "Your resume is a good starting point. Use the tailored materials to make your application even stronger.",
        };

    return (
      <div className={`${recommendation.bgColor} ${recommendation.color} p-4 rounded-lg flex items-start gap-4`}>
        <recommendation.Icon className={`h-8 w-8 mt-1 shrink-0`} />
        <div>
          <h4 className="font-bold">{recommendation.title}</h4>
          <p className="text-sm">{recommendation.text}</p>
        </div>
      </div>
    );
 };

  const renderTabContentLoader = () => (
    <div className="flex justify-center items-center p-10 min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Generating content...</p>
    </div>
  );


  if (loading) {
    return (
        <div className="w-full flex justify-center items-center py-20">
            <Card>
              <CardContent className="flex justify-center items-center flex-col text-center min-h-[400px] p-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg font-semibold text-primary">
                  Generating your full report...
                </p>
                 <p className="mt-2 text-muted-foreground max-w-sm animate-pulse">
                    {randomFact}
                </p>
              </CardContent>
            </Card>
        </div>
    );
  }

  if (!fullReport || !resumeData) {
     return (
        <div className="w-full flex justify-center items-center py-20">
          <Card>
            <CardContent className="flex justify-center items-center flex-col text-center min-h-[400px] border-dashed border-2 rounded-lg p-10">
              <p className="text-muted-foreground">
                Could not generate a report. Please try again.
              </p>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className='grid w-full grid-cols-6'>
            <TabsTrigger value="analysis">Initial Analysis</TabsTrigger>
            <TabsTrigger value="resume">Tailored Resume</TabsTrigger>
            <TabsTrigger value="cover-letter"><FileText className='w-4 h-4 mr-2'/>Cover Letter</TabsTrigger>
            <TabsTrigger value="skill-analysis"><Brain className='w-4 h-4 mr-2'/>Skill Analysis</TabsTrigger>
            <TabsTrigger value="interview-prep"><MessageSquareQuote className='w-4 h-4 mr-2'/>Interview Prep</TabsTrigger>
            <TabsTrigger value="career-path"><Briefcase className='w-4 h-4 mr-2'/>Career Path</TabsTrigger>
      </TabsList>
      
       <TabsContent value="analysis" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Initial ATS Analysis</CardTitle>
                    <CardDescription>
                    This is how your original resume scored against the job description before tailoring.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg">
                        <div className="text-7xl font-bold text-primary font-headline">
                            {fullReport.initialAtsScore}
                        </div>
                        <div className="text-sm text-muted-foreground">Initial ATS Score</div>
                    </div>
                    <div className="space-y-6">
                       <AtsScoreBreakdown breakdown={fullReport.atsScoreBreakdown} />
                       {renderApplyRecommendation(fullReport.initialAtsScore)}
                    </div>
                </CardContent>
            </Card>
            <AtsExplanation />
          </div>
      </TabsContent>

       <TabsContent value="resume" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Editor */}
              <div className="flex flex-col gap-6 h-full">
                <Card className="flex-shrink-0">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-headline text-2xl flex items-center">
                          <Edit className="mr-2 h-6 w-6" />
                          Your Tailored Resume
                        </CardTitle>
                        <CardDescription>
                          Edit your new resume below. The preview will update live.
                        </CardDescription>
                      </div>
                      <div className="text-center p-4 bg-secondary rounded-lg shrink-0">
                        <div className="text-4xl font-bold text-primary font-headline">
                          {fullReport.tailoredAtsScore}
                        </div>
                        <div className="text-xs text-muted-foreground">New ATS Score</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                <ResumeEditor resumeData={resumeData} setResumeData={setResumeData} />
              </div>

              {/* Right Column: Preview */}
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                       <CardTitle className="font-headline text-xl whitespace-nowrap">Live Preview</CardTitle>
                        <div className="flex items-center gap-2">
                           <Label htmlFor="region" className="text-xs">Region</Label>
                            <Select value={region} onValueChange={setRegion}>
                            <SelectTrigger id="region" className="w-[150px] h-8">
                                <SelectValue placeholder="Region" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="north-american">North American</SelectItem>
                                <SelectItem value="european">European</SelectItem>
                            </SelectContent>
                            </Select>

                            <Label htmlFor="template" className="text-xs">Template</Label>
                            <Select value={template} onValueChange={setTemplate}>
                            <SelectTrigger id="template" className="w-[120px] h-8">
                                <SelectValue placeholder="Template" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="classic">Classic</SelectItem>
                                <SelectItem value="modern">Modern</SelectItem>
                                <SelectItem value="creative">Creative</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="ml-auto" size="sm" disabled={isExporting}>
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                {isExporting ? 'Exporting...' : 'Export'} 
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>Download as PDF</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportDOCX} disabled={isExporting}>Download as Word (.docx)</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {/* Photo uploader for european templates */}
                     {['european'].includes(region) && (
                        <Card className="mt-4 border-dashed border-accent">
                            <CardHeader>
                                <CardTitle className="text-lg">Photo Recommended</CardTitle>
                                <CardDescription>Upload a professional headshot for this regional format.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                     <Avatar className="h-24 w-24">
                                        <AvatarImage src={resumeData?.basics?.photo} />
                                        <AvatarFallback><UserIcon className="h-12 w-12 text-muted-foreground" /></AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-2">
                                        <Input
                                            id="photo-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/png, image/jpeg"
                                            onChange={handlePhotoUpload}
                                        />
                                        <Button type="button" variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>
                                            <Upload className="mr-2 h-4 w-4" /> Upload Photo
                                        </Button>
                                        <p className="text-xs text-muted-foreground">PNG or JPG recommended.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                  </CardHeader>
                  <CardContent className="bg-secondary p-4 flex justify-center items-start overflow-auto h-[calc(100vh-18rem)]">
                    <div
                      ref={resumePreviewRef}
                      className="w-[8.5in] min-h-[11in] bg-white shadow-lg origin-top"
                      style={{
                        transform: `scale(0.55)`,
                        transformOrigin: 'top center',
                      }}
                    >
                      {renderTemplate()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
      <TabsContent value="cover-letter" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Generated Cover Letter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loadingTabs['cover-letter'] ? renderTabContentLoader() : (
                        <>
                            <Textarea 
                            value={fullReport.coverLetter || ''}
                            onChange={(e) => setFullReport({...fullReport, coverLetter: e.target.value})}
                            className="min-h-[400px] text-sm font-mono"
                            />
                            <Button onClick={handleDownloadCoverLetter} disabled={!fullReport.coverLetter}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Cover Letter
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
      </TabsContent>
       <TabsContent value="skill-analysis" className="mt-4">
            {loadingTabs['skill-analysis'] ? renderTabContentLoader() : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CheckSquare className="text-green-500"/> Integrated Keywords</CardTitle>
                            <CardDescription>Keywords from the job description that we successfully integrated into your resume.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {fullReport.integratedKeywords && fullReport.integratedKeywords.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                {fullReport.integratedKeywords.map((skill, index) => (
                                    <Badge key={index} variant="secondary">{skill}</Badge>
                                ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground flex items-center gap-2"><Info className="h-4 w-4"/>No specific keywords were integrated.</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-amber-500"/> Missing Keywords</CardTitle>
                            <CardDescription>Important keywords from the job that could not be added to your resume based on your experience.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {fullReport.missingKeywords && fullReport.missingKeywords.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                {fullReport.missingKeywords.map((skill, index) => (
                                    <Badge key={index} variant="destructive">{skill}</Badge>
                                ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground flex items-center gap-2"><Info className="h-4 w-4"/>Great news! No major skill gaps were found.</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Suggested Courses &amp; Certifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-muted-foreground">Consider these courses or certifications to fill skill gaps and strengthen your profile.</p>
                            {fullReport.suggestedCertifications && fullReport.suggestedCertifications.length > 0 ? (
                                <ul className="space-y-3">
                                {fullReport.suggestedCertifications.map((cert, index) => (
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
                                <div className="text-sm text-muted-foreground">No specific certifications were suggested for this role.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
      </TabsContent>
       <TabsContent value="interview-prep" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Interview Q&amp;A</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingTabs['interview-prep'] ? renderTabContentLoader() : (
                           <ScrollArea className="h-[500px] pr-4">
                            {fullReport.interviewQA && fullReport.interviewQA.length > 0 ? (
                                <div className="space-y-4">
                                {fullReport.interviewQA.map((qa, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-secondary/50">
                                    <h4 className="font-semibold mb-2">{qa.question}</h4>
                                    <p className="text-sm text-muted-foreground font-mono">{qa.answer}</p>
                                </div>
                                ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">No interview questions were generated.</div>
                            )}
                          </ScrollArea>
                        )}
                    </CardContent>
                </Card>
      </TabsContent>
      <TabsContent value="career-path" className="mt-4">
        {loadingCareerPath ? (
            <div className="w-full flex justify-center items-center py-20">
                <Card>
                  <CardContent className="flex justify-center items-center flex-col text-center min-h-[400px] p-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-semibold text-primary">
                      Analyzing your career trajectory...
                    </p>
                  </CardContent>
                </Card>
            </div>
        ) : careerPathData ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Suggested Career Paths</CardTitle>
                        <CardDescription>Based on your resume, here are some career paths that could be a great fit.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {careerPathData.careerSuggestions.map((path, index) => (
                           <div key={index} className="p-4 border rounded-lg">
                                <h4 className="font-semibold">{path.pathTitle}</h4>
                                <p className="text-sm text-muted-foreground">{path.pathDescription}</p>
                           </div>
                       ))}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Possible Job Positions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {careerPathData.possibleJobPositions.map((pos, index) => (
                                <Badge key={index} variant="secondary">{pos}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recommended Certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                        {careerPathData.suggestedCertifications.map((cert, index) => (
                            <li key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted">
                            <Award className="h-5 w-5 text-amber-500 mt-0.5 shrink-0"/>
                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline flex items-center gap-1.5">
                                {cert.name}
                                <LinkIcon className="h-3 w-3" />
                            </a>
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        ) : (
            <div className="text-center text-muted-foreground p-8">Career path analysis could not be loaded. Please try again later.</div>
        )}
      </TabsContent>
    </Tabs>
  );
}


export default function ReportPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/30">
            <Header />
            <main className="flex-1">
                <section className="container mx-auto px-4 pt-12 pb-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
                        Your Optimized Application Kit
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                        Review your analysis, edit your resume, and download your materials.
                        </p>
                    </div>
                </section>
                <section className="container mx-auto px-4 pb-20 pt-8">
                    <Suspense fallback={<div className="flex justify-center items-center h-96"><Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" /></div>}>
                        <ReportContent />
                    </Suspense>
                </section>
            </main>
        </div>
    )
}
