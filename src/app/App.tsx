import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "sonner";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import SessionExpiredModal from "./components/SessionExpiredModal";

/**
 * FBEconnect – Root App Component
 *
 * Provider order (outermost → innermost):
 *   LanguageProvider  – i18n, no auth dependency
 *   AuthProvider      – session, user, profile, role
 *   CartProvider      – shopping cart (depends on auth for buyer role)
 *   RouterProvider    – all routes (depend on auth for protection)
 *   SessionExpiredModal – listens to auth events for mid-session expiry
 *   Toaster           – global toast notifications
 */
export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
          {/* Shows a modal when the Supabase session expires mid-session */}
          <SessionExpiredModal />
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}