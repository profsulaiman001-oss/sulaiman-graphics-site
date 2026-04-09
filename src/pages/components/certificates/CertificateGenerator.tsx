import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../../../lib/supabase";
import { X, FileText, Download, Loader2, ShieldCheck, Cpu } from "lucide-react";

export const CertificateGenerator = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    // Keeping your exact ID generation logic
    certNo: `SG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generatePremiumAsset = async () => {
    if (!formData.clientName || !formData.projectName) {
      alert("Please fill in all fields.");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // 1. SUPABASE LOGIC (UNTOUCHED)
      const { error } = await supabase
        .from('certificates')
        .insert([
          { 
            license_id: formData.certNo, 
            client_name: formData.clientName, 
            project_name: formData.projectName,
            issue_date: new Date().toISOString().split('T')[0] 
          }
        ]);

      if (error) throw error;

      // 2. PREMIUM PDF GENERATION (ENCRYPTED ASSET CARD STYLE)
      const doc = new jsPDF("l", "mm", [297, 210]); // A4 Landscape
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // COLORS
      const brandBlue = [37, 99, 235]; 
      const darkBg = [5, 10, 21]; // Matches your Hub's dark theme
      const white = [255, 255, 255];
      const gray = [100, 116, 139];

      // BACKGROUND: FULL DARK SPACE
      doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // GLOWING BORDER
      doc.setDrawColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.setLineWidth(1.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20, "S");
      
      // HEADER: STUDIO IDENTITY
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("SULAIMAN GRAPHICS // SECURE ASSET MANAGEMENT", pageWidth / 2, 25, { align: "center", charSpace: 3 });

      // MAIN TITLE
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(42);
      doc.text("CERTIFICATE OF OWNERSHIP", pageWidth / 2, 60, { align: "center" });
      
      // DESCRIPTION
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("FORMAL INTELLECTUAL PROPERTY & USAGE RIGHTS TRANSFER", pageWidth / 2, 72, { align: "center", charSpace: 1.5 });

      // THE ASSIGNEE SECTION (Glassmorphism Effect)
      doc.setFillColor(255, 255, 255, 0.03); 
      doc.roundedRect(40, 90, pageWidth - 80, 50, 5, 5, "F");
      
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.setFontSize(9);
      doc.text("LEGAL RIGHTS ASSIGNED TO:", pageWidth / 2, 102, { align: "center" });

      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.text(formData.clientName.toUpperCase(), pageWidth / 2, 122, { align: "center" });

      // PROJECT INFO
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.setFontSize(11);
      doc.text(`PROJECT: ${formData.projectName.toUpperCase()}`, pageWidth / 2, 160, { align: "center" });

      // FOOTER DATA
      const footerY = 185;
      
      // Date
      doc.setFontSize(8);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.text("ISSUE DATE", 40, footerY);
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(12);
      doc.text(new Date().toLocaleDateString(), 40, footerY + 8);

      // LICENSE ID (The Key Data)
      doc.setFontSize(8);
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.text("VERIFIED LICENSE ID", pageWidth / 2, footerY, { align: "center" });
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(14);
      doc.setFont("courier", "bold"); 
      doc.text(formData.certNo, pageWidth / 2, footerY + 8, { align: "center" });

      // AUTHENTICATOR
      doc.setFontSize(8);
      doc.setTextColor(gray[0], gray[1], gray[2]);
      doc.text("AUTHENTICATED BY", pageWidth - 40, footerY, { align: "right" });
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bolditalic");
      doc.text("Sulaiman Graphics", pageWidth - 40, footerY + 8, { align: "right" });

      // Save PDF
      doc.save(`SG_License_${formData.clientName.replace(/\s+/g, '_')}.pdf`);
      
    } catch (err) {
      console.error("Masterpiece Save Error:", err);
      alert("Failed to secure license record.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
      <div className="bg-[#0a0f1d] border border-blue-500/20 rounded-[2.5rem] w-full max-w-lg shadow-[0_0_50px_rgba(37,99,235,0.1)] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-blue-500/5">
          <h2 className="text-white font-bold flex items-center gap-3 italic tracking-tight">
            <ShieldCheck className="text-blue-500" size={20} /> MINT LICENSE ASSET
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client Name</label>
            <input 
              type="text" 
              placeholder="e.g. SULAIMAN RABIU"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all font-medium"
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Project Title</label>
            <input 
              type="text" 
              placeholder="e.g. SG Flyer Design"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all font-medium"
              onChange={(e) => setFormData({...formData, projectName: e.target.value})}
            />
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Cpu className="text-blue-500/50" size={18} />
               <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Generated ID</p>
                  <p className="text-blue-400 font-mono text-sm">{formData.certNo}</p>
               </div>
            </div>
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          </div>

          <button 
            onClick={generatePremiumAsset}
            disabled={!formData.clientName || !formData.projectName || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-zinc-600 text-white py-5 rounded-2xl font-black mt-4 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20 uppercase tracking-[0.2em] text-[10px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                ENCRYPTING DATA...
              </>
            ) : (
              <>
                <Download size={18} /> 
                SECURE & GENERATE ASSET
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
