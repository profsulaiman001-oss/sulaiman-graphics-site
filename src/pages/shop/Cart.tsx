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
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => setLocation("/shop")}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-black"
          >
            <ArrowLeft size={14} /> Back to Store
          </button>
          <h2 className="text-xl font-black uppercase italic tracking-tighter">
            My <span className="text-blue-500">Collection</span>
          </h2>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
            <ShoppingBag size={48} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Your collection is empty</p>
            <button 
              onClick={() => setLocation("/shop")}
              className="mt-6 bg-blue-600 px-8 py-3 rounded-xl font-black italic text-sm hover:bg-blue-500 transition-all"
            >
              BROWSE ASSETS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* List of Items (Left) */}
            <div className="lg:col-span-7 space-y-4">
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={`${item.id}-${index}`}
                    className="bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl flex items-center gap-4 group"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-black">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black uppercase italic text-sm truncate">{item.name}</h4>
                      <p className="text-blue-500 font-black text-sm">₦{item.price.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(index)}
                      className="p-3 text-zinc-700 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Checkout Summary (Right) */}
            <div className="lg:col-span-5">
              <div className="bg-blue-600 rounded-3xl p-8 sticky top-24 shadow-[0_20px_50px_rgba(37,99,235,0.2)]">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-blue-200 uppercase tracking-widest text-[10px] font-black">
                    <span>Items Count</span>
                    <span>{cart.length}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="font-black uppercase italic">Total Amount</span>
                    <span className="text-3xl font-black italic">₦{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <button className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase italic tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3">
                  <CreditCard size={18} />
                  Complete Order
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-100/60">
                    <ShieldCheck size={12} /> Secure License Verification
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-100/60">
                    <Zap size={12} /> Instant Digital Delivery
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
