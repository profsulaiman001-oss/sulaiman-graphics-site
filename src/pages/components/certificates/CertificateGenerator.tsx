import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../../../lib/supabase"; // Path corrected for src/lib/supabase.ts
import { X, FileText, Hash, User, Briefcase, Download, Loader2 } from "lucide-react";

export const CertificateGenerator = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    certNo: `SG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generateNativePDF = async () => {
    // Validation: Don't run if fields are empty
    if (!formData.clientName || !formData.projectName) {
      alert("Please fill in all fields before generating.");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // 1. Save to Supabase
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

      // 2. Generate PDF - High-fidelity certificate matching goal design
      const doc = new jsPDF("l", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Color palette
      const navyBlue: [number, number, number] = [20, 40, 60];
      const tealAccent: [number, number, number] = [30, 60, 80];
      const goldPrimary: [number, number, number] = [180, 140, 60];
      const goldDark: [number, number, number] = [140, 100, 40];
      const lightGray: [number, number, number] = [235, 235, 235];
      const mediumGray: [number, number, number] = [220, 220, 220];
      const darkText: [number, number, number] = [30, 45, 65];

      // === BACKGROUND ===
      // Base light gray background
      doc.setFillColor(...lightGray);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Diagonal stripe pattern (subtle)
      doc.setFillColor(...mediumGray);
      for (let i = -pageHeight; i < pageWidth + pageHeight; i += 40) {
        doc.setFillColor(255, 255, 255);
        const points = [
          { x: i, y: 0 },
          { x: i + 20, y: 0 },
          { x: i + 20 + pageHeight, y: pageHeight },
          { x: i + pageHeight, y: pageHeight }
        ];
        // Draw diagonal stripe using lines
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(18);
        doc.line(i + 10, 0, i + 10 + pageHeight, pageHeight);
      }

      // === TOP-LEFT DECORATIVE RIBBON WAVE ===
      // Main navy wave - top left corner flowing right
      doc.setFillColor(...navyBlue);
      
      // Top left ribbon - curved wave shape
      doc.moveTo(0, 0);
      doc.lineTo(0, 70);
      doc.curveTo(30, 65, 60, 55, 90, 60);
      doc.curveTo(120, 65, 150, 50, 180, 55);
      doc.curveTo(200, 58, 210, 45, 220, 40);
      doc.lineTo(220, 0);
      doc.lineTo(0, 0);
      doc.fill();

      // Secondary teal accent wave beneath
      doc.setFillColor(...tealAccent);
      doc.moveTo(0, 50);
      doc.lineTo(0, 90);
      doc.curveTo(40, 85, 80, 75, 120, 80);
      doc.curveTo(150, 84, 170, 70, 190, 65);
      doc.curveTo(200, 62, 205, 58, 200, 55);
      doc.curveTo(170, 60, 140, 72, 100, 68);
      doc.curveTo(60, 64, 30, 75, 0, 70);
      doc.fill();

      // === BOTTOM-RIGHT DECORATIVE RIBBON WAVE ===
      doc.setFillColor(...navyBlue);
      doc.moveTo(pageWidth, pageHeight);
      doc.lineTo(pageWidth, pageHeight - 70);
      doc.curveTo(pageWidth - 30, pageHeight - 65, pageWidth - 60, pageHeight - 55, pageWidth - 90, pageHeight - 60);
      doc.curveTo(pageWidth - 120, pageHeight - 65, pageWidth - 150, pageHeight - 50, pageWidth - 180, pageHeight - 55);
      doc.curveTo(pageWidth - 200, pageHeight - 58, pageWidth - 210, pageHeight - 45, pageWidth - 220, pageHeight - 40);
      doc.lineTo(pageWidth - 220, pageHeight);
      doc.lineTo(pageWidth, pageHeight);
      doc.fill();

      // Secondary teal accent wave - bottom right
      doc.setFillColor(...tealAccent);
      doc.moveTo(pageWidth, pageHeight - 50);
      doc.lineTo(pageWidth, pageHeight - 90);
      doc.curveTo(pageWidth - 40, pageHeight - 85, pageWidth - 80, pageHeight - 75, pageWidth - 120, pageHeight - 80);
      doc.curveTo(pageWidth - 150, pageHeight - 84, pageWidth - 170, pageHeight - 70, pageWidth - 190, pageHeight - 65);
      doc.curveTo(pageWidth - 200, pageHeight - 62, pageWidth - 205, pageHeight - 58, pageWidth - 200, pageHeight - 55);
      doc.curveTo(pageWidth - 170, pageHeight - 60, pageWidth - 140, pageHeight - 72, pageWidth - 100, pageHeight - 68);
      doc.curveTo(pageWidth - 60, pageHeight - 64, pageWidth - 30, pageHeight - 75, pageWidth, pageHeight - 70);
      doc.fill();

      // Diagonal ribbon cutting through middle-right area
      doc.setFillColor(...navyBlue);
      doc.moveTo(pageWidth - 50, 60);
      doc.curveTo(pageWidth - 80, 80, pageWidth - 100, 120, pageWidth - 60, pageHeight - 60);
      doc.curveTo(pageWidth - 40, pageHeight - 80, pageWidth - 20, pageHeight - 100, pageWidth - 30, 80);
      doc.curveTo(pageWidth - 35, 70, pageWidth - 45, 65, pageWidth - 50, 60);
      doc.fill();

      // === GOLDEN AWARD BADGE ===
      const badgeX = pageWidth - 70;
      const badgeY = 75;
      const badgeRadius = 22;

      // Outer scalloped edge (star-like pattern)
      doc.setFillColor(...goldPrimary);
      const points = 16;
      const outerR = badgeRadius + 8;
      const innerR = badgeRadius + 3;
      
      doc.moveTo(badgeX + outerR, badgeY);
      for (let i = 0; i <= points * 2; i++) {
        const angle = (i * Math.PI) / points;
        const r = i % 2 === 0 ? outerR : innerR;
        const x = badgeX + r * Math.cos(angle);
        const y = badgeY + r * Math.sin(angle);
        doc.lineTo(x, y);
      }
      doc.fill();

      // Inner gold circle with gradient effect
      doc.setFillColor(...goldDark);
      doc.circle(badgeX, badgeY, badgeRadius, "F");
      
      doc.setFillColor(...goldPrimary);
      doc.circle(badgeX, badgeY, badgeRadius - 2, "F");

      // Inner dark circle for text
      doc.setFillColor(...navyBlue);
      doc.circle(badgeX, badgeY, badgeRadius - 5, "F");

      // Badge text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text("SULAIMAN", badgeX, badgeY - 8, { align: "center" });
      doc.text("GRAPHICS", badgeX, badgeY - 3, { align: "center" });
      
      doc.setTextColor(...goldPrimary);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(new Date().getFullYear().toString(), badgeX, badgeY + 5, { align: "center" });
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text("CERTIFIED", badgeX, badgeY + 12, { align: "center" });

      // === MAIN CERTIFICATE TEXT ===
      // Title - "CERTIFICATE"
      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(42);
      doc.text("CERTIFICATE", 25, 45);

      // Subtitle - "OF OWNERSHIP"
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.setTextColor(...tealAccent);
      doc.text("OF OWNERSHIP", 25, 55);

      // Presentation text
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("THIS CERTIFICATE IS PRESENTED TO", 25, 80);

      // Client Name - elegant styling
      doc.setTextColor(...darkText);
      doc.setFont("times", "bolditalic");
      doc.setFontSize(32);
      doc.text(formData.clientName, 25, 100);

      // Decorative line under name
      const nameWidth = doc.getTextWidth(formData.clientName);
      doc.setDrawColor(...navyBlue);
      doc.setLineWidth(0.8);
      doc.line(25, 105, 25 + Math.max(nameWidth, 100), 105);

      // Project description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const projectText = `For the successful completion and delivery of the professional design project "${formData.projectName}".`;
      const splitText = doc.splitTextToSize(projectText, 160);
      doc.text(splitText, 25, 118);
      
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("All intellectual property rights have been officially transferred to the certificate holder.", 25, 135);

      // === FOOTER SECTION ===
      const footerY = pageHeight - 35;

      // Signature field
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.line(25, footerY + 5, 80, footerY + 5);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("SIGNATURE", 25, footerY + 12);

      // Date field
      doc.line(100, footerY + 5, 155, footerY + 5);
      doc.text("DATE", 100, footerY + 12);
      doc.setTextColor(...darkText);
      doc.setFontSize(10);
      doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), 100, footerY + 3);

      // === SECURITY SERIAL NUMBER - License ID ===
      // Professional security serial styling at bottom center
      const serialY = pageHeight - 12;
      
      // Security background strip
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(pageWidth / 2 - 50, serialY - 6, 100, 14, 2, 2, "F");
      
      // Security border
      doc.setDrawColor(...navyBlue);
      doc.setLineWidth(0.3);
      doc.roundedRect(pageWidth / 2 - 50, serialY - 6, 100, 14, 2, 2, "S");
      
      // Security icon dots
      doc.setFillColor(...goldPrimary);
      doc.circle(pageWidth / 2 - 42, serialY + 1, 1.5, "F");
      doc.circle(pageWidth / 2 + 42, serialY + 1, 1.5, "F");
      
      // License ID text
      doc.setFont("courier", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...navyBlue);
      doc.text("SERIAL NO:", pageWidth / 2 - 35, serialY + 2);
      
      doc.setTextColor(...darkText);
      doc.setFontSize(10);
      doc.text(formData.certNo, pageWidth / 2 + 5, serialY + 2);

      // Save PDF
      doc.save(`Certificate_${formData.clientName.replace(/\s+/g, '_')}.pdf`);
      
    } catch (err) {
      console.error("Masterpiece Save Error:", err);
      alert("Failed to secure license record. Please try again.");
    } finally {
      setIsGenerating(false);
    }
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
            <label className="text-[10px] font-black text-zinc-500 uppercase">Client Name</label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition"
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase">Project Title</label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition"
              onChange={(e) => setFormData({...formData, projectName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-blue-500 uppercase">License ID</label>
            <input 
              type="text" value={formData.certNo} readOnly
              className="w-full bg-zinc-800 border border-blue-900/40 p-4 rounded-2xl text-blue-400 outline-none font-mono cursor-not-allowed"
            />
          </div>

          <button 
            onClick={generateNativePDF}
            disabled={!formData.clientName || !formData.projectName || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white py-5 rounded-2xl font-bold mt-4 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                SECURING LICENSE...
              </>
            ) : (
              <>
                <Download size={18} /> 
                Verify & Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
