"use client";
import dynamic from "next/dynamic";

const PDFViewerClient = dynamic(() => import("./client"), {
  ssr: false,
  loading: () => (
    <div className="p-[2rem] text-center text-[1.2rem] "
      // style={{
      //   padding: "2rem",
      //   textAlign: "center",
      //   fontSize: "1.2rem",
      //   color: "#333",
      // }}
    >
      Loading PDF Viewer...
    </div>
  ),
});

const PDFViewer = ({ pdfData }: { pdfData: Blob}) => {
  return <PDFViewerClient pdfData={pdfData} />;
};
export default PDFViewer;