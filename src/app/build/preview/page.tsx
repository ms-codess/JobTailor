'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, ArrowLeft, User as UserIcon } from 'lucide-react';
import type { FormData as ResumeFormData } from '@/types/resume';
import Link from 'next/link';

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

const TemplateLoader = () => (
  <div className="p-8 space-y-4">
    <div className="h-8 w-1/2 mx-auto bg-muted rounded" />
    <div className="h-4 w-3/4 mx-auto bg-muted rounded" />
    <div className="space-y-6 pt-4">
      <div className="h-4 w-1/4 bg-muted rounded" />
      <div className="h-16 w-full bg-muted rounded" />
      <div className="h-4 w-1/4 bg-muted rounded" />
      <div className="h-16 w-full bg-muted rounded" />
    </div>
  </div>
);

const ClassicTemplate = dynamic(() => import('@/components/resume-templates/classic-template').then(mod => mod.ClassicTemplate), { loading: () => <TemplateLoader /> });
const ModernTemplate = dynamic(() => import('@/components/resume-templates/modern-template').then(mod => mod.ModernTemplate), { loading: () => <TemplateLoader /> });
const CreativeTemplate = dynamic(() => import('@/components/resume-templates/creative-template').then(mod => mod.CreativeTemplate), { loading: () => <TemplateLoader /> });
const EuropeanClassicTemplate = dynamic(() => import('@/components/resume-templates/european-classic-template').then(mod => mod.EuropeanClassicTemplate), { loading: () => <TemplateLoader /> });
const EuropeanModernTemplate = dynamic(() => import('@/components/resume-templates/european-modern-template').then(mod => mod.EuropeanModernTemplate), { loading: () => <TemplateLoader /> });
const EuropeanCreativeTemplate = dynamic(() => import('@/components/resume-templates/european-creative-template').then(mod => mod.EuropeanCreativeTemplate), { loading: () => <TemplateLoader /> });

