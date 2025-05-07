import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Header,
  Footer,
  PageNumber,
  convertInchesToTwip,
} from "docx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import type { DocMetadata } from "../hooks/use-doc-store";

export interface ExportOptions {
  metadata: {
    title: string;
    author: string;
    lastUpdated: Date;
    headerContent: string;
    footerContent: string;
  };
  content: string;
  format: "doc" | "docx" | "pdf";
}

// Helper function to convert HTML to RTF
const htmlToRtf = (html: string): string => {
  // Basic HTML to RTF conversion
  let rtf = "{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033\n";

  // Add document info
  rtf += "{\\info{\\title Document}\\author Author}\\n";

  // Convert HTML content
  rtf += html
    .replace(/<p>/g, "\\par ")
    .replace(/<\/p>/g, "\\par ")
    .replace(/<b>/g, "\\b ")
    .replace(/<\/b>/g, "\\b0 ")
    .replace(/<i>/g, "\\i ")
    .replace(/<\/i>/g, "\\i0 ")
    .replace(/<u>/g, "\\ul ")
    .replace(/<\/u>/g, "\\ul0 ")
    .replace(/<br>/g, "\\line ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  rtf += "}";
  return rtf;
};

export const exportDocument = async ({
  metadata,
  content,
  format,
}: ExportOptions) => {
  try {
    if (format === "doc") {
      // Convert content to RTF format
      const rtfContent = htmlToRtf(content);

      // Create a blob with the RTF content
      const blob = new Blob([rtfContent], { type: "application/rtf" });

      // Create a download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${metadata.title}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      return true;
    } else if (format === "docx") {
      // Create a new document
      const doc = new Document({
        title: metadata.title,
        creator: metadata.author,
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: convertInchesToTwip(1),
                  right: convertInchesToTwip(1),
                  bottom: convertInchesToTwip(1),
                  left: convertInchesToTwip(1),
                },
                size: {
                  width: convertInchesToTwip(8.5),
                  height: convertInchesToTwip(11),
                },
              },
            },
            headers: {
              default: new Header({
                children: [new Paragraph({ text: metadata.headerContent })],
              }),
            },
            footers: {
              default: new Footer({
                children: [new Paragraph({ text: metadata.footerContent })],
              }),
            },
            children: [
              new Paragraph({
                children: [new TextRun(content)],
              }),
            ],
          },
        ],
      });

      // Generate the document as a blob
      const blob = await Packer.toBlob(doc);

      // Create a download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${metadata.title}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      return true;
    } else if (format === "pdf") {
      return await exportToPDF(metadata, content);
    }

    throw new Error(`Unsupported export format: ${format}`);
  } catch (error) {
    console.error("Error exporting document:", error);
    throw new Error("Failed to export document");
  }
};

const getHeaderContent = (
  metadata: DocMetadata,
  pageNumber: number,
  totalPages: number
) => {
  if (metadata.headerSettings.differentFirstPage && pageNumber === 1) {
    return metadata.headerSettings.firstPageContent || "";
  }
  if (metadata.headerSettings.differentOddEven) {
    return pageNumber % 2 === 0
      ? metadata.headerSettings.evenPageContent || ""
      : metadata.headerSettings.oddPageContent || "";
  }
  return metadata.headerContent;
};

