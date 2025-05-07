import React, { useState } from "react";
import {
  UserPlus2,
  Save,
  FileDown,
  History,
  MessageSquare,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { useDocStore } from "../hooks/use-doc-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

interface HeaderProps {
  onHistoryClick: () => void;
  onCommentsClick: () => void;
}

export const Header = ({ onHistoryClick, onCommentsClick }: HeaderProps) => {
  const { metadata, setTitle } = useDocStore();
  const { headerContent, headerVisible } = metadata;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(metadata.title);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleTitleSubmit = () => {
    setTitle(newTitle);
    setIsEditingTitle(false);
  };

  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return format(date, "MMMM d, yyyy");
  };

  const exportAsPDF = async () => {
    try {
      setIsExporting(true);
      const element = document.querySelector(".editor-content");
      if (!element) return;

      const contentHeight = element.scrollHeight;
      const a4Height = 1054; // A4 height in pixels at 96 DPI
      const totalPages = Math.ceil(contentHeight / a4Height);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      for (let page = 1; page <= totalPages; page++) {
        if (page > 1) pdf.addPage();

        // Add header
        if (headerVisible && headerContent) {
          const headerElement = document.createElement("div");
          headerElement.innerHTML = headerContent
            .replace(/\[Page #\]/g, page.toString())
            .replace(/\[Total Pages\]/g, totalPages.toString())
            .replace(/\[Current Date\]/g, format(new Date(), "MMMM d, yyyy"));
          document.body.appendChild(headerElement);
          const headerCanvas = await html2canvas(headerElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          });
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

        // Add main content for this page
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
          headerVisible ? 40 : 10, // top margin (after header if present)
          190, // width (A4 width - margins)
          headerVisible ? 237 : 277 // height (adjusted for header/footer)
        );

        // Add footer
        if (metadata.footerVisible && metadata.footerContent) {
          const footerElement = document.createElement("div");
          footerElement.innerHTML = metadata.footerContent
            .replace(/\[Page #\]/g, page.toString())
            .replace(/\[Total Pages\]/g, totalPages.toString())
            .replace(/\[Current Date\]/g, format(new Date(), "MMMM d, yyyy"));
          document.body.appendChild(footerElement);
          const footerCanvas = await html2canvas(footerElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          });
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

      pdf.save(`${metadata.title}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  const exportAsDoc = async () => {
    try {
      setIsExporting(true);
      const element = document.querySelector(".editor-content");
      if (!element) return;

      const contentHeight = element.scrollHeight;
      const a4Height = 1054; // A4 height in pixels at 96 DPI
      const totalPages = Math.ceil(contentHeight / a4Height);

      const content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${metadata.title}</title>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <style>
            @page {
              size: A4;
              margin: 1in;
              mso-header-margin: 0.5in;
              mso-footer-margin: 0.5in;
            }
            body {
              font-family: 'Calibri', sans-serif;
              font-size: 11pt;
              line-height: 1.5;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1em 0;
            }
            td, th {
              border: 1px solid black;
              padding: 8px;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            div.header {
              mso-element: header;
            }
            div.footer {
              mso-element: footer;
            }
            .page-number:before {
              content: counter(page);
            }
            .total-pages:before {
              content: counter(pages);
            }
          </style>
        </head>
        <body>
          ${
            headerVisible
              ? `
            <div style="mso-element: header" id="header">
              ${headerContent
                .replace(/\[Page #\]/g, '<span class="page-number"></span>')
                .replace(
                  /\[Total Pages\]/g,
                  '<span class="total-pages"></span>'
                )
                .replace(
                  /\[Current Date\]/g,
                  format(new Date(), "MMMM d, yyyy")
                )}
            </div>
          `
              : ""
          }
          ${element.innerHTML}
          ${
            metadata.footerVisible
              ? `
            <div style="mso-element: footer" id="footer">
              ${metadata.footerContent
                .replace(/\[Page #\]/g, '<span class="page-number"></span>')
                .replace(
                  /\[Total Pages\]/g,
                  '<span class="total-pages"></span>'
                )
                .replace(
                  /\[Current Date\]/g,
                  format(new Date(), "MMMM d, yyyy")
                )}
            </div>
          `
              : ""
          }
        </body>
        </html>
      `;

      const blob = new Blob([content], {
        type: "application/msword;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${metadata.title}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting DOC:", error);
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  if (!headerVisible) return null;

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTitleSubmit();
                  }
                }}
                className="text-xl font-semibold border-b border-gray-300 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            ) : (
              <h1
                className="text-xl font-semibold cursor-pointer hover:text-gray-600"
                onClick={() => {
                  setIsEditingTitle(true);
                  setNewTitle(metadata.title);
                }}
              >
                {metadata.title}
              </h1>
            )}
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
              New
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Last Updated {formatDate(metadata.lastUpdated)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onHistoryClick}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
          <button
            onClick={onCommentsClick}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comments</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50">
            <UserPlus2 className="w-4 h-4" />
            <span>Invite People</span>
          </button>
          <button
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white rounded-full hover:bg-[#4f46e5]"
          >
            <Save className="w-4 h-4" />
            <span>Save & Export</span>
          </button>
        </div>
      </div>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Document</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Button
              onClick={exportAsPDF}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              {isExporting ? "Exporting PDF..." : "Export as PDF"}
            </Button>
            <Button
              onClick={exportAsDoc}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              {isExporting ? "Exporting DOC..." : "Export as DOC"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
