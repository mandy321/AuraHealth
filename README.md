# Aura Health: Gentle Cycle & Baby Companion SPA

A standalone, privacy-first client-side Single Page Application (SPA) designed to track menstrual cycles, plan baby development stages, explore modern baby names, practice mindful breathing, and learn about postpartum health.

This application is built with a soft, warm pastel spa aesthetic (cream, blush rose, and lavender) designed to be highly welcoming and comforting to women and new mothers.

---

## 🌟 Core Features

1. **Fertility & Cycle Visualizer**
   - Interactive calendar mapped dynamically to user-defined cycle parameters (Last period date, typical cycle length, and menstruation days).
   - Color-coded phase overlays (Menstrual, Follicular, Ovulatory Peak, and Luteal) detailing hormone characteristics.
   - Private daily logs to record flow rate, cramps, general feeling, and journal notes.

2. **Pregnancy Testing & Milestones**
   - Automatically computes optimal pregnancy testing windows and details hCG hormone threshold behaviors.
   - Interactive milestone slider tracking embryonic and fetal growth from Week 1 to Week 12, with size comparisons to fruits (Poppy Seed, Apple Seed, Raspberry, Lime).

3. **Baby Names Explorer**
   - Curated database of modern Indian, Gen-Z, and global trending baby names with origins and meanings.
   - Dynamic search filters by classification (Girl, Boy, Unisex) and origin style.
   - **Live API Fetch Refresh**: Click the sync icon to fetch live, real-world trending names globally using the `randomuser.me` API.
   - "Favorites Wishlist" saved directly to browser LocalStorage.

4. **Quotes & Self-Care Hub**
   - **Daily Affirmation Fetcher**: Automatically pulls positive, encouraging quotes from public endpoints, with robust offline fallback libraries.
   - Structured wellness guides covering comfort tea drinks, heat compress methods, and sleep hygiene.

5. **Mindful Breathing Timer**
   - Guided breath visualizer designed for menstrual cramps relief and pregnancy relaxation.
   - Supports **Box Breathing (4-4-4-4)** and **4-7-8 Relaxation** ratios with interactive growing/shrinking visual elements.

6. **Postpartum & Infant Care Guide**
   - Essential wellness information covering physical recovery (involution, lochia, sitz baths), emotional changes (baby blues vs PPD), and newborn nutrition.
   - Clear checklists for **DO's** (rest, nutrient-dense diet) and **DON'Ts** (heavy lifting, premature workouts).
   - Clinical Medical Disclaimer urging consultation with a gynecologist or pediatrician for medical issues.

7. **Technical & Privacy Architecture**
   - 100% client-side logic with zero external database dependencies.
   - All profile data and favorited names live in browser LocalStorage.
   - Safety control to purge all local data with a single click.

---

## 🛠️ Technology Stack
* **Markup**: HTML5
* **Styling**: Tailwind CSS (Utility classes via CDN) + Custom CSS (`styles.css` for pastel glow animations, circle expansions, and scrollbars)
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
   git commit -m "Initial commit of Aura Health pastel SPA"
   git remote add origin https://github.com/yourusername/aura-health.git
   git push -u origin main
   ```
2. Enable Pages in **Settings** > **Pages** of your GitHub repository. Select `main` branch and `/` root folder.
