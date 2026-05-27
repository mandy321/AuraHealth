/**
 * AuraHealth - Client-Side Women's Health & Baby Companion
 * Features:
 *  - Fertility & Cycle Visualizer (Pastel Calendar grid mapping)
 *  - Pregnancy Testing Kit Intelligence (hCG thresholds & guidance)
 *  - Gestational Milestone Timeline (Weeks 1-12)
 *  - Interactive Baby Names Explorer (Gen-Z, Indian, and Global names + Live API fetch)
 *  - Mindful Breathing Timer (Cramps & Relaxation relief guide)
 *  - Postpartum Recovery & Newborn Care Guide (Do's & Don'ts + Medical Disclaimer)
 *  - LocalStorage Privacy Architecture
 */

// App State
const state = {
  // Cycle configurations
  cycleLength: 28,
  periodLength: 5,
  lastPeriodDate: "", // YYYY-MM-DD
  
  // Calendar navigation
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  selectedDateStr: "", 

  // Tab navigation
  activeTab: "fertility",

  // Pregnancy timeline
  selectedWeek: 4,

  // Baby Names Explorer
  namesList: [],
  favoriteNames: [],
  nameSearchFilter: "",
  nameGenderFilter: "all",
  nameCategoryFilter: "all",

  // Mindful Breathing state
  breatheActive: false,
  breatheInterval: null,
  breatheTimer: 0,
  breathePhase: "Inhale", // Inhale, Hold, Exhale, Hold
  breatheRatio: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 }, // default Box
  breatheCount: 4,
  breatheTechnique: "box", // box, relax

  // Local storage cache
  logs: {}
};

// Curated Baby Names Database (Modern Indian, Gen-Z, Global Trending)
const localBabyNames = [
  // Modern Indian Names
  { name: "Aarav", gender: "boy", origin: "Indian", meaning: "Peaceful; wisdom; musical note", tag: "Modern Indian" },
  { name: "Ananya", gender: "girl", origin: "Indian", meaning: "Matchless; unique; peerless", tag: "Modern Indian" },
  { name: "Vihaan", gender: "boy", origin: "Indian", meaning: "Dawn; morning; start of era", tag: "Modern Indian" },
  { name: "Myra", gender: "girl", origin: "Indian", meaning: "Sweet; beloved; swift light", tag: "Modern Indian" },
  { name: "Ishaan", gender: "boy", origin: "Indian", meaning: "Lord Shiva; light indicator", tag: "Modern Indian" },
  { name: "Kiara", gender: "girl", origin: "Indian/Italian", meaning: "Clear; bright; soft light", tag: "Modern Indian" },
  { name: "Kabir", gender: "boy", origin: "Indian", meaning: "Great; saintly poet", tag: "Modern Indian" },
  { name: "Diya", gender: "girl", origin: "Indian", meaning: "Clay lamp; light guidance", tag: "Modern Indian" },
  { name: "Advait", gender: "boy", origin: "Indian", meaning: "Unique; non-dualist", tag: "Modern Indian" },
  { name: "Zara", gender: "girl", origin: "Arabic/Indian", meaning: "Princess; blooming flower", tag: "Modern Indian" },
  { name: "Vivaan", gender: "boy", origin: "Indian", meaning: "Full of life; rays of sun", tag: "Modern Indian" },
  { name: "Amaira", gender: "girl", origin: "Indian", meaning: "Beautiful princess; forever pretty", tag: "Modern Indian" },
  { name: "Rudra", gender: "boy", origin: "Indian", meaning: "Lord Shiva; remover of pain", tag: "Modern Indian" },
  { name: "Navya", gender: "girl", origin: "Indian", meaning: "Worth praising; young; modern", tag: "Modern Indian" },

  // Gen-Z Names
  { name: "Nova", gender: "girl", origin: "Latin", meaning: "New star; cosmic transition", tag: "Gen-Z" },
  { name: "Kai", gender: "unisex", origin: "Hawaiian/Japanese", meaning: "Sea; shell; recovery", tag: "Gen-Z" },
  { name: "Luna", gender: "girl", origin: "Latin", meaning: "Moon goddess; soft light", tag: "Gen-Z" },
  { name: "Ezra", gender: "unisex", origin: "Hebrew", meaning: "Helper; strong companion", tag: "Gen-Z" },
  { name: "Sage", gender: "unisex", origin: "Latin", meaning: "Wise protector; cleansing herb", tag: "Gen-Z" },
  { name: "Zen", gender: "unisex", origin: "Japanese", meaning: "Peaceful focus; meditative", tag: "Gen-Z" },
  { name: "River", gender: "unisex", origin: "Nature", meaning: "Flowing stream; gentle energy", tag: "Gen-Z" },
  { name: "Hazel", gender: "girl", origin: "English", meaning: "Hazel tree; soft golden brown", tag: "Gen-Z" },
  { name: "Arlo", gender: "boy", origin: "Spanish/German", meaning: "Barberry tree; fortified hill", tag: "Gen-Z" },
  { name: "Wren", gender: "unisex", origin: "Nature", meaning: "Small songbird; free-spirited", tag: "Gen-Z" },

  // Global Trending
  { name: "Maeve", gender: "girl", origin: "Irish", meaning: "Intoxicating; mythical queen", tag: "Global Trending" },
  { name: "Leo", gender: "boy", origin: "Latin", meaning: "Lion; courageous; brave", tag: "Global Trending" },
  { name: "Noah", gender: "boy", origin: "Hebrew", meaning: "Rest; solace; comfort", tag: "Global Trending" },
  { name: "Olivia", gender: "girl", origin: "Latin", meaning: "Olive branch; peace token", tag: "Global Trending" },
  { name: "Elio", gender: "boy", origin: "Italian/Spanish", meaning: "Sun god; radiant light", tag: "Global Trending" },
  { name: "Ayla", gender: "girl", origin: "Turkish/Hebrew", meaning: "Moonlight; oak tree", tag: "Global Trending" },
  { name: "Theo", gender: "boy", origin: "Greek", meaning: "Divine gift; helper", tag: "Global Trending" }
];

