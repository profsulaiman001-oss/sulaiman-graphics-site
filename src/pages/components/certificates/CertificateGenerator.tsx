import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { X, FileText, Hash, User, Briefcase, Download } from "lucide-center";

export const CertificateGenerator = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    certNo: `SG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generateNativePDF = () => {
    setIsGenerating(true);
    
    // Create PDF: Landscape, Unit: Millimeters, Format: A4
    const doc = new jsPDF("l", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const blueColor = [37, 99, 235]; // Blue-600
    const darkColor = [24, 24, 27]; // Zinc-900

    // 1. Draw Premium Borders
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(0, 0, pageWidth, 5, "F"); // Top Blue Bar
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(0, pageHeight - 5, pageWidth, 5, "F"); // Bottom Dark Bar

    // 2. Studio Header
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SULAIMAN GRAPHICS STUDIO", pageWidth / 2, 20, { align: "center", charSpace: 2 });
    
    // LINE REMOVED HERE (The doc.line code that was at Y: 23 is gone)

    // 3. Main Title
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("times", "italic");
    doc.setFontSize(50);
    doc.text("Certificate of Ownership", pageWidth / 2, 55, { align: "center" });

    // 4. Sub-text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("FORMAL INTELLECTUAL PROPERTY TRANSFER", pageWidth / 2, 65, { align: "center", charSpace: 1 });

    // 5. Assignment Text
    doc.setFontSize(10);
    doc.text("THIS DOCUMENT CONFIRMS THAT THE RIGHTS ARE LEGALLY ASSIGNED TO", pageWidth / 2, 90, { align: "center" });

    // 6. Recipient Name (The focus)
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(35);
    doc.setFont("helvetica", "bold");
    doc.text(formData.clientName.toUpperCase() || "RECIPIENT NAME", pageWidth / 2, 110, { align: "center" });
    
    // Underline for name
    doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 60, 115, pageWidth / 2 + 60, 115);

    // 7. Project Details
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("For the professional design project entitled:", pageWidth / 2, 135, { align: "center" });
    
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(`"${formData.projectName || "Design Project"}"`, pageWidth / 2, 150, { align: "center" });

    // 8. Footer Metadata
    const footerY = 180;
    
    // Date
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("ISSUE DATE", 40, footerY);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(12);
    doc.text(new Date().toLocaleDateString(), 40, footerY + 7);

    // License ID
    doc.setFontSize(9);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text("VERIFIED LICENSE ID", pageWidth / 2, footerY, { align: "center" });
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(11);
    doc.text(formData.certNo, pageWidth / 2, footerY + 7, { align: "center" });

    // Signature/Authority
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("AUTHENTICATED BY", pageWidth - 40, footerY, { align: "right" });
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.text("Sulaiman Graphics", pageWidth - 40, footerY + 7, { align: "right" });

    // 9. Save the file
    doc.save(`Certificate_${formData.clientName.replace(/\s+/g, '_') || 'SG'}.pdf`);
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-white font-bold flex items-center gap-2">
            <FileText className="text-blue-500" /> Professional License
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
              <User size={12}/> Client Name
            </label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition"
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
              <Briefcase size={12}/> Project Title
            </label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition"
              onChange={(e) => setFormData({...formData, projectName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2">
              <Hash size={12}/> License Code (Manual Edit)
            </label>
            <input 
              type="text" 
              value={formData.certNo}
              className="w-full bg-zinc-800 border border-blue-900/40 p-4 rounded-2xl text-blue-400 outline-none font-mono"
              onChange={(e) => setFormData({...formData, certNo: e.target.value})}
            />
          </div>

          <button 
            onClick={generateNativePDF}
            disabled={!formData.clientName || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white py-5 rounded-2xl font-bold mt-4 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs"
          >
            {isGenerating ? "CREATING PDF..." : <><Download size={18} /> Download Certificate</>}
          </button>
        </div>
      </div>
    </div>
  );
};
