# FBEconnect – Security & Production Readiness Checklist

> Generated on 2026-05-15. Review and update regularly.

---

## ✅ Frontend Security

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Protected route guard on all `/app/*` routes | ✅ Done | `ProtectedRoute.tsx` blocks render until auth verified |
| 2 | Role-based access control (RBAC) | ✅ Done | `RoleGuard.tsx` restricts farmer/buyer/expert/admin routes |
| 3 | Redirect unauthenticated users to `/login` | ✅ Done | Saves `from` location for post-login redirect |
| 4 | Prevent rendering protected pages before auth check | ✅ Done | Full-screen loading spinner during verification |
| 5 | Session expiry detection | ✅ Done | `SessionExpiredModal.tsx` prompts re-login |
| 6 | Input validation (email, password, phone, name, ID) | ✅ Done | Centralised in `utils/validation.ts` |
| 7 | Password policy (min 8, uppercase, number) | ✅ Done | New registrations + password resets |
| 8 | XSS prevention via DOMPurify | ✅ Done | `utils/sanitize.ts` with strict config |
| 9 | File upload MIME validation (magic bytes) | ✅ Done | `utils/fileValidation.ts` |
| 10 | File upload size limits (5 MB docs, 8 MB images) | ✅ Done | Enforced before upload |
| 11 | Executable file blocking | ✅ Done | `.exe`, `.sh`, `.php` etc. rejected |
| 12 | Client-side rate limiting (login, password reset) | ✅ Done | `hooks/useRateLimit.ts` |
| 13 | Global error boundary | ✅ Done | `ErrorBoundary.tsx` – no stack traces shown |
| 14 | No `dangerouslySetInnerHTML` without sanitization | ✅ Done | Convention enforced via comments |
| 15 | Environment variable documentation | ✅ Done | `.env.example` with public vs private docs |
| 16 | Sensitive error messages not exposed to UI | ✅ Done | `lib/api.ts` classifies errors |

---

## ✅ Security Headers (Vercel)

| Header | Value | Status |
|--------|-------|--------|
| Content-Security-Policy | Restricts scripts, styles, images, connections | ✅ Done |
| X-Frame-Options | DENY | ✅ Done |
| X-Content-Type-Options | nosniff | ✅ Done |
| Referrer-Policy | strict-origin-when-cross-origin | ✅ Done |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | ✅ Done |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | ✅ Done |
| X-XSS-Protection | 1; mode=block | ✅ Done |

---

## ✅ Performance & Build

| # | Item | Status |
|---|------|--------|
| 1 | Lazy-loaded all 29 page components | ✅ Done |
| 2 | React.lazy + Suspense with Loading fallbacks | ✅ Done |
| 3 | Vendor chunk splitting (react, supabase, charts) | ✅ Done |
| 4 | Source maps disabled in production | ✅ Done |
| 5 | React StrictMode enabled | ✅ Done |

---

## ✅ SEO & Accessibility

| # | Item | Status |
|---|------|--------|
| 1 | Meta description, keywords | ✅ Done |
| 2 | Open Graph tags (og:title, og:description, og:image) | ✅ Done |
| 3 | Twitter Card tags | ✅ Done |
| 4 | Canonical URL | ✅ Done |
| 5 | robots.txt (blocks /app/, allows public pages) | ✅ Done |
| 6 | sitemap.xml (8 public pages) | ✅ Done |
| 7 | aria-labels on icon buttons | ✅ Done |
| 8 | Proper heading hierarchy (single h1 per page) | ✅ Done |
| 9 | Form labels with htmlFor associations | ✅ Done |
| 10 | Google Font (Inter) loaded | ✅ Done |

---

## ⚠️ Backend Recommendations (NOT implemented – server-side work needed)

> [!IMPORTANT]
> Frontend security alone is insufficient. The following must be implemented server-side.

| # | Recommendation | Priority | Where |
|---|---------------|----------|-------|
| 1 | **Server-side rate limiting** on login/signup/reset endpoints | 🔴 Critical | Supabase Edge Functions or Vercel Edge Middleware |
| 2 | **Row-Level Security (RLS)** on all tables | 🔴 Critical | Supabase Dashboard → Database → Policies |
| 3 | **Block role field updates** from client | 🔴 Critical | RLS policy: deny UPDATE on `profiles.role` from client |
| 4 | **Email enumeration prevention** on signup | 🟠 High | Supabase Auth settings |
| 5 | **File MIME validation** in Supabase Storage policies | 🟠 High | Storage bucket policies |
| 6 | **File size limits** in Supabase Storage | 🟠 High | Bucket-level max file size |
| 7 | **Input sanitization** in Edge Functions | 🟡 Medium | Sanitize all strings before DB insert |
| 8 | **Password policy enforcement** in Supabase Auth | 🟡 Medium | Auth settings → Password strength |
| 9 | **Webhook/audit logging** for admin actions | 🟢 Low | Database triggers / Edge Functions |
| 10 | **CAPTCHA on registration** (hCaptcha/Turnstile) | 🟢 Low | Supabase Auth supports Captcha integration |

---

## ⚠️ Known Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | Client-side rate limiting can be bypassed | 🟡 Medium | Implement server-side rate limiting (see above) |
| 2 | AdminDashboard has hardcoded demo data | 🟢 Low | Replace with live Supabase queries |
| 3 | No CAPTCHA on forms | 🟡 Medium | Add hCaptcha via Supabase Auth |
| 4 | Supabase anon key is public by design | 🟢 Info | This is expected — security relies on RLS |

---

## Deployment Checklist

- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Environment Variables
- [ ] Verify RLS is enabled on **all** Supabase tables
- [ ] Run `npm run build` — confirm no build errors
- [ ] Run `npm audit` — confirm no critical vulnerabilities
- [ ] Test login flow: unauthenticated → redirected → login → dashboard
- [ ] Test RBAC: farmer cannot access `/app/admin`
- [ ] Check response headers in browser DevTools → Security tab
- [ ] Verify no `.map` source files served in production
- [ ] Test on mobile viewport sizes
- [ ] Verify robots.txt and sitemap.xml are accessible
