import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

export async function generateCoverLetterDocx(text: string): Promise<Blob> {
  const paragraphs = text
    .split('\n')
    .map(line => new Paragraph({ children: [new TextRun(line)] }));

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Cover Letter', bold: true, size: 28 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ children: [new TextRun(' ')] }),
          ...paragraphs,
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

