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
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shop-assets')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert("Upload failed. Check storage permissions.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("products").insert([{
        name,
        description,
        price: parseFloat(price),
        discount_price: discountPrice ? parseFloat(discountPrice) : null,
        category,
        image_url: imageUrl
      }]);

      if (error) throw error;

      // Reset Form
      setName("");
      setDescription("");
      setPrice("");
      setDiscountPrice("");
      setImageUrl("");
      setActiveTab("inventory");
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert("Failed to add product.");
    } finally {
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure? This action is permanent.")) return;
    
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <ShoppingBag className="text-blue-500" size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Asset Management</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              CONTROL <span className="text-zinc-800">CENTER</span>
            </h1>
          </div>

          <div className="flex items-center bg-white/5 border border-white/10 p-1.5 rounded-[1.5rem] backdrop-blur-xl">
            <button 
              onClick={() => setActiveTab("inventory")}
              className={cn(
                "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === "inventory" ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" : "text-zinc-500 hover:text-white"
              )}
            >
              <LayoutGrid size={14} /> Inventory
            </button>
            <button 
              onClick={() => setActiveTab("add")}
              className={cn(
                "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === "add" ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" : "text-zinc-500 hover:text-white"
              )}
            >
              <Plus size={14} /> New Asset
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "inventory" ? (
            <motion.div 
              key="inventory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {products.map((product) => (
                <div key={product.id} className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-blue-500/50 transition-all duration-500">
                  {/* FIXED: Aspect ratio set to square for flyer consistency */}
                  <div className="aspect-square relative overflow-hidden bg-black/40">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                       <button 
                         onClick={() => deleteProduct(product.id)}
                         className="w-10 h-10 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl backdrop-blur-xl border border-red-500/20 transition-all flex items-center justify-center"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{product.category}</span>
                      <span className="text-lg font-black tracking-tighter">₦{product.price.toLocaleString()}</span>
                    </div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-blue-500 transition-colors">
                      {product.name}
                    </h3>
                    {/* FIXED: Added Description field to management view */}
                    <p className="text-zinc-500 text-[11px] font-medium line-clamp-2 leading-relaxed h-8 mb-4">
                      {product.description}
                    </p>
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-600">
                         <Check size={12} className="text-green-500" /> Active in Shop
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="add"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/5 border border-white/10 p-12 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10" />
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-2">Core Identity</label>
                    <input 
                      type="text" 
                      placeholder="Asset Name (e.g. Minimalist Event Flyer)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700 font-bold tracking-tight"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-2">Full Description</label>
                    <textarea 
                      placeholder="Highlight features, formats, and design style..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none transition-all h-32 resize-none placeholder:text-zinc-700 font-bold tracking-tight"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-2">Market Price (₦)</label>
                      <input 
                        type="number" 
                        placeholder="5000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none transition-all font-black"
                        required
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-2">Promo Price (₦)</label>
                      <input 
                        type="number" 
                        placeholder="Optional"
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none transition-all font-black text-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-2">Categorization</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none transition-all font-black appearance-none uppercase tracking-widest text-xs"
                    >
                      <option value="Template" className="bg-[#02040a]">Template</option>
                      <option value="UI Kit" className="bg-[#02040a]">UI Kit</option>
                      <option value="Typography" className="bg-[#02040a]">Typography</option>
                      <option value="Branding" className="bg-[#02040a]">Branding</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-2">Premium Showcase</label>
                    <label className={cn(
                      "w-full aspect-square border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group relative",
                      imageUrl ? "border-blue-500/50" : "border-white/10 hover:border-blue-500/30 bg-white/5"
                    )}>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      />
                      
                      {imageUrl ? (
                        <div className="relative w-full h-full group">
                          <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                             <span className="text-[10px] font-black uppercase tracking-widest">Change Image</span>
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
