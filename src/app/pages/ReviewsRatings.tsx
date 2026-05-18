import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { useState } from "react";

const reviews = [
  {
    id: 1,
    product: "Organic Tomatoes",
    reviewer: "John Mwangi",
    rating: 5,
    comment: "Excellent quality tomatoes! Fresh and organic as advertised. Will definitely order again.",
    date: "March 8, 2026",
    helpful: 12,
    avatar: "👨🏾‍🌾",
  },
  {
    id: 2,
    product: "Fresh Maize",
    reviewer: "Sarah Wanjiru",
    rating: 4,
    comment: "Good quality maize. Delivery was on time. Only minor issue was packaging could be better.",
    date: "March 7, 2026",
    helpful: 8,
    avatar: "👩🏾",
  },
  {
    id: 3,
    product: "Green Cabbage",
    reviewer: "David Ochieng",
    rating: 5,
    comment: "Perfect! The cabbage was fresh and crisp. Great farmer to work with.",
    date: "March 5, 2026",
    helpful: 15,
    avatar: "👨🏿‍💼",
  },
  {
    id: 4,
    product: "Fresh Milk",
    reviewer: "Grace Akinyi",
    rating: 5,
    comment: "Best quality milk in the region. Delivery is always on time and the farmer is very professional.",
    date: "March 3, 2026",
    helpful: 20,
    avatar: "👩🏾‍💼",
  },
  {
    id: 5,
    product: "Sweet Potatoes",
    reviewer: "James Kamau",
    rating: 4,
    comment: "Good product overall. Would appreciate more variety in sizes available.",
    date: "March 1, 2026",
    helpful: 5,
    avatar: "👨🏾",
  },
];

const ratingDistribution = [
  { stars: 5, count: 45, percentage: 75 },
  { stars: 4, count: 12, percentage: 20 },
  { stars: 3, count: 2, percentage: 3 },
  { stars: 2, count: 1, percentage: 2 },
  { stars: 1, count: 0, percentage: 0 },
];

export default function ReviewsRatings() {
  const [filter, setFilter] = useState("All Reviews");

  const totalReviews = ratingDistribution.reduce((acc, r) => acc + r.count, 0);
  const averageRating = (
    ratingDistribution.reduce((acc, r) => acc + r.stars * r.count, 0) / totalReviews
  ).toFixed(1);

  const filteredReviews = reviews.filter((review) => {
    if (filter === "5 Stars") return review.rating === 5;
    if (filter === "4 Stars") return review.rating === 4;
    if (filter === "3 Stars & Below") return review.rating <= 3;
    return true; // "All Reviews"
  });

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
                  <button className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
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