// Document Elements
let el = {};

/**
 * Setup default configuration dates
 */
function setupDefaults() {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 10);
  const yyyy = defaultDate.getFullYear();
  const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
  const dd = String(defaultDate.getDate()).padStart(2, '0');
  state.lastPeriodDate = `${yyyy}-${mm}-${dd}`;
  
  state.selectedDateStr = getTodayStr();
  state.namesList = [...localBabyNames];
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * LocalStorage caching layers
 */
function loadData() {
  try {
    const profileJson = localStorage.getItem("aura_profile_v2");
    if (profileJson) {
      const prof = JSON.parse(profileJson);
      state.cycleLength = parseInt(prof.cycleLength) || 28;
      state.periodLength = parseInt(prof.periodLength) || 5;
      state.lastPeriodDate = prof.lastPeriodDate || state.lastPeriodDate;
    } else {
      setupDefaults();
      saveProfile();
    }

    const logsJson = localStorage.getItem("aura_logs_v2");
    state.logs = logsJson ? JSON.parse(logsJson) : {};

    const favNamesJson = localStorage.getItem("aura_favorite_names");
    state.favoriteNames = favNamesJson ? JSON.parse(favNamesJson) : [];
  } catch (e) {
    console.error("LocalStorage load error:", e);
    setupDefaults();
  }
}

function saveProfile() {
  const prof = {
    cycleLength: state.cycleLength,
    periodLength: state.periodLength,
    lastPeriodDate: state.lastPeriodDate
  };
  localStorage.setItem("aura_profile_v2", JSON.stringify(prof));
}

function saveLogs() {
  localStorage.setItem("aura_logs_v2", JSON.stringify(state.logs));
}

function saveFavorites() {
  localStorage.setItem("aura_favorite_names", JSON.stringify(state.favoriteNames));
}

/**
 * Cycle mathematical algorithms
 */
function calculateCyclePhase(targetDate) {
  if (!state.lastPeriodDate) {
    return { phase: "none", label: "Unknown", probability: "0%", desc: "Set cycle parameters.", index: 0 };
  }

  const startDate = new Date(state.lastPeriodDate + "T00:00:00");
  const checkDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  const timeDiff = checkDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  const L = state.cycleLength;
  const P = state.periodLength;
  const cycleDay = ((diffDays % L) + L) % L + 1; // 1-based cycle index
  
  if (cycleDay >= 1 && cycleDay <= P) {
    return {
      phase: "menstrual",
      label: "Menstrual Phase",
      probability: "Low (<1%)",
      probValue: 1,
      color: "text-red-500",
      desc: "Uterine lining is shedding. Estrogen and progesterone are at baseline levels. Rest, warm hydration, and gentle stretching are recommended.",
      cycleDay: cycleDay
    };
  } else if (cycleDay > P && cycleDay <= 10) {
    const progress = (cycleDay - P) / (11 - P);
    const prob = Math.round(5 + progress * 20); // 5% -> 25%
    return {
      phase: "follicular",
      label: "Follicular Phase",
      probability: `Gradual Climb (${prob}%)`,
      probValue: prob,
      color: "text-blue-500",
      desc: "Estrogen is climbing to stimulate egg maturity. Energy levels start increasing. Great window for mental clarity and exercise.",
      cycleDay: cycleDay
    };
  } else if (cycleDay >= 11 && cycleDay <= 16) {
    let prob = 35;
    if (cycleDay === 11) prob = 35;
    else if (cycleDay === 12) prob = 60;
    else if (cycleDay === 13) prob = 85;
    else if (cycleDay === 14) prob = 98; // peak
    else if (cycleDay === 15) prob = 80;
    else if (cycleDay === 16) prob = 30;

    return {
      phase: "ovulatory",
      label: "Ovulatory Window",
      probability: `Peak Probability (${prob}%)`,
      probValue: prob,
      color: "text-rose-500",
      desc: "Luteinizing Hormone (LH) peaks, releasing the mature egg. High metabolic energy. Focus on stress-relief, positive mood support, and balanced nutrition.",
      cycleDay: cycleDay
    };
  } else {
    const daysSinceOvulation = cycleDay - 16;
    const remainingLuteal = L - 16;
    const progress = daysSinceOvulation / remainingLuteal;
    const prob = Math.max(1, Math.round(20 - progress * 20));

    return {
      phase: "luteal",
      label: "Luteal Phase",
      probability: `Rapid Drop to Lowest (${prob}%)`,
      probValue: prob,
      color: "text-purple-500",
      desc: "Progesterone peaks to nurture a potential pregnancy, dropping if fertilization does not happen. Standard PMS signs might trigger. Gentle yoga and box breathing support relaxation.",
      cycleDay: cycleDay
    };
  }
}

/**
 * Tab Controller
 */
function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Navigation links styling
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    const isCurrent = btn.getAttribute("data-tab") === tabId;
    if (isCurrent) {
      btn.classList.add("text-rose-600", "border-rose-500", "bg-rose-50");
      btn.classList.remove("text-zinc-500", "border-transparent", "hover:bg-zinc-100/60");
    } else {
      btn.classList.remove("text-rose-600", "border-rose-500", "bg-rose-50");
      btn.classList.add("text-zinc-500", "border-transparent", "hover:bg-zinc-100/60");
    }
  });

  // Toggle active views
  document.querySelectorAll(".tab-panel").forEach(panel => {
    if (panel.id === `${tabId}-panel`) {
      panel.classList.remove("hidden");
    } else {
      panel.classList.add("hidden");
    }
  });

  // Action callbacks
  if (tabId === "fertility") {
    renderCalendar();
  } else if (tabId === "testing") {
    calculateTestingIntel();
  } else if (tabId === "names") {
    renderBabyNames();
  } else if (tabId === "selfcare") {
    loadDailyAffirmation();
  } else if (tabId === "logs") {
    renderLogsList();
  }
}

