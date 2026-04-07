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
      // Use a timeout to ensure any mobile keyboard closure or layout shifts finish
      await new Promise(resolve => setTimeout(resolve, 600));

      const canvas = await html2canvas(certificateRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        // These settings are the secret for mobile success:
        scrollX: 0,
        scrollY: -window.scrollY, 
        onclone: (clonedDoc) => {
          // Make sure the cloned element is visible for the capture
          const el = clonedDoc.getElementById("premium-cert-canvas");
          if (el) el.style.display = "flex";
        }
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${formData.clientName.replace(/\s+/g, '_') || 'SG'}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Download failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* Left Side: Professional Input Panel */}
        <div className="w-full md:w-80 bg-zinc-900 p-6 md:p-8 border-r border-zinc-800 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-white font-black text-xl tracking-tighter">STUDIO <span className="text-blue-500">CERT</span></h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition"><X size={18} /></button>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2 tracking-widest"><User size={12}/> Recipient</label>
              <input type="text" placeholder="Client Name" className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition" onChange={(e) => setFormData({...formData, clientName: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2 tracking-widest"><Briefcase size={12}/> Project</label>
              <input type="text" placeholder="Project Name" className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition" onChange={(e) => setFormData({...formData, projectName: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2 tracking-widest"><Hash size={12}/> License ID</label>
              <input type="text" value={formData.certNo} className="w-full bg-zinc-800/50 border border-blue-900/30 p-3 rounded-xl text-xs text-blue-400 outline-none" onChange={(e) => setFormData({...formData, certNo: e.target.value})} />
            </div>
          </div>

          <button 
            onClick={generatePDF}
            disabled={!formData.clientName || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white py-4 rounded-2xl font-bold mt-10 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
          >
            {isGenerating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Download size={20} /> Generate PDF</>}
          </button>
        </div>

        {/* Right Side: The Premium Canvas */}
        <div className="flex-1 bg-zinc-950 p-4 md:p-12 flex items-center justify-center overflow-auto">
           {/* THE CERTIFICATE DESIGN */}
           <div 
             id="premium-cert-canvas"
             ref={certificateRef}
             style={{ width: '1123px', height: '794px' }}
             className="bg-white relative flex flex-col items-center justify-between p-16 shadow-2xl shrink-0"
           >
              {/* Premium Borders */}
              <div className="absolute top-0 left-0 w-full h-4 bg-blue-600"></div>
              <div className="absolute bottom-0 left-0 w-full h-4 bg-zinc-900"></div>
              
              {/* Header */}
              <div className="text-center">
                <h3 className="text-blue-600 font-black tracking-[0.4em] text-xs">SULAIMAN GRAPHICS STUDIO</h3>
                <div className="w-16 h-1 bg-zinc-900 mx-auto mt-2"></div>
              </div>

              {/* Main Content */}
              <div className="text-center space-y-10">
                <div className="space-y-2">
                  <h1 className="text-zinc-900 text-7xl font-serif tracking-tight">Certificate of Ownership</h1>
                  <p className="text-zinc-400 text-lg font-light tracking-wide italic">Formal Intellectual Property Transfer</p>
                </div>

                <div className="space-y-4">
                  <p className="text-zinc-400 uppercase tracking-[0.3em] text-[10px] font-black">Is hereby legally assigned to</p>
                  <h2 className="text-zinc-900 text-5xl font-black border-b-2 border-zinc-900 pb-4 inline-block px-12 uppercase">{formData.clientName || "Client Name"}</h2>
                </div>

                <div className="max-w-2xl mx-auto">
                  <p className="text-zinc-500 text-lg leading-relaxed">
                    This document certifies that the creative assets for <span className="text-blue-600 font-bold">"{formData.projectName || "Project Title"}"</span> are the exclusive property of the aforementioned recipient.
                  </p>
                </div>
              </div>

              {/* Footer Layout - Fixed Hierarchy */}
              <div className="w-full flex justify-between items-end border-t border-zinc-100 pt-10">
                <div className="w-1/3 text-left">
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Issue Date</p>
                  <p className="text-zinc-900 font-bold text-lg">{formData.date}</p>
                </div>

                <div className="w-1/3 flex flex-col items-center gap-2">
                  <ShieldCheck size={48} className="text-blue-600" />
                  <p className="text-zinc-900 font-black text-[10px] tracking-widest">LIC: {formData.certNo}</p>
                </div>

                <div className="w-1/3 text-right">
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Authority</p>
                  <p className="text-zinc-900 font-black text-lg underline underline-offset-4 decoration-blue-600">Sulaiman G.</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
