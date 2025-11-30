
'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Loader2, Download, ChevronDown, Link as LinkIcon, Trash2, Wand2, Edit, FileText, CheckSquare, Award, MessageSquareQuote, Info, AlertTriangle, Brain, ThumbsUp, ThumbsDown, Briefcase } from 'lucide-react';
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
import type { FormData as ResumeFormData } from '@/types/resume';
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
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

import { normalizeCoverLetterParagraphs } from '@/lib/cover-letter-format';

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
export type PolishContext = {
  section: string;
  content: string;
  onUpdate: (newContent: string) => void;
};

type FullReportData = GenerateTailoredResumeOutput & Partial<CoverLetterOutput> & Partial<SkillAnalysisOutput> & Partial<InterviewPrepOutput>;


function ReportContent() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [fullReport, setFullReport] = useState<FullReportData | null>(null);
  const [template, setTemplate] = useState('classic');
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const [resumeData, setResumeData] = useState<ResumeFormData | null>(null);
  const [randomFact, setRandomFact] = useState('');
  const [activeTab, setActiveTab] = useState('resume');
  const [resumeView, setResumeView] = useState<'edit' | 'split' | 'preview'>('split');
  const [previewScale, setPreviewScale] = useState<number>(0.65);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const [editorScale, setEditorScale] = useState<number>(0.9);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const [resumeInput, setResumeInput] = useState<GenerateTailoredResumeInput | null>(null);
  const [careerPathData, setCareerPathData] = useState<SuggestCareerPathOutput | null>(null);
  const [loadingCareerPath, setLoadingCareerPath] = useState(false);
  const [careerPathStarted, setCareerPathStarted] = useState(true);
  const [loadingTabs, setLoadingTabs] = useState({
    'cover-letter': false,
    'skill-analysis': false,
    'interview-prep': false,
  });
  const [isExporting, setIsExporting] = useState(false);
  // Split layout state
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const [editorWidthPct, setEditorWidthPct] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isLg, setIsLg] = useState(false);

  const isResumeReady = (resume?: ResumeFormData | null) => {
    if (!resume) return false;
    const experiences = resume.experience ?? [];
    if (experiences.length === 0) return false;
    const everyExperienceHasTasks = experiences.every(exp =>
      (exp.description || '')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean).length > 0
    );
    return everyExperienceHasTasks;
  };


  useEffect(() => {
    if (loading) {
      setRandomFact(jobHuntingFacts[Math.floor(Math.random() * jobHuntingFacts.length)]);
      const interval = setInterval(() => {
        setRandomFact(jobHuntingFacts[Math.floor(Math.random() * jobHuntingFacts.length)]);
      }, 5000); // Change fact every 5 seconds
      return () => clearInterval(interval);
    }
  }, [loading]);
  
  const generateAdditionalReportData = async (
    cacheKey: string,
    input: GenerateTailoredResumeInput,
    scope: Array<'cover-letter' | 'skill-analysis' | 'interview-prep'> = [
      'cover-letter',
      'skill-analysis',
      'interview-prep',
    ]
  ) => {
      const existingReportStr = localStorage.getItem(`report_${cacheKey}`);
      const parsedReport = existingReportStr ? JSON.parse(existingReportStr) : {};

      const wantsCoverLetter = scope.includes('cover-letter');
      const wantsSkillAnalysis = scope.includes('skill-analysis');
      const wantsInterviewPrep = scope.includes('interview-prep');

      const needsCoverLetter = wantsCoverLetter && !parsedReport.coverLetter;
      const needsSkillAnalysis = wantsSkillAnalysis && !parsedReport.integratedKeywords;
      const needsInterviewPrep = wantsInterviewPrep && !parsedReport.interviewQA;

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
          const promises: Promise<any>[] = [];
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

          if (hadError) {
            console.error('Some parts of the report could not be generated.');
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
          console.error('Failed to load additional materials', e);
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
        setErrorMessage('Missing report key. Please go back and try again.');
        setLoading(false);
        return;
    }

    const generateReport = async () => {
        setLoading(true);

        const cachedReport = localStorage.getItem(`report_${cacheKey}`);
        const resumeText = localStorage.getItem(`resume_${cacheKey}`);
        const jobDescription = localStorage.getItem(`jd_${cacheKey}`);

        if (!resumeText || !jobDescription) {
            setErrorMessage('Could not find the required data to generate a report. Please try again.');
            router.push('/tailor');
            return;
        }
        
        const input = { resumeText, jobDescription };

        if (cachedReport) {
            const reportData = JSON.parse(cachedReport);
            if (isResumeReady(reportData.tailoredResume)) {
              // Show cached data while regenerating a fresh report in the background
              setFullReport(reportData);
              setResumeData(reportData.tailoredResume);
              setResumeInput(input);
              // keep loading=true so the waiting screen stays visible until fresh data arrives
            }
            // if incomplete, fall through to regenerate without showing cached version
        }


        try {
            const response = await generateTailoredResume({
                resumeText,
                jobDescription,
            });
            if (!isResumeReady(response.tailoredResume)) {
              throw new Error('Tailored resume arrived incomplete. Please try again.');
            }
            setFullReport(response);
            setResumeData(response.tailoredResume);
            setResumeInput(input);
            localStorage.setItem(`report_${cacheKey}`, JSON.stringify(response));

        } catch (e: any) {
            setErrorMessage(e?.message || 'An unexpected error occurred while generating your report.');
        } finally {
            setLoading(false);
        }
    };
    
    generateReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, toast]);

  useEffect(() => {
    if (loading || !fullReport || careerPathData || !careerPathStarted) return;

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
    if (tab === 'career-path') setCareerPathStarted(true);
  };

  useEffect(() => {
    if (!resumeInput || !fullReport) return;
    const cacheKey = searchParams.get('key') || 'default';
    if (activeTab === 'cover-letter' && !fullReport.coverLetter && !loadingTabs['cover-letter']) {
      generateAdditionalReportData(cacheKey, resumeInput, ['cover-letter']);
    }
    if (activeTab === 'skill-analysis' && !fullReport.integratedKeywords && !loadingTabs['skill-analysis']) {
      generateAdditionalReportData(cacheKey, resumeInput, ['skill-analysis']);
    }
    if (activeTab === 'interview-prep' && !fullReport.interviewQA && !loadingTabs['interview-prep']) {
      generateAdditionalReportData(cacheKey, resumeInput, ['interview-prep']);
    }
  }, [activeTab, fullReport, resumeInput, searchParams]);

  // Auto-fit preview within its container (minimize unused space)
  useEffect(() => {
    if (activeTab !== 'resume') return;
    if (!previewContainerRef.current) return;
    const container = previewContainerRef.current;
    const ro = new ResizeObserver(() => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const pageW = 8.5 * 96; // px
      const pageH = 11 * 96;  // px
      if (cw === 0 || ch === 0) return;
      const scale = Math.min(cw / pageW, ch / pageH) * 0.99;
      const clamped = Math.max(0.4, Math.min(1.0, scale));
      setPreviewScale(clamped);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [resumeView, resumeData, activeTab]);

  // Sectioned editor control
  const [editSection, setEditSection] = useState<'basics' | 'education' | 'experience' | 'skills' | 'custom'>('basics');

  // Auto-fit editor within its container (show all fields, no scroll) for Split view
  useEffect(() => {
    if (!editorContainerRef.current) return;
    const el = editorContainerRef.current;
    const ro = new ResizeObserver(() => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const targetW = 900; // estimated full-form width
      const targetH = 1500; // estimated full-form height with all fields
      const scale = Math.min(cw / targetW, ch / targetH);
      const clamped = Math.max(0.55, Math.min(1.0, scale));
      setEditorScale(clamped);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [resumeData]);
  // (Preview fit handled above)

  // Track viewport breakpoint for responsive split behavior
  useEffect(() => {
    const updateIsLg = () => setIsLg(typeof window !== 'undefined' && window.innerWidth >= 1024);
    updateIsLg();
    window.addEventListener('resize', updateIsLg);
    return () => window.removeEventListener('resize', updateIsLg);
  }, []);

  // Drag handlers for split resize
  useEffect(() => {
    if (!isDraggingSplit) return;
    const onMove = (e: MouseEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const relX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
      const pct = (relX / rect.width) * 100;
      const clamped = Math.max(25, Math.min(75, pct));
      setEditorWidthPct(clamped);
    };
    const onUp = () => setIsDraggingSplit(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDraggingSplit]);

  // Touch support for split resize
  useEffect(() => {
    if (!isDraggingSplit) return;
    const onTouchMove = (e: TouchEvent) => {
      if (!splitContainerRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const relX = Math.min(Math.max(touch.clientX - rect.left, 0), rect.width);
      const pct = (relX / rect.width) * 100;
      const clamped = Math.max(25, Math.min(75, pct));
      setEditorWidthPct(clamped);
    };
    const onTouchEnd = () => setIsDraggingSplit(false);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDraggingSplit]);


  const renderTemplate = () => {
    if (!resumeData) return null;

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

        // Capture DOM size, anchor link rects, and render at scale(1)
        const originalTransform = input.style.transform;
        input.style.transform = 'scale(1)';
        input.style.transformOrigin = 'top left';

        const inputRect = input.getBoundingClientRect();
        const anchors = Array.from(input.querySelectorAll('a[href]')) as HTMLAnchorElement[];
        const linkRects = anchors.map(a => {
          const r = a.getBoundingClientRect();
          return {
            href: a.href,
            x: r.left - inputRect.left,
            y: r.top - inputRect.top,
            w: r.width,
            h: r.height,
          };
        });

        const captureScale = 2;
        const canvas = await html2canvas(input, {
          scale: captureScale,
          useCORS: true,
          logging: false,
          width: input.scrollWidth,
          height: input.scrollHeight,
          windowWidth: input.scrollWidth,
          windowHeight: input.scrollHeight,
          backgroundColor: '#ffffff',
        });

        input.style.transform = originalTransform;

        // Render everything onto a single-page PDF by scaling to fit A4 portrait with margins
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10; // mm

        const targetWidthMM = pageWidth - margin * 2;
        const targetHeightMM = pageHeight - margin * 2;

        const mmPerPx = targetWidthMM / canvas.width;
        const renderHeightMM = canvas.height * mmPerPx;

        // If content is too tall, reduce scale to fit height as well
        const heightScale = targetHeightMM / renderHeightMM;
        const finalScale = Math.min(1, heightScale);

        const finalWidthMM = targetWidthMM * finalScale;
        const finalHeightMM = renderHeightMM * finalScale;
        const offsetX = (pageWidth - finalWidthMM) / 2;
        const offsetY = (pageHeight - finalHeightMM) / 2;

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalWidthMM, finalHeightMM);

        // Add clickable link annotations mapped from DOM positions (scaled)
        for (const lr of linkRects) {
          const xMM = offsetX + lr.x * mmPerPx * finalScale;
          const yMM = offsetY + lr.y * mmPerPx * finalScale;
          const wMM = lr.w * mmPerPx * finalScale;
          const hMM = lr.h * mmPerPx * finalScale;
          try {
            const inst: any = pdf as any;
            if (typeof inst.link === 'function') {
              inst.link(xMM, yMM, Math.max(wMM, 2), Math.max(hMM, 2), { url: lr.href });
            } else if (typeof inst.textWithLink === 'function') {
              const prev = inst.getTextColor ? inst.getTextColor() : undefined;
              inst.setTextColor?.(0, 0, 255);
              inst.textWithLink('•', xMM + wMM / 2, yMM + hMM / 2, { url: lr.href });
              if (prev) inst.setTextColor?.(prev);
            }
          } catch {
            /* ignore link annotation failures */
          }
        }

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
      const saveAsModule = await import('file-saver');
      const saveAs = (saveAsModule as any).saveAs ?? (saveAsModule as any).default;
      if (!saveAs) {
        throw new Error('File saver unavailable');
      }
      const { generateDocx } = await import('@/lib/docx-generator');
      const blob = await generateDocx(resumeData, template as 'classic' | 'modern' | 'creative');
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
    const signature = resumeData?.basics?.name || '';
    const paragraphs = normalizeCoverLetterParagraphs(fullReport.coverLetter, signature);
    try {
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20; // mm
        const contentWidth = pageWidth - margin * 2;

        pdf.setFont('times', 'normal');
        pdf.setFontSize(11);
        // Looser line height for readability
        // @ts-ignore: jsPDF typings may not include setLineHeightFactor
        if (pdf.setLineHeightFactor) pdf.setLineHeightFactor(1.6);

        let y = margin;
        const lineHeight = 6;      // mm per line
        const paragraphGap = 8;    // mm between paragraphs
        paragraphs.forEach((para) => {
          const text = para.trim();
          if (!text) {
            y += paragraphGap; // single blank line
            return;
          }
          const wrapped = pdf.splitTextToSize(text, contentWidth);
          pdf.text(wrapped, margin, y);
          y += wrapped.length * lineHeight + paragraphGap;
        });
        pdf.save('cover-letter.pdf');
    } catch (e: any) {
        toast({
            title: 'Download Failed',
            description: e.message || 'Could not download cover letter.',
            variant: 'destructive'
        });
    }
  };

  const handleDownloadCoverLetterDocx = async () => {
    if (!fullReport?.coverLetter) return;
    const signature = resumeData?.basics?.name || '';
    const normalizedCover = normalizeCoverLetterParagraphs(fullReport.coverLetter, signature).join('\n\n');
    try {
      const saveAsModule = await import('file-saver');
      const saveAs = (saveAsModule as any).saveAs ?? (saveAsModule as any).default;
      if (!saveAs) {
        throw new Error('File saver unavailable');
      }
      const { generateCoverLetterDocx } = await import('@/lib/docx-cover-letter');
      const blob = await generateCoverLetterDocx(normalizedCover);
      saveAs(blob, 'cover-letter.docx');
    } catch (e: any) {
      toast({ title: 'Download Failed', description: e.message || 'Could not download cover letter.', variant: 'destructive' });
    }
  };


const scoreToLabel = (score: number) => {
  if (score >= 70) return 'High Match';
  if (score >= 40) return 'Medium Match';
  return 'Low Match';
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


  const isWaiting =
    loading ||
    (!fullReport && !errorMessage);

  if (isWaiting) {
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

  if (!fullReport || !resumeData || !fullReport.tailoredResume || !fullReport.tailoredResume.experience?.length) {
     return (
        <div className="w-full flex justify-center items-center py-20">
          <Card>
            <CardContent className="flex justify-center items-center flex-col text-center min-h-[400px] border-dashed border-2 rounded-lg p-10">
              <p className="text-muted-foreground">
                {errorMessage ?? 'Could not generate a report. Please try again.'}
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
            <TabsTrigger value="career-path">
              {loadingCareerPath && !careerPathData ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Briefcase className='w-4 h-4 mr-2'/>
              )}
              Career Path
            </TabsTrigger>
      </TabsList>
      
       <TabsContent value="analysis" className="mt-6">
          <div className="grid grid-cols-1 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Initial ATS Analysis</CardTitle>
                    <CardDescription>
                    This is how your original resume scored against the job description before tailoring.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-8 items-start">
                    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-white to-primary/5 rounded-lg">
                        <div className="text-4xl font-bold text-primary font-headline">
                            {scoreToLabel(fullReport.initialAtsScore)}
                        </div>
                        <div className="text-sm text-muted-foreground">Initial Match Level</div>
                    </div>
                    <div className="space-y-6">
                       <AtsScoreBreakdown breakdown={fullReport.atsScoreBreakdown} />
                       {renderApplyRecommendation(fullReport.initialAtsScore)}
                    </div>
                </CardContent>
            </Card></div>
      </TabsContent>

       <TabsContent value="resume" className="mt-6">
            <div className="flex flex-col gap-6 items-stretch">
              <div className="hidden">
                <div className="inline-flex items-center gap-1 rounded-md border bg-background p-1">
                  <Button size="sm" variant={editSection === 'basics' ? 'default' : 'ghost'} onClick={() => setEditSection('basics')}>Basics</Button>
                  <Button size="sm" variant={editSection === 'education' ? 'default' : 'ghost'} onClick={() => setEditSection('education')}>Education</Button>
                  <Button size="sm" variant={editSection === 'experience' ? 'default' : 'ghost'} onClick={() => setEditSection('experience')}>Experience</Button>
                  <Button size="sm" variant={editSection === 'skills' ? 'default' : 'ghost'} onClick={() => setEditSection('skills')}>Skills</Button>
                  <Button size="sm" variant={editSection === 'custom' ? 'default' : 'ghost'} onClick={() => setEditSection('custom')}>Custom</Button>
                </div>
                <div className="inline-flex items-center gap-1 rounded-md border bg-background p-1">
                  <Button size="sm" variant={resumeView === 'edit' ? 'default' : 'ghost'} onClick={() => setResumeView('edit')}>Edit</Button>
                  <Button size="sm" variant={resumeView === 'split' ? 'default' : 'ghost'} onClick={() => setResumeView('split')}>Split</Button>
                  <Button size="sm" variant={resumeView === 'preview' ? 'default' : 'ghost'} onClick={() => setResumeView('preview')}>Preview</Button>
                </div>
              </div>
              {/* Left Column: Editor */}
              <div className="hidden">
                <Card className="flex-shrink-0">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-headline text-2xl text-foreground flex items-center">
                          <Edit className="mr-2 h-6 w-6" />
                          Your Tailored Resume
                        </CardTitle>
                        <CardDescription>
                          Edit your new resume below. The preview will update live.
                        </CardDescription>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-primary/10 via-white to-primary/5 rounded-lg shrink-0">
                        <div className="text-4xl font-bold text-primary font-headline">
                          {fullReport.tailoredAtsScore}
                        </div>
                        <div className="text-xs text-muted-foreground">New ATS Score</div>
                      </div>
                    </div>
                </CardHeader>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <ResumeEditor section={editSection} resumeData={resumeData} setResumeData={setResumeData} />
                  </CardContent>
                </Card>
              </div>

              {/* Preview Full Width */}
              <Card className="hidden">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="font-headline text-xl text-foreground whitespace-nowrap">Live Preview</CardTitle>
                        <div className="flex items-center gap-2">
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
                               <Button className="ml-auto btn-primary" size="sm" disabled={isExporting}>
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
                </CardHeader>
                <CardContent className="bg-gradient-to-b from-white via-primary/5 to-white p-0 flex justify-center items-center overflow-hidden h-[85vh]" ref={previewContainerRef}>
                   <div
                     ref={resumePreviewRef}
                     className="w-[8.5in] min-h-[11in] bg-white shadow-lg origin-top"
                     style={{
                       transform: `scale(${previewScale})`,
                       transformOrigin: 'center center',
                     }}
                   >
                     {renderTemplate()}
                   </div>
                 </CardContent>
              </Card>

                <div ref={splitContainerRef} className="flex flex-col lg:flex-row gap-6 items-start w-full">
                  <Card className="h-[110vh] backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border border-white/50 shadow-xl" style={{ width: isLg ? `${editorWidthPct}%` : '100%' }}>
                    <CardHeader>
                      <CardTitle className="font-headline text-xl text-foreground">Edit</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[calc(110vh-5rem)] overflow-auto">
                      <ResumeEditor noScroll resumeData={resumeData} setResumeData={setResumeData} />
                    </CardContent>
                  </Card>
                  {/* Drag handle (visible on lg+) */}
                  <div
                    className="hidden lg:flex w-1 cursor-col-resize bg-border hover:bg-primary/60 transition-colors self-stretch"
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize editor and preview"
                    onMouseDown={() => setIsDraggingSplit(true)}
                    onTouchStart={() => setIsDraggingSplit(true)}
                  />
                  <Card className="h-[110vh] backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border border-white/50 shadow-xl" style={{ width: isLg ? `${100 - editorWidthPct}%` : '100%' }}>
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                      <CardTitle className="font-headline text-xl text-foreground whitespace-nowrap">Preview</CardTitle>
                        <div className="flex items-center gap-2">
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
                            <Button className="ml-auto btn-primary" size="sm" disabled={isExporting}>
                              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                              {isExporting ? 'Exporting...' : 'Export'}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>Download as PDF</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="bg-gradient-to-b from-white via-primary/5 to-white p-0 h-[calc(110vh-5rem)]" ref={previewContainerRef}>
                      <ScrollArea className="h-full pr-0">
                        <div className="flex justify-center items-center h-full">
                          <div
                            ref={resumePreviewRef}
                            className="w-[8.5in] min-h-[11in] bg-white shadow-lg origin-top"
                            style={{ transform: `scale(${previewScale})`, transformOrigin: 'center center' }}
                          >
                            {renderTemplate()}
                          </div>
                        </div>
                      </ScrollArea>
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
                        <div className="space-y-4">
                          {(() => {
                            const signature = resumeData?.basics?.name || '';
                            const normalized = normalizeCoverLetterParagraphs(fullReport.coverLetter || '', signature).join('\n\n');
                            return (
                              <Textarea
                                value={normalized}
                                onChange={(e) => setFullReport({...fullReport, coverLetter: e.target.value})}
                                className="min-h-[300px] text-sm"
                              />
                            );
                          })()}
                            <div className="flex gap-2">
                              <Button onClick={handleDownloadCoverLetter} disabled={!fullReport.coverLetter}>
                                <Download className="mr-2 h-4 w-4" />
                                Download as PDF
                              </Button>
                              <Button variant="secondary" onClick={handleDownloadCoverLetterDocx} disabled={!fullReport.coverLetter}>
                                <Download className="mr-2 h-4 w-4" />
                                Download as DOCX
                              </Button>
                            </div>
                        </div>
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
                                {fullReport.integratedKeywords.map((skill: string, index: number) => (
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
                                {fullReport.missingKeywords.map((skill: string, index: number) => (
                                    <Badge key={index} variant="destructive">{skill}</Badge>
                                ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground flex items-center gap-2"><Info className="h-4 w-4"/>Great news! No major skill gaps were found.</div>
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
                            {fullReport.interviewQA.map((qa: {question: string; answer: string}, index: number) => (
                                <div key={index} className="p-4 border rounded-lg bg-primary/5">
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
                       {careerPathData.careerSuggestions.map((path: {pathTitle: string; pathDescription: string}, index: number) => (
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
                            {careerPathData.possibleJobPositions.map((pos: string, index: number) => (
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
                        {careerPathData.suggestedCertifications.map((cert: {name: string; url: string}, index: number) => (
                            <li key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted">
                            <Award className="h-5 w-5 text-amber-500 mt-0.5 shrink-0"/>
                            {cert.url && cert.url.startsWith('http') ? (
                              <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline flex items-center gap-1.5">
                                  {cert.name}
                                  <LinkIcon className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-sm text-muted-foreground">{cert.name}</span>
                            )}
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
                        Tailored Resume
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                        Edit, preview, and download your resume and related materials.
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
