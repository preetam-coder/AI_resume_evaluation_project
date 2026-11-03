import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import puppeteer from 'puppeteer-core';
import type { Plugin } from 'vite';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

type ResumeData={name:string;contactLine:string;headline:string;summary:string;skills:string[];experience:{title:string;company:string;dates:string;bullets:string[]}[];projects:{name:string;role:string;technologies:string[];problem:string;approach:string;outcome:string}[];education:string[];certifications:string[]};

function browserPath(){
  const candidates=[process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.PROGRAMFILES&&join(process.env.PROGRAMFILES,'Google','Chrome','Application','chrome.exe'),
    process.env['PROGRAMFILES(X86)']&&join(process.env['PROGRAMFILES(X86)'],'Google','Chrome','Application','chrome.exe'),
    process.env.LOCALAPPDATA&&join(process.env.LOCALAPPDATA,'Google','Chrome','Application','chrome.exe'),
    process.env['PROGRAMFILES(X86)']&&join(process.env['PROGRAMFILES(X86)'],'Microsoft','Edge','Application','msedge.exe'),
    '/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  return candidates.find((path):path is string=>Boolean(path&&existsSync(path)));
}
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const safeText=(value:unknown,max=2000)=>typeof value==='string'?value.slice(0,max):'';
function resumeHtml(data:ResumeData){
  const section=(title:string,content:string)=>content?`<section><h2>${title}</h2>${content}</section>`:'';
  const bulletList=(items:string[])=>items.filter(Boolean).map(item=>`<li>${escapeHtml(item)}</li>`).join('');
  const experience=data.experience.map(item=>`<article><div class="row"><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.dates)}</span></div><div class="row"><i>${escapeHtml(item.company)}</i></div><ul>${bulletList(item.bullets)}</ul></article>`).join('');
  const projects=data.projects.map(item=>`<article><div class="row"><b>${escapeHtml(item.name)}</b>${item.role?`<span>${escapeHtml(item.role)}</span>`:''}</div>${item.technologies.length?`<p class="tech">${escapeHtml(item.technologies.join(' · '))}</p>`:''}<ul>${bulletList([item.problem,item.approach,item.outcome])}</ul></article>`).join('');
  const css=`@page{size:A4;margin:14mm 16mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#17202a;font-size:10pt;line-height:1.38;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}header{text-align:center;border-bottom:1px solid #77808a;padding-bottom:10px;margin-bottom:12px}h1{font-size:21pt;letter-spacing:.2px;margin:0 0 3px}header p{margin:3px 0;color:#36414a;font-size:10pt}h2{font-size:11pt;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid #9aa3aa;padding-bottom:3px;margin:12px 0 6px}article{margin:7px 0;break-inside:avoid}.row{display:flex;justify-content:space-between;gap:10px}.row b{font-size:10pt}.row span,.row i{font-size:9pt;color:#37424a}p{margin:4px 0}ul{margin:4px 0 0;padding-left:17px}li{padding-left:1px;margin:2px 0}section{break-inside:auto}.skills{line-height:1.5}.tech{font-size:9pt;color:#3c4b56}`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><header><h1>${escapeHtml(data.name||'Resume')}</h1>${data.contactLine?`<p>${escapeHtml(data.contactLine)}</p>`:''}${data.headline?`<p><b>${escapeHtml(data.headline)}</b></p>`:''}</header>${section('Professional Summary',data.summary?`<p>${escapeHtml(data.summary)}</p>`:'')}${section('Skills',data.skills.length?`<p class="skills">${escapeHtml(data.skills.join(' · '))}</p>`:'')}${section('Experience',experience)}${section('Projects',projects)}${section('Education',bulletList(data.education))}${section('Certifications',bulletList(data.certifications))}</body></html>`;
}
async function pdfMiddleware(req:IncomingMessage,res:ServerResponse,next:(error?:Error)=>void){
  if(req.method!=='POST'){res.statusCode=405;res.setHeader('Allow','POST');res.end(JSON.stringify({error:'POST required.'}));return;}
  const origin=req.headers.origin; if(origin&&req.headers.host){try{if(new URL(origin).host!==req.headers.host){res.statusCode=403;res.end(JSON.stringify({error:'Cross-origin PDF requests are not allowed.'}));return;}}catch{res.statusCode=400;res.end(JSON.stringify({error:'Invalid request origin.'}));return;}}
  try{
    let raw='';for await(const chunk of req){raw+=chunk.toString();if(raw.length>150000){res.statusCode=413;res.end(JSON.stringify({error:'Resume draft is too large to export.'}));return;}}
    const input=JSON.parse(raw) as Partial<ResumeData>;
    const data:ResumeData={name:safeText(input.name,120),contactLine:safeText(input.contactLine,300),headline:safeText(input.headline,180),summary:safeText(input.summary),skills:Array.isArray(input.skills)?input.skills.slice(0,60).map(v=>safeText(v,100)):[],experience:Array.isArray(input.experience)?input.experience.slice(0,30).map(v=>({title:safeText(v.title,150),company:safeText(v.company,150),dates:safeText(v.dates,100),bullets:Array.isArray(v.bullets)?v.bullets.slice(0,12).map(b=>safeText(b)):[]})):[],projects:Array.isArray(input.projects)?input.projects.slice(0,30).map(v=>({name:safeText(v.name,150),role:safeText(v.role,150),technologies:Array.isArray(v.technologies)?v.technologies.slice(0,20).map(t=>safeText(t,100)):[],problem:safeText(v.problem),approach:safeText(v.approach),outcome:safeText(v.outcome)})):[],education:Array.isArray(input.education)?input.education.slice(0,20).map(v=>safeText(v)):[],certifications:Array.isArray(input.certifications)?input.certifications.slice(0,20).map(v=>safeText(v)):[]};
    if(!data.name&&!data.summary&&!data.experience.length&&!data.projects.length){res.statusCode=400;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Add resume content before exporting.'}));return;}
    const executablePath=browserPath();if(!executablePath){res.statusCode=503;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'Chrome or Edge was not found. Set PUPPETEER_EXECUTABLE_PATH to your browser executable.'}));return;}
    const browser=await puppeteer.launch({executablePath,headless:true,args:process.platform==='linux'?['--no-sandbox','--disable-setuid-sandbox']:[]});
    try{const page=await browser.newPage();await page.setContent(resumeHtml(data),{waitUntil:'domcontentloaded'});const pdf=await page.pdf({format:'A4',printBackground:true,preferCSSPageSize:true});const filename=(data.name||'resume').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'resume';res.statusCode=200;res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`attachment; filename="${filename}.pdf"`);res.setHeader('Content-Length',pdf.byteLength);res.end(Buffer.from(pdf));}finally{await browser.close();}
  }catch(error){if(res.headersSent){res.end();return;}res.statusCode=500;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:error instanceof Error?error.message:'Could not generate the PDF.'}));}
}
function puppeteerPdf():Plugin{return{name:'resume-puppeteer-pdf',configureServer(server){server.middlewares.use('/api/resume-pdf',(req,res,next)=>{void pdfMiddleware(req,res,next)});},configurePreviewServer(server){server.middlewares.use('/api/resume-pdf',(req,res,next)=>{void pdfMiddleware(req,res,next)});}}}

export default defineConfig({ plugins: [react(), tailwindcss(),puppeteerPdf()] });
