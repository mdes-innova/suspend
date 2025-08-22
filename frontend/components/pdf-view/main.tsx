"use client";
import PDFViewer from "./viewer";
import { type Document } from "@/lib/types";
import { useEffect, useState } from 'react';
import { downloadPdf } from "../actions/document";
import { isAuthError } from "../exceptions/auth";
import { RedirectToLogin } from "../reload-page";

export default function PdfView({ document }: { document: Document }) {
  const [pdfData, setPdfData] = useState<Blob | null>(null);

  useEffect(() => {
    const getData = async() => {
      if (typeof document?.id === 'number') {
        try {
          const data = await downloadPdf(document?.id);
          setPdfData(data); 
        } catch (error) {
          if (isAuthError(error)) RedirectToLogin();
          else setPdfData(null);
        }
      } else setPdfData(null);
    }

    getData();
  }, []);

  if (pdfData) 
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <div className="max-w-[1200px] mx-0 my-auto p-[2rem] bg-background min-h-[100vh]"
          // style={{
          //   maxWidth: "1200px",
          //   margin: "0 auto",
          //   padding: "2rem",
          //   backgroundColor: "white",
          //   minHeight: "100vh",
          // }}
        >
          <PDFViewer pdfData={pdfData} />
        </div>
      </div>
    );
  else
    return null;
}