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

  // Your new "Clean" background link
  const BACKGROUND_URL = "https://lqdeybfkgcihcsticzes.supabase.co/storage/v1/object/public/certificates/20260419_092504.png";

  const generatePremiumAsset = async () => {
    if (!formData.clientName || !formData.projectName) {
      alert("Please fill in all fields.");
      return;
    }
    
    setIsGenerating(true);
    
    try {
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

      const doc = new jsPDF("l", "mm", "a4"); 
      const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

      const img = new Image();
      img.src = BACKGROUND_URL;
      
      img.onload = () => {
        doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

        const navyColor = "#050A15";
        const accentBlue = "#2563EB"; 

        // 1. TOP MARGIN LOGO TEXT
        doc.setTextColor(accentBlue);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("SULAIMAN GRAPHICS // OFFICIAL ASSET LICENSE", 25, 25, { charSpace: 1 });

        // 2. MAIN HEADER (Hierarchy Level 1)
        doc.setTextColor(navyColor);
        doc.setFont("times", "bold");
        doc.setFontSize(32);
        doc.text("CERTIFICATE OF", 25, 60);
        doc.text("OWNERSHIP", 25, 72);

        // 3. ASSIGNEE LABEL
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor("#64748b");
        doc.text("THIS IS TO CERTIFY THAT", 25, 95, { charSpace: 1 });

        // 4. CLIENT NAME (Hierarchy Level 1 - The Focus)
        doc.setTextColor(navyColor);
        doc.setFontSize(42);
        doc.setFont("times", "bolditalic");
        doc.text(formData.clientName.toUpperCase(), 25, 115);

        // 5. PROJECT DESCRIPTION (Hierarchy Level 2)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor("#334155");
        const bodyText = `Is the sole legal owner and holder of all commercial usage rights for the digital masterpiece titled "${formData.projectName.toUpperCase()}." This license serves as an official transfer of Intellectual Property from Sulaiman Graphics.`;
        const splitText = doc.splitTextToSize(bodyText, 140); // Kept to the left half
        doc.text(splitText, 25, 130);

        // 6. METADATA FOOTER (Hierarchy Level 3 - Technical Data)
        // License ID
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor("#94a3b8");
        doc.text("LICENSE SERIAL ID", 25, 175);
        doc.setTextColor(navyColor);
        doc.setFont("courier", "bold");
        doc.setFontSize(11);
        doc.text(formData.certNo, 25, 182);

        // Date
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor("#94a3b8");
        doc.text("ISSUANCE DATE", 90, 175);
        doc.setTextColor(navyColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(new Date().toLocaleDateString('en-GB'), 90, 182);

        // Branding
        doc.setTextColor(accentBlue);
        doc.setFontSize(10);
        doc.text("SULAIMAN.GRAPHICS", 25, 195);

        doc.save(`SG_License_${formData.clientName.replace(/\s+/g, '_')}.pdf`);
        setIsGenerating(false);
      };

    } catch (err) {
      console.error(err);
      alert("Failed to secure license record.");
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
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Client Identity</label>
            <input 
              type="text" 
              placeholder="Full Legal Name"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all font-medium"
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Asset Project Title</label>
            <input 
              type="text" 
              placeholder="e.g. Premium Brand Logo"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-all font-medium"
              onChange={(e) => setFormData({...formData, projectName: e.target.value})}
            />
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Cpu className="text-blue-500/50" size={18} />
               <div>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Allocated ID</p>
                  <p className="text-blue-400 font-mono text-xs">{formData.certNo}</p>
               </div>
            </div>
          </div>

          <button 
            onClick={generatePremiumAsset}
            disabled={!formData.clientName || !formData.projectName || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-zinc-600 text-white py-5 rounded-2xl font-black mt-4 flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 uppercase tracking-[0.2em] text-[10px]"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            {isGenerating ? "Processing Asset..." : "Generate Official License"}
          </button>
        </div>
      </div>
    </div>
  );
};
