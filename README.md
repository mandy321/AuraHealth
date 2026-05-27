# Aura Health: Private Cycle & Pregnancy Companion SPA

A standalone, secure, client-side Single Page Application (SPA) designed to track menstrual cycles, visualize fertility probability windows, calculate optimal pregnancy testing schedules, track early gestational milestones, and evaluate clinical symptoms for medical consultations.

Designed with a modern glassmorphic visual aesthetic and high security in mind, the application operates entirely within the user's browser, transmitting zero data over the internet.

---

## 🌟 Core Features

1. **Fertility & Cycle Visualizer**
   - Interactive calendar mapped dynamically to user-defined cycle parameters (Last period date, cycle duration, period length).
   - Zone-based phase calculations (Menstrual, Follicular, Ovulatory, Luteal) along with estimated pregnancy probability curves.
   - Dynamic logging interface allows recording of symptoms (flow rate, cramping pain level, general mood, and text notes) on any specific calendar date.

2. **Pregnancy Testing Kit Intelligence**
   - Automatically computes optimal pregnancy testing windows (starting exactly 14 days after estimated ovulation or on the first day of a missed period).
   - Educational resource detail explaining the physiological mechanics of the **hCG (human Chorionic Gonadotropin)** hormone, detection thresholds, and why early testing triggers false negatives.
   - Step-by-step clinical guidance for conducting tests, morning tracking, and reading faint lines.

3. **Gestational Timeline & Body Changes**
   - Interactive slider tracking pregnancy milestones from Week 1 to Week 12.
   - Side-by-side comparative views showing **Fetal Development** (fruit-scale representations, anatomical growth) vs. **Maternal Body Transformations** (placenta hormones, fatigue triggers, bladder pressure shifts).

4. **Clinical Symptom Triage Engine**
   - A health screening questionnaire tracking red flag symptoms (severe pelvic pain, heavy vaginal bleeding, amenorrhea exceeding 90 consecutive days, fever, and severe dizziness).
   - Automated conditional diagnostic evaluation separating outcomes into Critical Red Alerts, Yellow Warning, or Green/Routine.
   - **Print/Export Consultation Report** feature that compiles all symptoms and cycle statistics into a clean, professional clinical print template for gynecologist appointments.

5. **Technical & Privacy Architecture**
   - **100% Client-Side execution**: Zero database or server API connections.
   - **LocalStorage integration**: All profiles and symptom histories are stored in the browser's local sandbox cache.
   - **Data Purging**: A one-click "Purge All My Data" mechanism that safely deletes all logs from LocalStorage instantly.

---

## 🛠️ Technology Stack
* **Markup**: HTML5 (Semantic elements)
* **Styling**: Tailwind CSS (Utility classes & custom configurations via embedded CDN script)
* **Logic**: Vanilla ES6 JavaScript (LocalStorage APIs, Gregorian date calculations, DOM manipulation)
* **Custom Styles**: Vanilla CSS (`styles.css` for ambient glow canvas animations, custom slider layouts, and print overrides)
* **Icons**: FontAwesome v6.4

---

## 🚀 Running Locally

Since the application consists entirely of static assets, you can run it without any build tools.

### Option 1: Direct Execution
Simply open `index.html` in any web browser.

### Option 2: Local Python Server (Recommended)
Navigate to the root directory in your terminal and run:
```bash
python3 -m http.server 8000
```
Then visit: [http://localhost:8000](http://localhost:8000)

### Option 3: Node.js (Static Server)
```bash
npx serve .
```

---

## 📦 Static Deployment on GitHub Pages

Hosting this SPA on GitHub Pages is straightforward and takes less than a minute:

1. **Initialize Git and Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Aura Health SPA"
   git remote add origin https://github.com/yourusername/aura-health.git
   git branch -M main
   git push -u origin main
   ```
2. **Configure Pages**:
   - Go to your repository on GitHub.
   - Navigate to **Settings** > **Pages** tab.
   - Under **Build and deployment**, select **Deploy from a branch**.
   - Under **Branch**, select `main` (or the root folder `/`) and click **Save**.
   - Your site will be live at `https://yourusername.github.io/aura-health/` within a couple of minutes!
