
'use client';

import type { FormData } from '@/app/build/page';
import { Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

interface EuropeanCreativeTemplateProps {
  data: FormData;
}

export function EuropeanCreativeTemplate({ data }: EuropeanCreativeTemplateProps) {
  const { basics, education, experience, skills, certifications, languages, customSections } = data;
  
  const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={className}>
      <h2 className="text-[9pt] font-bold uppercase tracking-widest text-purple-600 mb-3">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="flex bg-white text-gray-700 font-[system-ui] min-h-[11in] text-[9.5pt] leading-snug">
      {/* Main Content */}
      <main className="w-2/3 p-8 pr-4">
         <header className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tighter break-words">{basics.name}</h1>
         </header>

        <Section title="" className="mb-6">
           <p className="text-[10pt] leading-relaxed">{basics.summary}</p>
        </Section>

        <Section title="Experience" className="mb-6">
           {experience.map((exp, index) => (
            <div key={index} className="mb-4 relative pl-5 before:absolute before:left-0 before:top-1 before:w-1.5 before:h-1.5 before:bg-purple-500 before:rounded-full">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-[10.5pt] text-gray-800">{exp.role}</h3>
                <p className="text-[9pt] text-gray-500">{exp.years}</p>
              </div>
              <p className="text-[9.5pt] text-gray-600 mb-1">{exp.company}</p>
              <div className="prose prose-sm max-w-none text-gray-600 text-[9pt]">
                {exp.description.split('\n').map((line, i) => (line.trim() ? <p key={i} className="my-0.5">{line}</p> : null))}
              </div>
            </div>
          ))}
        </Section>
        
        <Section title="Education" className="mb-6">
          {education.map((edu, index) => (
            <div key={index} className="flex items-start mb-2 relative pl-5 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-purple-500 before:rounded-full">
              <div>
                <h3 className="font-semibold text-[10.5pt]">{edu.school}</h3>
                <p className="text-[9.5pt]">{edu.degree}</p>
              </div>
              <p className="text-[9pt] text-gray-500 pt-1 ml-auto">{edu.year}</p>
            </div>
          ))}
        </Section>

        {customSections.map((section, index) => (
            <Section key={index} title={section.title} className="mb-6">
                <div className="prose prose-sm max-w-none text-gray-600 pl-5 text-[9pt]">
                    {section.content.split('\n').map((line, i) => <p key={i} className="my-0.5">{line}</p>)}
                </div>
            </Section>
        ))}
      </main>

       {/* Right Sidebar */}
      <aside className="w-1/3 bg-purple-50 p-6 flex flex-col items-center">
        {basics.photo ? (
            <div className="w-20 h-20 rounded-full mb-4 mx-auto overflow-hidden shadow-md">
                <Image src={basics.photo} alt={basics.name} width={80} height={80} className="object-cover" />
            </div>
        ) : (
            <div className="w-20 h-20 rounded-full bg-purple-500 mb-4 mx-auto flex items-center justify-center text-white text-4xl font-bold">
            {basics.name.charAt(0)}
            </div>
        )}

        <div className="space-y-4 text-sm w-full">
          <Section title="Contact">
             <div className="space-y-1.5 text-[9pt]">
                <p className="flex items-start gap-2 break-all"><Mail size={12}/> {basics.email}</p>
                <p className="flex items-start gap-2"><Phone size={12}/> {basics.phone}</p>
                <p className="flex items-start gap-2"><MapPin size={12}/> {basics.location}</p>
                {basics.links.map(link => (
                    <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:underline break-all">
                    <LinkIcon size={12}/> {link.label}
                    </a>
                ))}
             </div>
          </Section>
          
          {skills && skills.length > 0 && <Section title="Skills">
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, i) => <span key={i} className="bg-purple-200 text-purple-800 text-[8pt] font-medium px-2 py-0.5 rounded-md">{skill}</span>)}
            </div>
          </Section>}

          {certifications && certifications.length > 0 && <Section title="Certifications">
             <ul className="list-disc list-inside text-[9pt] space-y-1">
              {certifications.map((cert, i) => <li key={i}>{cert}</li>)}
            </ul>
          </Section>}

          {languages && languages.length > 0 && <Section title="Languages">
            <ul className="list-disc list-inside text-[9pt] space-y-1">
              {languages.map((lang, i) => <li key={i}>{lang}</li>)}
            </ul>
          </Section>}
        </div>
      </aside>

    </div>
  );
}
