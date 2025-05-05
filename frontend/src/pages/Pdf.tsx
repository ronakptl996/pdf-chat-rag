import PDFChat from "../Components/PDFChat";
import PDFRender from "../Components/PDFRender";

function Pdf() {
  return (
    <div className="grid grid-cols-2 overflow-hidden">
      <PDFRender />
      <PDFChat />
    </div>
  );
}

export default Pdf;
