import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Trash2, Tag, Percent, Package, 
  Image as ImageIcon, Loader2, CheckCircle, 
  LayoutGrid, List 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ManageShop() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

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
      alert(error.message);
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
      alert("Product added to shop!");
      setName(""); setDescription(""); setPrice(""); setDiscountPrice(""); setImageUrl("");
      fetchProducts();
    }
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Remove this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: ADD PRODUCT FORM (40%) */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 sticky top-10">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6 flex items-center gap-3">
              <Package className="text-blue-500" /> Inventory Entry
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Product Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-blue-500 outline-none transition" placeholder="e.g. Modern Designer Portfolio" />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Base Price (₦)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} required className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-blue-500 outline-none transition" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Discount Price (Optional)</label>
                  <input type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-green-500 outline-none transition" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Product Details</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-blue-500 outline-none transition resize-none" />
              </div>

              {/* Square Image Uploader */}
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Display Image (1:1 Ratio)</label>
                <label className="aspect-square w-full border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition group relative overflow-hidden">
                  <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && handleImageUpload(e.target.files[0])} />
                  {imageUrl ? (
                    <img src={imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      {uploading ? <Loader2 className="animate-spin mx-auto text-blue-500" /> : <ImageIcon size={40} className="mx-auto text-zinc-700 group-hover:text-blue-500 transition" />}
                      <p className="text-xs font-bold text-zinc-500 mt-2">UPLOAD SQUARE MOCKUP</p>
                    </div>
                  )}
                </label>
              </div>

              <button disabled={loading || uploading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black uppercase italic tracking-widest transition flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                Add to Storefront
              </button>
            </form>
          </section>
        </div>

        {/* RIGHT: LIVE SHOP LIST (60%) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <LayoutGrid size={20} className="text-blue-500" /> Active Inventory
            </h2>
            <span className="bg-white/5 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
              {products.length} Items Total
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {products.map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={item.id} 
                  className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden group"
                >
                  <div className="aspect-square bg-black relative">
                    <img src={item.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                    <button 
                      onClick={() => deleteProduct(item.id)}
                      className="absolute top-3 right-3 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                    {item.discount_price && (
                      <div className="absolute top-3 left-3 bg-green-500 text-black px-2 py-1 rounded-md text-[10px] font-black flex items-center gap-1">
                        <Percent size={10} /> SALE
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-black uppercase italic truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-blue-500 font-black">₦{item.price}</span>
                      {item.discount_price && <span className="text-zinc-600 line-through text-xs italic">₦{item.discount_price}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
