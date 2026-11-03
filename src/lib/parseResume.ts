export async function extractResume(file:File):Promise<string>{
  if(file.size>8*1024*1024) throw new Error('Please choose a file smaller than 8 MB.');
  const ext=file.name.toLowerCase().split('.').pop();
  if(ext==='docx') { const mammoth=await import('mammoth'); const result=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()}); return result.value.trim(); }
  if(ext==='pdf') { const pdfjs=await import('pdfjs-dist'); pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).toString(); const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise; const pages:string[]=[]; for(let i=1;i<=pdf.numPages;i++){const p=await pdf.getPage(i);const c=await p.getTextContent();pages.push(c.items.map(x=>'str' in x?x.str:'').join(' '));} const text=pages.join('\n').trim(); if(text.length<80) throw new Error('This PDF has little or no selectable text. It may be scanned; run OCR first, then upload the searchable PDF.'); return text; }
  throw new Error('Upload a PDF or DOCX file.');
}
