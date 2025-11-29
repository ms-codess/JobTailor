import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function generateCoverLetterDocx(text: string): Promise<Blob> {
  const paragraphs = text
    .split('\n')
    .map(line => new Paragraph({ children: [new TextRun(line)] }));

  const doc = new Document({
    sections: [
      {
        children: [
          ...paragraphs,
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