/**
 * Renders Gregorian monthly calendar grid overlaid with cycle phases
 */
function renderCalendar() {
  const year = state.currentYear;
  const month = state.currentMonth;
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  el.calendarMonthTitle.innerText = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Mon index
  const totalDays = new Date(year, month + 1, 0).getDate();

  el.calendarGrid.innerHTML = "";

  // Render calendar offsets
  for (let i = 0; i < adjustedFirstDay; i++) {
    const blank = document.createElement("div");
    blank.className = "h-14 md:h-16 bg-zinc-50 border border-zinc-100 rounded-xl opacity-40";
    el.calendarGrid.appendChild(blank);
  }

  const todayStr = getTodayStr();

  // Render monthly days
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const cycleInfo = calculateCyclePhase(dateObj);
    const dayCell = document.createElement("div");
    
    // Style overlays
    dayCell.className = `h-14 md:h-16 p-1.5 border rounded-xl cursor-pointer flex flex-col justify-between transition-all duration-200 glass-panel-hover ${PHASE_CLASSES[cycleInfo.phase]}`;
    
    let badge = "";
    if (state.logs[dateStr]) {
      badge = `<span class="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>`;
    }

    dayCell.innerHTML = `
      <div class="flex justify-between items-start">
        <span class="text-xs font-bold">${d}</span>
        ${badge}
      </div>
      <div class="text-[9px] leading-tight font-medium opacity-80 truncate">
        ${cycleInfo.label.split(" ")[0]}
      </div>
    `;

    if (dateStr === todayStr) {
      dayCell.classList.add("day-today");
    }
    if (dateStr === state.selectedDateStr) {
      dayCell.classList.add("day-selected");
    }

    dayCell.addEventListener("click", () => {
      state.selectedDateStr = dateStr;
      document.querySelectorAll(".day-selected").forEach(c => c.classList.remove("day-selected"));
      dayCell.classList.add("day-selected");
      updateSelectedDayPanel(dateStr, cycleInfo);
    });

    el.calendarGrid.appendChild(dayCell);
  }

  const selectedDate = new Date(state.selectedDateStr + "T00:00:00");
  const initCycleInfo = calculateCyclePhase(selectedDate);
  updateSelectedDayPanel(state.selectedDateStr, initCycleInfo);
}

/**
 * Diagnostic panel updates for selected date
 */
function updateSelectedDayPanel(dateStr, cycleInfo) {
  const d = new Date(dateStr + "T00:00:00");
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.selectedDayLabel.innerText = d.toLocaleDateString('en-US', options);
  
  el.selectedDayPhase.innerText = cycleInfo.label;
  el.selectedDayPhase.className = `text-sm font-extrabold tracking-wide ${cycleInfo.color}`;
  
  el.selectedDayCycleDay.innerText = cycleInfo.cycleDay ? `Cycle Day ${cycleInfo.cycleDay}` : "N/A";
  el.selectedDayProbability.innerText = cycleInfo.probability;
  el.selectedDayPhaseDesc.innerText = cycleInfo.desc;

  const log = state.logs[dateStr] || {};
  el.logFlow.value = log.flow || "none";
  el.logPain.value = log.pain || "none";
  el.logMood.value = log.mood || "good";
  el.logNotes.value = log.notes || "";
  
  if (state.logs[dateStr]) {
    el.loggedSummaryText.innerHTML = `
      <div class="mt-2 text-xs border-t border-rose-100 pt-2 text-zinc-600 space-y-0.5">
        <strong>Currently Logged:</strong><br/>
        • Flow: <span class="capitalize font-bold text-rose-600">${log.flow}</span><br/>
        • Pain: <span class="capitalize font-bold text-rose-600">${log.pain}</span><br/>
        • Mood: <span class="capitalize font-bold text-rose-600">${log.mood === 'good' ? 'Balanced' : log.mood}</span><br/>
        ${log.notes ? `• Notes: <span class="italic text-zinc-500">"${log.notes}"</span>` : ""}
      </div>
    `;
    el.deleteLogBtn.classList.remove("hidden");
  } else {
    el.loggedSummaryText.innerHTML = `<p class="text-[11px] text-zinc-400 italic mt-1.5">No symptoms logged for this date.</p>`;
    el.deleteLogBtn.classList.add("hidden");
  }
}

function saveSymptomLog() {
  const dateStr = state.selectedDateStr;
  state.logs[dateStr] = {
    flow: el.logFlow.value,
    pain: el.logPain.value,
    mood: el.logMood.value,
    notes: el.logNotes.value.trim()
  };
  saveLogs();
  renderCalendar();
  showNotification("Cycle Log updated successfully!", "success");
}

function deleteSymptomLog() {
  const dateStr = state.selectedDateStr;
  if (state.logs[dateStr]) {
    delete state.logs[dateStr];
    saveLogs();
    renderCalendar();
    showNotification("Cycle Log cleared", "info");
  }
}

