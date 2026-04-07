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
      const canvas = await html2canvas(certificateRef.current, { 
        scale: 3, // Higher scale for premium print quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${formData.clientName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* Left Side: Professional Input Panel */}
        <div className="w-full md:w-80 bg-zinc-900 p-8 border-r border-zinc-800 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-white font-bold text-xl">Certificate</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Studio Edition</p>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition"><X size={20} /></button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2"><User size={12}/> Recipient Name</label>
              <input 
                type="text" placeholder="e.g. John Doe"
                className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2"><Briefcase size={12}/> Project Title</label>
              <input 
                type="text" placeholder="e.g. Modern Brand Identity"
                className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none"
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2"><Hash size={12}/> ID</label>
                <input 
                  type="text" value={formData.certNo}
                  className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl text-[10px] text-zinc-300 outline-none"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2"><Calendar size={12}/> Date</label>
                <input 
                  type="text" value={formData.date}
                  className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl text-[10px] text-zinc-300 outline-none"
                  readOnly
                />
              </div>
            </div>
          </div>

          <button 
            onClick={generatePDF}
            disabled={!formData.clientName || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white py-4 rounded-2xl font-bold mt-10 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            {isGenerating ? "Processing..." : <><Download size={18} /> Export Premium PDF</>}
          </button>
        </div>

        {/* Right Side: The Premium Canvas */}
        <div className="flex-1 bg-zinc-800/50 p-12 flex items-center justify-center overflow-auto">
           {/* Wrap the certificate in a div with fixed dimensions to ensure PDF consistency */}
           <div className="min-w-[1123px] min-h-[794px] bg-white relative flex items-center justify-center shadow-2xl" ref={certificateRef} style={{ width: '1123px', height: '794px' }}>
              
              {/* Design Elements */}
              <div className="absolute top-0 left-0 w-full h-4 bg-blue-600"></div>
              <div className="absolute top-0 right-0 w-1/3 h-full bg-zinc-50/50 -skew-x-12 translate-x-20"></div>
              
              {/* Content Layout */}
              <div className="relative w-[90%] h-[85%] border-[1px] border-zinc-200 p-16 flex flex-col justify-between items-center text-center">
                
                {/* Header Section */}
                <div className="space-y-2">
                  <h3 className="text-blue-600 font-black tracking-[0.3em] text-sm">SULAIMAN GRAPHICS STUDIO</h3>
                  <div className="w-12 h-1 bg-zinc-900 mx-auto"></div>
                </div>

                {/* Main Hierarchy */}
                <div className="space-y-8">
                  <h1 className="text-zinc-900 text-7xl font-serif tracking-tight">Certificate of Ownership</h1>
                  <p className="text-zinc-500 text-xl font-light max-w-2xl mx-auto">
                    This official document serves as a formal transfer of all intellectual property rights and creative ownership for the project entitled:
                  </p>
                  <h2 className="text-blue-600 text-5xl font-black uppercase tracking-tight">{formData.projectName || "Project Title"}</h2>
                </div>

                {/* Recipient */}
                <div className="space-y-4">
                  <p className="text-zinc-400 uppercase tracking-widest text-xs font-bold">Is hereby legally assigned to</p>
                  <h2 className="text-zinc-900 text-4xl font-bold border-b-2 border-zinc-900 pb-2 inline-block px-8">{formData.clientName || "Client Name"}</h2>
                </div>

                {/* Footer Data */}
                <div className="w-full flex justify-between items-end border-t border-zinc-100 pt-12">
                  <div className="text-left space-y-1">
                    <p className="text-zinc-400 text-[10px] font-black uppercase">Issue Date</p>
                    <p className="text-zinc-900 font-bold text-sm">{formData.date}</p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck size={40} className="text-blue-600" />
                    <p className="text-zinc-900 font-black text-[10px] tracking-tighter">OFFICIAL VERIFICATION CODE</p>
                    <p className="text-zinc-400 text-[9px]">{formData.certNo}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-zinc-400 text-[10px] font-black uppercase">Authorized By</p>
                    <p className="text-zinc-900 font-bold text-sm underline decoration-blue-600 decoration-2">Director of Design</p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
