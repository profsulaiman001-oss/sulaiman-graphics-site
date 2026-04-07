import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { X, User, Briefcase, Hash, Calendar, Download } from "lucide-react";

export const CertificateGenerator = ({ onClose }: { onClose: () => void }) => {
  // CORRECTED: Initializing with empty strings for full editability
  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    certNo: `SG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generateNativePDF = () => {
    setIsGenerating(true);
    const doc = new jsPDF("l", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const blueColor = [37, 99, 235]; 
    const darkColor = [24, 24, 27];

    // 1. Premium Blue Abstract Shapes (Corners)
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.triangle(pageWidth, 0, pageWidth, 70, pageWidth - 70, 0, 'F');
    doc.triangle(0, pageHeight, 0, pageHeight - 70, 70, pageHeight, 'F');

    // 2. Main Top Border
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(0, 0, pageWidth, 4, "F");

    // 3. Studio Header (Line removed as requested)
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SULAIMAN GRAPHICS STUDIO", pageWidth / 2, 20, { align: "center", charSpace: 2 });

    // 4. Main Title
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("times", "italic");
    doc.setFontSize(55);
    doc.text("Certificate of Ownership", pageWidth / 2, 55, { align: "center" });

    // 5. Legal Assignment Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("THIS OFFICIAL DOCUMENT SERVES AS A FORMAL TRANSFER OF ALL", pageWidth / 2, 85, { align: "center", charSpace: 1 });
    doc.text("INTELLECTUAL PROPERTY RIGHTS FOR THE PROJECT ENTITLED:", pageWidth / 2, 92, { align: "center", charSpace: 1 });

    // 6. Dynamic Project Title
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text(`"${formData.projectName.toUpperCase()}"`, pageWidth / 2, 112, { align: "center" });

    // 7. Dynamic Recipient Name (Underline removed)
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text("IS HEREBY LEGALLY ASSIGNED TO", pageWidth / 2, 130, { align: "center", charSpace: 2 });
    
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(45);
    doc.setFont("helvetica", "bold");
    doc.text(formData.clientName.toUpperCase(), pageWidth / 2, 155, { align: "center" });

    // 8. Footer Section
    const footerY = 185;
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("ISSUE DATE", 40, footerY);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(formData.date, 40, footerY + 7);

    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text("VERIFIED LICENSE ID", pageWidth / 2, footerY, { align: "center" });
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(formData.certNo, pageWidth / 2, footerY + 7, { align: "center" });

    doc.setTextColor(150, 150, 150);
    doc.text("AUTHENTICATED BY", pageWidth - 40, footerY, { align: "right" });
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Sulaiman G.", pageWidth - 40, footerY + 7, { align: "right" });

    doc.save(`Certificate_${formData.clientName || 'Unnamed'}.pdf`);
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-white font-bold text-lg">Certificate Generator</h2>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Design Studio Edition</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><User size={12}/> Recipient Name</label>
            <input 
              type="text" 
              placeholder="Enter Client Name"
              value={formData.clientName}
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition"
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><Briefcase size={12}/> Project Title</label>
            <input 
              type="text" 
              placeholder="Enter Project Title"
              value={formData.projectName}
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition"
              onChange={(e) => setFormData({...formData, projectName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2"><Hash size={12}/> License ID</label>
              <input type="text" value={formData.certNo} readOnly className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-zinc-400 text-xs font-mono outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2"><Calendar size={12}/> Date</label>
              <input type="text" value={formData.date} readOnly className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-zinc-400 text-xs outline-none" />
            </div>
          </div>

          <button 
            onClick={generateNativePDF}
            disabled={!formData.clientName || !formData.projectName || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white py-5 rounded-2xl font-bold mt-4 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs"
          >
            {isGenerating ? "Processing..." : <><Download size={18} /> Export Premium PDF</>}
          </button>
        </div>
      </div>
    </div>
  );
};