const getFooterContent = (
  metadata: DocMetadata,
  pageNumber: number,
  totalPages: number
) => {
  let content = "";
  if (metadata.footerSettings.differentFirstPage && pageNumber === 1) {
    content = metadata.footerSettings.firstPageContent || "";
  } else if (metadata.footerSettings.differentOddEven) {
    content =
      pageNumber % 2 === 0
        ? metadata.footerSettings.evenPageContent || ""
        : metadata.footerSettings.oddPageContent || "";
  } else {
    content = metadata.footerContent;
  }

  return content
    .replace(/\[Page #\]/g, pageNumber.toString())
    .replace(/\[Total Pages\]/g, totalPages.toString())
    .replace(/\[Current Date\]/g, format(new Date(), "MMMM d, yyyy"));
};

const exportToPDF = async (metadata: DocMetadata, content: string) => {
  const element = document.querySelector(".editor-content");
  if (!element) throw new Error("Editor content not found");

  // Calculate total pages
  const contentHeight = element.scrollHeight;
  const a4Height = 1054; // A4 height in pixels at 96 DPI
  const totalPages = Math.ceil(contentHeight / a4Height);

  // Create PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // For each page
  for (let page = 1; page <= totalPages; page++) {
    if (page > 1) pdf.addPage();

    // Add header if visible
    if (metadata.headerVisible) {
      const headerContent = getHeaderContent(metadata, page, totalPages);
      if (headerContent) {
        const headerElement = document.createElement("div");
        headerElement.innerHTML = headerContent;
        document.body.appendChild(headerElement);
        const headerCanvas = await html2canvas(headerElement);
        pdf.addImage(
          headerCanvas.toDataURL("image/jpeg", 1.0),
          "JPEG",
          10, // left margin
          10, // top margin
          190, // width (A4 width - margins)
          20 // height
        );
        document.body.removeChild(headerElement);
      }
    }

    // Add main content
    const canvas = await html2canvas(element as HTMLElement, {
      height: a4Height,
      windowHeight: a4Height,
      y: (page - 1) * a4Height,
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    pdf.addImage(
      canvas.toDataURL("image/jpeg", 1.0),
      "JPEG",
      10, // left margin
      40, // top margin (after header)
      190, // width (A4 width - margins)
      237 // height (A4 height - margins - header - footer)
    );

    // Add footer if visible
    if (metadata.footerVisible) {
      const footerContent = getFooterContent(metadata, page, totalPages);
      if (footerContent) {
        const footerElement = document.createElement("div");
        footerElement.innerHTML = footerContent;
        document.body.appendChild(footerElement);
        const footerCanvas = await html2canvas(footerElement);
        pdf.addImage(
          footerCanvas.toDataURL("image/jpeg", 1.0),
          "JPEG",
          10, // left margin
          277, // bottom margin
          190, // width (A4 width - margins)
          20 // height
        );
        document.body.removeChild(footerElement);
      }
    }
  }

  return pdf;
};

const exportToWord = async (metadata: DocMetadata, content: string) => {
  // Create sections for different header/footer configurations
  const sections = [];

  // First page section if different first page is enabled
  if (
    metadata.headerSettings.differentFirstPage ||
    metadata.footerSettings.differentFirstPage
  ) {
    sections.push({
      properties: {
        page: {
          size: {
            width: 12240, // Width in twentieths of a point (8.5 inches)
            height: 15840, // Height in twentieths of a point (11 inches)
          },
          margin: {
            top: 1440, // 1 inch in twentieths of a point
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
        titlePage: true,
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              text: metadata.headerSettings.firstPageContent || "",
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              text: metadata.footerSettings.firstPageContent || "",
            }),
          ],
        }),
      },
      children: [new Paragraph({ text: content })],
    });
  }

  // Main section
  sections.push({
    properties: {
      page: {
        size: {
          width: 12240,
          height: 15840,
        },
        margin: {
          top: 1440,
          right: 1440,
          bottom: 1440,
          left: 1440,
        },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({ text: metadata.headerContent })],
      }),
      ...(metadata.headerSettings.differentOddEven && {
        even: new Header({
          children: [
            new Paragraph({
              text: metadata.headerSettings.evenPageContent || "",
            }),
          ],
        }),
        odd: new Header({
          children: [
            new Paragraph({
              text: metadata.headerSettings.oddPageContent || "",
            }),
          ],
        }),
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            children: [
              new TextRun(metadata.footerContent),
              new TextRun({
                children: [PageNumber.CURRENT],
              }),
              new TextRun(" of "),
              new TextRun({
                children: [PageNumber.TOTAL_PAGES],
              }),
            ],
          }),
        ],
      }),
      ...(metadata.footerSettings.differentOddEven && {
        even: new Footer({
          children: [
            new Paragraph({
              text: metadata.footerSettings.evenPageContent || "",
            }),
          ],
        }),
        odd: new Footer({
          children: [
            new Paragraph({
              text: metadata.footerSettings.oddPageContent || "",
            }),
          ],
        }),
      }),
    },
    children: [new Paragraph({ text: content })],
  });

  // Create document
  const doc = new Document({
    sections,
  });

  // Generate blob
  const buffer = await Packer.toBlob(doc);
  return buffer;
};
