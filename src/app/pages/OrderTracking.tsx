import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, X, FileText, Printer, Download, Star } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../context/AuthContext";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
type FilterTab = "All Orders" | OrderStatus;

const trackingStepsFor = (status: OrderStatus) => {
  const steps = [
    { label: "Order Placed", icon: CheckCircle },
    { label: "Confirmed", icon: Package },
    { label: "Shipped", icon: Truck },
    { label: "Delivered", icon: CheckCircle },
  ];
  const completedCount =
    status === "pending" ? 1 :
    status === "confirmed" ? 2 :
    status === "shipped" ? 3 :
    status === "delivered" ? 4 : 0;
  return steps.map((s, i) => ({ ...s, completed: i < completedCount }));
};

const statusColors: Record<OrderStatus, string> = {
  delivered: "bg-emerald-900/50 text-emerald-300",
  shipped: "bg-purple-900/50 text-purple-300",
  confirmed: "bg-blue-900/50 text-blue-300",
  pending: "bg-amber-900/50 text-amber-300",
  cancelled: "bg-red-900/50 text-red-300",
};

const filterTabs: FilterTab[] = ["All Orders", "pending", "confirmed", "shipped", "delivered"];

export default function OrderTracking() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All Orders");
  const [contactModal, setContactModal] = useState<any | null>(null);
  const [updateModal, setUpdateModal] = useState<any | null>(null);
  const [receiptModal, setReceiptModal] = useState<any | null>(null);
  const [reviewModal, setReviewModal] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        let fetchedOrders: any[] = [];
        const queryStr = `
          id, status, created_at, total_amount,
          buyer:profiles!buyer_id(full_name, phone),
          items:order_items!inner(
            quantity,
            price_at_purchase,
            product:products!inner(name, farmer_id)
          )
        `;

        if (profile.role === 'admin') {
          const { data, error } = await supabase.from('orders').select(queryStr).order('created_at', { ascending: false });
          if (error) throw error;
          fetchedOrders = data || [];
        } else {
          // Fetch orders where the user is the buyer
          const { data: buyerData, error: buyerError } = await supabase
            .from('orders')
            .select(queryStr)
            .eq('buyer_id', profile.id)
            .order('created_at', { ascending: false });
            
          if (buyerError) throw buyerError;
          fetchedOrders = buyerData || [];

          // If the user is a farmer, ALSO fetch orders where they are the seller
          if (profile.role === 'farmer') {
            const { data: sellerData, error: sellerError } = await supabase
              .from('orders')
              .select(queryStr)
              .eq('items.product.farmer_id', profile.id)
              .order('created_at', { ascending: false });
              
            if (sellerError) throw sellerError;
            
            if (sellerData) {
               const existingIds = new Set(fetchedOrders.map(o => o.id));
               for (const order of sellerData) {
                 if (!existingIds.has(order.id)) {
                   fetchedOrders.push(order);
                 }
               }
               fetchedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            }
          }
        }
        
        if (fetchedOrders.length >= 0) {
          const formatted = fetchedOrders.map((o: any) => {
            const productNames = o.items.map((i: any) => i.product.name).join(", ");
            const totalQty = o.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
            
            return {
              id: o.id,
              shortId: o.id.slice(0, 8).toUpperCase(),
              product: productNames || "Multiple Items",
              items: o.items,
              totalAmount: o.total_amount,
              quantity: `${totalQty} units`,
              buyer: o.buyer?.full_name || "Unknown Buyer",
              phone: o.buyer?.phone || "No phone provided",
              status: o.status,
              orderDate: new Date(o.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
              deliveryDate: "Pending Update", 
              location: o.status === 'pending' ? "Awaiting Confirmation" : o.status === 'confirmed' ? "Farm - Preparing" : o.status === 'shipped' ? "In Transit" : o.status === 'delivered' ? "Delivered" : "Cancelled",
              progress: o.status === 'pending' ? 10 : o.status === 'confirmed' ? 40 : o.status === 'shipped' ? 70 : o.status === 'delivered' ? 100 : 0
            };
          });
          setOrders(formatted);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();

    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  const filtered = activeFilter === "All Orders"
    ? orders
    : orders.filter(o => o.status === activeFilter);

  const counts = {
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Prompt for cancellation
      if (newStatus === "cancelled" && !window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;
      
      toast.success(`Order status updated to ${newStatus}`);
      setUpdateModal(null);
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal || !profile) return;
    
    try {
      const farmerId = reviewModal.items?.[0]?.product?.farmer_id;
      if (!farmerId) throw new Error("Could not find farmer ID for this order.");

      const { error } = await supabase.from('reviews').insert({
        reviewer_id: profile.id,
        farmer_id: farmerId,
        product_name: reviewModal.product,
        rating: reviewRating,
        comment: reviewComment,
        helpful_count: 0
      });

      if (error) throw error;

      toast.success("Review submitted successfully!");
      setReviewModal(null);
      setReviewRating(5);
      setReviewComment("");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit review: " + err.message);
    }
  };

  const downloadReceipt = (order: any) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("FBEconnect Order Receipt", 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Order ID: ${order.shortId}`, 14, 32);
      doc.text(`Date: ${order.orderDate}`, 14, 40);
      doc.text(`Buyer: ${order.buyer}`, 14, 48);
      doc.text(`Status: ${order.status.toUpperCase()}`, 14, 56);
      
      const tableData = order.items?.map((item: any) => [
        item.product.name,
        item.quantity.toString(),
        `KES ${item.price_at_purchase.toLocaleString()}`,
        `KES ${(item.price_at_purchase * item.quantity).toLocaleString()}`
      ]) || [];
      
      (doc as any).autoTable({
        startY: 64,
        head: [['Item', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] } // emerald-500
      });
      
      const finalY = (doc as any).lastAutoTable.finalY || 64;
      doc.setFontSize(14);
      doc.text(`Total Paid: KES ${(order.totalAmount || 0).toLocaleString()}`, 14, finalY + 10);
      
      doc.save(`Receipt_${order.shortId}.pdf`);
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF receipt");
    }
  };

  if (isLoading) {
    return <div className="p-4 md:p-8 text-white">Loading orders...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Order Tracking</h1>
          <p className="text-emerald-200">Track and manage your orders in real-time</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {(["pending", "confirmed", "shipped", "delivered"] as OrderStatus[]).map((status) => {
          const icons = { pending: Clock, confirmed: Package, shipped: Truck, delivered: CheckCircle };
          const colors = {
            pending: "from-amber-600 to-amber-700",
            confirmed: "from-blue-600 to-blue-700",
            shipped: "from-purple-600 to-purple-700",
            delivered: "from-emerald-600 to-emerald-700",
          };
          const Icon = icons[status];
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(activeFilter === status ? "All Orders" : status)}
              className={`bg-gradient-to-br ${colors[status]} rounded-xl p-6 text-white text-left transition-all hover:scale-105 ${
                activeFilter === status ? "ring-2 ring-white/50 scale-105" : ""
              }`}
            >
              <Icon className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-sm opacity-80 mb-1 capitalize">{status}</p>
              <p className="text-3xl font-bold">{counts[status]}</p>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all capitalize ${
              activeFilter === tab
                ? "bg-emerald-600 text-white shadow-lg"
                : "bg-white/10 text-emerald-200 hover:bg-white/20"
            }`}
          >
            {tab}
            {tab !== "All Orders" && (
              <span className="ml-2 text-xs opacity-70">({counts[tab as OrderStatus]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filtered.length === 0 && (
          <div className="bg-white/5 rounded-xl p-12 text-center text-gray-400 border border-white/10">
            No orders found for this filter.
          </div>
        )}
        {filtered.map((order) => {
          const steps = trackingStepsFor(order.status);
          return (
            <div
              key={order.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-emerald-500/50 transition-all"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-bold text-lg">{order.product}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status as OrderStatus] || 'bg-gray-700 text-gray-300'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mb-1 font-mono">ID: {order.shortId}</p>
                    <p className="text-emerald-300 text-sm">Quantity: {order.quantity}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setContactModal(order)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      Contact
                    </button>
                    {(order.status === "confirmed" || order.status === "shipped" || order.status === "delivered") && (
                      <button
                        onClick={() => setReceiptModal(order)}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all border border-white/10"
                      >
                        <FileText className="w-4 h-4" />
                        Receipt
                      </button>
                    )}
                    {profile?.role === 'farmer' && order.items?.some((i: any) => i.product.farmer_id === profile.id) && order.status !== "delivered" && order.status !== "cancelled" && (
                      <button
                        onClick={() => setUpdateModal(order)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
                      >
                        Update Status
                      </button>
                    )}
                    {profile?.role === 'buyer' && order.status === "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all border border-red-500"
                      >
                        <X className="w-4 h-4" />
                        Cancel Order
                      </button>
                    )}
                    {profile?.role === 'buyer' && order.status === "delivered" && (
                      <button
                        onClick={() => setReviewModal(order)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all border border-yellow-500"
                      >
                        <Star className="w-4 h-4" />
                        Leave Review
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Buyer</p>
                    <p className="text-white font-medium">{order.buyer}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Order Date</p>
                    <p className="text-white font-medium">{order.orderDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Expected Delivery</p>
                    <p className="text-white font-medium">{order.deliveryDate}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-6 bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{order.location}</span>
                  </div>
                  <span className="text-white text-sm font-semibold">{order.progress}%</span>
                </div>
                <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${order.progress}%` }}
                  />
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="p-6 border-t border-white/10">
                <div className="flex items-center justify-between relative">
                  {/* connector line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10 z-0" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-emerald-600 z-0 transition-all duration-700"
                    style={{ width: `${((steps.filter(s => s.completed).length - 1) / (steps.length - 1)) * (100 - 10)}%` }}
                  />
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={index} className="flex flex-col items-center flex-1 relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                            step.completed ? "bg-emerald-600" : "bg-white/10"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${step.completed ? "text-white" : "text-gray-500"}`} />
                        </div>
                        <p className={`text-xs text-center ${step.completed ? "text-white font-medium" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact Modal */}
      {contactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-emerald-900 border border-emerald-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Contact Info</h2>
              <button onClick={() => setContactModal(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-emerald-300 text-sm mb-1 font-mono text-xs">Order: {contactModal.shortId}</p>
              <p className="text-white font-bold text-lg">{contactModal.buyer}</p>
              <div className="flex items-center gap-2 mt-3">
                <Phone className="w-5 h-5 text-emerald-400" />
                <span className="text-white">{contactModal.phone}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  toast.info("Please use the Messages app for secure communication.");
                  setContactModal(null);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Go to Messages
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {updateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-emerald-900 border border-emerald-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Update Order Status</h2>
              <button onClick={() => setUpdateModal(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-300 mb-6 text-sm">
              Order <span className="text-white font-semibold font-mono text-xs block truncate">{updateModal.shortId}</span>
            </p>
            <div className="space-y-3">
              {(["pending", "confirmed", "shipped", "delivered"] as OrderStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(updateModal.id, status)}
                  className={`w-full py-3 px-4 rounded-lg text-left font-medium transition-all capitalize ${
                    updateModal.status === status
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {updateModal.status === status ? "✓ " : ""}{status}
                  {updateModal.status === status && " (Current)"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-lg shadow-2xl text-gray-800">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-emerald-600" />
                Order Receipt
              </h2>
              <button onClick={() => setReceiptModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-mono font-medium">{receiptModal.shortId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date & Time:</span>
                <span className="font-medium">{receiptModal.orderDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium uppercase text-emerald-600">{receiptModal.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Buyer:</span>
                <span className="font-medium">{receiptModal.buyer}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 py-4">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Items</h3>
              <div className="space-y-2">
                {receiptModal.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span className="font-medium">KES {(item.price_at_purchase * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-center mb-8">
              <span className="font-bold text-gray-900">Total Paid</span>
              <span className="text-2xl font-bold text-emerald-600">KES {(receiptModal.totalAmount || 0).toLocaleString()}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  toast.success("Printing receipt...");
                  window.print();
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" /> Print
              </button>
              <button
                onClick={() => downloadReceipt(receiptModal)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-emerald-900 border border-emerald-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Review Product</h2>
              <button onClick={() => setReviewModal(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-emerald-200 text-sm mb-1">Product</p>
              <p className="text-white font-semibold">{reviewModal.product}</p>
            </div>
            
            <div className="mb-6">
              <p className="text-emerald-200 text-sm mb-2">Rating</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-emerald-200 text-sm mb-2">Comment</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-white/10 border border-emerald-700/50 rounded-xl p-4 text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-32"
                placeholder="Share your experience with this order..."
              />
            </div>

            <button
              onClick={handleSubmitReview}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
