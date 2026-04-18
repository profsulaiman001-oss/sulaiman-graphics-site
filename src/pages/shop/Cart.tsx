import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Trash2, ArrowLeft, CreditCard, 
  ShoppingBag, ShieldCheck, Zap 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<any[]>([]);

  // Load cart from storage
  useEffect(() => {
    const savedCart = localStorage.getItem("sulaiman_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem("sulaiman_cart", JSON.stringify(updatedCart));
    // Dispatch event so Navbar/Shop count updates immediately
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    // Background updated to Midnight Blue [#020617]
    <div className="min-h-screen bg-[#020617] text-white py-24 px-6 md:px-12 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
          <button 
            onClick={() => setLocation("/shop")}
            className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all uppercase tracking-[0.2em] text-[10px] font-black"
          >
            <div className="bg-white/5 p-2 rounded-full group-hover:bg-white/10 transition">
              <ArrowLeft size={16} />
            </div>
            Back to Store
          </button>
          
          <div className="text-left md:text-right">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
              MY <span className="text-blue-600">COLLECTION</span>
            </h2>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">Review your digital provisions</p>
          </div>
        </div>

        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 border border-white/5 bg-[#080c1d] rounded-[3rem] shadow-2xl"
          >
            <div className="bg-[#020617] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <ShoppingBag size={32} className="text-zinc-800" />
            </div>
            <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] mb-8">Your collection is empty</p>
            <button 
              onClick={() => setLocation("/shop")}
              className="bg-blue-600 px-10 py-4 rounded-2xl font-black italic text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20"
            >
              Browse Assets
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* List of Items (Left) */}
            <div className="lg:col-span-7 space-y-6">
              <AnimatePresence mode="popLayout">
                {cart.map((item, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={`${item.id}-${index}`}
                    className="bg-[#080c1d] border border-white/5 p-5 rounded-[2rem] flex items-center gap-6 group hover:border-blue-500/30 transition-all duration-500"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-[#020617] border border-white/5">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1 block">{item.category}</span>
                      <h4 className="font-black uppercase italic text-lg tracking-tighter truncate group-hover:text-blue-500 transition-colors">{item.name}</h4>
                      <p className="text-white font-mono font-black text-sm mt-1">₦{item.price.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(index)}
                      className="w-12 h-12 flex items-center justify-center bg-red-500/5 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Checkout Summary (Right) */}
            <div className="lg:col-span-5">
              <div className="bg-blue-600 rounded-[2.5rem] p-10 sticky top-32 shadow-[0_30px_60px_rgba(37,99,235,0.3)] border border-white/20">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <ShoppingBag size={20} />
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">Order Summary</h3>
                </div>
                
                <div className="space-y-5 mb-10">
                  <div className="flex justify-between items-center text-blue-100 uppercase tracking-widest text-[10px] font-black bg-black/10 p-3 rounded-xl border border-white/5">
                    <span>Provision Count</span>
                    <span className="bg-white text-blue-600 px-2 py-0.5 rounded-md">{cart.length}</span>
                  </div>
                  
                  <div className="pt-6 border-t border-white/20">
                    <span className="text-blue-200 text-[10px] font-black uppercase tracking-widest block mb-2">Total Investment</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-4xl font-black italic tracking-tighter">₦{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-white text-blue-600 py-5 rounded-[1.5rem] font-black uppercase italic tracking-widest hover:bg-[#020617] hover:text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-xl active:scale-95 group">
                  <CreditCard size={20} className="group-hover:rotate-12 transition-transform" />
                  Complete Order
                </button>

                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                  <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-blue-100/60">
                    <ShieldCheck size={14} className="text-blue-200" /> Secure License Verification
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-blue-100/60">
                    <Zap size={14} className="text-blue-200" /> Instant Digital Asset Delivery
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
