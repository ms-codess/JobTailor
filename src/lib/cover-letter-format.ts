export function normalizeCoverLetterParagraphs(raw: string, signature?: string): string[] {
  if (!raw || !raw.trim()) return [];

  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  // Normalize excessive breaks
  text = text.replace(/\n{3,}/g, "\n\n");

  // Drop placeholder employer lines the model might emit
  const banned = new Set(['hiring manager', 'hiring team', 'company address', '[header]', '[opening]', '[greetings]', '[middle]', '[closing]', '[signature]']);
  text = text
    .split('\n')
    .filter(line => !banned.has(line.trim().toLowerCase()))
    .join('\n');

  // Ensure a line break immediately after greeting if it's inline
  text = text.replace(/^(\s*Dear\s+[^\n,]+,)\s*/im, (_, greet) => `${greet}\n`);

  // Strip accidental header/contact lines (email/phone/address) at the very top
  let headerLines = text.split('\n').filter(l => l !== undefined);
  while (headerLines.length) {
    const first = headerLines[0].trim();
    const looksLikeEmail = /@/.test(first);
    const looksLikePhone = /\d{2,}.*\d{2,}/.test(first);
    const looksLikeAddress = /(street|st\.|ave|avenue|road|rd\.|boulevard|blvd|ontario|ottawa)/i.test(first);
    if (looksLikeEmail || looksLikePhone || looksLikeAddress) {
      headerLines.shift();
      continue;
    }
    break;
  }
  text = headerLines.join('\n').trim();

  // Extract greeting (wherever it appears) and ensure a blank line before/after it
  let greeting: string | null = null;
  let lines = text.split('\n');
  const greetIdx = lines.findIndex(l => l.toLowerCase().startsWith('dear '));
  if (greetIdx >= 0) {
    greeting = lines[greetIdx].trim();
    // remove greeting line
    lines = lines.filter((_, idx) => idx !== greetIdx);
    // ensure a blank line remains to separate header from body
    if (greetIdx > 0 && lines[greetIdx - 1] !== '') {
      lines.splice(greetIdx - 1, 0, '');
    }
    text = lines.join('\n').trim();
  } else {
    // Force greeting at top if missing
    greeting = 'Dear Hiring Manager,';
    text = text.trim();
  }

  // Detect if a signature already exists (Sincerely/Regards + name)
  const signatureLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const hasExistingSignature = signatureLines.some(l =>
    /^sincerely[, ]?$/i.test(l) || /^regards[, ]?$/i.test(l)
  );

  // Split by paragraphs using blank lines
  let paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  // If no blank-line paragraphs, build paragraphs from sentences with a soft length cap
  if (paragraphs.length <= 1) {
    const sentences = text
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    const grouped: string[] = [];
    let current = '';
    const maxLen = 160; // keep paragraphs readable
    sentences.forEach(sentence => {
      if (!current) {
        current = sentence;
      } else if ((current + ' ' + sentence).length <= maxLen) {
        current += ' ' + sentence;
      } else {
        grouped.push(current);
        current = sentence;
      }
    });
    if (current) grouped.push(current);
    if (grouped.length) paragraphs = grouped;
  }

  const result: string[] = [];
  if (greeting) {
    result.push(greeting);
    result.push(''); // blank line after greeting
  }
  result.push(...paragraphs);

  // Append signature only when provided and not already present
  if (signature && signature.trim() && !hasExistingSignature) {
    result.push('');
    result.push("Sincerely,");
    result.push(signature.trim());
  }

  return result;
}
