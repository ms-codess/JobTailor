
'use client';

import type { FormData } from '@/app/build/page';
import { Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';

interface CreativeTemplateProps {
  data: FormData;
}

export function CreativeTemplate({ data }: CreativeTemplateProps) {
  const { basics, education, experience, skills, certifications, languages, customSections } = data;
  
  const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={className}>
      <h2 className="text-[9pt] font-bold uppercase tracking-widest text-teal-600 mb-3">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="flex bg-white text-gray-700 font-[system-ui] min-h-[11in] text-[9.5pt] leading-snug">
      {/* Left Sidebar */}
      <aside className="w-1/3 bg-gray-50 p-6 text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-teal-500 mb-3 flex items-center justify-center text-white text-4xl font-bold">
          {basics.name.charAt(0)}
        </div>
        <h1 className="text-xl font-bold text-gray-800 break-words">{basics.name}</h1>
        
        <p className="text-[9pt] text-left self-start my-4">{basics.summary}</p>
        
        <div className="w-full text-left space-y-3 text-[9pt]">
          <Section title="Contact">
             <p className="flex items-start gap-2 break-all"><Mail size={11}/> {basics.email}</p>
             <p className="flex items-start gap-2"><Phone size={11}/> {basics.phone}</p>
             <p className="flex items-start gap-2"><MapPin size={11}/> {basics.location}</p>
             {basics.links.map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:underline break-all">
                <LinkIcon size={11}/> {link.label}
                </a>
             ))}
          </Section>
          
          {skills && skills.length > 0 && <Section title="Skills">
            <ul className="list-disc list-inside text-[9pt]">
              {skills.map((skill, i) => <li key={i}>{skill}</li>)}
            </ul>
          </Section>}

          {certifications && certifications.length > 0 && <Section title="Certifications">
            <ul className="list-disc list-inside text-[9pt]">
              {certifications.map((cert, i) => <li key={i}>{cert}</li>)}
            </ul>
          </Section>}

          {languages && languages.length > 0 && <Section title="Languages">
            <ul className="list-disc list-inside text-[9pt]">
              {languages.map((lang, i) => <li key={i}>{lang}</li>)}
            </ul>
          </Section>}
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-2/3 p-6">
        <Section title="Experience" className="mb-6">
           {experience.map((exp, index) => (
            <div key={index} className="mb-4">
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
            <div key={index} className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-[10.5pt]">{edu.school}</h3>
                <p className="text-[9.5pt]">{edu.degree}</p>
              </div>
              <p className="text-[9pt] text-gray-500 pt-1">{edu.year}</p>
            </div>
          ))}
        </Section>

        {customSections.map((section, index) => (
          <Section key={index} title={section.title} className="mb-6">
             <div className="prose prose-sm max-w-none text-gray-600 text-[9pt]">
                {section.content.split('\n').map((line, i) => <p key={i} className="my-0.5">{line}</p>)}
              </div>
          </Section>
        ))}
      </main>
    </div>
  );
}
