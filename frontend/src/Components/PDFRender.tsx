import { useParams } from "react-router";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const PDFRender = () => {
  const { id } = useParams();
  const [numPages, setNumPages] = useState<number | null>(null);

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="overflow-y-auto scrollbar-hide scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 p-4 border-r-2 border-gray-200 h-[calc(100vh-100px)]">
      <Document
        file={`http://localhost:3000/pdf/${id}`}
        loading={<div>PDF is loading...</div>}
        onLoadSuccess={onLoadSuccess}
        options={options}
      >
        {Array.from(new Array(numPages), (_el, index) => (
          <div
            key={`page_${index + 1}`}
            className="relative w-full h-full flex justify-center items-center py-10 border-b border-gray-200"
          >
            <Page
              pageNumber={index + 1}
              className="w-full h-full flex justify-center items-center"
            />
            <div className="absolute bottom-3 right-[50%] text-sm text-gray-500">
              {index + 1} / {numPages}
            </div>
          </div>
        ))}
      </Document>
    </div>
  );
};

export default PDFRender;
