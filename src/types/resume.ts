export type FormData = {
  basics: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    photo?: string;
    links: { label: string; url: string }[];
  };
  education: { school: string; degree: string; year: string }[];
  experience: { company: string; role: string; years: string; description: string }[];
  skills: string[];
  certifications: string[];
  languages: string[];
  customSections: { title: string; content: string }[];
};

