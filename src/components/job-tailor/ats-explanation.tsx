
'use client';

import { ArrowRight, Briefcase, Check, FileText, Filter, Server, Sparkles, UserCheck, UserX, GraduationCap, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

export function AtsExplanation() {
  const Step = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  const Arrow = () => (
    <div className="flex-1 flex justify-center items-center">
      <ArrowRight className="h-8 w-8 text-primary/30" />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>How Applicant Tracking Systems (ATS) Work</CardTitle>
         <CardDescription>
            An Applicant Tracking System (ATS) is software used by most companies to automatically scan your resume for keywords, skills, and experience that match the job description. To get past the ATS and reach a human recruiter, your resume needs to be formatted correctly and contain the right information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Main Flow */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-2">
          <Step
            icon={<FileText size={32} />}
            title="1. Submission"
            description="You upload your resume to a company's career portal."
          />
          <Arrow />
          <Step
            icon={<Server size={32} />}
            title="2. Parsing"
            description="The ATS scans and extracts text into categories like 'Skills' and 'Experience'."
          />
          <Arrow />
          <Step
            icon={<Filter size={32} />}
            title="3. Filtering"
            description="It checks for basic qualifications and keywords from the job description."
          />
          <Arrow />
           <Step
            icon={<Sparkles size={32} />}
            title="4. Scoring"
            description="Your resume is scored based on relevance to the job role."
          />
        </div>

        {/* Detail Cards */}
        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
            {/* What it looks for */}
            <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Check className="text-green-500" /> What the ATS Looks For</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p className="flex items-start gap-2"><Briefcase className="h-4 w-4 mt-0.5 shrink-0"/> <strong>Keywords:</strong> Exact words/phrases from the job description (e.g., "Project Management", "React").</p>
                    <p className="flex items-start gap-2"><GraduationCap className="h-4 w-4 mt-0.5 shrink-0"/> <strong>Relevant Experience:</strong> Job titles and responsibilities that align with the role.</p>
                    <p className="flex items-start gap-2"><FileText className="h-4 w-4 mt-0.5 shrink-0"/> <strong>Standard Formatting:</strong> Clear headings (Experience, Education) and simple layouts.</p>
                </CardContent>
            </Card>

            {/* What it struggles with */}
             <Card className="bg-secondary/50">
                <CardHeader>
                     <CardTitle className="text-lg flex items-center gap-2"><X className="text-red-500" /> What the ATS Struggles With</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p className="flex items-start gap-2"><Briefcase className="h-4 w-4 mt-0.5 shrink-0"/> <strong>Complex Designs:</strong> Graphics, columns, and tables can confuse the parser.</p>
                    <p className="flex items-start gap-2"><GraduationCap className="h-4 w-4 mt-0.5 shrink-0"/> <strong>Unconventional Fonts:</strong> Fancy or custom fonts may not be readable.</p>
                    <p className="flex items-start gap-2"><FileText className="h-4 w-4 mt-0.5 shrink-0"/> <strong>Headers/Footers:</strong> Information in the document's header or footer is often ignored.</p>
                </CardContent>
            </Card>
        </div>


        {/* Outcome */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold text-center mb-4">5. The Outcome</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center p-6 bg-green-500/10 rounded-lg text-center border border-green-500/30">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-500/20 text-green-600 mb-3">
                    <UserCheck size={28} />
                </div>
                <h4 className="font-bold text-green-700">PASS</h4>
                <p className="text-sm text-green-600">Your resume matched the criteria and is forwarded to a human recruiter.</p>
            </div>
             <div className="flex flex-col items-center p-6 bg-red-500/10 rounded-lg text-center border border-red-500/30">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 text-red-600 mb-3">
                    <UserX size={28} />
                </div>
                <h4 className="font-bold text-red-700">FAIL</h4>
                <p className="text-sm text-red-600">Your resume did not meet the minimum requirements and is filtered out.</p>
            </div>
          </div>
        </div>
         <p className="text-center text-sm text-muted-foreground pt-4">JobTailor helps you optimize your resume to pass the filter and reach the recruiter.</p>

      </CardContent>
    </Card>
  );
}
