import { Link, useNavigate } from "react-router";
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft, PackageCheck,
  Tag, MapPin, Star, ShoppingBag, AlertCircle, CreditCard,
  Smartphone, Building2, Truck, ChevronRight, Shield, MessageSquare,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { useState } from "react";

type Step = "cart" | "payment" | "success";
type PaymentMethod = "mpesa" | "bank" | "pod";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isOrdering, setIsOrdering] = useState(false);
  const [step, setStep] = useState<Step>("cart");

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const handleProceedToPayment = () => {
    if (items.length === 0) { toast.error("Your cart is empty!"); return; }
    if (!profile) { toast.error("You must be logged in."); return; }
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmAndPay = async () => {
    // Validate payment details
    if (paymentMethod === "mpesa") {
      const cleaned = mpesaPhone.replace(/\s/g, "");
      if (!/^(\+?254|0)\d{9}$/.test(cleaned)) {
        toast.error("Enter a valid M-Pesa phone number (e.g. 0712345678)");
        return;
      }
    }
    if (paymentMethod === "bank" && !bankRef.trim()) {
      toast.error("Enter your bank transfer reference number.");
      return;
    }

    setIsOrdering(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          buyer_id: profile!.id,
          status: "pending",
          total_amount: totalPrice,
          notes: `Delivery Address: ${deliveryAddress || 'Not provided'}\nNotes: ${orderNotes}\nPayment: ${paymentMethod.toUpperCase()}`,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items
        .map((item) => ({
          order_id: order.id,
          product_id: typeof item.id === "number" ? null : item.id,
          quantity: item.quantity,
          price_at_purchase: item.price,
        }))
        .filter((oi) => oi.product_id !== null);

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      setStep("success");
      toast.success("Order placed successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to place order: " + err.message);
    } finally {
      setIsOrdering(false);
    }
  };

  // ── Empty Cart ──
  if (items.length === 0 && step !== "success") {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-emerald-800/40 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-12 h-12 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-emerald-300 mb-8 max-w-sm">
          Browse the marketplace and add products you'd like to order from local farmers.
        </p>
        <Link
          to="/app/marketplace"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg"
        >
          <ShoppingBag className="w-5 h-5" />
          Browse Marketplace
        </Link>
      </div>
    );
  }

  // ── Order Success ──
  if (step === "success") {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-emerald-600/40 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <PackageCheck className="w-14 h-14 text-emerald-300" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Order Placed!</h2>
        <p className="text-emerald-200 mb-2 max-w-sm text-lg">
          Your order has been submitted successfully.
        </p>
        <p className="text-emerald-400 text-sm mb-8">
          {paymentMethod === "mpesa" && "You will receive an M-Pesa payment prompt shortly."}
          {paymentMethod === "bank" && "Your bank transfer is being verified."}
          {paymentMethod === "pod" && "Payment will be collected on delivery."}
          {" "}Track it under <strong>Order Tracking</strong>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/app/order-tracking"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            <MapPin className="w-5 h-5" /> Track My Order
          </Link>
          <Link
            to="/app/marketplace"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            <ShoppingBag className="w-5 h-5" /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── Step indicator ──
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[
        { key: "cart", label: "Cart", icon: ShoppingCart },
        { key: "payment", label: "Payment", icon: CreditCard },
        { key: "success", label: "Done", icon: PackageCheck },
      ].map((s, i) => {
        const Icon = s.icon;
        const isActive = s.key === step;
        const isDone =
          (s.key === "cart" && (step === "payment" || step === "success")) ||
          (s.key === "payment" && step === "success");
        return (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && (
              <div className={`w-8 h-0.5 ${isDone || isActive ? "bg-emerald-500" : "bg-white/20"}`} />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? "bg-emerald-600 text-white"
                    : isActive
                    ? "bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-emerald-900"
                    : "bg-white/10 text-emerald-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  isDone || isActive ? "text-white" : "text-emerald-500"
                }`}
              >
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Order Summary Sidebar (shared) ──
  const OrderSummary = ({ showProceed }: { showProceed: boolean }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sticky top-24">
      <h2 className="text-xl font-bold text-white mb-5">Order Summary</h2>
      <div className="space-y-3 mb-5">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-emerald-300 truncate max-w-[180px]">
              {item.name} × {item.quantity}
            </span>
            <span className="text-white font-medium flex-shrink-0">
              KES {(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 my-4" />
      <div className="space-y-2 mb-5">
        <div className="flex justify-between text-sm text-emerald-300">
          <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
          <span>KES {totalPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-emerald-300">
          <span>Delivery</span>
          <span className="text-emerald-400">Negotiated with seller</span>
        </div>
        <div className="flex justify-between font-bold text-white text-lg pt-2 border-t border-white/10">
          <span>Total</span>
          <span>KES {totalPrice.toLocaleString()}</span>
        </div>
      </div>

      {showProceed ? (
        <button
          onClick={handleProceedToPayment}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 text-lg"
        >
          Proceed to Payment <ChevronRight className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={handleConfirmAndPay}
          disabled={isOrdering}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 text-lg"
        >
          {isOrdering ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Confirm & Pay · KES {totalPrice.toLocaleString()}
            </>
          )}
        </button>
      )}

      <Link
        to="/app/marketplace"
        className="w-full flex items-center justify-center gap-2 mt-3 text-emerald-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-all font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Continue Shopping
      </Link>
    </div>
  );

  // ── PAYMENT STEP ──
  if (step === "payment") {
    const methods: { key: PaymentMethod; label: string; desc: string; icon: typeof Smartphone }[] = [
      { key: "mpesa", label: "M-Pesa", desc: "Pay via M-Pesa mobile money", icon: Smartphone },
      { key: "bank", label: "Bank Transfer", desc: "Direct bank deposit / EFT", icon: Building2 },
      { key: "pod", label: "Pay on Delivery", desc: "Cash on delivery to your location", icon: Truck },
    ];

    return (
      <div className="p-6 lg:p-8">
        <StepIndicator />
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setStep("cart")}
            className="text-emerald-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Payment</h1>
            <p className="text-emerald-300 text-sm mt-0.5">Choose your payment method</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            {/* Payment Method Selector */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Payment Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {methods.map((m) => {
                  const Icon = m.icon;
                  const selected = paymentMethod === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setPaymentMethod(m.key)}
                      className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all text-center ${
                        selected
                          ? "border-emerald-500 bg-emerald-900/40 shadow-lg shadow-emerald-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selected ? "bg-emerald-600" : "bg-white/10"
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${selected ? "text-white" : "text-emerald-400"}`} />
                      </div>
                      <span className={`font-bold text-sm ${selected ? "text-white" : "text-emerald-200"}`}>
                        {m.label}
                      </span>
                      <span className="text-emerald-400 text-xs">{m.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Details Form */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-white font-bold text-lg mb-4">Payment Details</h3>

              {paymentMethod === "mpesa" && (
                <div className="space-y-4">
                  <div className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-4">
                    <p className="text-emerald-200 text-sm leading-relaxed">
                      📱 Enter your M-Pesa registered phone number. You will receive an STK push prompt to confirm the payment of{" "}
                      <strong>KES {totalPrice.toLocaleString()}</strong>.
                    </p>
                  </div>
                  <div>
                    <label className="block text-emerald-100 text-sm font-medium mb-2">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="e.g. 0712 345 678"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg tracking-wider"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="space-y-4">
                  <div className="bg-blue-900/30 border border-blue-700/40 rounded-xl p-4">
                    <p className="text-blue-200 text-sm leading-relaxed mb-3">
                      🏦 Transfer <strong>KES {totalPrice.toLocaleString()}</strong> to:
                    </p>
                    <div className="space-y-1 text-sm text-blue-100">
                      <p><span className="text-blue-400">Bank:</span> Equity Bank</p>
                      <p><span className="text-blue-400">Account:</span> 0123456789012</p>
                      <p><span className="text-blue-400">Name:</span> FBEconnect Ltd</p>
                      <p><span className="text-blue-400">Branch:</span> Nairobi CBD</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-emerald-100 text-sm font-medium mb-2">
                      Transaction Reference Number
                    </label>
                    <input
                      type="text"
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      placeholder="e.g. TXN2026051300123"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "pod" && (
                <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl p-4">
                  <p className="text-amber-200 text-sm leading-relaxed">
                    🚚 You will pay <strong>KES {totalPrice.toLocaleString()}</strong> in cash when the order is delivered to your location. The farmer will coordinate delivery details with you.
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-emerald-100 text-sm font-medium mb-2">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. 123 Farm Road, Nairobi"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-emerald-100 text-sm font-medium mb-2">
                    Delivery Notes (optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Special instructions, e.g. Call upon arrival"
                    rows={2}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-3 bg-emerald-950/50 border border-emerald-800/40 rounded-xl p-4">
              <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-emerald-300 text-xs">
                Your payment information is secure. We never store sensitive payment data on our servers.
              </p>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="xl:col-span-1">
            <OrderSummary showProceed={false} />
          </div>
        </div>
      </div>
    );
  }

  // ── CART STEP (default) ──
  return (
    <div className="p-6 lg:p-8">
      <StepIndicator />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-emerald-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">My Cart</h1>
            <p className="text-emerald-300 text-sm mt-0.5">
              {totalItems} item{totalItems !== 1 ? "s" : ""} ready to order
            </p>
          </div>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-2 rounded-lg transition-all text-sm font-medium border border-red-800/40"
        >
          <Trash2 className="w-4 h-4" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="xl:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-0">
                <div
                  className="sm:w-40 h-36 sm:h-auto bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="flex-1 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{item.name}</h3>
                      <p className="text-emerald-400 text-sm mt-0.5">{item.seller}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-emerald-300 text-xs">
                          <MapPin className="w-3 h-3" /> {item.location}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400 text-xs">
                          <Star className="w-3 h-3 fill-yellow-400" /> {item.rating}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                            item.inStock
                              ? "bg-emerald-800/60 text-emerald-300"
                              : "bg-red-900/40 text-red-400"
                          }`}
                        >
                          {item.inStock ? "✓ In Stock" : "✗ Out of Stock"}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 text-xs">
                          <Tag className="w-3 h-3" /> {item.availableQty} {item.unit} available
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-emerald-400 text-xs">{item.priceLabel}</p>
                      <p className="text-white font-bold text-xl">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-emerald-400 text-xs">
                        KES {item.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-300 text-sm font-medium">Quantity:</span>
                      <div className="flex items-center gap-2 bg-emerald-900/60 rounded-xl border border-white/10 p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-all disabled:opacity-40"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-bold min-w-[2rem] text-center text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-all disabled:opacity-40"
                          disabled={item.quantity >= item.availableQty}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {item.quantity >= item.availableQty && (
                        <span className="flex items-center gap-1 text-amber-400 text-xs">
                          <AlertCircle className="w-3 h-3" /> Max stock reached
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {item.farmerId && profile?.id !== item.farmerId && (
                        <Link
                          to={`/app/messages?contactId=${item.farmerId}&message=Hi! Let's negotiate the delivery and price for ${item.name} (${item.quantity} ${item.unit}).`}
                          className="flex items-center gap-1.5 text-emerald-300 hover:text-white hover:bg-emerald-900/40 px-3 py-2 rounded-lg transition-all text-sm border border-emerald-700/50"
                        >
                          <MessageSquare className="w-4 h-4" /> Negotiate
                        </Link>
                      )}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-2 rounded-lg transition-all text-sm"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Summary */}
        <div className="xl:col-span-1">
          <OrderSummary showProceed={true} />
        </div>
      </div>
    </div>
  );
}
