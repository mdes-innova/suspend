"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Button } from "../ui/button";


pdfjs.GlobalWorkerOptions.workerSrc = "/libs/pdf.worker.min.mjs";

export default function PDFViewerClient({ pdfData }: { pdfData: Blob }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<null | number>(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () =>{
    if (pageNumber != null)
      setPageNumber(pageNumber - 1 <= 1 ? 1 : pageNumber - 1);
  }

  const goToNextPage = () => {
    if (pageNumber != null && numPages != null)
    setPageNumber(pageNumber + 1 >= numPages ? numPages : pageNumber + 1);
  }

  return (
    <div className="p-[2rem]">
      <nav 
        className="mb-[1rem] flex gap-[1rem] align-middle items-center"
        // style={{
        //   marginBottom: "1rem",
        //   display: "flex",
        //   gap: "1rem",
        //   alignItems: "center",
        // }}
      >
        <Button variant="outline"
          className={pageNumber != null && pageNumber <= 1? 'cursor-not-allowed bg-muted': 'cursor-default'}
          onClick={goToPrevPage}
          disabled={pageNumber != null && pageNumber <= 1}
          // style={{
          //   padding: "0.5rem 1rem",
          //   backgroundColor: pageNumber <= 1 ? "#ccc" : "#007bff",
          //   color: "white",
          //   border: "none",
          //   borderRadius: "4px",
          //   cursor: pageNumber <= 1 ? "not-allowed" : "pointer",
          // }}
        >
          ก่อนหน้า
        </Button>
        <Button variant="outline"
          className={pageNumber != null && numPages != null && pageNumber >= numPages? 'cursor-not-allowed bg-muted': 'cursor-default'}
          onClick={goToNextPage}
          disabled={pageNumber != null && numPages !=null && pageNumber >= numPages}
          // style={{
          //   padding: "0.5rem 1rem",
          //   backgroundColor: pageNumber >= numPages ? "#ccc" : "#007bff",
          //   color: "white",
          //   border: "none",
          //   borderRadius: "4px",
          //   cursor: pageNumber >= numPages ? "not-allowed" : "pointer",
          // }}
        >
          ถัดไป
        </Button>
        <p style={{ margin: 0, fontWeight: "bold", color: "#333" }}>
          Page {pageNumber} of {numPages || "..."}
        </p>
      </nav>

      <div
        className="border border-[#ccc] rounded overflow-hidden flex justify-center"
        // style={{
        //   border: "1px solid #ccc",
        //   borderRadius: "4px",
        //   overflow: "hidden",
        //   display: "flex",
        //   justifyContent: "center",
        // }}
      >
        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div 
            className="p-[2rem] text-center"
            // style={{ padding: "2rem", textAlign: "center" }}
            >
              Loading PDF...
            </div>
          }
          error={
            <div
            className="p-[2rem] text-center text-red-600"
              // style={{
              //   padding: "2rem",
              //   textAlign: "center",
              //   color: "red",
              // }}
            >
              Failed to load PDF. Please make sure the file exists in the public
              folder.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber?? 999}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={800}
          />
        </Document>
      </div>
    </div>
  );
};