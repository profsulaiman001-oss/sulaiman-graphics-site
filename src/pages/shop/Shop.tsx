import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingCart, ShoppingBag, ArrowUpRight, Percent, Sparkles, Filter } from "lucide-react";
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

  const addToCart = (product: any) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    localStorage.setItem("sulaiman_cart", JSON.stringify(updatedCart));
    
    // Trigger Navbar update immediately
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-blue-500/30">
      
      {/* --- PREMIUM HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full opacity-50" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6 backdrop-blur-md">
              <Sparkles size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Premium Digital Assets</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] mb-8">
              THE <span className="text-blue-600">TERMINAL</span><br />
              <span className="text-zinc-800">COLLECTION</span>
            </h1>
            <p className="text-zinc-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
              High-performance frameworks, visual systems, and creative blueprints designed for the next generation of designers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- CATEGORY FILTER BAR --- */}
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
          <div className="hidden md:flex items-center gap-2 text-zinc-500">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{filteredProducts.length} Results</span>
          </div>
        </div>
      </div>

      {/* --- PRODUCT GALLERY --- */}
      <main className="max-w-7xl mx-auto px-6 pb-40">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
             <span className="font-black uppercase tracking-[0.4em] text-zinc-800 italic">Synchronizing Assets</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={product.id}
                  className="group"
                >
                  {/* Image Container */}
                  <div className="aspect-[4/5] bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden relative border border-white/5 group-hover:border-blue-500/50 transition-all duration-700 shadow-2xl">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100"
                    />
                    
                    {/* Floating Status Badges */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                       {product.discount_price && (
                         <div className="bg-green-500 text-black px-3 py-1.5 rounded-xl text-[9px] font-black flex items-center gap-1 shadow-xl">
                           <Percent size={10} /> LIMITED OFFER
                         </div>
                       )}
                    </div>

                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-6 bottom-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-colors shadow-2xl"
                      >
                        <ShoppingBag size={14} /> Add to Collection
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="mt-8 px-2">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">
                        {product.category}
                      </span>
                      <ArrowUpRight size={18} className="text-zinc-800 group-hover:text-blue-500 transition-colors" />
                    </div>
                    
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-blue-500 transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-3">
                      <span className="text-xl font-black tracking-tighter">₦{product.price.toLocaleString()}</span>
                      {product.discount_price && (
                        <span className="text-sm text-zinc-700 line-through font-bold">₦{product.discount_price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* --- FLOATING CART FAB --- */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setLocation("/shop/cart")}
            className="fixed bottom-10 right-10 z-50 bg-blue-600 text-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center gap-4 group hover:bg-blue-500 transition-all active:scale-95 border border-white/20"
          >
            <div className="relative">
              <ShoppingCart size={24} />
              <span className="absolute -top-1 -right-1 bg-white text-blue-600 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-xs">Checkout Assets</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
