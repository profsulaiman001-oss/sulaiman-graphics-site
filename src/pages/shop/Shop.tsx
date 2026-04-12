import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingCart, ShoppingBag, ArrowRight, Tag, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export default function Shop() {
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products and existing cart on mount
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
    // Optional: Add a small toast notification here
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* 1. SHOP HEADER */}
      <header className="pt-20 pb-12 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">
            THE <span className="text-blue-500">TERMINAL</span> SHOP
          </h1>
          <p className="text-zinc-500 max-w-xl mx-auto font-medium">
            Premium assets, systems, and digital frameworks for the modern creative.
          </p>
        </motion.div>
      </header>

      {/* 2. FLOATING CART INDICATOR */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setLocation("/shop/cart")}
            className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white p-5 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center gap-3 group hover:bg-blue-500 transition-all"
          >
            <ShoppingCart size={24} />
            <span className="font-black text-lg">{cart.length}</span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold uppercase tracking-widest text-xs">
              View Collection
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 3. PRODUCT GRID */}
      <main className="container mx-auto px-4 pb-32">
        {loading ? (
          <div className="flex justify-center py-20"><span className="animate-pulse font-black italic text-zinc-700">LOADING ASSETS...</span></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product) => (
              <motion.div 
                key={product.id}
                className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden group hover:border-blue-500/30 transition-all duration-500"
              >
                {/* Square Product Image */}
                <div className="aspect-square bg-black relative overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  {/* Discount Badge */}
                  {product.discount_price && (
                    <div className="absolute top-4 left-4 bg-green-500 text-black px-3 py-1 rounded-lg text-[10px] font-black flex items-center gap-1">
                      <Percent size={12} /> SPECIAL OFFER
                    </div>
                  )}
                </div>

                {/* Info & CTA */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1 block">
                        {product.category}
                      </span>
                      <h3 className="text-2xl font-black uppercase italic leading-none">{product.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-white italic">₦{product.price.toLocaleString()}</p>
                      {product.discount_price && (
                        <p className="text-xs text-zinc-600 line-through italic">₦{product.discount_price.toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-zinc-500 text-sm mb-8 line-clamp-2 font-medium">
                    {product.description}
                  </p>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => addToCart(product)}
                      className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all">
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
