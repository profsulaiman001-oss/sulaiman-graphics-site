import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Plus, Minus, Sparkles, ShieldCheck, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Shop() {
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchProducts();
    const savedCart = localStorage.getItem("sulaiman_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const updateQuantity = (product: any, delta: number) => {
    let updatedCart = [...cart];
    if (delta === 1) {
      updatedCart.push(product);
    } else {
      const index = updatedCart.findIndex(item => item.id === product.id);
      if (index !== -1) updatedCart.splice(index, 1);
    }
    setCart(updatedCart);
    localStorage.setItem("sulaiman_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const getQuantity = (id: string) => cart.filter(item => item.id === id).length;

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = selectedCategory === "All" ? products : products.filter(p => p.category === selectedCategory);

  return (
    // Background updated to match footer blue [#020617]
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 font-sans">
      
      {/* --- HEADER --- */}
      <header className="pt-32 pb-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 mb-3 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <Sparkles size={10} className="text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Digital Provisions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
              SULAIMAN <span className="text-blue-600">SHOP</span>
            </h1>
          </motion.div>
        </div>
      </header>

      {/* --- CATEGORY TABS --- */}
      <div className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 mb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-8 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap pb-1 border-b-2",
                selectedCategory === cat ? "text-blue-500 border-blue-600" : "text-zinc-600 border-transparent hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 pb-40">
        {loading ? (
          <div className="flex justify-center py-40">
             <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const qty = getQuantity(product.id);
                return (
                  <motion.div 
                    layout 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    key={product.id} 
                    // Card color slightly lighter than background for depth
                    className="group bg-[#080c1d] border border-white/5 rounded-[2.5rem] p-4 hover:border-blue-500/30 transition-all duration-500 shadow-2xl"
                  >
                    <div className="aspect-square bg-[#020617] rounded-[1.8rem] overflow-hidden relative border border-white/5 mb-5">
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        <Package size={10} className="text-blue-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">{product.category}</span>
                      </div>
                    </div>

                    <div className="px-2 pb-2">
                      <h3 className="text-xl font-black uppercase italic tracking-tighter leading-tight group-hover:text-blue-500 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-zinc-500 text-[11px] font-medium mt-3 line-clamp-2 leading-relaxed h-8">
                        {product.description}
                      </p>

                      <div className="mt-6 flex items-center justify-between gap-4 pt-5 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest mb-1">Price</span>
                          <span className="text-xl font-black tracking-tighter text-white">₦{product.price.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                          {qty > 0 && (
                            <>
                              <button 
                                onClick={() => updateQuantity(product, -1)} 
                                className="w-10 h-10 flex items-center justify-center hover:bg-red-500/10 text-red-500 rounded-xl transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-black min-w-[24px] text-center">{qty}</span>
                            </>
                          )}
                          <button 
                            onClick={() => updateQuantity(product, 1)}
                            className={cn(
                              "w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                              qty > 0 ? "hover:bg-blue-500/10 text-blue-500" : "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                            )}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* --- FLOATING CART --- */}
      <AnimatePresence>
        {cart.length > 0 && (
          <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center px-6">
            <motion.button
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              onClick={() => setLocation("/shop/cart")} // Redirects to internal Collection page
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-[0_25px_50px_rgba(37,99,235,0.4)] flex items-center gap-4 hover:bg-blue-500 transition-all border border-white/20 active:scale-95 group"
            >
              <div className="relative">
                <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                  {cart.length}
                </span>
              </div>
              <span className="font-black uppercase tracking-[0.2em] text-[10px]">Review Provisions</span>
              <ShieldCheck size={16} className="text-blue-200/50" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