export default function BuildPreviewPage() {
  const { toast } = useToast();
  const [resumeData, setResumeData] = useState<ResumeFormData | null>(null);
  const [region, setRegion] = useState<'north-american' | 'european'>('north-american');
  const [template, setTemplate] = useState<'classic' | 'modern' | 'creative'>('classic');
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.85);
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('build_resume_draft');
      if (raw) setResumeData(JSON.parse(raw));
    } catch {
      setResumeData(null);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (!previewContainerRef.current) return;
      const container = previewContainerRef.current;
      const padding = 32;
      const availableWidth = container.clientWidth - padding * 2;
      const availableHeight = container.clientHeight - padding * 2;
      const scaleW = availableWidth / (8.5 * 96);
      const scaleH = availableHeight / (11 * 96);
      const newScale = Math.max(0.5, Math.min(scaleW, scaleH));
      setPreviewScale(newScale);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderTemplate = () => {
    if (!resumeData) return null;
    const isEuropean = region === 'european';
    if (isEuropean) {
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

      const originalTransform = input.style.transform;
      input.style.transform = 'scale(1)';
      input.style.transformOrigin = 'top left';

      const inputRect = input.getBoundingClientRect();
      const anchors = Array.from(input.querySelectorAll('a[href]')) as HTMLAnchorElement[];
      const linkRects = anchors.map(a => {
        const r = a.getBoundingClientRect();
        return { href: a.href, x: r.left - inputRect.left, y: r.top - inputRect.top, w: r.width, h: r.height };
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

      const js: any = jsPDF;
      const pdf = new js({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const renderWidthMM = pageWidth - margin * 2;
      const mmPerCanvasPx = renderWidthMM / canvas.width;
      const mmPerCssPx = mmPerCanvasPx * captureScale;
      const sliceHeightPx = Math.floor((pageHeight - margin * 2) / mmPerCanvasPx);

      let yOffsetPx = 0;
      let isFirstPage = true;
      while (yOffsetPx < canvas.height) {
        if (!isFirstPage) pdf.addPage();
        isFirstPage = false;
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(sliceHeightPx, canvas.height - yOffsetPx);
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, yOffsetPx, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
        }
        const imgData = pageCanvas.toDataURL('image/png');
        const renderHeightMM = pageCanvas.height * mmPerCanvasPx;
        pdf.addImage(imgData, 'PNG', margin, margin, renderWidthMM, renderHeightMM);

        for (const lr of linkRects) {
          const top = lr.y, bottom = lr.y + lr.h, sliceTop = yOffsetPx, sliceBottom = yOffsetPx + pageCanvas.height;
          if (bottom <= sliceTop || top >= sliceBottom) continue;
          const xMM = margin + lr.x * mmPerCssPx;
          const yMM = margin + (lr.y - yOffsetPx) * mmPerCssPx;
          const wMM = lr.w * mmPerCssPx;
          const hMM = lr.h * mmPerCssPx;
          try {
            if (typeof (pdf as any).link === 'function') (pdf as any).link(xMM, yMM, wMM, hMM, { url: lr.href });
            else if ((pdf as any).textWithLink) {
              (pdf as any).setTextColor(255, 255, 255);
              (pdf as any).textWithLink(' ', xMM, yMM + hMM / 2, { url: lr.href });
              (pdf as any).setTextColor(0, 0, 0);
            }
          } catch {}
        }
        yOffsetPx += pageCanvas.height;
      }
      pdf.save('resume.pdf');
    } catch (error) {
      console.error('Failed to export PDF', error);
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
      const { saveAs } = await import('file-saver');
      const { generateDocx } = await import('@/lib/docx-generator');
      const blob = await generateDocx(resumeData);
      saveAs(blob, 'resume.docx');
    } catch (error) {
      console.error('Failed to export DOCX', error);
      toast({ title: 'Word Export Failed', description: 'An unexpected error occurred during document generation.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!resumeData) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Unsupported file', description: 'Please upload a PNG or JPG image.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const updated = { ...resumeData, basics: { ...resumeData.basics, photo: reader.result as string } };
      setResumeData(updated);
      try { localStorage.setItem('build_resume_draft', JSON.stringify(updated)); } catch {}
    };
    reader.readAsDataURL(file);
  };

  if (!resumeData) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/20">
        <Header />
        <main className="flex-1">
          <section className="container mx-auto px-4 py-10">
            <Card>
              <CardHeader>
                <CardTitle>No resume data found</CardTitle>
                <CardDescription>Please go back and build your resume first.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/build"><Button><ArrowLeft className="mr-2 h-4 w-4" /> Back to Build</Button></Link>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-6 md:py-10">
          <div className="flex items-center justify-between mb-4">
            <Link href="/build"><Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit</Button></Link>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="font-headline text-xl text-foreground">Preview & Download</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="region" className="text-xs">Region</Label>
                  <Select value={region} onValueChange={(v: any) => setRegion(v)}>
                    <SelectTrigger id="region" className="w-[150px] h-8">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north-american">North American</SelectItem>
                      <SelectItem value="european">European</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label htmlFor="template" className="text-xs">Template</Label>
                  <Select value={template} onValueChange={(v: any) => setTemplate(v)}>
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

              {region === 'european' && (
                <Card className="mt-4 border-dashed">
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
                        <Input id="photo-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handlePhotoUpload} />
                        <Button type="button" variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>Upload Photo</Button>
                        {resumeData?.basics?.photo && (
                          <Button type="button" variant="ghost" onClick={() => { const updated = { ...resumeData, basics: { ...resumeData.basics, photo: '' } }; setResumeData(updated); try { localStorage.setItem('build_resume_draft', JSON.stringify(updated)); } catch {} }}>Remove Photo</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardHeader>
            <CardContent className="bg-secondary p-0 h-[calc(110vh-5rem)]" ref={previewContainerRef}>
              <ScrollArea className="h-full pr-0">
                <div className="flex justify-center items-center h-full">
                  <div ref={resumePreviewRef} className="w-[8.5in] min-h-[11in] bg-white shadow-lg origin-top" style={{ transform: `scale(${previewScale})`, transformOrigin: 'center center' }}>
                    {renderTemplate()}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

