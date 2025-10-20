
'use client';

import { useState } from 'react';
import type { FormData as ResumeFormData } from '@/app/build/page';
import type { PolishContext } from '@/app/tailor/report/page';
import { CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Wand2, Link as LinkIcon, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { aiResumePolishing, AiResumePolishingOutput } from '@/ai/flows/ai-resume-polishing';

interface ResumeEditorProps {
    resumeData: ResumeFormData;
    setResumeData: (data: ResumeFormData) => void;
}

export function ResumeEditor({ resumeData, setResumeData }: ResumeEditorProps) {
  const [loadingPolish, setLoadingPolish] = useState(false);
  const [polishResult, setPolishResult] = useState<AiResumePolishingOutput | null>(null);
  const [polishContext, setPolishContext] = useState<PolishContext | null>(null);
  const { toast } = useToast();

   const handlePolish = async (context: PolishContext) => {
    if (!resumeData) return;
    setLoadingPolish(true);
    setPolishResult(null);
    setPolishContext(context);
    try {
      const result = await aiResumePolishing({
        resumeSection: context.section,
        currentContent: context.content,
      });
      setPolishResult(result);
    } catch (e: any) {
      toast({
        title: 'Polish Failed',
        description: e.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPolish(false);
    }
  };

    const renderBasics = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Basics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={resumeData.basics.name} onChange={(e) => setResumeData({ ...resumeData, basics: { ...resumeData.basics, name: e.target.value } })} />
        </div>
        <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={resumeData.basics.email} onChange={(e) => setResumeData({ ...resumeData, basics: { ...resumeData.basics, email: e.target.value } })} />
        </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={resumeData.basics.phone} onChange={(e) => setResumeData({ ...resumeData, basics: { ...resumeData.basics, phone: e.target.value } })} />
        </div>
        <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={resumeData.basics.location} onChange={(e) => setResumeData({ ...resumeData, basics: { ...resumeData.basics, location: e.target.value } })} />
        </div>
        </div>
        <div>
        <Label htmlFor="summary">Summary</Label>
        <div className="relative">
            <Textarea id="summary" placeholder="A brief professional summary..." value={resumeData.basics.summary} onChange={(e) => setResumeData({ ...resumeData, basics: { ...resumeData.basics, summary: e.target.value } })} />
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handlePolish({ section: 'Summary', content: resumeData.basics.summary, onUpdate: (newContent) => setResumeData({...resumeData, basics: {...resumeData.basics, summary: newContent }})})}><Wand2 className="w-4 h-4" /></Button>
                </DialogTrigger>
                {(polishResult && polishContext?.section === 'Summary') && <DialogContent>
                    <DialogHeader><DialogTitle>Polish: {polishContext.section}</DialogTitle></DialogHeader>
                    {loadingPolish ? <Loader2 className="animate-spin" /> : <>
                        <h4 className="font-semibold">Polished Content</h4>
                        <Textarea readOnly value={polishResult.polishedContent} className="h-32"/>
                        <Button onClick={() => {if(polishContext) {polishContext.onUpdate(polishResult.polishedContent)}; setPolishResult(null); setPolishContext(null)}}>Use this version</Button>
                    </>}
                </DialogContent>}
                </Dialog>
        </div>
        </div>
        <div className="space-y-2">
            <Label>Links</Label>
            {resumeData.basics.links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Input placeholder="Label (e.g. LinkedIn)" value={link.label} onChange={(e) => {
                            const newLinks = [...resumeData.basics.links];
                            newLinks[index].label = e.target.value;
                            setResumeData({...resumeData, basics: {...resumeData.basics, links: newLinks }});
                    }} />
                    <Input placeholder="URL" value={link.url} onChange={(e) => {
                            const newLinks = [...resumeData.basics.links];
                            newLinks[index].url = e.target.value;
                            setResumeData({...resumeData, basics: {...resumeData.basics, links: newLinks }});
                    }} />
                    <Button variant="ghost" size="icon" onClick={() => {
                        const newLinks = resumeData.basics.links.filter((_, i) => i !== index);
                        setResumeData({...resumeData, basics: {...resumeData.basics, links: newLinks}});
                    }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => {
                const newLinks = [...resumeData.basics.links, {label: '', url: ''}];
                setResumeData({...resumeData, basics: {...resumeData.basics, links: newLinks}});
            }}>
                <LinkIcon className="mr-2 h-4 w-4" /> Add Link
            </Button>
        </div>
    </div>
 );

 const renderEducation = () => (
    <div className='space-y-4'>
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Education</h3>
        {resumeData.education.map((edu, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-md mb-4 relative">
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>School</Label>
                    <Input value={edu.school} onChange={(e) => {
                    const newEdu = [...resumeData.education];
                    newEdu[index].school = e.target.value;
                    setResumeData({ ...resumeData, education: newEdu });
                    }} />
                </div>
                <div>
                    <Label>Degree</Label>
                    <Input value={edu.degree} onChange={(e) => {
                    const newEdu = [...resumeData.education];
                    newEdu[index].degree = e.target.value;
                    setResumeData({ ...resumeData, education: newEdu });
                    }} />
                </div>
                </div>
                <Label>Year of Graduation</Label>
                <Input value={edu.year} onChange={(e) => {
                const newEdu = [...resumeData.education];
                newEdu[index].year = e.target.value;
                setResumeData({ ...resumeData, education: newEdu });
                }} />
                <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => {
                const newEdu = resumeData.education.filter((_, i) => i !== index);
                setResumeData({...resumeData, education: newEdu});
                }}>
                <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        ))}
        <Button variant="outline" onClick={() => setResumeData({ ...resumeData, education: [...resumeData.education, { school: '', degree: '', year: '' }] })}>Add Education</Button>
    </div>
 );

 const renderExperience = () => (
    <div className='space-y-4'>
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Experience</h3>
        {resumeData.experience.map((exp, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-md mb-4 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => {
                    const newExp = resumeData.experience.filter((_, i) => i !== index);
                    setResumeData({...resumeData, experience: newExp});
                }}>
                <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Company</Label>
                    <Input value={exp.company} onChange={(e) => {
                    const newExp = [...resumeData.experience];
                    newExp[index].company = e.target.value;
                    setResumeData({ ...resumeData, experience: newExp });
                    }} />
                </div>
                <div>
                    <Label>Role</Label>
                    <Input value={exp.role} onChange={(e) => {
                    const newExp = [...resumeData.experience];
                    newExp[index].role = e.target.value;
                    setResumeData({ ...resumeData, experience: newExp });
                    }} />
                </div>
                </div>
                <Label>Years</Label>
                <Input value={exp.years} placeholder="e.g., 2020 - Present" onChange={(e) => {
                const newExp = [...resumeData.experience];
                newExp[index].years = e.target.value;
                setResumeData({ ...resumeData, experience: newExp });
                }} />
                <Label>Description</Label>
                <div className="relative">
                <Textarea placeholder="Describe your responsibilities and achievements..." value={exp.description} onChange={(e) => {
                    const newExp = [...resumeData.experience];
                    newExp[index].description = e.target.value;
                     setResumeData({ ...resumeData, experience: newExp });
                }} />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handlePolish({ section: `Experience at ${exp.company}`, content: exp.description, onUpdate: (newContent) => {
                            const newExp = [...resumeData.experience];
                            newExp[index].description = newContent;
                            setResumeData({ ...resumeData, experience: newExp });
                        }})}><Wand2 className="w-4 h-4" /></Button>
                    </DialogTrigger>
                    {(polishResult && polishContext?.section === `Experience at ${exp.company}`) && <DialogContent>
                        <DialogHeader><DialogTitle>Polish: {polishContext.section}</DialogTitle></DialogHeader>
                        {loadingPolish ? <Loader2 className="animate-spin" /> : <>
                        <h4 className="font-semibold">Polished Content</h4>
                        <Textarea readOnly value={polishResult.polishedContent} className="h-32"/>
                        <Button onClick={() => {if(polishContext) {polishContext.onUpdate(polishResult.polishedContent)}; setPolishResult(null); setPolishContext(null)}}>Use this version</Button>
                        </>}
                    </DialogContent>}
                    </Dialog>
                </div>
            </div>
        ))}
        <Button variant="outline" onClick={() => setResumeData({ ...resumeData, experience: [...resumeData.experience, { company: '', role: '', years: '', description: '' }] })}>Add Experience</Button>
    </div>
 );

 const renderSkills = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Skills &amp; Languages</h3>
        <div>
        <Label>Skills</Label>
        <Textarea placeholder="Enter skills, separated by commas" value={resumeData.skills.join(', ')} onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value.split(',').map(s => s.trim()) })} />
        </div>
        <div>
        <Label>Certifications</Label>
        <Textarea placeholder="Enter certifications, separated by commas" value={resumeData.certifications.join(', ')} onChange={(e) => setResumeData({ ...resumeData, certifications: e.target.value.split(',').map(s => s.trim()) })} />
        </div>
        <div>
        <Label>Languages</Label>
        <Textarea placeholder="Enter languages, separated by commas" value={resumeData.languages.join(', ')} onChange={(e) => setResumeData({ ...resumeData, languages: e.target.value.split(',').map(s => s.trim()) })} />
        </div>
    </div>
 );

 const renderCustom = () => (
    <div className='space-y-4'>
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Custom Sections</h3>
        {resumeData.customSections.map((section, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-md mb-4 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => {
                    const newCustom = resumeData.customSections.filter((_, i) => i !== index);
                    setResumeData({...resumeData, customSections: newCustom});
                }}>
                <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                <Label>Section Title</Label>
                <Input value={section.title} onChange={(e) => {
                    const newCustom = [...resumeData.customSections];
                    newCustom[index].title = e.target.value;
                    setResumeData({...resumeData, customSections: newCustom});
                }} />
                <Label>Content</Label>
                <div className="relative">
                <Textarea value={section.content} onChange={(e) => {
                    const newCustom = [...resumeData.customSections];
                    newCustom[index].content = e.target.value;
                    setResumeData({...resumeData, customSections: newCustom});
                }} />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handlePolish({ section: section.title, content: section.content, onUpdate: (newContent) => {
                            const newCustom = [...resumeData.customSections];
                            newCustom[index].content = newContent;
                            setResumeData({ ...resumeData, customSections: newCustom });
                        }})}><Wand2 className="w-4 h-4" /></Button>
                    </DialogTrigger>
                    {(polishResult && polishContext?.section === section.title) && <DialogContent>
                        <DialogHeader><DialogTitle>Polish: {polishContext.section}</DialogTitle></DialogHeader>
                        {loadingPolish ? <Loader2 className="animate-spin" /> : <>
                            <h4 className="font-semibold">Polished Content</h4>
                            <Textarea readOnly value={polishResult.polishedContent} className="h-32"/>
                            <Button onClick={() => {if(polishContext) {polishContext.onUpdate(polishResult.polishedContent)}; setPolishResult(null); setPolishContext(null)}}>Use this version</Button>
                        </>}
                    </DialogContent>}
                    </Dialog>
                </div>
            </div>
        ))}
        <Button variant="outline" onClick={() => setResumeData({...resumeData, customSections: [...resumeData.customSections, { title: '', content: ''}]})}>Add Custom Section</Button>
    </div>
 );

  return (
    <ScrollArea className="h-[calc(100vh-24rem)]">
        <CardContent className="space-y-8 pt-6">
            {renderBasics()}
            {renderEducation()}
            {renderExperience()}
            {renderSkills()}
            {renderCustom()}
        </CardContent>
    </ScrollArea>
  );
}
