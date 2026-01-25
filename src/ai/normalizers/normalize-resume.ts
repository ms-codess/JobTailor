import { GenerateStructuredResumeOutput } from '@/ai/schemas/resume-schema';

type NormalizeOptions = {
  log?: boolean;
};

const languageHints = [
  'english',
  'french',
  'spanish',
  'german',
  'mandarin',
  'arabic',
  'hindi',
  'portuguese',
  'russian',
  'japanese',
  'korean',
  'italian',
  'dutch',
  'swedish',
  'norwegian',
  'danish',
  'finnish',
];

const certHints = [
  'cert',
  'certification',
  'certificate',
  'aws',
  'azure',
  'gcp',
  'pmp',
  'csm',
  'compTIA',
  'cisco',
  'microsoft',
  'oracle',
  'salesforce',
  'scrum',
  'itil',
];

const skillSectionTitles = ['skills', 'technical skills', 'tooling', 'technologies', 'tools'];
const languageSectionTitles = ['language', 'languages', 'linguistic'];

function dedupe(list: string[]) {
  return Array.from(new Set(list.map(item => item.trim()).filter(Boolean)));
}

function splitLines(text: string) {
  return text
    .split('\n')
    .map(line => line.replace(/^-+\s*/, '').trim())
    .filter(Boolean);
}

function extractFromCustom(
  resume: GenerateStructuredResumeOutput,
  predicate: (title: string, content: string) => boolean
) {
  const moved: string[] = [];
  resume.customSections = (resume.customSections || []).filter(section => {
    const title = section.title?.toLowerCase() || '';
    const content = section.content || '';
    if (predicate(title, content)) {
      moved.push(...splitLines(content));
      return false;
    }
    return true;
  });
  return moved;
}

export function normalizeResume(
  resume: GenerateStructuredResumeOutput,
  options: NormalizeOptions = {}
): GenerateStructuredResumeOutput {
  const normalized = { ...resume };
  const moves: Record<string, number> = {
    languages: 0,
    certifications: 0,
    skills: 0,
    customRemoved: 0,
  };

  // 1) Move language-like entries out of skills or mislabeled custom sections.
  const movedLanguages = (normalized.skills || []).filter(skill =>
    languageHints.some(lang => skill.toLowerCase().includes(lang))
  );
  const languageCustom = extractFromCustom(normalized, (title, content) => {
    return languageSectionTitles.some(t => title.includes(t)) || languageHints.some(lang => content.toLowerCase().includes(lang));
  });
  moves.languages += movedLanguages.length + languageCustom.length;
  normalized.languages = dedupe([...(normalized.languages || []), ...movedLanguages, ...languageCustom]);
  normalized.skills = (normalized.skills || []).filter(
    skill => !movedLanguages.includes(skill)
  );

  // 2) Move certifications out of skills/custom when the content hints at certs.
  const movedCerts = (normalized.skills || []).filter(skill =>
    certHints.some(hint => skill.toLowerCase().includes(hint))
  );
  const certCustom = extractFromCustom(normalized, (title, content) => {
    const lower = `${title} ${content}`.toLowerCase();
    return certHints.some(hint => lower.includes(hint));
  });
  moves.certifications += movedCerts.length + certCustom.length;
  normalized.certifications = dedupe([
    ...(normalized.certifications || []),
    ...movedCerts,
    ...certCustom,
  ]);
  normalized.skills = (normalized.skills || []).filter(skill => !movedCerts.includes(skill));

  // 3) If a custom section is really a skills bucket, fold into skills.
  const customSkills = extractFromCustom(normalized, title =>
    skillSectionTitles.some(t => title.includes(t))
  );
  moves.skills += customSkills.length;
  normalized.skills = dedupe([...(normalized.skills || []), ...customSkills]);

  // 4) Handle theses so they do not consume a whole custom section.
  normalized.customSections = (normalized.customSections || []).filter(section => {
    const lowerContent = section.content?.toLowerCase() || '';
    if (lowerContent.includes('thesis') || lowerContent.includes('dissertation')) {
      if (normalized.education && normalized.education.length > 0) {
        normalized.education = normalized.education.map((edu, idx) => {
          if (idx === 0) {
            const thesis = section.content.trim();
            const alreadyHas = edu.degree?.toLowerCase().includes('thesis');
            return {
              ...edu,
              degree: alreadyHas ? edu.degree : `${edu.degree} — Thesis: ${thesis}`,
            };
          }
          return edu;
        });
      }
      return false;
    }
    return true;
  });

  // 5) Dedupe arrays and trim noise.
  normalized.skills = dedupe(normalized.skills || []);
  normalized.certifications = dedupe(normalized.certifications || []);
  normalized.languages = dedupe(normalized.languages || []);
  normalized.education = (normalized.education || []).filter(
    edu => edu.school?.trim() || edu.degree?.trim() || edu.year?.trim()
  );
  normalized.experience = (normalized.experience || []).filter(
    exp => exp.company?.trim() || exp.role?.trim() || exp.description?.trim()
  );
  normalized.customSections = (normalized.customSections || []).filter(section => {
    const keep = section.title?.trim() || section.content?.trim();
    if (!keep) moves.customRemoved += 1;
    return keep;
  });

  if (options.log) {
    const moved = Object.entries(moves).filter(([, count]) => count > 0);
    if (moved.length > 0) {
      console.warn(
        '[normalizeResume] Adjusted sections:',
        moved.map(([k, v]) => `${k}:${v}`).join(', ')
      );
    }
  }

  return normalized;
}
