
'use client';

import type { FormData } from '@/app/build/page';
import { Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

interface EuropeanClassicTemplateProps {
  data: FormData;
}

export function EuropeanClassicTemplate({ data }: EuropeanClassicTemplateProps) {
  const { basics, education, experience, skills, certifications, languages, customSections } = data;
  return (
    <div className="p-8 bg-white text-gray-800 font-serif text-[10pt] leading-snug">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 text-center">
            {basics.photo && (
                <div className="mb-4 inline-block rounded-md overflow-hidden shadow-md">
                    <Image src={basics.photo} alt={basics.name} width={100} height={100} className="object-cover" />
                </div>
            )}
            <div className="bg-gray-50 p-4 rounded-md text-left">
                 <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Personal Details</h2>
                 <div className="space-y-2 text-[9pt]">
                     <p className="flex items-start gap-2 break-all"><Mail size={11}/> {basics.email}</p>
                     <p className="flex items-start gap-2"><Phone size={11}/> {basics.phone}</p>
                     <p className="flex items-start gap-2"><MapPin size={11}/> {basics.location}</p>
                     {basics.links.map(link => (
                        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:underline break-all">
                        <LinkIcon size={11}/> {link.label}
                        </a>
                    ))}
                 </div>
            </div>
             {skills && skills.length > 0 && <div className="mt-4 text-left">
                <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Skills</h2>
                 <ul className="list-disc list-inside text-[10pt] space-y-1">
                    {skills.map((skill, index) => <li key={index}>{skill}</li>)}
                 </ul>
             </div>}
             {certifications && certifications.length > 0 && <div className="mt-4 text-left">
                <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Certifications</h2>
                 <ul className="list-disc list-inside text-[10pt] space-y-1">
                    {certifications.map((cert, index) => <li key={index}>{cert}</li>)}
                 </ul>
             </div>}
             {languages && languages.length > 0 && <div className="mt-4 text-left">
                <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider">Languages</h2>
                 <ul className="list-disc list-inside text-[10pt] space-y-1">
                    {languages.map((lang, index) => <li key={index}>{lang}</li>)}
                 </ul>
             </div>}
        </div>
        <div className="col-span-2">
           <div className="border-b-2 border-gray-400 pb-2 mb-4">
                <h1 className="text-2xl font-bold tracking-wider uppercase break-words">{basics.name}</h1>
            </div>
             <div className="mb-4">
                <p className="text-[10pt]">{basics.summary}</p>
            </div>
             <div className="mb-4">
                <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-2 uppercase tracking-wider">Work Experience</h2>
                {experience.map((exp, index) => (
                <div key={index} className="mb-3">
                    <div className="flex justify-between">
                    <h3 className="font-bold text-[11pt]">{exp.role}, {exp.company}</h3>
                    <p className="font-light text-[10pt]">{exp.years}</p>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-700 mt-1 text-[10pt]">
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
                    <h3 className="font-bold text-[11pt]">{edu.degree}</h3>
                    <p className="text-[10pt]">{edu.school}</p>
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
        </div>
      </div>
    </div>
  );
}
