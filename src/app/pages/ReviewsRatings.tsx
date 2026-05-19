import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function ReviewsRatings() {
  const { profile } = useAuth();
  const [filter, setFilter] = useState("All Reviews");
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        let query = supabase.from('reviews').select(`
          *,
          reviewer:profiles!reviewer_id(full_name)
        `).order('created_at', { ascending: false });

        // If the user is a farmer, only show their reviews. 
        // Otherwise (buyer or expert), they might see reviews they wrote or general reviews.
        // For simplicity, we just fetch all or filter if needed.
        if (profile?.role === 'farmer') {
          query = query.eq('farmer_id', profile.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        const formatted = data.map((r: any) => ({
          id: r.id,
          product: r.product_name,
          reviewer: r.reviewer?.full_name || "Unknown Buyer",
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.created_at).toLocaleDateString(),
          helpful: r.helpful_count || 0,
          avatar: "👤",
        }));
        setReviews(formatted);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (profile) {
      fetchReviews();
    }
  }, [profile]);

  const handleHelpful = async (id: string, currentHelpful: number) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ helpful_count: currentHelpful + 1 })
        .eq('id', id);
      if (error) throw error;
      
      setReviews(reviews.map(r => r.id === id ? { ...r, helpful: r.helpful + 1 } : r));
      toast.success("Marked as helpful!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update helpful count");
    }
  };

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const getDistribution = () => {
    const dist = [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ];
    
    if (totalReviews === 0) return dist;

    reviews.forEach(r => {
      const index = dist.findIndex(d => d.stars === r.rating);
      if (index !== -1) dist[index].count += 1;
    });

    dist.forEach(d => {
      d.percentage = Math.round((d.count / totalReviews) * 100);
    });

    return dist;
  };

  const ratingDistribution = getDistribution();

  const filteredReviews = reviews.filter((review) => {
    if (filter === "5 Stars") return review.rating === 5;
    if (filter === "4 Stars") return review.rating === 4;
    if (filter === "3 Stars & Below") return review.rating <= 3;
    return true; // "All Reviews"
  });

  if (isLoading) {
    return <div className="p-8 text-white">Loading reviews...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Reviews & Ratings</h1>
        <p className="text-emerald-200">Customer feedback and ratings for your products</p>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Average Rating */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-8 text-white text-center">
          <p className="text-sm opacity-80 mb-2">Average Rating</p>
          <div className="text-6xl font-bold mb-3">{averageRating}</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(parseFloat(averageRating))
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-emerald-300"
                }`}
              />
            ))}
          </div>
          <p className="text-emerald-100 text-sm">Based on {totalReviews} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-bold text-lg mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {ratingDistribution.map((rating) => (
              <div key={rating.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-white font-medium">{rating.stars}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${rating.percentage}%` }}
                  />
                </div>
                <span className="text-gray-300 text-sm w-16 text-right">
                  {rating.count} ({rating.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("All Reviews")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
            filter === "All Reviews"
              ? "bg-emerald-600 text-white"
              : "bg-white/10 text-emerald-200 hover:bg-white/20"
          }`}
        >
          All Reviews
        </button>
        <button
          onClick={() => setFilter("5 Stars")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
            filter === "5 Stars"
              ? "bg-emerald-600 text-white"
              : "bg-white/10 text-emerald-200 hover:bg-white/20"
          }`}
        >
          5 Stars
        </button>
        <button
          onClick={() => setFilter("4 Stars")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
            filter === "4 Stars"
              ? "bg-emerald-600 text-white"
              : "bg-white/10 text-emerald-200 hover:bg-white/20"
          }`}
        >
          4 Stars
        </button>
        <button
          onClick={() => setFilter("3 Stars & Below")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
            filter === "3 Stars & Below"
              ? "bg-emerald-600 text-white"
              : "bg-white/10 text-emerald-200 hover:bg-white/20"
          }`}
        >
          3 Stars & Below
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{review.avatar}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-white font-semibold">{review.reviewer}</h4>
                    <p className="text-emerald-300 text-sm">{review.product}</p>
                  </div>
                  <span className="text-xs text-gray-400">{review.date}</span>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-500"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-300 text-sm mb-4">{review.comment}</p>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleHelpful(review.id, review.helpful)}
                    className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({review.helpful})</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
