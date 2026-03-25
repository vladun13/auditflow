# Quick Task 260325-khj: Fix Navbar imports and credits fallback, rewrite Footer links and add newsletter signup

## Tasks

### Task 1: Fix Navbar credits fallback
- **File:** `src/components/Navbar.tsx`
- **Action:** Change `"— credits"` to `"0 credits"` on the credits button fallback (line ~338)
- **Note:** `ChevronDown` import kept — still used in CreditsPanel FAQ accordion (line 104)
- **Done:** ✅

### Task 2: Rewrite Footer
- **File:** `src/components/Footer.tsx`
- **Action:**
  - Product section: Features → Demo (#demo), keep Pricing, API → Coming Soon badge
  - Resources section: remove Documentation, keep Blog + Community
  - Legal section: add Accessibility Statement (#) and Font Statement (#)
  - Brand column: add newsletter email signup "Get notified when API launches"
- **Done:** ✅
