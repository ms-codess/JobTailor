
'use client';

import type { FormData } from '@/types/resume';
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Star, User, Link as LinkIcon, FolderKanban, Award, Languages } from 'lucide-react';
import Image from 'next/image';

interface EuropeanModernTemplateProps {
  data: FormData;
}

export function EuropeanModernTemplate({ data }: EuropeanModernTemplateProps) {
  const { basics, education, experience, skills, certifications, languages, customSections } = data;

  const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mb-5">
      <h2 className="flex items-center text-base font-semibold text-sky-800 mb-2 gap-2 border-b-2 border-sky-100 pb-1">
        {icon}
        <span className="uppercase tracking-wider text-sm">{title}</span>
      </h2>
      <div>{children}</div>
    </div>
  );

  return (
    <div className="p-8 bg-white text-gray-700 font-sans text-[10pt] leading-snug">
      <header className="flex items-center pb-4 mb-4 gap-6">
         {basics.photo && (
            <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 shadow-md">
                <Image src={basics.photo} alt={basics.name} width={80} height={80} className="object-cover" />
            </div>
        )}
        <div className="flex-grow">
            <h1 className="text-2xl font-bold text-gray-800 break-words">{basics.name}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-[9pt] text-gray-500">
                <span className="flex items-center gap-1"><Mail size={11}/> {basics.email}</span>
                <span className="flex items-center gap-1"><Phone size={11}/> {basics.phone}</span>
                <span className="flex items-center gap-1"><MapPin size={11}/> {basics.location}</span>
                {basics.links.map(link => (
                    <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                        <LinkIcon size={11}/> {link.label}
                    </a>
                ))}
            </div>
        </div>
      </header>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
            <p className="text-[10pt] mb-4">{basics.summary}</p>

              {skills && skills.length > 0 && <Section title="Skills" icon={<Star size={14} />}>
                <ul className="space-y-1 pl-1">
                {skills.map((skill, index) => (
                    <li key={index} className="text-[10pt]">{skill}</li>
                ))}
                </ul>
              </Section>}

              {certifications && certifications.length > 0 && <Section title="Certifications" icon={<Award size={14} />}>
                <ul className="space-y-1 pl-1">
                {certifications.map((cert, index) => (
                    <li key={index} className="text-[10pt]">{cert}</li>
                ))}
                </ul>
              </Section>}

              {languages && languages.length > 0 && <Section title="Languages" icon={<Languages size={14} />}>
                <ul className="space-y-1 pl-1">
                {languages.map((lang, index) => (
                    <li key={index} className="text-[10pt]">{lang}</li>
                ))}
                </ul>
              </Section>}
        </div>

        <div className="col-span-2">
          <Section title="Experience" icon={<Briefcase size={14} />}>
            {experience.map((exp, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-[11pt] text-gray-800">{exp.role}</h3>
                    <p className="text-[9pt] text-gray-500">{exp.years}</p>
                </div>
                <p className="text-[10pt] text-gray-600 mb-1">{exp.company}</p>
                <div className="prose prose-sm max-w-none text-gray-600 pl-4 border-l-2 border-gray-200 text-[9pt]">
                   {exp.description.split('\n').map((line, i) => (line.trim() ? <p key={i} className="my-0.5">{line}</p> : null))}
                </div>
              </div>
            ))}
          </Section>
           <Section title="Education" icon={<GraduationCap size={14} />}>
            {education.map((edu, index) => (
               <div key={index} className="mb-2 last:mb-0">
                  <h3 className="font-semibold text-[11pt]">{edu.degree} - {edu.year}</h3>
                  <p className="text-[10pt]">{edu.school}</p>
              </div>
            ))}
          </Section>
          {customSections.map((section, index) => (
            <Section key={index} title={section.title} icon={<FolderKanban size={14} />}>
                <div className="prose prose-sm max-w-none text-gray-600 text-[9pt]">
                    {section.content.split('\n').map((line, i) => <p key={i} className="my-0.5">{line}</p>)}
                </div>
            </Section>
           ))}
        </div>
      </div>
    </div>
  );
}
