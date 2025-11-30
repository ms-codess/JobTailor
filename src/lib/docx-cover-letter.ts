import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { normalizeCoverLetterParagraphs } from './cover-letter-format';

export async function generateCoverLetterDocx(rawText: string, signature?: string): Promise<Blob> {
  const paragraphs = normalizeCoverLetterParagraphs(rawText, signature);

  const docParagraphs: Paragraph[] = [];

  paragraphs.forEach(raw => {
    const text = raw.trim();
    if (!text) {
      // Preserve intentional blank lines (e.g., after greeting)
      docParagraphs.push(
        new Paragraph({
          children: [],
          spacing: { line: 300, after: 0 },
          alignment: AlignmentType.LEFT,
        })
      );
      return;
    }
    docParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text })],
        spacing: { line: 300, after: 140 }, // consistent single spacing with a modest paragraph gap (closer to textarea/PDF)
        alignment: AlignmentType.LEFT,
      })
    );
  });

  const doc = new Document({
    sections: [{ children: docParagraphs }],
  });

  return Packer.toBlob(doc);
}
