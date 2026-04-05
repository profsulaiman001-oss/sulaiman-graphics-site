import { useState } from "react";
import { Receipt as ReceiptIcon, PenLine, Download, CheckCircle, Clock, Sun, Moon } from "lucide-react";

export default function Receipt() {
  const [clientName, setClientName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("₦");
  const [paymentStatus, setPaymentStatus] = useState("Complete Payment");
  
  // 🌓 ADDED: State to manage receipt theme
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-[#0B0C10] min-h-screen text-gray-100 flex flex-col items-center justify-center p-4 pt-24 pb-12">
      
      {/* 🖨️ AGGRESSIVE PRINT CSS: Dynamically handles dark and light mode for the PDF */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-receipt, .print-receipt * {
            visibility: visible !important;
          }
          .print-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            background: ${isDarkMode ? '#11141A' : '#FFFFFF'} !important;
            padding: 0.5in !important;
            margin: 0 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-text-primary {
            color: ${isDarkMode ? '#FFFFFF' : '#000000'} !important;
          }
          .print-text-secondary {
            color: ${isDarkMode ? '#9CA3AF' : '#4B5563'} !important;
          }
          .print-border {
            border-color: ${isDarkMode ? '#1F2937' : '#E5E7EB'} !important;
          }
          @page {
            margin: 0.5in !important;
            size: auto;
          }
        }
      `}</style>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Receipt Setup Inputs */}
        <div className="md:col-span-1 space-y-4 no-print">
          
          {/* 🌓 ADDED: Theme Toggle Button */}
          <div className="bg-[#11141A] border border-gray-800 rounded-2xl p-3 flex justify-between items-center">
            <span className="text-sm text-gray-400 font-medium">Receipt Theme</span>
            <div className="flex bg-[#1A1F29] rounded-lg p-1">
              <button
                onClick={() => setIsDarkMode(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  !isDarkMode 
                    ? "bg-white text-black" 
                    : "text-gray-500 hover:text-white"
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                onClick={() => setIsDarkMode(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  isDarkMode 
                    ? "bg-cyan-500 text-black" 
                    : "text-gray-500 hover:text-white"
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
            </div>
          </div>

          <div className="bg-[#11141A] border border-gray-800 rounded-2xl p-5 sticky top-24">
            <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
              <PenLine className="w-4 h-4 text-cyan-500" /> Generate Receipt
            </h3>
            
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
                <label className="text-xs text-gray-400">Business Name (Optional)</label>
                <input 
                  type="text" 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Service Rendered</label>
                <input 
                  type="text" 
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g. Logo Design"
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Amount Paid</label>
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full bg-[#1A1F29] border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400">Payment Status</label>
                <select 
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-lg py-2.5 px-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="Complete Payment">Complete Payment</option>
                  <option value="Part Payment">Part Payment</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => window.print()}
              disabled={!clientName || !service || !amount}
              className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-30"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        {/* Right Side: The Visual Receipt */}
        <div className={`print-receipt md:col-span-2 border rounded-2xl p-8 shadow-2xl flex flex-col justify-between min-h-[500px] transition-colors ${
          isDarkMode 
            ? "bg-[#11141A] border-gray-800" 
            : "bg-white border-gray-200"
        }`}>
          <div>
            {/* Header */}
            <div className={`flex justify-between items-start border-b pb-5 mb-6 print-border ${
              isDarkMode ? "border-gray-800" : "border-gray-100"
            }`}>
              <div>
                <h1 className={`font-display font-black text-xl tracking-tighter print-text-primary ${
                  isDarkMode ? "text-white" : "text-black"
                }`}>
                  SULAIMAN<span className="text-cyan-500">.</span>GRAPHICS
                </h1>
                <p className={`text-xs mt-1 print-text-secondary ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}>Official Payment Receipt</p>
              </div>
              <div className="text-right">
                <span className={`text-xs print-text-secondary ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}>Date</span>
                <p className={`text-sm font-medium print-text-primary ${
                  isDarkMode ? "text-gray-300" : "text-gray-800"
                }`}>{today}</p>
              </div>
            </div>

            {/* Receipt Content */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={`text-xs print-text-secondary block mb-1 ${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  }`}>Billed To:</span>
                  <p className={`font-semibold print-text-primary text-base ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}>{clientName || "Client Name"}</p>
                  {businessName && (
                    <p className={`text-sm print-text-secondary ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>{businessName}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-xs print-text-secondary block mb-1 ${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  }`}>Status:</span>
                  <div className="flex items-center justify-end gap-1.5">
                    {paymentStatus === "Complete Payment" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                    <p className={`text-sm font-bold ${paymentStatus === "Complete Payment" ? "text-emerald-500" : "text-amber-500"}`}>
                      {paymentStatus.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table Header */}
              <div className={`border-t pt-4 mt-6 print-border ${
                isDarkMode ? "border-gray-800" : "border-gray-100"
              }`}>
                <div className={`grid grid-cols-3 text-xs font-semibold uppercase tracking-wider print-text-secondary ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}>
                  <div className="col-span-2">Service Description</div>
                  <div className="text-right">Total</div>
                </div>
              </div>

              {/* Table Row */}
              <div className={`border-t border-b py-4 my-2 print-border ${
                isDarkMode ? "border-gray-800" : "border-gray-100"
              }`}>
                <div className="grid grid-cols-3 items-center">
                  <div className="col-span-2">
                    <p className={`font-medium print-text-primary ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}>{service || "Service Name"}</p>
                    <p className={`text-xs mt-0.5 print-text-secondary ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}>Digital design assets & delivery</p>
                  </div>
                  <div className={`text-right font-bold print-text-primary ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}>
                    {currency}{amount || "0.00"}
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-end">
                <div className="w-1/2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={`print-text-secondary ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}>Subtotal:</span>
                    <span className={`font-medium print-text-primary ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}>{currency}{amount || "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={`print-text-secondary ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}>Tax:</span>
                    <span className={`font-medium print-text-primary ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}>{currency}0.00</span>
                  </div>
                  <div className={`flex justify-between border-t pt-2 text-base font-bold print-border ${
                    isDarkMode ? "border-gray-800" : "border-gray-100"
                  }`}>
                    <span className={`print-text-primary ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}>Total Paid:</span>
                    <span className={`${
                      isDarkMode ? "text-cyan-500" : "text-cyan-600"
                    } print-text-primary`}>{currency}{amount || "0.00"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`border-t pt-4 mt-8 text-center print-border ${
            isDarkMode ? "border-gray-800" : "border-gray-100"
          }`}>
            <p className={`text-xs print-text-secondary ${
              isDarkMode ? "text-gray-500" : "text-gray-500"
            }`}>Thank you for your business!</p>
            <p className={`text-xs mt-1 print-text-secondary ${
              isDarkMode ? "text-gray-400" : "text-gray-400"
            }`}>Sulaiman Graphics • Digital Media & Design</p>
          </div>
        </div>
      </div>
    </div>
  );
      }
