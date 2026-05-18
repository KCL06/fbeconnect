import { Plus, Edit, Eye, TrendingUp, X, Save, Trash2, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  price_label: string;
  quantity_available: number;
  in_stock: boolean;
  image_url: string;
  farmer_id?: string;
}

const defaultCategories = ["Vegetables", "Grains", "Dairy", "Poultry", "Tubers", "Fruits", "Herbs", "Flowers", "Livestock", "Fish"];

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Vegetables",
    price: "",
    quantity_available: "",
    in_stock: true,
  });

  useEffect(() => {
    fetchProducts();
  }, [user?.id]);

  const fetchProducts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      toast.error("Failed to load products: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Build dynamic categories from defaults + whatever farmers have actually used
  const productCategories = [...new Set([...defaultCategories, ...products.map(p => p.category).filter(Boolean)])];
  const allCategories = ["All", ...productCategories.sort()];

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(p => p.category === selectedCategory);

  const ensureBucketExists = async (bucketName: string) => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const exists = buckets?.some(b => b.name === bucketName);
      if (!exists) {
        await supabase.storage.createBucket(bucketName, { public: true });
      }
    } catch {
      // Bucket may already exist or we lack permissions — that's OK, the upload will tell us
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const bucketName = 'product-images';
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      // If the bucket doesn't exist yet, create it and retry once
      if (uploadError && uploadError.message?.toLowerCase().includes('not found')) {
        toast.info("Setting up image storage... please wait.");
        await ensureBucketExists(bucketName);
        const retry = await supabase.storage.from(bucketName).upload(filePath, file);
        uploadError = retry.error;
      }

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
      return null;
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newProduct.name || !newProduct.price || !newProduct.quantity_available) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = "https://images.unsplash.com/photo-1555447740-6a812da65e7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
      
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const priceNum = parseFloat(newProduct.price);
      const qtyNum = parseInt(newProduct.quantity_available);

      const { error } = await supabase.from("products").insert({
        farmer_id: user.id,
        name: newProduct.name,
        category: newProduct.category,
        price: isNaN(priceNum) ? 0 : priceNum,
        price_label: `KES ${newProduct.price}`,
        quantity_available: isNaN(qtyNum) ? 0 : qtyNum,
        in_stock: newProduct.in_stock,
        image_url: imageUrl,
      });

      if (error) throw error;
      toast.success("Product added successfully!");
      setShowAddModal(false);
      setImageFile(null);
      setNewProduct({ name: "", category: "Vegetables", price: "", quantity_available: "", in_stock: true });
      fetchProducts();
    } catch (err: any) {
      toast.error("Failed to add product: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      let imageUrl = editingProduct.image_url;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const priceNum = parseFloat(editingProduct.price.toString());
      const qtyNum = parseInt(editingProduct.quantity_available.toString());

      const { error } = await supabase
        .from("products")
        .update({
          name: editingProduct.name,
          category: editingProduct.category,
          price: isNaN(priceNum) ? 0 : priceNum,
          price_label: `KES ${editingProduct.price}`,
          quantity_available: isNaN(qtyNum) ? 0 : qtyNum,
          in_stock: editingProduct.in_stock,
          image_url: imageUrl,
        })
        .eq("id", editingProduct.id);

      if (error) throw error;
      toast.success("Product updated successfully!");
      setEditingProduct(null);
      setImageFile(null);
      fetchProducts();
    } catch (err: any) {
      toast.error("Failed to update product: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Product deleted successfully");
      fetchProducts();
      setViewingProduct(null);
    } catch (err: any) {
      toast.error("Failed to delete product: " + err.message);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 relative rounded-2xl overflow-hidden p-6 md:p-8 bg-gradient-to-r from-emerald-800/80 to-emerald-700/80 backdrop-blur-sm">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1751200270667-cb13feeac24c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtJTIwZnJlc2glMjBwcm9kdWNlJTIwZGlzcGxheXxlbnwxfHx8fDE3NzMzMDc0OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')",
          }}
        />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Products</h1>
          <p className="text-emerald-200">Manage your agricultural products and inventory</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 text-white">
          <p className="text-sm opacity-80 mb-1">Total Products</p>
          <p className="text-2xl md:text-3xl font-bold">{products.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white">
          <p className="text-sm opacity-80 mb-1">Categories</p>
          <p className="text-2xl md:text-3xl font-bold">{[...new Set(products.map(p => p.category))].length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-4 text-white">
          <p className="text-sm opacity-80 mb-1">In Stock</p>
          <p className="text-2xl md:text-3xl font-bold">{products.filter(p => p.in_stock && p.quantity_available > 0).length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 text-white">
          <p className="text-sm opacity-80 mb-1">Out of Stock</p>
          <p className="text-2xl md:text-3xl font-bold">{products.filter(p => !p.in_stock || p.quantity_available === 0).length}</p>
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <button
          onClick={() => { setShowAddModal(true); setImageFile(null); }}
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add New Product</span>
        </button>

        <div className="flex gap-2 overflow-x-auto pb-2 whitespace-nowrap w-full md:w-auto">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white/10 text-emerald-200 hover:bg-white/20"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-all border border-white/10 hover:border-emerald-500/50 hover:shadow-xl"
            >
              <div
                className="h-40 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${product.image_url || 'https://images.unsplash.com/photo-1555447740-6a812da65e7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-bold text-lg line-clamp-1">{product.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                      product.in_stock && product.quantity_available > 0
                        ? "bg-emerald-900/50 text-emerald-300"
                        : "bg-orange-900/50 text-orange-300"
                    }`}
                  >
                    {product.in_stock && product.quantity_available > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <p className="text-emerald-300 text-sm mb-3">{product.category}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-white">{product.price_label || `KES ${product.price}`}</p>
                    <p className="text-gray-400 text-sm">Qty: {product.quantity_available}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingProduct(product); setImageFile(null); }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setViewingProduct(product)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <p className="text-emerald-300 text-lg">No products found</p>
              <p className="text-emerald-400/60 text-sm mt-1">Click 'Add New Product' to list your produce.</p>
            </div>
          )}
        </div>
      )}

      {/* View Product Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-2xl w-full border border-white/20 shadow-2xl">
            <div className="relative">
              <div
                className="h-64 bg-cover bg-center rounded-t-2xl"
                style={{ backgroundImage: `url(${viewingProduct.image_url || 'https://images.unsplash.com/photo-1555447740-6a812da65e7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl" />
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-3xl font-bold text-white">{viewingProduct.name}</h2>
                <button
                  onClick={() => handleDeleteProduct(viewingProduct.id)}
                  className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500/30 transition-all"
                  title="Delete Product"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-emerald-300 text-lg mb-6">{viewingProduct.category}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Price</p>
                  <p className="text-2xl font-bold text-white">{viewingProduct.price_label || `KES ${viewingProduct.price}`}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Stock</p>
                  <p className="text-2xl font-bold text-white">{viewingProduct.quantity_available}</p>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-lg mb-6">
                <p className="text-gray-400 text-sm mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                    viewingProduct.in_stock && viewingProduct.quantity_available > 0
                      ? "bg-emerald-900/50 text-emerald-300"
                      : "bg-orange-900/50 text-orange-300"
                  }`}
                >
                  {viewingProduct.in_stock && viewingProduct.quantity_available > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <button
                onClick={() => setViewingProduct(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-2xl w-full border border-white/20 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Product</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-emerald-200 text-sm mb-2">Product Image (Optional)</label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg bg-cover bg-center border border-emerald-500/30 flex-shrink-0"
                    style={{ backgroundImage: `url(${imageFile ? URL.createObjectURL(imageFile) : editingProduct.image_url})` }}
                  />
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-dashed border-emerald-500/50 rounded-lg p-3 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-200 text-sm">
                      {imageFile ? imageFile.name : "Choose a new image"}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-emerald-200 text-sm mb-2">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2.5 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-emerald-200 text-sm mb-2">Category</label>
                <input
                  type="text"
                  list="edit-category-list"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2.5 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Select or type a new category"
                />
                <datalist id="edit-category-list">
                  {productCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-emerald-200 text-sm mb-2">Price (KES)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                    className="w-full bg-white/10 text-white px-4 py-2.5 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-emerald-200 text-sm mb-2">Quantity Available</label>
                  <input
                    type="number"
                    value={editingProduct.quantity_available}
                    onChange={(e) => setEditingProduct({...editingProduct, quantity_available: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/10 text-white px-4 py-2.5 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <input
                    type="checkbox"
                    checked={editingProduct.in_stock}
                    onChange={(e) => setEditingProduct({...editingProduct, in_stock: e.target.checked})}
                    className="w-5 h-5 accent-emerald-500"
                  />
                  <span className="text-white font-medium">Currently In Stock</span>
                </label>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  disabled={isSubmitting}
                  onClick={handleSaveEdit}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-2xl w-full border border-white/20 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Product</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-emerald-200 text-sm mb-2">Product Image</label>
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-emerald-500/50 rounded-xl hover:bg-white/5 transition-colors cursor-pointer overflow-hidden relative">
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-emerald-400">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-sm">Click to upload image</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="block text-emerald-200 text-sm mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2.5 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Fresh Tomatoes"
                />
              </div>

              <div>
                <label className="block text-emerald-200 text-sm mb-2">Category</label>
                <input
                  type="text"
                  list="add-category-list"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2.5 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Select or type a new category"
                  required
                />
                <datalist id="add-category-list">
                  {productCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-emerald-200 text-sm mb-2">Price (KES)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2.5 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 150"
                  />
                </div>
                <div>
                  <label className="block text-emerald-200 text-sm mb-2">Initial Quantity</label>
                  <input
                    type="number"
                    required
                    value={newProduct.quantity_available}
                    onChange={(e) => setNewProduct({...newProduct, quantity_available: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2.5 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <input
                    type="checkbox"
                    checked={newProduct.in_stock}
                    onChange={(e) => setNewProduct({...newProduct, in_stock: e.target.checked})}
                    className="w-5 h-5 accent-emerald-500"
                  />
                  <span className="text-white font-medium">Currently In Stock</span>
                </label>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? "Adding..." : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}