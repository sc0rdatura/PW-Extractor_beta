declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const extractTextFromPdf = async (file: File): Promise<string> => {
  if (typeof window === 'undefined' || !window.pdfjsLib) {
    throw new Error('PDF.js library not loaded');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  // Iterate through each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      // @ts-ignore - PDFJS types are loose in the browser global
      .map((item) => item.str)
      .join(' ');
    fullText += `\n--- Page ${i} ---\n` + pageText;
  }

  return fullText;
};