import Header from "./Components/Header";
import logo from "./assets/pdf.png";
import { useEffect, useState } from "react";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);

  useEffect(() => {
    const fetchPdfFiles = async () => {
      try {
        const response = await fetch("http://localhost:3000/get-pdfs");
        const data = await response.json();
        setPdfFiles(data.data);
      } catch (error) {
        console.log(error);
      }
    };
    if (!isModalOpen) {
      fetchPdfFiles();
    }
  }, [isModalOpen]);

  return (
    <>
      <div>
        <Header setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />
      </div>
      <div className="container mx-auto grid grid-cols-5 gap-4 p-4">
        {pdfFiles.map((file: any) => (
          <div className="bg-gray-100 cursor-pointer" key={file}>
            <div className="p-4 rounded-md">
              <img src={logo} alt="logo" className="w-10 h-10" />
              <p className="pt-2">{file}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
