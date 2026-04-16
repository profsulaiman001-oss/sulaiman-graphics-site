import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Trash2, Package, Image as ImageIcon, 
  Loader2, LayoutGrid, BarChart3, TrendingUp, 
  ArrowUpRight, ShoppingBag, X, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ManageShop() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"inventory" | "add">("inventory");

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [category, setCategory] = useState("Template");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('shop-assets').getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("products").insert([{
      name,
      description,
      price: parseFloat(price),
      discount_price: discountPrice ? parseFloat(discountPrice) : null,
      category,
      image_url: imageUrl,
    }]);

    if (!error) {
      setName(""); setDescription(""); setPrice(""); setDiscountPrice(""); setImageUrl("");
      fetchProducts();
      setActiveTab("inventory");
    }
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this premium asset?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const totalValue = products.reduce((acc, curr) => acc + (curr.price || 0), 0);

  return (
    <div className="min-h-screen bg-[#02040a] text-white pt-28 pb-20 px-4 md:px-10 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* --- PREMIUM HEADER SECTION --- */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-8 bg-blue-600"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Admin Command Center</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
              Storefront <span className="text-zinc-700">Management</span>
            </h1>
          </div>

          <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl">
            <button 
              onClick={() => setActiveTab("inventory")}
              className={cn(
                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "inventory" ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"
              )}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveTab("add")}
              className={cn(
                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === "add" ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"
              )}
            >
              New Entry
            </button>
          </div>
        </header>

        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { label: "Active Assets", val: products.length, icon: Package, color: "text-blue-500" },
            { label: "Inventory Value", val: `₦${totalValue.toLocaleString()}`, icon: TrendingUp, color: "text-green-500" },
            { label: "Avg Price", val: `₦${Math.round(totalValue / (products.length || 1)).toLocaleString()}`, icon: BarChart3, color: "text-purple-500" }
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
              <stat.icon className={cn("mb-4", stat.color)} size={24} />
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black mt-1">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <AnimatePresence mode="wait">
          {activeTab === "inventory" ? (
            <motion.div 
              key="inv" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {products.map((item) => (
                <div key={item.id} className="group relative bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-blue-500/50 transition-all duration-500">
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img src={item.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-60" />
                    
                    <button 
                      onClick={() => deleteProduct(item.id)}
                      className="absolute top-6 right-6 p-3 bg-black/50 backdrop-blur-md text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    {item.discount_price && (
                      <span className="absolute top-6 left-6 bg-green-500 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">Sale Active</span>
                    )}
                  </div>

                  <div className="p-8">
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.2em]">{item.category}</span>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter mt-1 mb-4 truncate">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black">₦{item.price.toLocaleString()}</span>
                        {item.discount_price && <span className="text-zinc-600 line-through text-xs italic">₦{item.discount_price.toLocaleString()}</span>}
                      </div>
                      <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500">
                        <ArrowUpRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="add" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-2xl shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  
                  {/* Form Left */}
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Product Name</label>
                      <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700" placeholder="e.g. ULTRA FLYER PACK" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Price (₦)</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-blue-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Discount (₦)</label>
                        <input type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-green-500 outline-none transition-all" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Description</label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Describe the quality..." />
                    </div>
                  </div>

                  {/* Form Right - Uploader */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Product Mockup</label>
                    <label className="flex-1 min-h-[300px] border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group relative overflow-hidden">
                      <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && handleImageUpload(e.target.files[0])} />
                      {imageUrl ? (
                        <div className="relative w-full h-full group">
                          <img src={imageUrl} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Check className="text-white" size={48} />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          {uploading ? (
                            <Loader2 className="animate-spin mx-auto text-blue-500" size={32} />
                          ) : (
                            <>
                              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <ImageIcon size={28} className="text-zinc-600 group-hover:text-blue-500" />
                              </div>
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Premium File</p>
                            </>
                          )}
                        </div>
                      )}
                    </label>

                    <button 
                      disabled={loading || uploading || !imageUrl} 
                      className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 py-5 rounded-[1.5rem] font-black uppercase italic tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(37,99,235,0.2)]"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <><ShoppingBag size={18} /> Publish to Shop</>}
                    </button>
                  </div>

                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
                        }
