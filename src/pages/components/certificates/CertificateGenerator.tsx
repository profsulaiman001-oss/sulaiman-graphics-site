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

  // The Public URL you provided
  const BACKGROUND_URL = "https://lqdeybfkgcihcsticzes.supabase.co/storage/v1/object/public/certificates/1776511592134_865bkg_2_1.jpg";

  const generatePremiumAsset = async () => {
    if (!formData.clientName || !formData.projectName) {
      alert("Please fill in all fields.");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // 1. SUPABASE LOGIC
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

      // 2. PREMIUM PDF GENERATION
      const doc = new jsPDF("l", "mm", "a4"); 
      const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

      // Load and add the background image
      const img = new Image();
      img.src = BACKGROUND_URL;
      
      img.onload = () => {
        // Draw Background
        doc.addImage(img, 'JPEG', 0, 0, pageWidth, pageHeight);

        // --- TEXT STYLING & POSITIONING ---
        // Colors to match the background (Deep Navy and Gold-ish hues)
        const navyColor = "#020617";
        const goldAccent = "#B8860B"; 

        // 1. HEADER TITLE
        doc.setTextColor(navyColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("OFFICIAL CERTIFICATE OF OWNERSHIP", pageWidth / 2, 45, { align: "center", charSpace: 2 });

        // 2. CLIENT NAME (The focus of the certificate)
        doc.setTextColor(navyColor);
        doc.setFontSize(38);
        doc.setFont("times", "bolditalic"); // Using Times for a more classic/legal feel
        doc.text(formData.clientName.toUpperCase(), pageWidth / 2, 95, { align: "center" });

        // 3. PROJECT DESCRIPTION
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor("#4b5563");
        const description = `This document confirms that full commercial rights and legal ownership of the digital assets produced for "${formData.projectName.toUpperCase()}" have been officially transferred from Sulaiman Graphics to the assignee named above.`;
        const splitDescription = doc.splitTextToSize(description, 180);
        doc.text(splitDescription, pageWidth / 2, 115, { align: "center" });

        // 4. FOOTER LEFT: LICENSE ID
        doc.setFontSize(8);
        doc.setTextColor("#9ca3af");
        doc.text("VERIFIED LICENSE ID", 45, 170);
        doc.setTextColor(navyColor);
        doc.setFont("courier", "bold");
        doc.setFontSize(12);
        doc.text(formData.certNo, 45, 178);

        // 5. FOOTER RIGHT: DATE
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor("#9ca3af");
        doc.text("DATE OF ISSUANCE", pageWidth - 45, 170, { align: "right" });
        doc.setTextColor(navyColor);
        doc.setFontSize(12);
        doc.text(new Date().toLocaleDateString('en-GB'), pageWidth - 45, 178, { align: "right" });

        // 6. BOTTOM BRANDING
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(goldAccent);
        doc.text("SULAIMAN GRAPHICS", pageWidth / 2, 190, { align: "center", charSpace: 1 });

        // Save PDF
        doc.save(`Certificate_${formData.clientName.replace(/\s+/g, '_')}.pdf`);
        setIsGenerating(false);
      };

    } catch (err) {
      console.error("Generation Error:", err);
      alert("Failed to secure license record.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
      <div className="bg-[#0a0f1d] border border-blue-500/20 rounded-[2.5rem] w-full max-w-lg shadow-[0_0_50px_rgba(37,99,235,0.1)]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-blue-500/5 rounded-t-[2.5rem]">
          <h2 className="text-white font-bold flex items-center gap-3 italic tracking-tight">
            <ShieldCheck className="text-blue-500" size={20} /> MINT PREMIUM LICENSE
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Assignee / Client Name</label>
            <input 
              type="text" 
              placeholder="Full Legal Name"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all"
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Project Title</label>
            <input 
              type="text" 
              placeholder="e.g. Brand Identity System"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all"
              onChange={(e) => setFormData({...formData, projectName: e.target.value})}
            />
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Cpu className="text-blue-500/50" size={18} />
               <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">License Serial</p>
                  <p className="text-blue-400 font-mono text-sm">{formData.certNo}</p>
               </div>
            </div>
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          </div>

          <button 
            onClick={generatePremiumAsset}
            disabled={!formData.clientName || !formData.projectName || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-zinc-600 text-white py-5 rounded-2xl font-black mt-4 flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 uppercase tracking-[0.2em] text-[10px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                SECURELY GENERATING...
              </>
            ) : (
              <>
                <Download size={18} /> 
                GENERATE PREMIUM ASSET
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
