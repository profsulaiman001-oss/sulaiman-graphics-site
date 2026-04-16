import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingCart, ShoppingBag, Plus, Minus, Sparkles, Filter, ShieldCheck } from "lucide-react";
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

  // Quantity control logic preserved
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
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-blue-500/30">
      
      {/* --- HERO SECTION - FIXED ALIGNMENT & GRADIENT --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full opacity-50" />
        
        {/* Added items-center and justify-center to fix text being pushed right */}
        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6 backdrop-blur-md">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Elite Digital Assets</span>
            </div>
            
            {/* UPDATED: High-contrast Gradient with Pop effect */}
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8 text-white">
              DIGITAL <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                PROVISIONS
              </span>
            </h1>
            
            <p className="text-zinc-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
              Premium visual frameworks and digital assets engineered for high-impact brands and professional creators.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- FILTER BAR --- */}
      <div className="sticky top-20 z-40 bg-[#02040a]/80 backdrop-blur-xl border-y border-white/5 mb-16">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
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
      </div>

      {/* --- PRODUCT GALLERY --- */}
      <main className="max-w-7xl mx-auto px-6 pb-40">
        {loading ? (
          <div className="flex justify-center py-40">
             <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const qty = getQuantity(product.id);
                return (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={product.id} className="group">
                    {/* ASPECT RATIO: SQUARE */}
                    <div className="aspect-square bg-[#0a0a0a] rounded-[2rem] overflow-hidden relative border border-white/5 group-hover:border-blue-500/50 transition-all duration-700 shadow-2xl">
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90 group-hover:opacity-100"
                      />
                    </div>

                    <div className="mt-6 px-2">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-4">
                          <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-zinc-500 text-[11px] font-medium line-clamp-2 mt-1 leading-relaxed h-8">
                            {product.description}
                          </p>
                        </div>

                        {/* QUANTITY CONTROLLER */}
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1 shrink-0">
                          {qty > 0 && (
                            <>
                              <button onClick={() => updateQuantity(product, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-red-500 transition-colors">
                                <Minus size={14} />
                              </button>
                              <span className="text-xs font-black px-1 min-w-[20px] text-center">{qty}</span>
                            </>
                          )}
                          <button 
                            onClick={() => updateQuantity(product, 1)}
                            className={cn(
                              "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                              qty > 0 ? "hover:bg-white/10 text-blue-500" : "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                            )}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-baseline gap-3">
                        <span className="text-xl font-black tracking-tighter">₦{product.price.toLocaleString()}</span>
                        {product.discount_price && (
                          <span className="text-sm text-zinc-700 line-through font-bold tracking-tighter">₦{product.discount_price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* --- SECURE CHECKOUT BUTTON --- */}
      <AnimatePresence>
        {cart.length > 0 && (
          <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center px-6">
            <motion.button
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={() => setLocation("/shop/cart")}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center gap-4 hover:bg-blue-500 transition-all border border-white/20 active:scale-95"
            >
              <div className="relative">
                <ShoppingBag size={20} />
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
