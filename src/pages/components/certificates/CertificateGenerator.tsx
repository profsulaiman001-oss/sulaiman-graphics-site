import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../../../lib/supabase"; 
import { X, FileText, Hash, User, Briefcase, Download, Loader2 } from "lucide-react";

export const CertificateGenerator = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    certNo: `SG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generateNativePDF = async () => {
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

      // PDF Setup: Landscape A4
      const doc = new jsPDF("l", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // COLORS
      const navyBlue = [10, 31, 64];   // Dark Navy (Replacing black)
      const accentBlue = [37, 99, 235]; // Vivid Blue
      const lightGray = [245, 245, 247];

      // 1. BACKGROUND BASE
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // 2. DRAW GEOMETRIC DECORATIONS (THE RIBBONS)
      // Top Right Angles
      doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      doc.triangle(pageWidth, 0, pageWidth, 80, pageWidth - 100, 0, "F");
      
      doc.setFillColor(accentBlue[0], accentBlue[1], accentBlue[2]);
      doc.triangle(pageWidth, 20, pageWidth, 100, pageWidth - 120, 0, "F");

      // Bottom Left Angles
      doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      doc.triangle(0, pageHeight, 0, pageHeight - 80, 100, pageHeight, "F");
      
      doc.setFillColor(accentBlue[0], accentBlue[1], accentBlue[2]);
      doc.triangle(0, pageHeight - 20, 0, pageHeight - 100, 120, pageHeight, "F");

      // 3. TEXT LAYOUT (Aligned Left to match inspiration)
      const marginX = 40;

      // Header
      doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(30);
      doc.text("CERTIFICATE", marginX, 45);
      
      doc.setFont("helvetica", "light");
      doc.setFontSize(22);
      doc.text("OF OWNERSHIP", marginX, 55);

      // Subtitle
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("THIS DOCUMENT CONFIRMS THE LEGAL TRANSFER TO:", marginX, 85);

      // Recipient Name
      doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      doc.setFontSize(42);
      doc.setFont("helvetica", "bold");
      doc.text(formData.clientName, marginX, 105);
      
      // Underline
      doc.setDrawColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      doc.setLineWidth(0.8);
      doc.line(marginX, 110, marginX + 120, 110);

      // Project Description
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const projectText = `For the professional creative project entitled "${formData.projectName}". This license verifies that all design assets, intellectual property rights, and commercial usage permissions have been fully assigned to the above-named client.`;
      const splitText = doc.splitTextToSize(projectText, 140);
      doc.text(splitText, marginX, 125);

      // 4. THE GOLDEN SEAL (Drawn natively)
      const sealX = pageWidth - 65;
      const sealY = 100;
      doc.setFillColor(197, 160, 82); // Gold color
      doc.circle(sealX, sealY, 18, "F");
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.circle(sealX, sealY, 16, "S");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("VERIFIED", sealX, sealY - 2, { align: "center" });
      doc.setFontSize(10);
      doc.text("STUDIO", sealX, sealY + 4, { align: "center" });

      // 5. FOOTER (Signature & Date)
      const footerY = 175;
      
      // Signature Line
      doc.setDrawColor(150, 150, 150);
      doc.line(marginX, footerY, marginX + 50, footerY);
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text("AUTHENTICATED SIGNATURE", marginX + 25, footerY + 5, { align: "center" });
      
      doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      doc.setFont("helvetica", "bolditalic");
      doc.text("Sulaiman Graphics", marginX + 25, footerY - 2, { align: "center" });

      // Date Line
      const dateX = marginX + 80;
      doc.setDrawColor(150, 150, 150);
      doc.line(dateX, footerY, dateX + 50, footerY);
      doc.setTextColor(100, 100, 100);
      doc.text("ISSUE DATE", dateX + 25, footerY + 5, { align: "center" });
      
      doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleDateString(), dateX + 25, footerY - 2, { align: "center" });

      // License ID (Vertical on the far right)
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(7);
      doc.text(`ID: ${formData.certNo}`, pageWidth - 10, pageHeight - 15, { angle: 90 });

      // Save
      doc.save(`License_${formData.clientName.replace(/\s+/g, '_')}.pdf`);
      
    } catch (err) {
      console.error(err);
      alert("Verification Error: Could not save to database.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-white font-bold flex items-center gap-2 tracking-tight">
            <FileText className="text-blue-500" size={20} /> Masterpiece License
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Client Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Full Legal Name"
                className="w-full bg-zinc-800/50 border border-zinc-700 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Project Title</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="e.g. Brand Identity Design"
                className="w-full bg-zinc-800/50 border border-zinc-700 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={generateNativePDF}
              disabled={!formData.clientName || !formData.projectName || isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 uppercase tracking-widest text-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  PROCESSING...
                </>
              ) : (
                <>
                  <Download size={18} /> 
                  Generate & Verify
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
