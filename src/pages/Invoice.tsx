import { useState } from "react";
import { Printer, Download, Plus, Trash2, Send, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InvoiceItem {
  id: string;
  description: string;
  price: number;
  quantity: number;
}

export default function Invoice() {
  const [clientName, setClientName] = useState("Client Name");
  const [clientAddress, setClientAddress] = useState("Client Street, City, Country");
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "Modern Premium Branding", price: 250, quantity: 1 },
  ]);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: "", price: 0, quantity: 1 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% example
  const total = subtotal + tax;

  const generatePDF = async () => {
    const element = document.getElementById("invoice-download-area");
    if (!element) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber}_${clientName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-100 flex flex-col pt-24 pb-12">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- CONTROLS PANEL (4 Columns) --- */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#11141A] border border-gray-800 rounded-3xl p-6 sticky top-28 shadow-2xl">
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6">Invoice Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Invoice #</label>
                  <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl p-3 mt-1 text-sm outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Client Name</label>
                  <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl p-3 mt-1 text-sm outline-none focus:border-cyan-500/50" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Client Address</label>
                <textarea value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl p-3 mt-1 text-sm outline-none focus:border-cyan-500/50 h-20 resize-none" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Line Items</label>
                  <button onClick={addItem} className="text-cyan-500 hover:text-cyan-400 p-1 transition-colors"><Plus size={18}/></button>
                </div>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2 items-center group">
                    <input placeholder="Desc" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="flex-grow bg-[#1A1F29] border border-gray-800 rounded-xl p-2.5 text-xs outline-none focus:border-gray-700" />
                    <input type="number" placeholder="$" value={item.price} onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))} className="w-16 bg-[#1A1F29] border border-gray-800 rounded-xl p-2.5 text-xs outline-none focus:border-gray-700" />
                    <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800 grid grid-cols-2 gap-3">
              <button 
                onClick={generatePDF}
                disabled={isGenerating}
                className="bg-white text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Download size={18}/>} PDF
              </button>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                <Send size={18}/> SEND
              </button>
            </div>
          </div>
        </div>

        {/* --- PREVIEW AREA (7 Columns) --- */}
        <div className="lg:col-span-7 overflow-x-auto pb-4">
          <div id="invoice-download-area" className="bg-white text-slate-900 w-[794px] min-h-[1123px] mx-auto p-12 shadow-2xl relative flex flex-col">
            
            {/* Header Section */}
            <div className="flex justify-between items-start mb-16">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl italic">S</div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">SULAIMAN<br/>GRAPHICS</h1>
                    <p className="text-[9px] text-cyan-600 font-black tracking-widest mt-1 uppercase">Premium Digital Arts</p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase">
                  South Mountain, Nigeria<br/>
                  sulaimangraphics.com.ng<br/>
                  info@sulaimangraphics.com.ng
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-6xl font-black text-slate-100 uppercase tracking-tighter mb-4">Invoice</h2>
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-900 italic">No: {invoiceNumber}</p>
                  <p className="text-xs font-bold text-slate-500">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Client Section */}
            <div className="mb-12 grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] uppercase font-black text-cyan-600 mb-2 tracking-widest">Billed To:</p>
                <p className="font-black text-xl text-slate-900">{clientName}</p>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">{clientAddress}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black text-cyan-600 mb-2 tracking-widest">Payment Due:</p>
                <p className="font-black text-sm text-slate-900">Upon Receipt</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="flex-grow">
              <div className="grid grid-cols-12 bg-slate-900 text-white rounded-xl p-4 text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg">
                <div className="col-span-7">Description of Services</div>
                <div className="col-span-2 text-center">Unit Price</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>

              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 px-4 border-b border-slate-100 pb-6 text-sm items-center">
                    <div className="col-span-7">
                      <p className="font-black text-slate-900">{item.description || "Design Service"}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Project ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                    </div>
                    <div className="col-span-2 text-center font-bold text-slate-700">${item.price.toFixed(2)}</div>
                    <div className="col-span-1 text-center font-bold text-slate-400">{item.quantity}</div>
                    <div className="col-span-2 text-right font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations & Summary */}
            <div className="mt-12 flex justify-between items-end pb-10">
              <div className="max-w-[300px]">
                <h4 className="text-[10px] font-black uppercase text-cyan-600 mb-2 tracking-widest">Notes & Instructions:</h4>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">
                  Thank you for choosing Sulaiman Graphics. Payment is expected within 7 days. 
                  All digital assets remain property of Sulaiman Graphics until full payment is received.
                </p>
              </div>
              <div className="w-72 space-y-3">
                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100">
                  <span>Tax (5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl shadow-xl transform translate-x-4">
                  <span className="font-black text-xs uppercase tracking-widest">Total Amount</span>
                  <span className="font-black text-2xl">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Signature Area (Matches inspiration) */}
            <div className="mt-auto pt-10 grid grid-cols-2 items-end">
               <div>
                  <div className="w-32 h-px bg-slate-200 mb-2"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Signature</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Verified by Sulaiman Graphics Security System</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
