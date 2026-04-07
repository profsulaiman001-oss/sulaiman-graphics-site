import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { X, Download, ShieldCheck, Calendar, Hash, User, Briefcase } from "lucide-react";

export const CertificateGenerator = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    certNo: `SG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  });

  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);
    
    try {
      // 1. Give mobile browsers a moment to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Optimized Capture with strict dimensions
      const canvas = await html2canvas(certificateRef.current, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff", // Force white background
        logging: false,
        // Crucial fix: Ignore the parent's scroll position
        windowWidth: 1123,
        windowHeight: 794,
        onclone: (clonedDoc) => {
          const capturedElement = clonedDoc.getElementById("premium-cert-canvas");
          if (capturedElement) {
            capturedElement.style.position = "static";
            capturedElement.style.display = "flex";
          }
        }
      });
      
      // 3. High-quality JPEG (Better for PDFs than PNG)
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      // 4. Create A4 Landscape PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${formData.clientName.replace(/\s+/g, '_') || 'Client'}.pdf`);
      
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Browser blocked the download. Please try again or use Chrome.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* Left Side: Professional Input Panel */}
        <div className="w-full md:w-80 bg-zinc-900 p-6 md:p-8 border-r border-zinc-800 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-white font-black text-xl tracking-tighter italic underline decoration-blue-600 underline-offset-4">STUDIO CERT</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition"><X size={18} /></button>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2 tracking-widest"><User size={12}/> Recipient</label>
              <input type="text" placeholder="Client Name" className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition placeholder:text-zinc-600" onChange={(e) => setFormData({...formData, clientName: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2 tracking-widest"><Briefcase size={12}/> Project</label>
              <input type="text" placeholder="Project Title" className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition placeholder:text-zinc-600" onChange={(e) => setFormData({...formData, projectName: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2 tracking-widest"><Hash size={12}/> License ID</label>
              <input type="text" value={formData.certNo} className="w-full bg-zinc-800 border border-blue-900/40 p-3 rounded-xl text-xs text-blue-400 outline-none font-mono" onChange={(e) => setFormData({...formData, certNo: e.target.value})} />
            </div>
          </div>

          <button 
            onClick={generatePDF}
            disabled={!formData.clientName || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white py-5 rounded-2xl font-bold mt-10 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs"
          >
            {isGenerating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Download size={18} /> Export Premium PDF</>}
          </button>
        </div>

        {/* Right Side: The Premium Canvas */}
        <div className="flex-1 bg-black p-4 md:p-12 flex items-center justify-center overflow-auto custom-scrollbar">
           {/* THE CERTIFICATE DESIGN - Fixed A4 Ratio */}
           <div 
             id="premium-cert-canvas"
             ref={certificateRef}
             style={{ width: '1123px', height: '794px' }}
             className="bg-white relative flex flex-col items-center justify-between p-20 shadow-2xl shrink-0"
           >
              {/* Premium Borders */}
              <div className="absolute top-0 left-0 w-full h-5 bg-blue-600"></div>
              <div className="absolute bottom-0 left-0 w-full h-5 bg-zinc-900"></div>
              
              {/* Header */}
              <div className="text-center">
                <h3 className="text-blue-600 font-black tracking-[0.5em] text-xs">SULAIMAN GRAPHICS STUDIO</h3>
                <div className="w-20 h-1.5 bg-zinc-900 mx-auto mt-3"></div>
              </div>

              {/* Main Content */}
              <div className="text-center space-y-12">
                <div className="space-y-2">
                  <h1 className="text-zinc-900 text-8xl font-serif tracking-tight">Certificate of Ownership</h1>
                  <p className="text-zinc-400 text-xl font-light tracking-[0.2em] uppercase">Formal Asset Title Transfer</p>
                </div>

                <div className="space-y-6">
                  <p className="text-zinc-400 uppercase tracking-[0.4em] text-[10px] font-black">This document confirms that</p>
                  <h2 className="text-zinc-900 text-6xl font-black border-b-[6px] border-zinc-900 pb-4 inline-block px-16 uppercase tracking-tighter">{formData.clientName || "Recipient Name"}</h2>
                </div>

                <div className="max-w-2xl mx-auto">
                  <p className="text-zinc-500 text-xl leading-relaxed italic font-light">
                    Is the legal owner of all creative works and intellectual property related to the project:
                  </p>
                  <p className="text-blue-600 text-3xl font-black mt-2 uppercase tracking-tight">"{formData.projectName || "Design Project"}"</p>
                </div>
              </div>

              {/* Footer Layout */}
              <div className="w-full flex justify-between items-end border-t-2 border-zinc-100 pt-12">
                <div className="w-1/3 text-left">
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Issue Date</p>
                  <p className="text-zinc-900 font-bold text-xl">{formData.date}</p>
                </div>

                <div className="w-1/3 flex flex-col items-center gap-3">
                  <ShieldCheck size={56} className="text-blue-600" strokeWidth={1} />
                  <p className="text-zinc-900 font-black text-[10px] tracking-[0.3em] uppercase">Verified License: {formData.certNo}</p>
                </div>

                <div className="w-1/3 text-right">
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Authenticated By</p>
                  <p className="text-zinc-900 font-black text-2xl italic underline underline-offset-8 decoration-blue-600 decoration-4">Sulaiman Graphics</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
