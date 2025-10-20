
'use client';

import type { FormData } from '@/app/build/page';
import { Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';

interface ClassicTemplateProps {
  data: FormData;
}

export function ClassicTemplate({ data }: ClassicTemplateProps) {
  const { basics, education, experience, skills, certifications, languages, customSections } = data;
  return (
    <div className="p-8 bg-white text-gray-800 font-serif text-[10pt] leading-snug">
      <div className="text-center border-b-2 border-gray-400 pb-2 mb-4">
        <h1 className="text-2xl font-bold tracking-wider uppercase">{basics.name}</h1>
        <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 mt-1 text-[9pt] text-gray-600">
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

      <div className="mb-4">
        <p className="text-[10pt]">{basics.summary}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-2 uppercase tracking-wider">Experience</h2>
        {experience.map((exp, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between">
              <h3 className="font-bold text-[11pt]">{exp.role}</h3>
              <p className="font-light text-[10pt]">{exp.years}</p>
            </div>
            <p className="italic text-[10pt] mb-1">{exp.company}</p>
            <div className="prose prose-sm max-w-none text-gray-700 text-[10pt]">
              {exp.description.split('\n').map((line, i) => (line.trim() ? <p key={i} className="my-0.5">{line}</p> : null))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-2 uppercase tracking-wider">Education</h2>
        {education.map((edu, index) => (
          <div key={index} className="flex justify-between mb-1">
            <div>
              <h3 className="font-bold text-[11pt]">{edu.school}</h3>
              <p className="text-[10pt]">{edu.degree}</p>
            </div>
            <p className="font-light text-[10pt]">{edu.year}</p>
          </div>
        ))}
      </div>

      {customSections.map((section, index) => (
        <div key={index} className="mb-4">
          <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-2 uppercase tracking-wider">{section.title}</h2>
          <div className="prose prose-sm max-w-none text-gray-700 text-[10pt]">
            {section.content.split('\n').map((line, i) => <p key={i} className="my-0.5">{line}</p>)}
          </div>
        </div>
       ))}

      {skills && skills.length > 0 && <div className="mb-4">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-2 uppercase tracking-wider">Skills</h2>
        <p className="text-[10pt]">
          {skills.join(' · ')}
        </p>
      </div>}
      
      {certifications && certifications.length > 0 && <div className="mb-4">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-2 uppercase tracking-wider">Certifications</h2>
        <p className="text-[10pt]">
          {certifications.join(' · ')}
        </p>
      </div>}
      
      {languages && languages.length > 0 && <div className="mb-4">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-2 uppercase tracking-wider">Languages</h2>
        <p className="text-[10pt]">
          {languages.join(' · ')}
        </p>
      </div>}

    </div>
  );
}
