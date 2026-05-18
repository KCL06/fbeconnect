import { ShoppingCart, Heart, Search, Filter, Star, X, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";

const initialListings = [
  {
    id: 1,
    seller: "Green Valley Farm",
    product: "Organic Tomatoes",
    price: "KES 120/kg",
    location: "Nairobi",
    rating: 4.8,
    reviews: 45,
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1767978529638-ff1faefa00c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwdG9tYXRvZXMlMjBoYXJ2ZXN0fGVufDF8fHx8MTc3MzMwNzM5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    inStock: true,
  },
  {
    id: 2,
    seller: "Sunrise Dairy",
    product: "Fresh Milk",
    price: "KES 100/liter",
    location: "Nakuru",
    rating: 4.9,
    reviews: 78,
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1719532520242-a809140b313d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYWlyeSUyMGZhcm0lMjBmcmVzaCUyMG1pbGt8ZW58MXx8fHwxNzczMjE2NTkyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    inStock: true,
  },
  {
    id: 3,
    seller: "Highland Farms",
    product: "Sweet Potatoes",
    price: "KES 70/kg",
    location: "Eldoret",
    rating: 4.7,
    reviews: 32,
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1741112480266-62def497fa27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2VldCUyMHBvdGF0b2VzJTIwaGFydmVzdHxlbnwxfHx8fDE3NzMzMDczOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    inStock: true,
  },
  {
    id: 4,
    seller: "Golden Harvest",
    product: "Fresh Maize",
    price: "KES 60/kg",
    location: "Kitale",
    rating: 4.6,
    reviews: 56,
    category: "Grains",
    image: "https://images.unsplash.com/photo-1571342574841-80ba1dfc8d4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuJTIwbWFpemUlMjBoYXJ2ZXN0fGVufDF8fHx8MTc3MzMwNzM5Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    inStock: true,
  },
  {
    id: 5,
    seller: "Green Acres",
    product: "Green Cabbage",
    price: "KES 80/kg",
    location: "Naivasha",
    rating: 4.9,
    reviews: 91,
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1555447740-6a812da65e7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNhYmJhZ2UlMjB2ZWdldGFibGVzfGVufDF8fHx8MTc3MzMwNzM5Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    inStock: true,
  },
  {
    id: 6,
    seller: "Happy Hen Farm",
    product: "Brown Eggs",
    price: "KES 15/piece",
    location: "Kiambu",
    rating: 5.0,
    reviews: 124,
    category: "Poultry",
    image: "https://images.unsplash.com/photo-1664339307400-9c22e5f44496?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJyb3duJTIwZWdnc3xlbnwxfHx8fDE3NzMzMDczOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    inStock: true,
  },
  {
    id: 7,
    seller: "Orchard Hills",
    product: "Fresh Mangoes",
    price: "KES 50/piece",
    location: "Mombasa",
    rating: 4.8,
    reviews: 63,
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    inStock: true,
  },
  {
    id: 8,
    seller: "Tropical Farms",
    product: "Ripe Bananas",
    price: "KES 10/piece",
    location: "Kisumu",
    rating: 4.5,
    reviews: 38,
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    inStock: true,
  },
  {
    id: 9,
    seller: "Rift Valley Grains",
    product: "Wheat Flour (2kg)",
    price: "KES 150/bag",
    location: "Nakuru",
    rating: 4.6,
    reviews: 42,
    category: "Grains",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    inStock: true,
  },
  {
    id: 10,
    seller: "Savanna Ranch",
    product: "Beef (Local)",
    price: "KES 700/kg",
    location: "Laikipia",
    rating: 4.7,
    reviews: 29,
    category: "Livestock",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    inStock: true,
  },
  {
    id: 11,
    seller: "Hillside Dairy Co.",
    product: "Fresh Yogurt",
    price: "KES 80/500ml",
    location: "Meru",
    rating: 4.8,
    reviews: 55,
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1488477181212-4328570de597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    inStock: true,
  },
  {
    id: 12,
    seller: "Kienyeji Farmers",
    product: "Free-Range Chicken",
    price: "KES 900/bird",
    location: "Muranga",
    rating: 4.9,
    reviews: 87,
    category: "Poultry",
    image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    inStock: true,
  },
  {
    id: 13,
    seller: "Kijani Farms",
    product: "Spinach (Bunch)",
    price: "KES 30/bunch",
    location: "Nairobi",
    rating: 4.7,
    reviews: 71,
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    inStock: true,
  },
  {
    id: 14,
    seller: "Maasai Ranchers",
    product: "Goat Meat",
    price: "KES 600/kg",
    location: "Kajiado",
    rating: 4.6,
    reviews: 33,
    category: "Livestock",
    image: "https://images.unsplash.com/photo-1624372632096-f5c7b3e8b7c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    inStock: false,
  },
  {
    id: 15,
    seller: "Sunny Orchards",
    product: "Passion Fruit",
    price: "KES 20/piece",
    location: "Thika",
    rating: 4.9,
    reviews: 110,
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1604495772376-9657f0035eb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    inStock: true,
  },
];

export default function MarketPlace() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart, isInCart, totalItems } = useCart();
  const { profile } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('products').select('*, profiles!farmer_id(full_name)');
        
        if (error) {
          console.error("Error fetching products:", error);
          toast.error("Failed to load products");
          return;
        }

        if (data && data.length > 0) {
          const mapped = data.map(p => ({
            id: p.id,
            seller: p.profiles?.full_name || "Unknown Farmer",
            farmer_id: p.farmer_id,
            product: p.name,
            price: p.price_label || `KES ${p.price}/unit`,
            numericPrice: p.price,
            location: p.location || "Kenya",
            rating: p.rating || 4.5,
            reviews: p.review_count || 0,
            category: p.category || "Other",
            image: p.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
            inStock: p.in_stock !== false,
            unit: p.unit || 'unit'
          }));
          setListings(mapped);
        } else {
          // Table is empty! Let's auto-seed if the user is a farmer (to pass RLS)
          if (profile?.role === 'farmer') {
            toast.info("Initializing marketplace with demo products...");
            const farmerId = profile.id;

            const productsToInsert = initialListings.map(l => ({
              name: l.product,
              price: parseInt(l.price.replace(/[^0-9]/g, "")) || 0,
              price_label: l.price,
              unit: l.price.includes("kg") ? "kg" : l.price.includes("liter") ? "liter" : "piece",
              category: l.category,
              location: l.location,
              image_url: l.image,
              in_stock: l.inStock,
              rating: l.rating,
              review_count: l.reviews,
              farmer_id: farmerId
            }));

            const { error: insertError } = await supabase.from('products').insert(productsToInsert);
            if (!insertError) {
              const { data: newData } = await supabase.from('products').select('*, profiles!farmer_id(full_name)');
              if (newData) {
                const mapped = newData.map(p => ({
                  id: p.id,
                  seller: p.profiles?.full_name || "Unknown Farmer",
                  farmer_id: p.farmer_id,
                  product: p.name,
                  price: p.price_label || `KES ${p.price}/unit`,
                  numericPrice: p.price,
                  location: p.location || "Kenya",
                  rating: p.rating || 4.5,
                  reviews: p.review_count || 0,
                  category: p.category || "Other",
                  image: p.image_url || "",
                  inStock: p.in_stock !== false,
                  unit: p.unit || 'unit'
                }));
                setListings(mapped);
                toast.success("Demo products loaded!");
              }
            } else {
               console.error("Failed to seed", insertError);
               toast.error("Failed to seed demo products. RLS policy might be blocking.");
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [profile]);

  const categories = ["All", "Vegetables", "Fruits", "Grains", "Dairy", "Poultry", "Livestock"];

  const filteredListings = listings.filter(listing => {
    const matchesCategory =
      selectedCategory === "All" || listing.category === selectedCategory;
    const matchesSearch =
      listing.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    toast.success(`Showing ${category === "All" ? "all products" : category}`);
  };

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fav => fav !== id));
      toast.info("Removed from favorites");
    } else {
      setFavorites([...favorites, id]);
      toast.success("Added to favorites!");
    }
  };

  const handleAddToCart = (listing: any) => {
    addToCart({
      id: listing.id,
      name: listing.product,
      price: parseInt(listing.price.replace(/[^0-9]/g, "")) || 0,
      priceLabel: listing.price,
      unit: listing.price.includes("kg") ? "kg" : listing.price.includes("liter") ? "liter" : listing.price.includes("piece") || listing.price.includes("bird") || listing.price.includes("bunch") || listing.price.includes("bag") || listing.price.includes("ml") ? "unit" : "unit",
      seller: listing.seller,
      farmerId: listing.farmer_id,
      location: listing.location,
      image: listing.image,
      availableQty: 50,
      inStock: listing.inStock,
      rating: listing.rating,
    });
  };

  const handleLoadMore = () => {
    toast.info("Loading more products...");
  };

  const handleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 relative rounded-2xl overflow-hidden p-6 md:p-8 bg-gradient-to-r from-emerald-800/80 to-emerald-700/80 backdrop-blur-sm">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549248581-cf105cd081f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Market Place</h1>
            <p className="text-emerald-200">Buy fresh agricultural products directly from farmers</p>
          </div>
          {totalItems > 0 && (
            <Link
              to="/app/cart"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              View Cart ({totalItems})
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 md:mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, sellers, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 pl-12 pr-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleFilters}
          className={`px-6 py-3 rounded-lg flex items-center gap-2 border border-white/20 transition-all ${
            showFilters ? "bg-emerald-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
          <h3 className="text-white font-bold text-lg mb-4">Filter Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-emerald-200 text-sm mb-2">Price Range</label>
              <select className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 [&>option]:bg-emerald-900 [&>option]:text-white">
                <option>All Prices</option>
                <option>Under KES 50</option>
                <option>KES 50-100</option>
                <option>Above KES 100</option>
              </select>
            </div>
            <div>
              <label className="block text-emerald-200 text-sm mb-2">Rating</label>
              <select className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 [&>option]:bg-emerald-900 [&>option]:text-white">
                <option>All Ratings</option>
                <option>4+ Stars</option>
                <option>3+ Stars</option>
              </select>
            </div>
            <div>
              <label className="block text-emerald-200 text-sm mb-2">Location</label>
              <select className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 [&>option]:bg-emerald-900 [&>option]:text-white">
                <option>All Locations</option>
                <option>Nairobi</option>
                <option>Nakuru</option>
                <option>Eldoret</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide w-full">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? "bg-emerald-600 text-white shadow-lg"
                : "bg-white/10 text-emerald-200 hover:bg-white/20"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results Info */}
      <div className="mb-4">
        <p className="text-emerald-200">
          Showing {filteredListings.length} of {listings.length} products
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-all border border-white/10 hover:border-emerald-500/50 hover:shadow-xl group"
          >
            {/* Product Image */}
            <div
              className="h-48 relative bg-cover bg-center"
              style={{ backgroundImage: `url(${listing.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <button
                onClick={() => toggleFavorite(listing.id)}
                className={`absolute top-3 right-3 backdrop-blur-sm p-2 rounded-full transition-all z-10 ${
                  favorites.includes(listing.id)
                    ? "bg-red-500/80 hover:bg-red-600"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.includes(listing.id) ? "text-white fill-white" : "text-white"
                  }`}
                />
              </button>
              {listing.inStock && (
                <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                  In Stock
                </span>
              )}
            </div>

            {/* Product Info */}
            <div className="p-5">
              <div className="mb-3">
                <h3 className="text-white font-bold text-lg mb-1">{listing.product}</h3>
                <p className="text-emerald-300 text-sm">{listing.seller}</p>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold text-sm">{listing.rating}</span>
                </div>
                <span className="text-gray-400 text-sm">({listing.reviews} reviews)</span>
              </div>

              <p className="text-gray-400 text-sm mb-4">📍 {listing.location}</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{listing.price}</p>
                </div>
                <div className="flex gap-2">
                  {listing.farmer_id && profile?.id !== listing.farmer_id && (
                    <Link
                      to={`/app/messages?contactId=${listing.farmer_id}&message=Hi! I am interested in your ${listing.product}.`}
                      className="px-3 py-2 rounded-lg bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 transition-all border border-emerald-700/50 flex items-center justify-center"
                      title="Message Seller"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => handleAddToCart(listing)}
                    disabled={!listing.inStock}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      !listing.inStock
                        ? "bg-gray-700/60 text-gray-400 cursor-not-allowed"
                        : isInCart(listing.id)
                        ? "bg-emerald-700 text-white ring-2 ring-emerald-400"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm font-semibold hidden lg:inline">
                      {!listing.inStock ? "Out of Stock" : isInCart(listing.id) ? "In Cart" : "Add to Cart"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No products found matching your criteria</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Load More */}
      {filteredListings.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-all border border-white/20"
          >
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
}