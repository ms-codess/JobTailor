
'use client';

import { toast } from '@/hooks/use-toast';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';

export async function processPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  // Use a dynamic import to get the URL of the worker script
  const pdfjsWorker = (await import('pdfjs-dist/build/pdf.worker.mjs')).default;
  
  // pdf.js expects a URL to the worker script
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = window.URL.createObjectURL(new Blob([`importScripts('${pdfjsWorker}');`], { type: 'application/javascript' }));
  }


  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText +=
      textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n';
  }

  // Fallback to AI OCR if standard extraction fails
  if (fullText.trim().length < 100) {
    toast({
      title: 'Image-based PDF Detected',
      description: 'Falling back to AI-powered OCR. This may take a moment...',
    });

    let ocrText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const imageDataUri = canvas.toDataURL('image/jpeg');
        const result = await extractTextFromImage({ imageDataUri });
        ocrText += result.extractedText + '\n';
      }
    }
    return ocrText;
  }

  return fullText;
}
