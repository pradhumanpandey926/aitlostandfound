# AIT Lost & Found // Cinema 3D Coverflow Experience
### Army Institute of Technology, Pune (Estd. 1994)
**Design System: Lazarev Agency — Cinematic Streaming & 3D Coverflow UI (Ref: [Pinterest](https://pin.it/2StigAvv5))**

A full-stack, responsive web application engineered for the recovery of lost student and campus gear across the **Army Institute of Technology (AIT) Pune** campus grounds. Built with the **MERN** stack and redesigned with a state-of-the-art **Cinematic Streaming & 3D Perspective Coverflow** aesthetic: dark cinema canvas (`#08080A`), ambient radial crimson backlight glow (`rgba(229, 9, 20, 0.22)`), 3D perspective Coverflow carousel, circular platform pill badges (`FND`, `LST`), star rating scores (`9.1 ★`), `rounded-2xl` & `rounded-3xl` glassmorphic cards, and glowing crimson gradient CTAs.

---

## 🎨 Cinematic 3D Coverflow Design Language & Aesthetic

- **Color Palette**:
  - **Cinema Black Canvas (`#08080A`)**: Ultra-deep nocturnal backdrop with rich ambient depth.
  - **Ambient Radial Crimson Glow (`#E50914` / `rgba(229, 9, 20, 0.22)`)**: Signature cinematic backlight glowing behind the 3D active card and key CTA elements.
  - **Glassmorphic Obsidian (`#0E0F14` / `rgba(255, 255, 255, 0.05)`)**: Translucent frosted panels with subtle 1px border (`border-white/10`).
  - **Pure White & Crisp Gray (`#FFFFFF` / `rgba(255, 255, 255, 0.70)`)**: High-contrast, crystal-clear typography.
  - **Vibrant Badges**: HBO/Netflix circular badges (electric blue for Found, crimson for Lost) paired with gold star rating pill (`★ 9.1`).
- **Shapes & Elevation**:
  - **Rounded Corners**: `rounded-2xl` (16px) for cards, `rounded-3xl` (24px) for modals and carousel frames, `rounded-full` for chips and circular pill badges.
  - **3D Perspective & Depth**: 3D Coverflow carousel with active center card (`scale-105`, `z-30`, crimson drop-glow) and perspective-rotated adjacent cards (`rotate-y-12`, `scale-90`, `opacity-60`).
- **Typography**:
  - **Plus Jakarta Sans & Inter**: Modern, ultra-clean geometric sans-serif for crystal-clear readability and cinema-grade elegance.
- **Signatures**:
  - **3D Coverflow Perspective Carousel**: Direct recreation of the Pinterest reference UI with keyboard & button navigation, star ratings, and glowing badges.
  - **Platform Circular Badges & Star Ratings**: Top-left circular pill (`FND` / `LST`) and top-right rating (`9.2 ★`).
  - **Glowing Crimson CTAs**: `bg-gradient-to-r from-[#E50914] to-[#B81D24]` with vibrant red hover glow.
  - **Category Index Chips**: Rounded-full pill filters for all 13 AIT campus zones with live counters.
  - **Security Gate Pass Voucher**: Dark glassmorphic pass (`GP-AIT-xxxx`) with barcode and AIT security seal.

---

## 📍 Strict AIT Pune Campus Landmarks

The application strictly filters and logs equipment across the 13 official AIT Pune locations:
1. **Library** (Study desks & reference racks)
2. **Mess** (Dining halls & water counters)
3. **Workshop** (Mechanical lathe, carpentry, and fitting labs)
4. **Auditorium** (Cadet briefings, induction halls)
5. **Academic Block** (Classrooms AB-101 to AB-304 & computer labs)
6. **Raman Theater** (Seminar amphitheater)
7. **BCJ Hall** (Cultural & council auditorium)
8. **Cricket Ground** (Pavilion steps & nets)
9. **Football Ground** (Track & perimeter)
10. **Basketball Court** (Spectator bleachers & fencing)
11. **Shopping Complex** (Stationary, Xerox, and canteen kiosks)
12. **Hostel (Boys / Girls)** (OBH, NBH, GH corridors & common rooms)
13. **Other / Open Campus** (Parade ground & main gates)

---

## ⚙️ Core Features & Workflows

1. **Dynamic Authentication, Registration & Session Management**:
   - **Guest by Default**: The application starts in an unauthenticated guest view.
   - **Navbar Controls**: Shows "Login / Register" when logged out, and active user name, role tag, and "Logout" when authenticated.
   - **Strict Domain Validation**: College emails must strictly match `@aitpune.edu.in` with user-friendly warnings (`"Please use your official college email (e.g., name_id@aitpune.edu.in)"`).
   - **Three Official Roles**:
     - `Student`
     - `Faculty / Teacher`
     - `Staff / Other / Security` (Grants access to Security Desk Claim Audits)
   - **Registration & Login Fields**: Requires Full Name, Role Selection, Registration / Roll / Employee ID, Official Email, and Password with visibility toggle.
   - **Action Guards**: Gated actions ("Report Item", "Claim Property") prompt the user to log in if currently in guest mode.
   - **Quick Demo Credentials (Dev Mode)**: 1-click test profiles for Student, Faculty, and Security Staff.

2. **Item Upload & Interactive Privacy Redaction Tool**:
   - Toggle: **"[+] FOUND EQUIPMENT"** vs **"[-] LOST NOTICE"**.
   - Mandatory title, category, landmark dropdown, date, time, and description.
   - **Interactive Redaction Canvas**:
     - Toggle privacy masking.
     - Add blackout redaction bars to mask student roll numbers, ID photos, and serial numbers.

3. **Anti-Fraud Claim Verification Flow**:
   - **"Claim Gear"** interactive questionnaire modal.
   - Claimant must answer private identifying mark questions (e.g., hidden inscriptions, internal sticker decals, exact cash denominations).
   - Side-by-side verification console for **Security Desk / Admin**:
     - Cross-references claimant's submission against finder's confidential inventory hint.
     - One-click **Approve** or **Reject** with audit notes.
     - Generates official **Campus Gate Pass** (`GP-AIT-xxxx`) with collection desk handoff instructions.

4. **Notifications & Keyword Radar ("Notify Me")**:
   - Real-time in-app alert feed with unread badges.
   - Arm custom watchwords (e.g., *"Casio"*, *"Keys"*, *"Wildhorn"*, *"Boat"*).
   - Automatically notifies the student whenever matching equipment is logged.

5. **10 Pre-Seeded Realistic AIT Campus Recoveries**:
   - *AIT Student Identity Card (TE Mech)* found at Raman Theater (Privacy Redacted)
   - *Casio fx-991CW ClassWiz Scientific Calculator* found at Library Desk #24
   - *Brown Leather Wildhorn Bi-Fold Wallet* lost at Mess
   - *Yonex Nanoray 18i Badminton Racket* found at Basketball Court
   - *Engineering Mathematics-III Spiral Notes* found at Academic Block
   - *boAt Airdopes 141 Charging Case (Black)* lost at Shopping Complex
   - *Set of 3 Godrej Brass Keys* found at Workshop
   - *AIT Official Squad Blazer (Navy Blue / Brass Crest)* at Auditorium (Under Claim Review)
   - *Fastrack Reflex Curved Smartwatch* at BCJ Hall (Claimed & Restored)
   - *Official Spalding TF-150 Basketball* at Cricket Ground (Verified)

---

## 🚀 Running the Project

### 1. Start the Full-Stack Server:
```bash
node server/src/index.js
```
The server will run on `http://localhost:5000` (serving both the REST API and the AVNIER production client bundle).

### 2. Run in Development Mode:
```bash
# Terminal 1: Backend API
cd server
npm start

# Terminal 2: Vite Dev Server
cd client
npm run dev
```
Open **`http://localhost:5173`** in your browser.
