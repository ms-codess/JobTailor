import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, ExternalHyperlink } from 'docx';
import type { FormData } from '@/types/resume';

type TemplateChoice = 'classic' | 'modern' | 'creative';

const TEMPLATE_STYLES: Record<TemplateChoice, { accent: string; headingAllCaps?: boolean }> = {
  classic: { accent: '5b21b6' }, // purple-800
  modern: { accent: '0f172a', headingAllCaps: true }, // slate-900
  creative: { accent: 'db2777' }, // pink-600
};

export async function generateDocx(data: FormData, template: TemplateChoice = 'classic'): Promise<Blob> {
  const { accent, headingAllCaps } = TEMPLATE_STYLES[template] ?? TEMPLATE_STYLES.classic;

  const headingStyle = (text: string, level: HeadingLevel) =>
    new Paragraph({
      text: headingAllCaps ? text.toUpperCase() : text,
      heading: level,
      border: { bottom: { color: accent, space: 2, style: BorderStyle.SINGLE, size: 4 } },
      spacing: { before: 80, after: 60 },
      color: accent,
    });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 576, right: 576, bottom: 576, left: 576 } }, // ~0.4in margins to fit one page
        },
        children: [
          new Paragraph({
            text: data.basics.name,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
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
          new Paragraph({ text: data.basics.summary, spacing: { after: 80 } }),
          headingStyle('Experience', HeadingLevel.HEADING_1),
          ...data.experience.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({ text: exp.role, bold: true }),
                new TextRun({ text: ` - ${exp.company}`, italics: true }),
                new TextRun({
                  text: exp.years,
                  style: 'bodySmall',
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 40 },
            }),
            ...exp.description.split('\n').map(desc =>
              new Paragraph({
                text: desc,
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 },
              })
            ),
            new Paragraph({ text: '' }),
          ]),
          headingStyle('Education', HeadingLevel.HEADING_1),
          ...data.education.map(
            edu =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${edu.school} - ${edu.degree}`, bold: true }),
                  new TextRun({ text: ` ${edu.year}`, style: 'bodySmall' }),
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 40 },
              })
          ),
          new Paragraph({ text: '' }),
          headingStyle('Skills', HeadingLevel.HEADING_1),
          new Paragraph({ text: data.skills.join(' | ') }),
          new Paragraph({ text: '' }),
          ...(data.certifications &&
          data.certifications.length > 0 &&
          data.certifications.some(c => c.trim() !== '')
            ? [
                headingStyle('Certifications', HeadingLevel.HEADING_1),
                new Paragraph({ text: data.certifications.join(' | ') }),
                new Paragraph({ text: '' }),
              ]
            : []),
          ...(data.languages &&
          data.languages.length > 0 &&
          data.languages.some(l => l.trim() !== '')
            ? [
                headingStyle('Languages', HeadingLevel.HEADING_1),
                new Paragraph({ text: data.languages.join(' | ') }),
              ]
            : []),
          ...data.customSections.flatMap(section => [
            new Paragraph({ text: '' }),
            headingStyle(section.title, HeadingLevel.HEADING_1),
            ...section.content.split('\n').map(item => new Paragraph({ text: item, spacing: { after: 40 } })),
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
        {
          id: 'bodySmall',
          name: 'BodySmall',
          basedOn: 'Normal',
          next: 'Normal',
          run: { size: 20 }, // 10pt
        },
      ],
    },
  });

  return Packer.toBlob(doc);
}
