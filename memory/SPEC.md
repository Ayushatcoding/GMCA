# Genius Mind Chess Academy — Living Spec

## Product
Single-page, mobile-first website for Genius Mind Chess Academy (GMCA), a Noida chess academy established in 2011. The page uses anchored sections in this order: Home, About, Coaches, Programs, Fees, Tournaments, Testimonials, Gallery, Contact.

## Brand and content
- Official logo assets: `frontend/public/gmca-logo.webp` for full lockup and `frontend/public/gmca-emblem.webp` for small spaces.
- Primary brand blue is sampled from the supplied logo: `#014DFF`.
- The site uses only confirmed business facts from the request. Coach credentials, gallery photos, Facebook URL, and tagline remain clearly labeled placeholders.
- Contact hours use the Google Maps version supplied by the owner: Mon–Thu 3:30 PM–7:30 PM (Tue/Thu until 5:30 PM), Sat–Sun 10:00 AM–1:00 PM, Friday closed. Owner confirmation is still needed because sources conflict.

## Data model and API
- `EnquiryCreate`: name, phone, program, message.
- `Enquiry`: EnquiryCreate plus string UUID `id` and UTC `created_at`.
- `POST /api/enquiries` persists contact form submissions to MongoDB and returns the saved enquiry.
- `GET /api/enquiries` lists saved enquiries for verification/admin follow-up.

## Key flows
1. Visitors navigate the continuous page with sticky desktop links or a mobile hamburger menu; the active section is highlighted with scrollspy.
2. Visitors can use blue CTAs to scroll to Contact or WhatsApp links to open the academy chat.
3. Contact form submission persists an enquiry and shows an inline success state plus toast; API failure leaves the form usable and shows an error message.

## Auth
No authentication or gated areas. No seeded accounts.