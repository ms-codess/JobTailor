
'use client';

import type { FormData } from '@/app/build/page';
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Star, Link as LinkIcon, FolderKanban, Award, Languages } from 'lucide-react';

interface ModernTemplateProps {
  data: FormData;
}

export function ModernTemplate({ data }: ModernTemplateProps) {
  const { basics, education, experience, skills, certifications, languages, customSections } = data;

  const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mb-5">
      <h2 className="flex items-center text-sm font-semibold text-blue-800 mb-2 gap-2">
        {icon}
        <span className="uppercase tracking-wider">{title}</span>
      </h2>
      <div className="border-l-2 border-blue-200 pl-4">{children}</div>
    </div>
  );

  return (
    <div className="p-8 bg-white text-gray-700 font-sans text-[10pt] leading-snug">
      <header className="flex items-center justify-between pb-4 mb-4 border-b-2 border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 break-words">{basics.name}</h1>
        </div>
        <div className="text-[9pt] text-right space-y-0.5">
          <p className="flex items-center justify-end gap-2"><Mail size={11}/> {basics.email}</p>
          <p className="flex items-center justify-end gap-2"><Phone size={11}/> {basics.phone}</p>
          <p className="flex items-center justify-end gap-2"><MapPin size={11}/> {basics.location}</p>
           {basics.links.map(link => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-end gap-2 hover:underline">
              <LinkIcon size={11}/> {link.label}
            </a>
          ))}
        </div>
      </header>
      
      <p className="mb-6 text-[10pt] italic">{basics.summary}</p>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Section title="Experience" icon={<Briefcase size={14} />}>
            {experience.map((exp, index) => (
              <div key={index} className="mb-3 last:mb-0 relative">
                <div className="absolute -left-[1.3rem] top-1 w-2.5 h-2.5 bg-blue-800 rounded-full border-2 border-white"></div>
                <p className="text-[9pt] text-gray-500">{exp.years}</p>
                <h3 className="font-semibold text-[11pt] text-gray-800">{exp.role}</h3>
                <p className="text-[10pt] text-gray-600 mb-1">{exp.company}</p>
                <div className="prose prose-sm max-w-none text-gray-600 text-[9pt]">
                   {exp.description.split('\n').map((line, i) => (line.trim() ? <p key={i} className="my-0.5">{line}</p> : null))}
                </div>
              </div>
            ))}
          </Section>
        </div>

        <div className="col-span-1">
          <Section title="Education" icon={<GraduationCap size={14} />}>
            {education.map((edu, index) => (
               <div key={index} className="mb-2 last:mb-0">
                  <h3 className="font-semibold text-[11pt]">{edu.degree}</h3>
                  <p className="text-[10pt]">{edu.school}</p>
                  <p className="text-[9pt] text-gray-500">{edu.year}</p>
              </div>
            ))}
          </Section>

          {skills && skills.length > 0 && <Section title="Skills" icon={<Star size={14} />}>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-[8pt] font-medium px-2 py-0.5 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </Section>}

          {certifications && certifications.length > 0 && <Section title="Certifications" icon={<Award size={14} />}>
             <ul className="space-y-1 text-[10pt]">
              {certifications.map((cert, index) => (
                <li key={index}>{cert}</li>
              ))}
            </ul>
          </Section>}

          {languages && languages.length > 0 && <Section title="Languages" icon={<Languages size={14} />}>
             <ul className="space-y-1 text-[10pt]">
              {languages.map((lang, index) => (
                <li key={index}>{lang}</li>
              ))}
            </ul>
          </Section>}

           {customSections.map((section, index) => (
            <Section key={index} title={section.title} icon={<FolderKanban size={14} />}>
                <div className="prose prose-sm max-w-none text-gray-600 -ml-4 text-[9pt]">
                    {section.content.split('\n').map((line, i) => <p key={i} className="my-0.5">{line}</p>)}
                </div>
            </Section>
           ))}
        </div>
      </div>
    </div>
  );
}
