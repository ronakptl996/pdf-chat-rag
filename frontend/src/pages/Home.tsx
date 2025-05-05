import Header from "../Components/Header";
import logo from "../assets/pdf.png";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { toast } from "react-toastify";

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPdfFiles = async () => {
      try {
        const response = await fetch("http://localhost:3000/get-pdfs", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await response.json();
        if (data.success) {
          setPdfFiles(data.data);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Error fetching PDF files");
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
          <NavLink to={`/pdf/${file._id}`} key={file._id}>
            <div className="bg-gray-100 cursor-pointer">
              <div className="p-4 rounded-md">
                <img src={logo} alt="logo" className="w-10 h-10" />
                <p className="pt-2">{file.name}</p>
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </>
  );
}

export default Home;
