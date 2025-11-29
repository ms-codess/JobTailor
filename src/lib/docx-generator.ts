import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, ExternalHyperlink } from 'docx';
import type { FormData } from '@/types/resume';

export async function generateDocx(data: FormData): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: data.basics.name,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun(data.basics.email),
              new TextRun(' | '),
              new TextRun(data.basics.phone),
              new TextRun(' | '),
              new TextRun(data.basics.location),
              ...data.basics.links.flatMap(link => [
                new TextRun(' | '),
                new ExternalHyperlink({
                  link: link.url,
                  children: [new TextRun({ text: link.label, style: 'Hyperlink' })],
                }),
              ]),
            ],
            style: 'compact',
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: data.basics.summary }),
          new Paragraph({
            text: 'Experience',
            heading: HeadingLevel.HEADING_1,
            border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          }),
          ...data.experience.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({ text: exp.role, bold: true }),
                new TextRun({ text: ` - ${exp.company}`, italics: true }),
                new TextRun({ text: `\t${exp.years}` }),
              ],
            }),
            ...exp.description.split('\n').map(desc =>
              new Paragraph({
                text: desc,
                bullet: { level: 0 },
              })
            ),
            new Paragraph({ text: '' }),
          ]),
          new Paragraph({
            text: 'Education',
            heading: HeadingLevel.HEADING_1,
            border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          }),
          ...data.education.map(
            edu =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${edu.school} - ${edu.degree}`, bold: true }),
                  new TextRun({ text: `\t${edu.year}` }),
                ],
              })
          ),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Skills',
            heading: HeadingLevel.HEADING_1,
            border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          }),
          new Paragraph({ text: data.skills.join(' | ') }),
          new Paragraph({ text: '' }),
          ...(data.certifications &&
          data.certifications.length > 0 &&
          data.certifications.some(c => c.trim() !== '')
            ? [
                new Paragraph({
                  text: 'Certifications',
                  heading: HeadingLevel.HEADING_1,
                  border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
                }),
                new Paragraph({ text: data.certifications.join(' | ') }),
                new Paragraph({ text: '' }),
              ]
            : []),
          ...(data.languages &&
          data.languages.length > 0 &&
          data.languages.some(l => l.trim() !== '')
            ? [
                new Paragraph({
                  text: 'Languages',
                  heading: HeadingLevel.HEADING_1,
                  border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
                }),
                new Paragraph({ text: data.languages.join(' | ') }),
              ]
            : []),
          ...data.customSections.flatMap(section => [
            new Paragraph({ text: '' }),
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_1,
              border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
            }),
            ...section.content.split('\n').map(item => new Paragraph({ text: item })),
          ]),
        ],
      },
    ],
    styles: {
      paragraphStyles: [
        {
          id: 'compact',
          name: 'Compact',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            size: 18, // 9pt
          },
        },
      ],
    },
  });

  return Packer.toBlob(doc);
}
