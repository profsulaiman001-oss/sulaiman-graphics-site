import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { X, Download, PenTool } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

export const CertificateGenerator = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    certNo: `SG-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split("T")[0],
  });

  const sigCanvas = useRef<SignatureCanvas>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!certificateRef.current) return;
    
    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${formData.projectName}_Certificate.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
        
        {/* Left Side: The Form */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary">Certificate Details</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-white"><X /></button>
          </div>

          <div className="space-y-3">
            <input 
              type="text" placeholder="Client Name"
              className="w-full bg-background border border-border p-3 rounded-xl text-sm"
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            />
            <input 
              type="text" placeholder="Project Name"
              className="w-full bg-background border border-border p-3 rounded-xl text-sm"
              onChange={(e) => setFormData({...formData, projectName: e.target.value})}
            />
            <input 
              type="text" value={formData.certNo}
              className="w-full bg-background border border-border p-3 rounded-xl text-sm"
              onChange={(e) => setFormData({...formData, certNo: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">DRAW YOUR SIGNATURE BELOW</label>
            <div className="bg-white rounded-xl overflow-hidden border-2 border-primary/20">
              <SignatureCanvas 
                ref={sigCanvas}
                penColor="black"
                canvasProps={{width: 400, height: 150, className: 'sigCanvas'}}
              />
            </div>
            <button onClick={() => sigCanvas.current?.clear()} className="text-xs text-red-500 underline">Clear Signature</button>
          </div>

          <button 
            onClick={generatePDF}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Download size={18} /> Generate PDF Certificate
          </button>
        </div>

        {/* Right Side: The Preview (What the PDF will look like) */}
        <div className="hidden md:block flex-1 border border-border rounded-xl p-4 bg-zinc-900 overflow-hidden">
           <div ref={certificateRef} className="w-[800px] h-[560px] bg-zinc-950 border-[10px] border-amber-600 p-12 text-center flex flex-col justify-between transform scale-[0.45] origin-top-left">
              <h1 className="text-amber-600 text-6xl font-black italic">CERTIFICATE OF OWNERSHIP</h1>
              <div className="space-y-4">
                <p className="text-white text-2xl">This document confirms that the project</p>
                <h2 className="text-amber-500 text-5xl font-bold uppercase">{formData.projectName || "PROJECT NAME"}</h2>
                <p className="text-white text-2xl">is now the legal property of</p>
                <h2 className="text-white text-4xl font-bold">{formData.clientName || "CLIENT NAME"}</h2>
              </div>
              <div className="flex justify-between items-end mt-12 border-t border-amber-600/30 pt-8">
                <div className="text-left">
                  <p className="text-amber-600 text-sm font-bold">CERTIFICATE NO:</p>
                  <p className="text-white text-lg">{formData.certNo}</p>
                </div>
                <div className="text-center">
                  <div className="h-16 w-32 mx-auto">
                    {/* The signature image will be captured by html2canvas */}
                  </div>
                  <p className="text-amber-600 font-bold border-t border-white pt-2">SULAIMAN GRAPHICS</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