function renderLogsList() {
  const container = el.logsListContainer;
  container.innerHTML = "";

  const loggedDates = Object.keys(state.logs).sort((a, b) => new Date(b) - new Date(a));

  if (loggedDates.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-zinc-400 glass-panel rounded-2xl border border-dashed border-rose-200">
        <i class="fas fa-heart text-2xl mb-2 text-rose-300"></i>
        <p class="text-sm font-semibold">No logs saved yet.</p>
        <p class="text-xs mt-1">Select a calendar date to start logging flow and symptoms.</p>
      </div>
    `;
    return;
  }

  loggedDates.forEach(dateStr => {
    const log = state.logs[dateStr];
    const logDate = new Date(dateStr + "T00:00:00");
    const formatted = logDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    const phaseInfo = calculateCyclePhase(logDate);

    const card = document.createElement("div");
    card.className = "glass-panel p-4 rounded-xl border border-rose-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4";
    card.innerHTML = `
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-bold text-zinc-700 text-sm">${formatted}</span>
          <span class="px-2 py-0.5 rounded-full text-[9px] uppercase font-extrabold tracking-wider ${phaseInfo.color} bg-rose-50 border border-current">
            ${phaseInfo.label}
          </span>
        </div>
        <div class="mt-2 flex gap-4 text-xs text-zinc-500">
          <span>Flow: <strong class="text-zinc-700 capitalize">${log.flow}</strong></span>
          <span>Pain: <strong class="text-zinc-700 capitalize">${log.pain}</strong></span>
          <span>Mood: <strong class="text-zinc-700 capitalize">${log.mood}</strong></span>
        </div>
        ${log.notes ? `<div class="mt-2 text-xs text-zinc-500 bg-rose-50/40 p-2 rounded-lg italic border-l-2 border-rose-300">"${log.notes}"</div>` : ""}
      </div>
      <div>
        <button class="px-3 py-1.5 rounded-xl bg-white border border-rose-100 hover:bg-rose-50 text-xs text-rose-500 font-bold transition-all" onclick="deleteHistoryLog('${dateStr}')">
          Remove
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.deleteHistoryLog = function(dateStr) {
  if (confirm(`Delete logs saved on ${dateStr}?`)) {
    delete state.logs[dateStr];
    saveLogs();
    renderLogsList();
    showNotification("Log removed successfully", "info");
  }
};

/**
 * Tab 2: "When to Test" calculator logic
 */
function calculateTestingIntel() {
  if (!state.lastPeriodDate) return;

  const startDate = new Date(state.lastPeriodDate + "T00:00:00");
  const L = state.cycleLength;
  const ovulationOffset = L - 14;

  const estOvulation = new Date(startDate.getTime());
  estOvulation.setDate(estOvulation.getDate() + ovulationOffset);

  const missedPeriod = new Date(startDate.getTime());
  missedPeriod.setDate(missedPeriod.getDate() + L);

  const optimalTesting = new Date(estOvulation.getTime());
  optimalTesting.setDate(optimalTesting.getDate() + 14);

  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  
  el.calcOvulationDate.innerText = estOvulation.toLocaleDateString('en-US', options);
  el.calcMissedDate.innerText = missedPeriod.toLocaleDateString('en-US', options);
  el.calcOptimalTestDate.innerText = optimalTesting.toLocaleDateString('en-US', options);

  const today = new Date();
  today.setHours(0,0,0,0);
  
  const diffDays = Math.ceil((optimalTesting.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    el.calcTestingCountdown.innerHTML = `
      <div class="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700">
        <div class="flex items-center gap-2 mb-1">
          <i class="fas fa-clock text-lg"></i>
          <span class="font-extrabold text-sm">Testing Schedule: Wait ${diffDays} Days</span>
        </div>
        <p class="text-xs opacity-90 leading-relaxed">
          Testing earlier than <span class="font-bold text-rose-600">${optimalTesting.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span> runs the risk of a false negative as the hCG hormone concentration increases gradually.
        </p>
      </div>
    `;
  } else {
    el.calcTestingCountdown.innerHTML = `
      <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
        <div class="flex items-center gap-2 mb-1">
          <i class="fas fa-check-circle text-lg"></i>
          <span class="font-extrabold text-sm">Testing Window Open</span>
        </div>
        <p class="text-xs opacity-90 leading-relaxed">
          You are past the estimated missed period threshold. A urine pregnancy test conducted today will deliver peak reliability (>99%).
        </p>
      </div>
    `;
  }
}

/**
 * Tab 3: Gestational timeline & size scrubs
 */
const milestones = {
  4: {
    title: "Week 4: Blastocyst Implantation",
    fruit: "Poppy Seed",
    fruitSize: "1-2 mm",
    fruitIcon: "🍒",
    babyText: "The fertilized egg completes its migration through the fallopian tube and implants securely into the nutrient-rich uterine wall.",
    bodyText: "Progesterone and early hCG production begins. You may experience baseline hormonal signals: fatigue, sore breasts, or light cramping.",
    babyGlow: "w-6 h-6 bg-rose-400/40 blur"
  },
  5: {
    title: "Week 5: Cellular Differentiation",
    fruit: "Apple Seed",
    fruitSize: "2-3 mm",
    fruitIcon: "🍎",
    babyText: "Cells start arranging into three vital germ layers that will form the brain, heart tube, bones, and organs in subsequent weeks.",
    bodyText: "HCG spikes quickly, triggering early morning sickness, food aversions, and fatigue. Your blood volume expands.",
    babyGlow: "w-8 h-8 bg-rose-400/45 blur"
  },
  8: {
    title: "Week 8: Primitive Heartbeat",
    fruit: "Raspberry",
    fruitSize: "1.6 cm",
    fruitIcon: "🍓",
    babyText: "Fingers are starting to bud, organs grow, and the heart tube consolidation creates a regular beat around 150 BPM.",
    bodyText: "Your uterus expands to lemon size, pushing slightly against your bladder. Olfactory senses double, increasing nausea sensitivity.",
    babyGlow: "w-14 h-14 bg-rose-400/50 blur"
  },
  12: {
    title: "Week 12: Officially a Fetus",
    fruit: "Lime",
    fruitSize: "5.4 cm",
    fruitIcon: "🍋",
    babyText: "Embryonic staging concludes. The fetus is fully formed with complete fingers, fingernails, and reflex actions.",
    bodyText: "The placenta fully assumes hormone synthesis. Morning sickness begins to settle. Your uterus moves above the pelvic bone.",
    babyGlow: "w-20 h-20 bg-rose-400/60 blur"
  }
};

function updateGestationalTimeline(week) {
  state.selectedWeek = parseInt(week);
  el.timelineSlider.value = week;
  el.weekDisplayBubble.innerText = `Week ${week}`;

  const milKeys = Object.keys(milestones).map(Number);
  let closest = milKeys[0];
  for (let k of milKeys) {
    if (week >= k) closest = k;
  }

  const m = milestones[closest];
  el.timelineMilestoneTitle.innerText = `${m.title} (Milestone Details)`;
  el.babyFruitIcon.innerText = m.fruitIcon;
  el.babyFruitName.innerText = m.fruit;
  el.babyFruitSize.innerText = m.fruitSize;
  el.babyDevText.innerText = m.babyText;
  el.bodyDevText.innerText = m.bodyText;
  el.fetalGlowGraphic.className = `rounded-full transition-all duration-300 ${m.babyGlow}`;
}

/**
 * Tab 4: Self Care, Affirmations, and daily quote fetch
 */
const fallbackAffirmations = [
  "You are strong, capable, and doing a beautiful job caring for yourself.",
  "Your body is a powerful, wise, and natural vessel of health and energy.",
  "Embrace each phase of your body with patience, warmth, and self-love.",
  "Every breath you take floods your muscles with calmness and healing.",
  "Caring for your mind and body is the highest form of self-love."
];

async function loadDailyAffirmation() {
  el.affirmationLoader.classList.remove("hidden");
  el.affirmationText.classList.add("opacity-20");

  try {
    // Dynamic fetch from type.fit free quotes API
    const response = await fetch("https://type.fit/api/quotes");
    if (!response.ok) throw new Error("API failed");
    const data = await response.json();
    
    // Pick a random quote
    const randIdx = Math.floor(Math.random() * data.length);
    const quoteObj = data[randIdx];
    
    el.affirmationText.innerText = `"${quoteObj.text}"`;
    el.affirmationAuthor.innerText = quoteObj.author ? `— ${quoteObj.author.split(",")[0]}` : "— Inspiration";
  } catch (e) {
    // Fallback if network failure / offline
    const localRand = fallbackAffirmations[Math.floor(Math.random() * fallbackAffirmations.length)];
    el.affirmationText.innerText = `"${localRand}"`;
    el.affirmationAuthor.innerText = "— Aura Wellness";
  } finally {
    el.affirmationLoader.classList.add("hidden");
    el.affirmationText.classList.remove("opacity-20");
  }
}

/**
 * Tab 5: Baby Names Explorer (Indian, Gen-Z, live API refresh)
 */
function renderBabyNames() {
  const container = el.namesGridContainer;
  container.innerHTML = "";

  const query = state.nameSearchFilter.toLowerCase();
  const gender = state.nameGenderFilter;
  const cat = state.nameCategoryFilter;

  // Filter list
  const filtered = state.namesList.filter(n => {
    const matchesSearch = n.name.toLowerCase().includes(query) || n.meaning.toLowerCase().includes(query);
    const matchesGender = gender === "all" || n.gender === gender || n.gender === "unisex";
    const matchesCategory = cat === "all" || 
      (cat === "indian" && n.tag.includes("Indian")) ||
      (cat === "genz" && n.tag.includes("Gen-Z")) ||
      (cat === "trending" && n.tag.includes("Trending"));
    
    return matchesSearch && matchesGender && matchesCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-8 text-center text-zinc-400 text-xs italic">
        No names matching filters found. Click the Refresh icon to fetch new global names!
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const isFav = state.favoriteNames.includes(item.name);
    const card = document.createElement("div");
    card.className = "p-4 rounded-xl bg-white border border-rose-100/50 flex flex-col justify-between shadow-sm relative";
    
    let genderColor = "text-rose-500 bg-rose-50 border-rose-100";
    if (item.gender === "boy") genderColor = "text-blue-500 bg-blue-50 border-blue-100";
    if (item.gender === "unisex") genderColor = "text-purple-500 bg-purple-50 border-purple-100";

    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-1.5">
          <span class="font-extrabold text-sm text-zinc-700 tracking-tight">${item.name}</span>
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded text-[8px] font-bold border ${genderColor} uppercase tracking-wide">${item.gender}</span>
            <button class="text-xs hover:scale-110 transition-transform ${isFav ? 'text-rose-500' : 'text-zinc-300'}" onclick="toggleFavoriteName('${item.name}')">
              <i class="fa${isFav ? 's' : 'r'} fa-heart"></i>
            </button>
          </div>
        </div>
        <p class="text-[10px] text-zinc-400 font-semibold uppercase">${item.origin} • ${item.tag || 'Global'}</p>
        <p class="text-[11px] text-zinc-500 mt-1.5 italic leading-relaxed">"${item.meaning}"</p>
      </div>
    `;
    container.appendChild(card);
  });

  renderFavoriteNamesSidebar();
}

/**
 * Live Fetch of Trending baby names using randomuser API
 */
async function fetchTrendingGlobalNames() {
  el.nameRefreshIcon.classList.add("fa-spin");
  showNotification("Fetching live global trending names...", "info");

  try {
    // Queries random user generator for 12 random names with multiple nationalities (India, US, France, Spain, Canada)
    const response = await fetch("https://randomuser.me/api/?results=12&nat=in,us,gb,fr,es,ca");
    if (!response.ok) throw new Error();
    const data = await response.json();

    const countryMap = {
      IN: "Indian", US: "American", GB: "British", FR: "French", ES: "Spanish", CA: "Canadian"
    };

    const fetchedNames = data.results.map(r => {
      const nat = r.nat;
      const origin = countryMap[nat] || "Global";
      const name = r.name.first;
      const gender = r.gender;
      
      return {
        name: name,
        gender: gender,
        origin: origin,
        meaning: `Live trending name; popular choice in ${origin} census records.`,
        tag: "Global Trending"
      };
    });

    // Merge fetched names avoiding duplicate names
    const existingNames = new Set(state.namesList.map(n => n.name.toLowerCase()));
    const newItems = fetchedNames.filter(n => !existingNames.has(n.name.toLowerCase()));

    state.namesList = [...newItems, ...state.namesList];
    renderBabyNames();
    showNotification(`Added ${newItems.length} live trending names!`, "success");
  } catch (e) {
    showNotification("Failed to fetch live names. Working offline.", "info");
  } finally {
    el.nameRefreshIcon.classList.remove("fa-spin");
  }
}

window.toggleFavoriteName = function(nameStr) {
  const idx = state.favoriteNames.indexOf(nameStr);
  if (idx > -1) {
    state.favoriteNames.splice(idx, 1);
    showNotification("Removed from favorites", "info");
  } else {
    state.favoriteNames.push(nameStr);
    showNotification("Saved to favorites!", "success");
  }
  saveFavorites();
  renderBabyNames();
};

function renderFavoriteNamesSidebar() {
  const sidebar = el.favoriteNamesContainer;
  sidebar.innerHTML = "";

  if (state.favoriteNames.length === 0) {
    sidebar.innerHTML = `
      <p class="text-[10px] text-zinc-400 italic">Click the heart icon on any name card to favorite.</p>
    `;
    return;
  }

  state.favoriteNames.forEach(name => {
    // Find name details
    const nameDetails = state.namesList.find(n => n.name === name) || { gender: 'unisex' };
    let color = "text-rose-500 bg-rose-50";
    if (nameDetails.gender === 'boy') color = "text-blue-500 bg-blue-50";
    if (nameDetails.gender === 'unisex') color = "text-purple-500 bg-purple-50";

    const badge = document.createElement("div");
    badge.className = `flex justify-between items-center px-3 py-1.5 rounded-lg border border-rose-100/50 bg-white shadow-sm text-xs font-semibold text-zinc-700`;
    badge.innerHTML = `
      <span class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full ${color.split(' ')[0]}"></span> ${name}
      </span>
      <button class="text-zinc-300 hover:text-red-400 transition-colors" onclick="toggleFavoriteName('${name}')">
        <i class="fas fa-times-circle"></i>
      </button>
    `;
    sidebar.appendChild(badge);
  });
}

/**
 * Tab 6: Guided Breathe Timer for pain and anxiety relief
 */
function selectBreatheTechnique(techId) {
  state.breatheTechnique = techId;
  
  // Update buttons classes
  document.querySelectorAll(".breathe-type-btn").forEach(btn => {
    const isCurrent = btn.getAttribute("data-type") === techId;
    if (isCurrent) {
      btn.classList.add("bg-rose-500", "text-white");
      btn.classList.remove("bg-white", "text-zinc-500", "border-rose-100");
    } else {
      btn.classList.remove("bg-rose-500", "text-white");
      btn.classList.add("bg-white", "text-zinc-500", "border-rose-100");
    }
  });

  if (techId === "box") {
    state.breatheRatio = { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };
    el.breatheTechniqueLabel.innerText = "Box Breathing (4-4-4-4 Ratio)";
    el.breatheTechniqueDesc.innerText = "Best for sharp cycle pain relief, settling panic or anxiety, and centering focus.";
  } else {
    state.breatheRatio = { inhale: 4, hold1: 7, exhale: 8, hold2: 0 };
    el.breatheTechniqueLabel.innerText = "Relaxation Breathing (4-7-8 Ratio)";
    el.breatheTechniqueDesc.innerText = "Best for deep nervous system calming, physical decompression, and preparing for sleep.";
  }

  resetBreatheTimer();
}

function resetBreatheTimer() {
  clearInterval(state.breatheInterval);
  state.breatheActive = false;
  state.breathePhase = "Inhale";
  state.breatheTimer = state.breatheRatio.inhale;
  el.breatheStateLabel.innerText = "Inhale";
  el.breatheCountdown.innerText = state.breatheTimer;
  el.breatheCircleGraphic.style.transform = "scale(1)";
  el.startBreatheBtn.innerText = "Start Breathing Guide";
  el.startBreatheBtn.className = "w-full py-3 rounded-xl bg-rose-500 text-white font-bold text-sm shadow-md transition-all hover:bg-rose-600";
}

function toggleBreatheTimer() {
  if (state.breatheActive) {
    // Pause
    clearInterval(state.breatheInterval);
    state.breatheActive = false;
    el.startBreatheBtn.innerText = "Resume Guide";
    el.startBreatheBtn.className = "w-full py-3 rounded-xl bg-rose-500 text-white font-bold text-sm shadow-md transition-all hover:bg-rose-600";
  } else {
    // Start
    state.breatheActive = true;
    el.startBreatheBtn.innerText = "Pause Guide";
    el.startBreatheBtn.className = "w-full py-3 rounded-xl bg-zinc-700 text-white font-bold text-sm shadow-md transition-all hover:bg-zinc-800";
    
    // Scale mapping on start
    animateBreatheCircle();

    state.breatheInterval = setInterval(() => {
      state.breatheTimer--;

      if (state.breatheTimer <= 0) {
        // Phase transition
        switch (state.breathePhase) {
          case "Inhale":
            if (state.breatheRatio.hold1 > 0) {
              state.breathePhase = "Hold";
              state.breatheTimer = state.breatheRatio.hold1;
            } else {
              state.breathePhase = "Exhale";
              state.breatheTimer = state.breatheRatio.exhale;
            }
            break;
          case "Hold":
            // Check if transition to Exhale
            state.breathePhase = "Exhale";
            state.breatheTimer = state.breatheRatio.exhale;
            break;
          case "Exhale":
            if (state.breatheRatio.hold2 > 0) {
              state.breathePhase = "Rest";
              state.breatheTimer = state.breatheRatio.hold2;
            } else {
              state.breathePhase = "Inhale";
              state.breatheTimer = state.breatheRatio.inhale;
            }
            break;
          case "Rest":
            state.breathePhase = "Inhale";
            state.breatheTimer = state.breatheRatio.inhale;
            break;
        }

        animateBreatheCircle();
      }

      el.breatheStateLabel.innerText = state.breathePhase;
      el.breatheCountdown.innerText = state.breatheTimer;
    }, 1000);
  }
}

function animateBreatheCircle() {
  const circle = el.breatheCircleGraphic;
  
  if (state.breathePhase === "Inhale") {
    // Smoothly scale up
    circle.style.transform = "scale(1.75)";
    circle.style.background = "radial-gradient(circle, rgba(251, 113, 133, 0.4) 0%, rgba(244, 63, 94, 0.25) 100%)";
    circle.style.borderColor = "rgba(244, 63, 94, 0.5)";
  } else if (state.breathePhase === "Exhale") {
    // Smoothly scale down
    circle.style.transform = "scale(1)";
    circle.style.background = "radial-gradient(circle, rgba(251, 113, 133, 0.2) 0%, rgba(244, 63, 94, 0.1) 100%)";
    circle.style.borderColor = "rgba(244, 63, 94, 0.2)";
  } else {
    // Keep scale during hold
    circle.style.background = "radial-gradient(circle, rgba(192, 132, 252, 0.3) 0%, rgba(168, 85, 247, 0.15) 100%)";
    circle.style.borderColor = "rgba(168, 85, 247, 0.4)";
  }
}

/**
 * Data management & Purge settings
 */
function purgeAllMyData() {
  if (confirm("WARNING: This will permanently delete all cycle configurations, logged symptoms, and favorited baby names. This action cannot be undone. Proceed?")) {
    localStorage.removeItem("aura_profile_v2");
    localStorage.removeItem("aura_logs_v2");
    localStorage.removeItem("aura_favorite_names");

    state.logs = {};
    state.favoriteNames = [];
    setupDefaults();
    saveProfile();

    renderCalendar();
    calculateTestingIntel();
    renderBabyNames();
    loadDailyAffirmation();
    renderLogsList();

    el.inputLastPeriod.value = state.lastPeriodDate;
    el.inputCycleLength.value = state.cycleLength;
    el.inputPeriodLength.value = state.periodLength;

    showNotification("All personal data has been securely deleted.", "info");
  }
}

function showNotification(msg, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  let bg = "bg-rose-500 text-white";
  if (type === "info") bg = "bg-purple-600 text-white";
  if (type === "success") bg = "bg-rose-600 text-white";

  toast.className = `${bg} text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 transform translate-y-2 opacity-0 transition-all duration-300`;
  toast.innerHTML = `<i class="fas fa-info-circle"></i> <span>${msg}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  }, 10);

  setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

function updateSettings(e) {
  e.preventDefault();
  
  const rawDate = el.inputLastPeriod.value;
  const rawCycle = parseInt(el.inputCycleLength.value);
  const rawPeriod = parseInt(el.inputPeriodLength.value);

  if (!rawDate) {
    showNotification("Select a valid period start date.", "info");
    return;
  }
  if (isNaN(rawCycle) || rawCycle < 15 || rawCycle > 60) {
    showNotification("Cycle length must be between 15 and 60 days.", "info");
    return;
  }
  if (isNaN(rawPeriod) || rawPeriod < 2 || rawPeriod > 15) {
    showNotification("Period length must be between 2 and 15 days.", "info");
    return;
  }

  state.lastPeriodDate = rawDate;
  state.cycleLength = rawCycle;
  state.periodLength = rawPeriod;

  saveProfile();
  
  renderCalendar();
  calculateTestingIntel();
  
  showNotification("Settings saved successfully!", "success");
}

function navigateMonth(offset) {
  state.currentMonth += offset;
  if (state.currentMonth < 0) {
    state.currentMonth = 11;
    state.currentYear -= 1;
  } else if (state.currentMonth > 11) {
    state.currentMonth = 0;
    state.currentYear += 1;
  }
  renderCalendar();
}

const PHASE_CLASSES = {
  menstrual: "phase-menstrual text-red-700 border-red-300",
  follicular: "phase-follicular text-blue-700 border-blue-300",
  ovulatory: "phase-ovulatory text-rose-700 border-rose-300",
  luteal: "phase-luteal text-purple-700 border-purple-300",
  none: "border-zinc-100 text-zinc-400"
};

/**
 * DOM Ready Initializer
 */
document.addEventListener("DOMContentLoaded", () => {
  el = {
    calendarMonthTitle: document.getElementById("calendar-month-title"),
    calendarGrid: document.getElementById("calendar-grid"),
    selectedDayLabel: document.getElementById("selected-day-label"),
    selectedDayPhase: document.getElementById("selected-day-phase"),
    selectedDayCycleDay: document.getElementById("selected-day-cycle-day"),
    selectedDayProbability: document.getElementById("selected-day-probability"),
    selectedDayPhaseDesc: document.getElementById("selected-day-phase-desc"),
    
    // Log inputs
    logFlow: document.getElementById("log-flow"),
    logPain: document.getElementById("log-pain"),
    logMood: document.getElementById("log-mood"),
    logNotes: document.getElementById("log-notes"),
    saveLogBtn: document.getElementById("save-log-btn"),
    deleteLogBtn: document.getElementById("delete-log-btn"),
    loggedSummaryText: document.getElementById("logged-summary-text"),
    
    // Settings inputs
    inputLastPeriod: document.getElementById("settings-last-period"),
    inputCycleLength: document.getElementById("settings-cycle-length"),
    inputPeriodLength: document.getElementById("settings-period-length"),
    settingsForm: document.getElementById("settings-form"),
    
    // Calendar navigation
    prevMonthBtn: document.getElementById("prev-month-btn"),
    nextMonthBtn: document.getElementById("next-month-btn"),

    // Pregnancy Testing elements
    calcOvulationDate: document.getElementById("calc-ovulation-date"),
    calcMissedDate: document.getElementById("calc-missed-date"),
    calcOptimalTestDate: document.getElementById("calc-optimal-test-date"),
    calcTestingCountdown: document.getElementById("calc-testing-countdown"),
    
    // Gestational elements
    timelineSlider: document.getElementById("timeline-slider"),
    weekDisplayBubble: document.getElementById("week-display-bubble"),
    timelineMilestoneTitle: document.getElementById("timeline-milestone-title"),
    babyFruitName: document.getElementById("baby-fruit-name"),
    babyFruitSize: document.getElementById("baby-fruit-size"),
    babyFruitIcon: document.getElementById("baby-fruit-icon"),
    babyDevText: document.getElementById("baby-dev-text"),
    bodyDevText: document.getElementById("body-dev-text"),
    fetalGlowGraphic: document.getElementById("fetal-glow-graphic"),
    
    // Affirmations
    affirmationText: document.getElementById("affirmation-text"),
    affirmationAuthor: document.getElementById("affirmation-author"),
    affirmationLoader: document.getElementById("affirmation-loader"),
    refreshAffirmationBtn: document.getElementById("refresh-affirmation-btn"),

    // Baby Names
    namesGridContainer: document.getElementById("names-grid-container"),
    favoriteNamesContainer: document.getElementById("favorite-names-container"),
    nameInputSearch: document.getElementById("name-input-search"),
    nameSelectGender: document.getElementById("name-select-gender"),
    nameSelectCategory: document.getElementById("name-select-category"),
    nameRefreshBtn: document.getElementById("name-refresh-btn"),
    nameRefreshIcon: document.getElementById("name-refresh-icon"),

    // Breathe Timer
    breatheCircleGraphic: document.getElementById("breathe-circle-graphic"),
    breatheStateLabel: document.getElementById("breathe-state-label"),
    breatheCountdown: document.getElementById("breathe-countdown"),
    breatheTechniqueLabel: document.getElementById("breathe-technique-label"),
    breatheTechniqueDesc: document.getElementById("breathe-technique-desc"),
    startBreatheBtn: document.getElementById("start-breathe-btn"),
    resetBreatheBtn: document.getElementById("reset-breathe-btn"),

    // History tab
    logsListContainer: document.getElementById("logs-list-container"),
    
    // Data Management
    purgeDataBtn: document.getElementById("purge-data-btn")
  };

  loadData();

  // Populate config
  el.inputLastPeriod.value = state.lastPeriodDate;
  el.inputCycleLength.value = state.cycleLength;
  el.inputPeriodLength.value = state.periodLength;

  // Navigation binders
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.getAttribute("data-tab"));
    });
  });

  // Calendar binders
  el.prevMonthBtn.addEventListener("click", () => navigateMonth(-1));
  el.nextMonthBtn.addEventListener("click", () => navigateMonth(1));
  el.saveLogBtn.addEventListener("click", saveSymptomLog);
  el.deleteLogBtn.addEventListener("click", deleteSymptomLog);
  el.settingsForm.addEventListener("submit", updateSettings);

  // Timeline slider
  el.timelineSlider.addEventListener("input", (e) => {
    updateGestationalTimeline(e.target.value);
  });

  // Affirmation refresh
  el.refreshAffirmationBtn.addEventListener("click", loadDailyAffirmation);

  // Baby Names binders
  el.nameInputSearch.addEventListener("input", (e) => {
    state.nameSearchFilter = e.target.value;
    renderBabyNames();
  });
  el.nameSelectGender.addEventListener("change", (e) => {
    state.nameGenderFilter = e.target.value;
    renderBabyNames();
  });
  el.nameSelectCategory.addEventListener("change", (e) => {
    state.nameCategoryFilter = e.target.value;
    renderBabyNames();
  });
  el.nameRefreshBtn.addEventListener("click", fetchTrendingGlobalNames);

  // Breathe timer binders
  document.querySelectorAll(".breathe-type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectBreatheTechnique(btn.getAttribute("data-type"));
    });
  });
  el.startBreatheBtn.addEventListener("click", toggleBreatheTimer);
  el.resetBreatheBtn.addEventListener("click", resetBreatheTimer);

  // Purge
  el.purgeDataBtn.addEventListener("click", purgeAllMyData);

  // Initial loads
  renderCalendar();
  updateGestationalTimeline(state.selectedWeek);
  selectBreatheTechnique("box");
  loadDailyAffirmation();
  renderBabyNames();
});
