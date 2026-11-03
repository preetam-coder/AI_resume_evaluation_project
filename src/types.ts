export type Finding = { overallScore:number; keywordScore:number; skillsScore:number; experienceScore:number; educationScore:number; matchedKeywords:string[]; missingKeywords:string[]; technicalSkills:string[]; softSkills:string[]; strengths:string[]; weakSections:string[]; suggestions:{priority:'high'|'medium'|'low';title:string;detail:string}[]; summary:string };
export type Analysis = { id:string; created_at:string; job_title:string; overall_score:number; findings:Finding; resume_text?:string; job_description?:string };
export type ResumeExperience = { title:string; company:string; dates:string; bullets:string[] };
export type ResumeProject = { name:string; role:string; technologies:string[]; problem:string; approach:string; outcome:string };
export type ResumeDraft = { name:string; contactLine:string; headline:string; summary:string; skills:string[]; experience:ResumeExperience[]; projects:ResumeProject[]; education:string[]; certifications:string[] };
