import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../../../lib/supabase";
import { X, Download, Loader2, ShieldCheck, Cpu } from "lucide-react";

export const CertificateGenerator = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    certNo: `SG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // High-quality JPG background
  const BACKGROUND_URL = "https://lqdeybfkgcihcsticzes.supabase.co/storage/v1/object/public/certificates/20260419_093930.jpg";

  const generatePremiumAsset = async () => {
    if (!formData.clientName || !formData.projectName) {
      alert("Please fill in all fields.");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const { error } = await supabase
        .from('certificates')
        .insert([{ 
            license_id: formData.certNo, 
            client_name: formData.clientName, 
            project_name: formData.projectName,
            issue_date: new Date().toISOString().split('T')[0] 
        }]);

      if (error) throw error;

      const doc = new jsPDF("l", "mm", "a4"); 
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const img = new Image();
      img.src = BACKGROUND_URL;
      
      img.onload = () => {
        doc.addImage(img, 'JPEG', 0, 0, pageWidth, pageHeight);

        // --- GLOBAL COLOR: PURE BLACK ---
        doc.setTextColor("#000000");

        // 1. HEADER: SULAIMAN GRAPHICS (Top Left)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("SULAIMAN GRAPHICS", 25, 25, { charSpace: 1.5 });

        // 2. MAIN TITLE
        doc.setFont("times", "bold");
        doc.setFontSize(32);
        doc.text("CERTIFICATE OF", 25, 55);
        doc.text("OWNERSHIP", 25, 67);

        // 3. ASSIGNEE LABEL (Tightened spacing)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("THIS IS TO CERTIFY THAT", 25, 82, { charSpace: 1 });

        // 4. OWNER'S NAME (Normal style + Underline)
        doc.setFont("times", "bold");
        doc.setFontSize(44);
        doc.text(formData.clientName.toUpperCase(), 25, 105);
        
        const nameWidth = doc.getTextWidth(formData.clientName.toUpperCase());
        doc.setDrawColor(0);
        doc.setLineWidth(0.8);
        doc.line(25, 108, 25 + nameWidth, 108);

        // 5. PARAGRAPH (Increased size + Bold Project Name)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(13);
        
        const textPart1 = "Is the sole legal owner and holder of all commercial usage rights for the digital masterpiece titled ";
        const textPart2 = `"${formData.projectName.toUpperCase()}." `;
        const textPart3 = "This license serves as an official transfer of Intellectual Property from Sulaiman Graphics.";

        doc.text(textPart1, 25, 122);
        const part1Width = doc.getTextWidth(textPart1);
        
        doc.setFont("helvetica", "bold"); 
        doc.text(textPart2, 25 + part1Width, 122);
        
        doc.setFont("helvetica", "normal");
        doc.text(textPart3, 25, 129);

        // 6. BOTTOM SECTION (Adjusted Upward to avoid background overlap)
        const footerY = 160; // Moved up from 165/172 to ensure total clearance

        // License ID
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("LICENSE SERIAL ID", 25, footerY);
        doc.setFont("courier", "bold");
        doc.setFontSize(12);
        doc.text(formData.certNo, 25, footerY + 7);

        // Issuance Date
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("ISSUANCE DATE", 95, footerY);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(new Date().toLocaleDateString('en-GB'), 95, footerY + 7);

        // NOTE: Bottom Branding Removed as per request

        doc.save(`SG_License_${formData.clientName.replace(/\s+/g, '_')}.pdf`);
        setIsGenerating(false);
      };

    } catch (err) {
      console.error(err);
      alert("Error generating license.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
      <div className="bg-[#0a0f1d] border border-blue-500/20 rounded-[2.5rem] w-full max-w-lg shadow-[0_0_50px_rgba(37,99,235,0.1)]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-blue-500/5 rounded-t-[2.5rem]">
          <h2 className="text-white font-bold flex items-center gap-3 italic tracking-tight uppercase text-xs">
            <ShieldCheck className="text-blue-500" size={18} /> Asset Minting Station
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors focus:outline-none"><X /></button>
        </div>

        <div className="p-8 space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block pl-1">Client Identity</label>
            <input 
              type="text" 
              placeholder="Full Legal Name"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all font-medium"
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block pl-1">Asset Project Title</label>
            <input 
              type="text" 
              placeholder="e.g. Premium Brand Logo"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all font-medium"
              onChange={(e) => setFormData({...formData, projectName: e.target.value})}
            />
          </div>

          {/* PREVIEW OF ALLOCATED ID */}
          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Cpu className="text-blue-500/50" size={18} />
               <div className="text-left">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Allocated ID</p>
                  <p className="text-blue-400 font-mono text-xs">{formData.certNo}</p>
               </div>
            </div>
          </div>

          <button 
            onClick={generatePremiumAsset}
            disabled={!formData.clientName || !formData.projectName || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-zinc-600 text-white py-5 rounded-2xl font-black mt-4 flex items-center justify-center gap-3 transition-all uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-blue-600/20"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            {isGenerating ? "Processing Asset..." : "Generate Official License"}
          </button>
        </div>
      </div>
    </div>
  );
};
