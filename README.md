# Aura Health: Cozy Cycle & Baby Companion SPA

A standalone, privacy-first client-side Single Page Application (SPA) designed to track menstrual cycles, plan baby development stages, explore modern baby names, practice mindful breathing, and learn about postpartum health.

This application features a **cozy dark-plum, rose, and gold dream-theme** (resembling a comforting midnight nursery/starry night sky) designed to be highly welcoming and visually relaxing for women and new mothers.

---

## 🌟 Core Features

1. **Fertility & Cycle Visualizer**
   - Interactive calendar mapped dynamically to user-defined cycle parameters (Last period date, typical cycle length, and menstruation days).
   - Color-coded phase overlays (Menstrual, Follicular, Ovulatory Peak, and Luteal) detailing hormone characteristics.
   - Private daily logs to record flow rate, cramps, general feeling, and journal notes.

2. **Pregnancy Testing & Milestones**
   - Computes optimal pregnancy testing windows and details hCG hormone threshold behaviors.
   - Interactive milestone slider tracking embryonic and fetal growth from Week 1 to Week 12, with size comparisons to fruits (Poppy Seed, Apple Seed, Raspberry, Lime).

3. **Baby Names Explorer (Improved)**
   - Preloaded database of popular baby names split into distinct styles: **Modern Indian**, **Gen-Z**, **Trending in India**, and **Global Trending (US/UK/EU)**.
   - **Safe Search & Meaning Checker**: Features a search query that matches both names and meanings. Filters are fully insulated against crashes.
   - **Hybrid Meaning Lookup**: Looks up names in a rich local dictionary, queries public naming database endpoints, and uses an intelligent phonetic contextual generator for new names, explaining their origin and meaning in a baby-name context.
   - **Live API Fetch**: Click the sync icon to fetch live, real-world trending first names globally using the `randomuser.me` API. Indian names are dynamically tagged as *Trending in India* while other names are tagged as *Global Trending* based on their registry origin.
   - "Favorites Wishlist" saved directly to browser LocalStorage.

4. **Quotes & Self-Care Hub**
   - **Daily Affirmation Fetcher**: Automatically pulls positive, encouraging quotes from public endpoints, with robust offline fallback libraries.
   - Wellness guides covering comfort tea drinks, heat compress methods, and sleep hygiene.

5. **Mindful Breathing Timer**
   - Guided breath visualizer designed for menstrual cramps relief and pregnancy relaxation.
   - Supports **Box Breathing (4-4-4-4)** and **4-7-8 Relaxation** ratios with visual scaling indicators.

6. **Postpartum Recovery Guide**
   - Recovery guidelines covering maternal physical changes (involution, lochia care) and newborn care (breastfeeding intervals).
   - Checklists for **DO's** (staying hydrated, sleep syncing) and **DON'Ts** (avoiding heavy lifting, early intense exercises).
   - Clinical Medical Disclaimer urging consultation with a gynecologist or pediatrician for medical issues.

7. **Technical & Privacy Architecture**
   - 100% client-side logic with zero external database dependencies.
   - All profile data and favorited names live in browser LocalStorage.
   - Safety control to purge all local data with a single click.

---

## 🛠️ Technology Stack
* **Markup**: HTML5
* **Styling**: Tailwind CSS (Utility classes via CDN) + Custom CSS (`styles.css` for ambient glow animations, circle expansions, and scrollbars)
* **Logic**: Vanilla ES6 JavaScript (Fetch API, LocalStorage persistence, DOM timers)
* **Icons**: FontAwesome v6.4

---

## 🚀 Running and Hosting

### Local Execution
To run locally, navigate to the folder and run:
```bash
python3 -m http.server 8080
```
Then visit: [http://localhost:8080](http://localhost:8080)

### GitHub Pages Deployment
1. Initialize Git, commit, and push commits to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Aura Health dark theme SPA"
   git remote add origin https://github.com/yourusername/aura-health.git
   git push -u origin main
   ```
2. Enable Pages in **Settings** > **Pages** of your GitHub repository. Select `main` branch and `/` root folder.
