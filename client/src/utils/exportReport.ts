import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadAsPNG(ref: React.RefObject<HTMLDivElement>) {
  if (!ref.current) return;
  const canvas = await html2canvas(ref.current, { scale: 2 });
  const link = document.createElement("a");
  link.download = "report.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export async function downloadAsPDF(ref: React.RefObject<HTMLDivElement>) {
  if (!ref.current) return;
  const canvas = await html2canvas(ref.current, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("report.pdf");
}
