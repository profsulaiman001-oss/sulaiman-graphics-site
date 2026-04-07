import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateProps {
  clientName: string;
  projectTitle: string;
  date: string;
  licenseNumber: string;
  isAdmin?: boolean;
}

const OwnershipCertificate: React.FC<CertificateProps> = ({ 
  clientName, projectTitle, date, licenseNumber, isAdmin = false 
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    // High-res capture for mobile quality
    const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`License_${licenseNumber}.pdf`);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Visual Design - Styled for Sulaiman Graphics */}
      <div 
        ref={certificateRef}
        className="w-[842px] h-[595px] bg-white p-16 relative flex flex-col justify-between border-[20px] border-slate-900"
        style={{ color: '#0f172a', fontFamily: 'serif', position: 'absolute', left: '-9999px' }} // Hidden from view, used for PDF
      >
        <div className="text-center border-b-2 border-slate-100 pb-6">
          <h1 className="text-5xl font-extrabold uppercase tracking-[0.2em]">Certificate of Ownership</h1>
          <p className="text-xl italic text-slate-400 mt-2">Official Transfer of Intellectual Property</p>
        </div>

        <div className="text-center space-y-4">
          <p className="text-lg uppercase tracking-widest text-slate-500">This certifies that</p>
          <h2 className="text-4xl font-bold text-slate-900 underline decoration-slate-200 underline-offset-8 px-4">{clientName}</h2>
          <p className="text-lg text-slate-500">is the recognized owner of the creative asset:</p>
          <h3 className="text-3xl font-serif italic font-semibold text-blue-900">"{projectTitle}"</h3>
        </div>

        <div className="flex justify-between items-end border-t-2 border-slate-100 pt-8">
          <div className="text-left">
            <p className="text-[10px] uppercase text-slate-400 font-sans">License ID</p>
            <p className="font-mono text-sm font-bold tracking-tighter">{licenseNumber}</p>
          </div>
          
          <div className="flex flex-col items-center">
             <div className="w-20 h-20 border-4 border-slate-900 rounded-full flex items-center justify-center mb-1">
                <span className="text-[10px] font-black text-center leading-tight">SULAIMAN<br/>GRAPHICS</span>
             </div>
             <p className="text-[10px] uppercase font-sans font-bold">Authorized Digital Seal</p>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase text-slate-400 font-sans">Issued Date</p>
            <p className="font-bold text-sm">{date}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleDownload}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
      >
        <span>📥</span> {isAdmin ? "Download Archive Copy" : "Download Official License"}
      </button>
    </div>
  );
};

export default OwnershipCertificate;
