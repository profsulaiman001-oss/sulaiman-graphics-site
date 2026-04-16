import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Plus, Minus, Sparkles, ShieldCheck, ShoppingCart } from "lucide-react";
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
  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-blue-500/30 font-sans">
      
      {/* --- PORTFOLIO STYLE HEADER (SMALL & LEFT ALIGNED) --- */}
      <header className="pt-32 pb-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 mb-3">
              <Sparkles size={12} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Premium Assets</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
              DIGITAL <span className="text-blue-600">PROVISIONS</span>
            </h1>
          </motion.div>
        </div>
      </header>

      {/* --- FILTER TABS --- */}
      <div className="sticky top-0 z-40 bg-[#02040a]/80 backdrop-blur-xl border-b border-white/5 mb-12">
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

      {/* --- PRODUCT GALLERY (PORTFOLIO CARD STYLE) --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 pb-40">
        {loading ? (
          <div className="flex justify-center py-40">
             <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const qty = getQuantity(product.id);
                return (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={product.id} className="group">
                    
                    {/* SQUARE IMAGE BOX - Matches Portfolio rounding */}
                    <div className="aspect-square bg-[#080808] rounded-[2rem] overflow-hidden relative border border-white/5 group-hover:border-blue-500/40 transition-all duration-500">
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                      
                      {/* Price Tag Overlay Inside Image */}
                      <div className="absolute bottom-5 right-5 bg-black/70 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl">
                         <span className="font-black tracking-tighter text-base">₦{product.price.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* CONTENT AREA BELOW IMAGE */}
                    <div className="mt-6 flex justify-between items-start px-1">
                      <div className="flex-1">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter leading-tight group-hover:text-blue-500 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-1">
                          {product.category || 'Visual Asset'}
                        </p>
                        {/* Description Maintained */}
                        <p className="text-zinc-500 text-[11px] mt-2 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* MINIMALIST QUANTITY TOGGLE */}
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1 ml-4">
                        {qty > 0 && (
                          <>
                            <button onClick={() => updateQuantity(product, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-black min-w-[18px] text-center">{qty}</span>
                          </>
                        )}
                        <button 
                          onClick={() => updateQuantity(product, 1)}
                          className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                            qty > 0 ? "hover:bg-blue-500/10 text-blue-500" : "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                          )}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* --- FLOATING SECURE CHECKOUT --- */}
      <AnimatePresence>
        {cart.length > 0 && (
          <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center px-6">
            <motion.button
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              onClick={() => setLocation("/shop/cart")}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-[0_25px_50px_rgba(37,99,235,0.4)] flex items-center gap-4 hover:bg-blue-500 transition-all border border-white/20 active:scale-95 group"
            >
              <div className="relative">
                <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              </div>
              <span className="font-black uppercase tracking-[0.2em] text-[10px]">Secure Checkout</span>
              <ShieldCheck size={16} className="text-blue-200/50" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
