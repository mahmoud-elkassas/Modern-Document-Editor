import mammoth from "mammoth";
import type { DocMetadata } from "../hooks/use-doc-store";
import * as pdfjsLib from "pdfjs-dist";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface WordDocumentMetadata {
  title: string;
  author: string;
  created: Date;
  modified: Date;
  headers: {
    default: string;
    firstPage?: string;
    evenPage?: string;
    oddPage?: string;
  };
  footers: {
    default: string;
    firstPage?: string;
    evenPage?: string;
    oddPage?: string;
  };
  pageMargins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pageSize: {
    width: number;
    height: number;
  };
}

interface MammothMessage {
  type: "info" | "warning" | "error";
  message: string;
}

export class WordProcessor {
  private static async extractTextFromDocx(file: File): Promise<string> {
    try {
      // Validate file size
      if (file.size === 0) {
        throw new Error("The file is empty");
      }

      // Validate file type
      const fileType = file.name.split(".").pop()?.toLowerCase();
      if (!fileType || (fileType !== "docx" && fileType !== "doc")) {
        throw new Error(
          `Invalid file type: ${fileType}. Expected .docx or .doc`
        );
      }

      const arrayBuffer = await file.arrayBuffer();

      // Check if the file is a valid ZIP archive (DOCX is a ZIP file)
      if (fileType === "docx") {
        const signature = new Uint8Array(arrayBuffer.slice(0, 4));
        const zipSignature = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
        if (!signature.every((byte, index) => byte === zipSignature[index])) {
          throw new Error("Invalid DOCX file: Not a valid ZIP archive");
        }
      }

      const result = await mammoth.extractRawText({ arrayBuffer });

      if (!result.value.trim()) {
        throw new Error("The document appears to be empty or contains no text");
      }

      return result.value;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("Can't find end of central directory")) {
          throw new Error(
            "Invalid or corrupted Word document. The file structure is damaged or incomplete."
          );
        }
        if (error.message.includes("Invalid file signature")) {
          throw new Error(
            "Invalid Word document. The file signature does not match a valid Word document format."
          );
        }
        throw new Error(
          `Failed to extract text from Word document: ${error.message}`
        );
      }
      throw new Error(
        "Failed to extract text from Word document: Unknown error"
      );
    }
  }

  private static async extractTextFromPdf(file: File): Promise<string> {
    try {
      // Validate file size
      if (file.size === 0) {
        throw new Error("The file is empty");
      }

      // Validate file type
      const fileType = file.name.split(".").pop()?.toLowerCase();
      if (!fileType || fileType !== "pdf") {
        throw new Error(`Invalid file type: ${fileType}. Expected .pdf`);
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n\n";
      }

      if (!fullText.trim()) {
        throw new Error("The PDF appears to be empty or contains no text");
      }

      return fullText;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("Invalid PDF structure")) {
          throw new Error(
            "Invalid or corrupted PDF document. The file structure is damaged or incomplete."
          );
        }
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
      }
      throw new Error("Failed to extract text from PDF: Unknown error");
    }
  }

  private static async extractMetadataFromDocx(
    file: File
  ): Promise<Partial<DocMetadata>> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });

      // Extract document properties
      const docProps = (result.messages as MammothMessage[])
        .filter((msg) => msg.type === "info")
        .reduce((props, msg) => {
          if (msg.message.includes("Title:")) {
            props.title = msg.message.replace("Title:", "").trim();
          } else if (msg.message.includes("Author:")) {
            props.author = msg.message.replace("Author:", "").trim();
          } else if (msg.message.includes("Created:")) {
            props.created = new Date(
              msg.message.replace("Created:", "").trim()
            );
          } else if (msg.message.includes("Modified:")) {
            props.modified = new Date(
              msg.message.replace("Modified:", "").trim()
            );
          }
          return props;
        }, {} as Partial<WordDocumentMetadata>);

      // Extract headers and footers
      const headers = {
        default: "",
        firstPage: "",
        evenPage: "",
        oddPage: "",
      };
      const footers = {
        default: "",
        firstPage: "",
        evenPage: "",
        oddPage: "",
      };

      // Extract page margins and size
      const pageMargins = {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
      };
      const pageSize = {
        width: 8.5,
        height: 11,
      };

      return {
        title: docProps.title || file.name.replace(/\.[^/.]+$/, ""),
        author: docProps.author || "Imported Author",
        lastUpdated: docProps.modified || new Date(),
        theme: "#ffffff",
        headerContent: headers.default,
        footerContent: footers.default,
        headerVisible: true,
        footerVisible: true,
        headerSettings: {
          differentFirstPage: !!headers.firstPage,
          differentOddEven: !!headers.evenPage || !!headers.oddPage,
          firstPageContent: headers.firstPage || "",
          oddPageContent: headers.oddPage || "",
          evenPageContent: headers.evenPage || "",
        },
        footerSettings: {
          differentFirstPage: !!footers.firstPage,
          differentOddEven: !!footers.evenPage || !!footers.oddPage,
          firstPageContent: footers.firstPage || "",
          oddPageContent: footers.oddPage || "",
          evenPageContent: footers.evenPage || "",
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to extract metadata from Word document: ${error.message}`
        );
      }
      throw new Error(
        "Failed to extract metadata from Word document: Unknown error"
      );
    }
  }

  private static async extractMetadataFromPdf(
    file: File
  ): Promise<Partial<DocMetadata>> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const metadata = await pdf.getMetadata();
      const info = metadata?.info as
        | { Title?: string; ModDate?: string; Author?: string }
        | undefined;

      return {
        title: info?.Title || file.name.replace(/\.[^/.]+$/, ""),
        lastUpdated: new Date(info?.ModDate || Date.now()),
        author: info?.Author || "Imported Author",
        theme: "#ffffff",
        headerContent: "",
        footerContent: "",
        headerVisible: true,
        footerVisible: true,
        headerSettings: {
          differentFirstPage: false,
          differentOddEven: false,
          firstPageContent: "",
          oddPageContent: "",
          evenPageContent: "",
        },
        footerSettings: {
          differentFirstPage: false,
          differentOddEven: false,
          firstPageContent: "",
          oddPageContent: "",
          evenPageContent: "",
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to extract metadata from PDF: ${error.message}`
        );
      }
      throw new Error("Failed to extract metadata from PDF: Unknown error");
    }
  }

  static async processDocument(file: File): Promise<{
    content: string;
    metadata: Partial<DocMetadata>;
  }> {
    try {
      const fileType = file.name.split(".").pop()?.toLowerCase();

      if (!fileType) {
        throw new Error("File has no extension");
      }

      if (fileType === "docx" || fileType === "doc") {
        const [content, metadata] = await Promise.all([
          this.extractTextFromDocx(file),
          this.extractMetadataFromDocx(file),
        ]);
        return { content, metadata };
      } else if (fileType === "pdf") {
        const [content, metadata] = await Promise.all([
          this.extractTextFromPdf(file),
          this.extractMetadataFromPdf(file),
        ]);
        return { content, metadata };
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error("Error processing document:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to process document: ${error.message}`);
      }
      throw new Error("Failed to process document: Unknown error");
    }
  }
}
