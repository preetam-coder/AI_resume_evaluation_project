const sectionAliases:Record<string,string[]>={
  summary:['summary','professional summary','profile','objective','about me'],
  experience:['experience','work experience','professional experience','employment history'],
  projects:['projects','project experience','selected projects'],
  skills:['skills','technical skills','core competencies','areas of expertise'],
  education:['education','academic background','qualifications'],
  certifications:['certifications','certificates','licenses'],
};

const skillTerms=[
  'Python','JavaScript','TypeScript','Java','C++','C#','SQL','R','Go','Ruby','PHP','HTML','CSS','React','Angular','Vue','Node.js','Express','Next.js','Django','Flask','FastAPI','Spring','REST APIs','GraphQL','Git','Docker','Kubernetes','AWS','Azure','Google Cloud','Terraform','Linux','PostgreSQL','MySQL','MongoDB','Redis','Firebase','Supabase','Pandas','NumPy','Scikit-learn','TensorFlow','PyTorch','Keras','Machine Learning','Deep Learning','Natural Language Processing','Computer Vision','Generative AI','LLMs','RAG','Vector Databases','Data Analysis','Data Visualization','Power BI','Tableau','Excel','Statistics','A/B Testing','CI/CD','Agile','Communication','Leadership','Problem Solving','Project Management','Collaboration','Research','Figma','Prototyping','Product Strategy',
];

export type ParsedResume={sections:Record<string,string>;skills:string[]};

export function parseResumeStructure(text:string):ParsedResume{
  const sections:Record<string,string>={};let current='header';const lines=text.replace(/\r/g,'').split('\n');
  for(const raw of lines){const line=raw.trim();if(!line)continue;const heading=line.toLowerCase().replace(/[:\s]+$/,'');const section=Object.entries(sectionAliases).find(([,aliases])=>aliases.includes(heading))?.[0];if(section){current=section;sections[current]??='';continue;}sections[current]=[sections[current],line].filter(Boolean).join('\n');}
  for(const key of Object.keys(sections))sections[key]=sections[key].trim();
  return {sections,skills:extractSkills(text)};
}

export function extractSkills(text:string):string[]{
  const normalized=text.toLowerCase().replace(/\s+/g,' ');const found=skillTerms.filter(skill=>new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(skill.toLowerCase())}($|[^a-z0-9+#])`,'i').test(normalized));
  return Array.from(new Set(found));
}

function escapeRegExp(value:string){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
