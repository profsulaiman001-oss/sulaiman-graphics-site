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
    
    // Small delay helps mobile browsers finish rendering the UI before capture
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(certificateRef.current!, { 
          scale: 2, // 2 is plenty for professional quality and much faster
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: "#ffffff",
          windowWidth: 1123, // Force landscape width during capture
          windowHeight: 794
        });
        
        const imgData = canvas.toDataURL("image/jpeg", 0.9); // JPEG is faster to process than PNG
        const pdf = new jsPDF("l", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Certificate_${formData.clientName.replace(/\s+/g, '_') || 'Sulaiman_Graphics'}.pdf`);
      } catch (error) {
        console.error("PDF Generation failed:", error);
        alert("Export failed. Try again or check your browser permissions.");
      } finally {
        setIsGenerating(false);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* Left Side: Input Panel */}
        <div className="w-full md:w-80 bg-zinc-900 p-8 border-r border-zinc-800 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-white font-bold text-xl tracking-tight">Certificate</h2>
              <p className="text-blue-500 text-[10px] uppercase font-black tracking-widest mt-1">Premium Studio</p>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition"><X size={20} /></button>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><User size={12}/> Recipient Name</label>
              <input 
                type="text" placeholder="John Doe"
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition"
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><Briefcase size={12}/> Project Title</label>
              <input 
                type="text" placeholder="Modern Brand Identity"
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition"
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2"><Hash size={12}/> License Code (Editable)</label>
              <input 
                type="text" 
                value={formData.certNo}
                className="w-full bg-zinc-800 border border-blue-900/50 p-3 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                onChange={(e) => setFormData({...formData, certNo: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><Calendar size={12}/> Date</label>
              <input 
                type="text" value={formData.date}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-xs text-zinc-400 outline-none"
                readOnly
              />
            </div>
          </div>

          <button 
            onClick={generatePDF}
            disabled={!formData.clientName || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white py-4 rounded-2xl font-bold mt-8 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            {isGenerating ? <div className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing...</div> : <><Download size={18} /> Export Premium PDF</>}
          </button>
        </div>

        {/* Right Side: The Premium Canvas */}
        <div className="flex-1 bg-zinc-950 p-4 md:p-12 flex items-start justify-center overflow-auto custom-scrollbar">
           {/* HIDDEN Capture Area with fixed A4 Landscape Ratio */}
           <div 
             ref={certificateRef}
             style={{ width: '1123px', height: '794px', position: 'relative' }}
             className="bg-white flex items-center justify-center p-12"
           >
              {/* Artistic Border Elements */}
              <div className="absolute top-0 left-0 w-full h-3 bg-blue-600"></div>
              <div className="absolute bottom-0 left-0 w-full h-3 bg-zinc-900"></div>
              <div className="absolute top-0 right-0 w-64 h-full bg-zinc-50/50 -skew-x-12 translate-x-32"></div>
              
              {/* Main Content Box */}
              <div className="relative w-full h-full border border-zinc-200 flex flex-col justify-between items-center text-center p-16">
                
                {/* Brand Header */}
                <div className="space-y-3">
                  <h3 className="text-blue-600 font-black tracking-[0.4em] text-sm">SULAIMAN GRAPHICS</h3>
                  <p className="text-zinc-400 text-[9px] uppercase tracking-widest font-bold">Premium Digital Design Studio</p>
                </div>

                {/* Main Titles */}
                <div className="space-y-8">
                  <h1 className="text-zinc-900 text-7xl font-serif tracking-tight leading-tight">Certificate of <br/> Ownership</h1>
                  <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
                  <p className="text-zinc-500 text-xl font-light max-w-2xl mx-auto leading-relaxed">
                    This document formally certifies the complete transfer of creative rights and intellectual property for:
                  </p>
                  <h2 className="text-blue-600 text-5xl font-black uppercase tracking-tighter">{formData.projectName || "Project Title"}</h2>
                </div>

                {/* Assigned To */}
                <div className="space-y-4">
                  <p className="text-zinc-400 uppercase tracking-[0.2em] text-[10px] font-black">Is hereby legally assigned to</p>
                  <h2 className="text-zinc-900 text-4xl font-bold border-b-4 border-zinc-900 pb-2 px-12">{formData.clientName || "Client Name"}</h2>
                </div>

                {/* Metadata Footer */}
                <div className="w-full flex justify-between items-end pt-12 border-t border-zinc-100">
                  <div className="text-left w-1/3">
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-wider">Date of Issue</p>
                    <p className="text-zinc-900 font-bold text-base">{formData.date}</p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <ShieldCheck size={44} className="text-blue-600" strokeWidth={1.5} />
                    <p className="text-zinc-900 font-black text-[9px] tracking-widest">VERIFIED LICENSE</p>
                    <p className="text-zinc-400 font-mono text-[10px]">{formData.certNo}</p>
                  </div>

                  <div className="text-right w-1/3">
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-wider">Authentication</p>
                    <p className="text-zinc-900 font-bold text-base italic underline decoration-blue-600 decoration-2 underline-offset-4">Sulaiman Graphics</p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
