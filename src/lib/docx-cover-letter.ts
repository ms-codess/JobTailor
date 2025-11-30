import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

function normalizeParagraphs(rawText: string, signature?: string): { greeting: string; body: string[]; closing: string } {
  const sigLower = signature?.toLowerCase() ?? '';
  const chunks = rawText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .filter(chunk => {
      const low = chunk.toLowerCase();
      if (low.includes('sincerely')) return false;
      if (sigLower && low.includes(sigLower)) return false;
      return true;
    });

  let greeting = 'Dear Hiring Manager,';
  let bodyChunks = [...chunks];

  // Pull greeting if present
  if (bodyChunks[0]?.toLowerCase().startsWith('dear')) {
    greeting = bodyChunks.shift() || greeting;
  }

  // Remove any extra greetings in body
  bodyChunks = bodyChunks.filter(b => !b.toLowerCase().startsWith('dear '));

  // Strip closing/signature from tail
  while (bodyChunks.length > 0) {
    const tail = bodyChunks[bodyChunks.length - 1].toLowerCase();
    if (tail.includes('sincerely') || (signature && tail.includes(signature.toLowerCase()))) {
      bodyChunks.pop();
    } else {
      break;
    }
  }

  let closing = 'Sincerely,';
  // If a closing line exists in chunks, pop it
  const closingIdx = bodyChunks.findIndex(c => c.toLowerCase().includes('sincerely'));
  if (closingIdx !== -1) {
    closing = bodyChunks[closingIdx];
    bodyChunks.splice(closingIdx, 1);
  }

  // If no explicit paragraphs, split sentences into short paragraphs (one per sentence)
  if (bodyChunks.length === 0 && rawText) {
    const sentences = rawText
      .replace(/\n+/g, ' ')
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
    bodyChunks = sentences.filter(s => !s.toLowerCase().startsWith('dear '));
  }

  return { greeting, body: bodyChunks, closing };
}

export async function generateCoverLetterDocx(rawText: string, signature?: string): Promise<Blob> {
  const { greeting, body, closing } = normalizeParagraphs(rawText, signature);

  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      children: [new TextRun(greeting)],
      spacing: { after: 40 },
      alignment: AlignmentType.LEFT,
    })
  );
  // Explicit blank line after greeting
  paragraphs.push(new Paragraph({ children: [new TextRun('')], spacing: { after: 80 } }));

  for (const para of body) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun(para)],
        spacing: { after: 160 },
        alignment: AlignmentType.LEFT,
      })
    );
  }

  paragraphs.push(
    new Paragraph({
      children: [new TextRun(closing)],
      spacing: { before: 200, after: 140 },
      alignment: AlignmentType.LEFT,
    })
  );

  if (signature) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun(signature)],
        spacing: { after: 80 },
        alignment: AlignmentType.LEFT,
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        children: [...paragraphs],
      },
    ],
  });

  return Packer.toBlob(doc);
}
