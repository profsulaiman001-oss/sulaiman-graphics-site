import { useState } from "react";
import { ShieldCheck, PenLine, Download } from "lucide-react";

export default function Agreement() {
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectPrice, setProjectPrice] = useState("");
  const [scope, setScope] = useState("");
  const [currency, setCurrency] = useState("₦"); 
  
  const [signature, setSignature] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-[#0B0C10] min-h-screen text-gray-100 flex flex-col items-center justify-center p-4 pt-24 pb-12">
      
      {/* 🖨️ AGGRESSIVE PRINT CSS: Destroys headers/footers & extra pages */}
      <style>{`
        @media print {
          /* Hide EVERYTHING on the website except the contract box */
          body * {
            visibility: hidden !important;
          }
          .print-contract, .print-contract * {
            visibility: visible !important;
          }
          
          /* Force the contract box to sit perfectly at the top left of page 1 */
          .print-contract {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          /* Remove gray backgrounds and force pitch black text for ink */
          .print-text-black {
            color: #000000 !important;
          }
          .print-text-gray {
            color: #4B5563 !important;
          }

          /* Stop blank pages from bleeding through */
          @page {
            margin: 0.5in !important;
            size: auto;
          }
        }
      `}</style>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Contract Setup Inputs */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-[#11141A] border border-gray-800 rounded-2xl p-5 sticky top-24">
            <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
              <PenLine className="w-4 h-4 text-cyan-500" /> Contract Setup
            </h3>
            <p className="text-xs text-gray-500 mb-4">Fill this out to generate the agreement for your client.</p>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Client Name</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Project Name</label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Brand Identity Pack"
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Project Price</label>
                <div className="flex gap-2">
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-[#1A1F29] border border-gray-800 rounded-lg py-2 px-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                  >
                    <option value="₦">₦</option>
                    <option value="$">$</option>
                    <option value="£">£</option>
                  </select>
                  <input 
                    type="text" 
                    value={projectPrice}
                    onChange={(e) => setProjectPrice(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-[#1A1F29] border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400">Project Scope</label>
                <textarea 
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="e.g. 1 Logo, 3 Social Media Flyers, and 1 Video Ad..."
                  rows={4}
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Actual Contract */}
        <div className="print-contract md:col-span-2 bg-[#11141A] border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-800 pb-5 mb-6">
              <div>
                <h1 className="font-display font-black text-xl tracking-tighter text-white print-text-black">
                  SULAIMAN<span className="text-cyan-500">.</span>GRAPHICS
                </h1>
                <p className="text-xs text-gray-500 mt-1 print-text-gray">Design & Digital Media Agreement</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 print-text-gray">Date Generated</span>
                <p className="text-sm font-medium text-gray-300 print-text-black">{today}</p>
              </div>
            </div>

            {/* Contract Body */}
            <div className="space-y-6 text-sm text-gray-400 print-text-black leading-relaxed max-h-[400px] overflow-y-auto pr-2">
              <p>
                This agreement is made between <span className="text-white font-medium print-text-black">{clientName || "[Client Name]"}</span> (The Client) and <span className="text-white font-medium print-text-black">Sulaiman Graphics</span> (The Designer).
              </p>

              <div>
                <h3 className="text-white font-semibold mb-1 print-text-black">1. Scope of Work</h3>
                <p>
                  The Designer agrees to produce visual assets for <span className="text-white font-medium print-text-black">"{projectName || "[Project Name]"}"</span>. 
                  The specific deliverables included are: <span className="text-white font-medium print-text-black">{scope || "[List assets here on the left side]"}</span>. 
                  Any additional assets requested outside of this list will require a separate quote.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-1 print-text-black">2. Payment & File Delivery</h3>
                <p>
                  The total fee for this project is <span className="text-cyan-400 font-bold print-text-black">{currency}{projectPrice || "0.00"}</span>. 
                  A 50% non-refundable deposit is required before work begins. The remaining 50% balance is due upon project completion. Final high-resolution files (PNG, JPG, Vector, or MP4) will be delivered only after the final invoice is paid.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-1 print-text-black">3. Revisions</h3>
                <p>
                  The Designer provides up to 2 rounds of revisions on the chosen concepts. A revision constitutes minor adjustments to color, typography, or layout. Complete redesigns or concept changes after approval will result in extra fees.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-1 print-text-black">4. Ownership & Usage</h3>
                <p>
                  Upon final payment, full ownership and commercial rights to the final approved designs are transferred to the Client. The Designer retains the right to display the completed assets in their portfolio for marketing purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Signature and Agreement Area */}
          <div className="border-t border-gray-800 pt-6 mt-6">
            {!isAgreed ? (
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-grow w-full">
                  <label className="text-xs text-gray-500 block mb-1">Type your full name to sign digitally</label>
                  <input 
                    type="text" 
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="E-signature"
                    className="w-full bg-[#1A1F29] border border-gray-800 rounded-lg py-2.5 px-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 font-serif italic"
                  />
                </div>
                <button 
                  onClick={() => {
                    if (signature.trim() !== "") setIsAgreed(true);
                  }}
                  disabled={!signature.trim() || !clientName || !projectPrice}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold py-2.5 px-6 rounded-lg transition-all disabled:opacity-30 whitespace-nowrap text-sm"
                >
                  Sign & Agree
                </button>
              </div>
            ) : (
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-500" />
                  <div>
                    <p className="text-sm font-semibold text-white print-text-black">Agreement Signed Digitally</p>
                    <p className="text-xs text-gray-400 print-text-gray">Signed by {signature} on {today}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="text-gray-400 hover:text-white p-2 border border-gray-700 rounded-lg"
                    title="Print or Save as PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
