import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;        // price per unit in KES
  priceLabel: string;   // e.g. "KES 120/kg"
  unit: string;         // "kg" | "liter" | "piece"
  seller: string;
  farmerId?: string;    // ID for the farmer to enable messaging
  location: string;
  image: string;
  quantity: number;     // quantity in cart
  availableQty: number; // max stock available
  inStock: boolean;
  rating: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isInCart: (id: string | number) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.availableQty) {
          toast.error(`Only ${product.availableQty} ${product.unit} available`);
          return prev;
        }
        toast.success(`${product.name} quantity updated!`);
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast.success(`${product.name} added to cart!`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string | number) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) toast.info(`${item.name} removed from cart`);
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateQuantity = (id: string | number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        if (qty > i.availableQty) {
          toast.error(`Only ${i.availableQty} ${i.unit} available`);
          return i;
        }
        return { ...i, quantity: qty };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.info("Cart cleared");
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isInCart = (id: string | number) => items.some((i) => i.id === id);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
