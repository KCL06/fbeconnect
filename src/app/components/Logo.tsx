/**
 * FBEconnect Logo Component
 *
 * HOW TO CHANGE THE LOGO IN THE FUTURE:
 * ──────────────────────────────────────
 * 1. Save your new logo image as `logo.png` inside the `public/` folder.
 *    Path: UbarnFarmersMarketPlacesSystem-main/public/logo.png
 *
 * 2. That's all — the app will automatically use the new image everywhere.
 *    No code changes needed.
 *
 * SIZING:
 * - The `size` prop controls the logo height: "sm" = 32px, "md" = 40px, "lg" = 56px
 * - Change the numbers in the size map below if you want different sizes.
 *
 * SHOWING/HIDING THE TEXT:
 * - Pass showText={false} to show only the logo image (no "FBEconnect" text next to it).
 * - The text is already baked into your logo image, so showText defaults to false.
 */

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-8",   // 32px — for compact headers
  md: "h-10",  // 40px — default, used in sidebar and top nav
  lg: "h-14",  // 56px — for landing page / footer
};

export default function Logo({ size = "md", showText = false, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/Logo.png"
        alt="FBEconnect Logo"
        className={`${sizeMap[size]} w-auto object-contain`}
        onError={(e) => {
          // Fallback: show text if logo image is missing
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      {showText && (
        <span className="text-xl font-bold text-white tracking-tight">FBEconnect</span>
      )}
    </div>
  );
}
