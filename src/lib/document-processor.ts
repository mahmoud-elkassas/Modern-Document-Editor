import { Document, Packer, Paragraph, TextRun, Header, Footer, PageNumber, convertInchesToTwip } from 'docx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import mammoth from 'mammoth';
import type { DocMetadata } from '@/hooks/use-doc-store';

interface ProcessOptions {
  metadata: DocMetadata;
  content: string;
  operation: 'export' | 'import';
  format: 'pdf' | 'docx' | 'html' | 'txt';
  file?: File;
}

export class DocumentProcessor {
  private static readonly PAGE_DIMENSIONS = {
    width: convertInchesToTwip(8.5),
    height: convertInchesToTwip(11),
    margins: {
      top: convertInchesToTwip(1),
      right: convertInchesToTwip(1),
      bottom: convertInchesToTwip(1),
      left: convertInchesToTwip(1)
    }
  };

  private static readonly PDF_DIMENSIONS = {
    headerHeight: 20,
    footerHeight: 20,
    margins: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    }
  };

  static async process(options: ProcessOptions) {
    try {
      if (options.operation === 'export') {
        return await this.exportDocument(options);
      } else {
        return await this.importDocument(options);
      }
    } catch (error) {
      console.error(`Error processing document: ${error}`);
      throw new Error(`Failed to ${options.operation} document: ${error.message}`);
    }
  }

  private static async exportDocument({ metadata, content, format }: ProcessOptions) {
    try {
      if (format === 'pdf') {
        return await this.exportToPDF(metadata, content);
      } else if (format === 'docx') {
        return await this.exportToWord(metadata, content);
      }
      throw new Error(`Unsupported export format: ${format}`);
    } catch (error) {
      console.error(`Error exporting document: ${error}`);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  private static async importDocument({ file, format }: ProcessOptions) {
    if (!file) throw new Error('File is required for import');

    try {
      switch (format) {
        case 'docx':
          return await this.importFromWord(file);
        case 'html':
          return await this.importFromHtml(file);
        case 'txt':
          return await this.importFromText(file);
        default:
          throw new Error(`Unsupported import format: ${format}`);
      }
    } catch (error) {
      console.error(`Error importing document: ${error}`);
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  private static processPlaceholders(content: string, pageNumber: number, totalPages: number) {
    return content
      .replace(/\[Page #\]/g, pageNumber.toString())
      .replace(/\[Total Pages\]/g, totalPages.toString())
      .replace(/\[Current Date\]/g, format(new Date(), 'MMMM d, yyyy'))
      .replace(/\[Time\]/g, format(new Date(), 'HH:mm'))
      .replace(/\[Year\]/g, format(new Date(), 'yyyy'));
  }

  private static async exportToPDF(metadata: DocMetadata, content: string) {
    const element = document.querySelector('.editor-content');
    if (!element) throw new Error('Editor content not found');

    const contentHeight = element.scrollHeight;
    const a4Height = 1054; // A4 height in pixels at 96 DPI
    const totalPages = Math.ceil(contentHeight / a4Height);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    for (let page = 1; page <= totalPages; page++) {
      if (page > 1) pdf.addPage();

      if (metadata.headerVisible && metadata.headerContent) {
        const headerContent = this.processPlaceholders(metadata.headerContent, page, totalPages);
        await this.addHeaderToPDF(pdf, headerContent);
      }

      await this.addContentToPDF(pdf, element, page, a4Height, !!metadata.headerContent);

      if (metadata.footerVisible && metadata.footerContent) {
        const footerContent = this.processPlaceholders(metadata.footerContent, page, totalPages);
        await this.addFooterToPDF(pdf, footerContent);
      }
    }

    return pdf;
  }

  private static async addHeaderToPDF(pdf: jsPDF, content: string) {
    const headerElement = document.createElement('div');
    headerElement.innerHTML = content;
    headerElement.style.width = '190mm';
    headerElement.style.padding = '10mm';
    document.body.appendChild(headerElement);
    
    try {
      const canvas = await html2canvas(headerElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        this.PDF_DIMENSIONS.margins.left,
        this.PDF_DIMENSIONS.margins.top,
        190,
        this.PDF_DIMENSIONS.headerHeight,
        undefined,
        'FAST'
      );
    } finally {
      document.body.removeChild(headerElement);
    }
  }

  private static async addContentToPDF(
    pdf: jsPDF, 
    element: Element, 
    page: number, 
    pageHeight: number,
    hasHeader: boolean
  ) {
    const canvas = await html2canvas(element as HTMLElement, {
      height: pageHeight,
      windowHeight: pageHeight,
      y: (page - 1) * pageHeight,
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    pdf.addImage(
      canvas.toDataURL('image/jpeg', 0.95),
      'JPEG',
      this.PDF_DIMENSIONS.margins.left,
      hasHeader ? 40 : this.PDF_DIMENSIONS.margins.top,
      190,
      hasHeader ? 237 : 277,
      undefined,
      'FAST'
    );
  }

  private static async addFooterToPDF(pdf: jsPDF, content: string) {
    const footerElement = document.createElement('div');
    footerElement.innerHTML = content;
    footerElement.style.width = '190mm';
    footerElement.style.padding = '10mm';
    document.body.appendChild(footerElement);
    
    try {
      const canvas = await html2canvas(footerElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        this.PDF_DIMENSIONS.margins.left,
        277,
        190,
        this.PDF_DIMENSIONS.footerHeight,
        undefined,
        'FAST'
      );
    } finally {
      document.body.removeChild(footerElement);
    }
  }

  private static async exportToWord(metadata: DocMetadata, content: string) {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              width: this.PAGE_DIMENSIONS.width,
              height: this.PAGE_DIMENSIONS.height,
            },
            margin: this.PAGE_DIMENSIONS.margins,
          }
        },
        headers: metadata.headerVisible ? {
          default: new Header({
            children: [
              new Paragraph({
                text: metadata.headerContent,
                style: 'Normal'
              })
            ]
          })
        } : undefined,
        footers: metadata.footerVisible ? {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: metadata.footerContent,
                    size: 24
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 24
                  }),
                  new TextRun({
                    text: " of ",
                    size: 24
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 24
                  })
                ],
                style: 'Normal'
              })
            ]
          })
        } : undefined,
        children: [
          new Paragraph({
            text: content,
            style: 'Normal'
          })
        ]
      }],
      styles: {
        paragraphStyles: [
          {
            id: 'Normal',
            name: 'Normal',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 24,
              font: 'Calibri',
            },
            paragraph: {
              spacing: {
                line: 276,
                before: 0,
                after: 0,
              },
            },
          }
        ]
      }
    });

    return await Packer.toBlob(doc);
  }

  private static async importFromWord(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    
    const options = {
      transformDocument: (element: Document) => {
        const styleNodes = element.getElementsByTagName('style');
        const styles = Array.from(styleNodes).map(node => node.textContent).join('\n');
        
        return {
          value: element,
          messages: [],
          styleMap: styles
        };
      }
    };

    const result = await mammoth.convertToHtml({ arrayBuffer }, options);
    const parser = new DOMParser();
    const doc = parser.parseFromString(result.value, 'text/html');
    
    const header = this.extractElement(doc, 'header', 'mso-element:header');
    const footer = this.extractElement(doc, 'footer', 'mso-element:footer');
    
    return {
      content: result.value,
      header,
      footer,
      styles: result.styleMap
    };
  }

  private static extractElement(doc: Document, selector: string, styleAttribute: string) {
    const element = doc.querySelector(`${selector}, .${selector}, [style*="${styleAttribute}"]`);
    if (!element) return '';

    const styles = element.getAttribute('style') || '';
    const classes = element.getAttribute('class') || '';
    
    return {
      content: element.innerHTML,
      styles,
      classes
    };
  }

  private static async importFromHtml(file: File) {
    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    
    const header = this.extractElement(doc, 'header', '');
    const footer = this.extractElement(doc, 'footer', '');
    
    const headerElement = doc.querySelector('header, .header');
    const footerElement = doc.querySelector('footer, .footer');
    
    if (headerElement) headerElement.remove();
    if (footerElement) footerElement.remove();
    
    const styleElements = doc.getElementsByTagName('style');
    const styles = Array.from(styleElements).map(style => style.textContent).join('\n');
    
    return {
      content: doc.body.innerHTML,
      header,
      footer,
      styles
    };
  }

  private static async importFromText(file: File) {
    const content = await file.text();
    return { 
      content,
      header: '',
      footer: '',
      styles: ''
    };
  }
}