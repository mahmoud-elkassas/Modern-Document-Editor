import mammoth from 'mammoth';

interface ImportOptions {
  file: File;
  type: 'docx' | 'html' | 'txt';
}

export const importDocument = async ({ file, type }: ImportOptions): Promise<{
  content: string;
  header?: string;
  footer?: string;
}> => {
  switch (type) {
    case 'docx':
      return importFromWord(file);
    case 'html':
      return importFromHtml(file);
    case 'txt':
      return importFromText(file);
    default:
      throw new Error(`Unsupported file type: ${type}`);
  }
};

const importFromWord = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Extract content with mammoth
  const result = await mammoth.convertToHtml({ arrayBuffer });
  
  // Parse the HTML to extract headers and footers
  const parser = new DOMParser();
  const doc = parser.parseFromString(result.value, 'text/html');
  
  // Look for header/footer elements (specific to Word export format)
  const header = doc.querySelector('div[style*="mso-element:header"]')?.innerHTML || '';
  const footer = doc.querySelector('div[style*="mso-element:footer"]')?.innerHTML || '';
  
  return {
    content: result.value,
    header,
    footer
  };
};

const importFromHtml = async (file: File) => {
  const text = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  
  // Look for common header/footer elements
  const header = doc.querySelector('header')?.innerHTML || 
                doc.querySelector('.header')?.innerHTML || 
                '';
                
  const footer = doc.querySelector('footer')?.innerHTML || 
                doc.querySelector('.footer')?.innerHTML || 
                '';
  
  // Remove header/footer from main content if they exist
  const headerElement = doc.querySelector('header, .header');
  const footerElement = doc.querySelector('footer, .footer');
  
  if (headerElement) headerElement.remove();
  if (footerElement) footerElement.remove();
  
  return {
    content: doc.body.innerHTML,
    header,
    footer
  };
};

const importFromText = async (file: File) => {
  const content = await file.text();
  return { content };
};