/**
 * AuraHealth - Client-Side Women's Health SPA Logic
 * Features:
 *  - Cycle Visualization (Calendar view with cycle phase overlays)
 *  - Pregnancy Testing Intelligence
 *  - Gestational Milestone Timeline
 *  - Symptom Triage & Clinical Export Engine
 *  - LocalStorage Privacy Architecture
 */

// Global App State
const state = {
  // Cycle config defaults
  cycleLength: 28,
  periodLength: 5,
  lastPeriodDate: "", // YYYY-MM-DD
  
  // Current calendar navigation
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(), // 0-indexed
  
  // Selected day on calendar for logging
  selectedDateStr: "", // YYYY-MM-DD
  
  // Active Tab
  activeTab: "fertility", // fertility, testing, timeline, triage, logs
  
  // Gestational Timeline
  selectedWeek: 4,
  
  // Local logs & user profile
  logs: {},
  profile: {}
};

// Phase color mapping
const PHASE_CLASSES = {
  menstrual: "phase-menstrual text-red-400 border-red-500",
  follicular: "phase-follicular text-blue-400 border-blue-500",
  ovulatory: "phase-ovulatory text-rose-400 border-rose-500",
  luteal: "phase-luteal text-purple-400 border-purple-500",
  none: "border-zinc-800 text-zinc-400"
};

// Document Elements (populated in init)
let el = {};

/**
 * Setup default dates and profiles
 */
function setupDefaults() {
  // Set default last period date to 10 days ago so the user lands in a visible cycle phase
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 10);
  const yyyy = defaultDate.getFullYear();
  const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
  const dd = String(defaultDate.getDate()).padStart(2, '0');
  state.lastPeriodDate = `${yyyy}-${mm}-${dd}`;
  
  state.selectedDateStr = getTodayStr();
}

/**
 * Helper to get YYYY-MM-DD of today
 */
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Load settings and logs from LocalStorage
 */
function loadData() {
  try {
    const profileJson = localStorage.getItem("aura_profile");
    if (profileJson) {
      const prof = JSON.parse(profileJson);
      state.cycleLength = parseInt(prof.cycleLength) || 28;
      state.periodLength = parseInt(prof.periodLength) || 5;
      state.lastPeriodDate = prof.lastPeriodDate || state.lastPeriodDate;
    } else {
      setupDefaults();
      saveProfile();
    }

    const logsJson = localStorage.getItem("aura_logs");
    if (logsJson) {
      state.logs = JSON.parse(logsJson);
    } else {
      state.logs = {};
    }
  } catch (e) {
    console.error("Error reading localStorage: ", e);
    setupDefaults();
  }
}

/**
 * Save configurations to LocalStorage
 */
function saveProfile() {
  const prof = {
    cycleLength: state.cycleLength,
    periodLength: state.periodLength,
    lastPeriodDate: state.lastPeriodDate
  };
  localStorage.setItem("aura_profile", JSON.stringify(prof));
}

/**
 * Save logs to LocalStorage
 */
function saveLogs() {
  localStorage.setItem("aura_logs", JSON.stringify(state.logs));
}

/**
 * Core Algorithm: Calculates fertility metrics for a given date
 * @param {Date} targetDate 
 * @returns {object} Phase info
 */
function calculateCyclePhase(targetDate) {
  if (!state.lastPeriodDate) {
    return { phase: "none", label: "Unknown", probability: "0%", desc: "Please set last period date.", index: 0 };
  }

  const startDate = new Date(state.lastPeriodDate + "T00:00:00");
  const checkDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  // Calculate difference in days
  const timeDiff = checkDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // Handle positive and negative cycle offsets mathematically
  const L = state.cycleLength;
  const P = state.periodLength;
  const cycleDay = ((diffDays % L) + L) % L + 1; // 1-based index of day in cycle
  
  // Phase mapping rules
  if (cycleDay >= 1 && cycleDay <= P) {
    return {
      phase: "menstrual",
      label: "Menstrual Phase",
      probability: "Low (<1%)",
      probValue: 1,
      color: "text-red-400",
      desc: "Your body is shedding the uterine lining. Hormone levels (estrogen and progesterone) are at their lowest.",
      cycleDay: cycleDay
    };
  } else if (cycleDay > P && cycleDay <= 10) {
    // Gradual climb in follicular
    // day P+1 to 10
    const progress = (cycleDay - P) / (11 - P);
    const prob = Math.round(5 + progress * 20); // 5% to 25%
    return {
      phase: "follicular",
      label: "Follicular Phase",
      probability: `Gradual Climb (${prob}%)`,
      probValue: prob,
      color: "text-blue-400",
      desc: "Estrogen rises as your body prepares a follicle for ovulation. Uterine lining begins to thicken.",
      cycleDay: cycleDay
    };
  } else if (cycleDay >= 11 && cycleDay <= 16) {
    // Ovulatory Peak Window
    // Peak probability is days 13-14 (up to 95+%)
    let prob = 35;
    if (cycleDay === 11) prob = 35;
    else if (cycleDay === 12) prob = 60;
    else if (cycleDay === 13) prob = 85;
    else if (cycleDay === 14) prob = 98;
    else if (cycleDay === 15) prob = 80;
    else if (cycleDay === 16) prob = 30;

    return {
      phase: "ovulatory",
      label: "Ovulatory Peak Window",
      probability: `Peak Probability (${prob}%)`,
      probValue: prob,
      color: "text-rose-400",
      desc: "Luteinizing Hormone (LH) surges, triggering the release of a mature egg. This is your most fertile window.",
      cycleDay: cycleDay
    };
  } else {
    // Luteal phase
    // Rapid drop to lowest
    const daysSinceOvulation = cycleDay - 16;
    const remainingLutealDays = L - 16;
    const progress = daysSinceOvulation / remainingLutealDays;
    const prob = Math.max(1, Math.round(20 - progress * 20)); // drops to <1%

    return {
      phase: "luteal",
      label: "Luteal Phase",
      probability: `Rapid Drop to Lowest (${prob}%)`,
      probValue: prob,
      color: "text-purple-400",
      desc: "Progesterone peaks to support potential fertilization, then drops if no pregnancy occurs, triggers PMS symptoms.",
      cycleDay: cycleDay
    };
  }
}

/**
 * Tab Switching Controller
 * @param {string} tabId 
 */
function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update Navigation UI
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    const isCurrent = btn.getAttribute("data-tab") === tabId;
    if (isCurrent) {
      btn.classList.add("text-rose-400", "border-rose-400", "bg-rose-500/10");
      btn.classList.remove("text-zinc-400", "border-transparent", "hover:bg-zinc-800/40");
    } else {
      btn.classList.remove("text-rose-400", "border-rose-400", "bg-rose-500/10");
      btn.classList.add("text-zinc-400", "border-transparent", "hover:bg-zinc-800/40");
    }
  });

  // Update Page Panels
  document.querySelectorAll(".tab-panel").forEach(panel => {
    if (panel.id === `${tabId}-panel`) {
      panel.classList.remove("hidden");
    } else {
      panel.classList.add("hidden");
    }
  });

  // Action overrides
  if (tabId === "fertility") {
    renderCalendar();
  } else if (tabId === "testing") {
    calculateTestingIntel();
  } else if (tabId === "logs") {
    renderLogsList();
  }
}

/**
 * Render standard Gregorian monthly grid overlaid with cycle phases
 */
function renderCalendar() {
  const year = state.currentYear;
  const month = state.currentMonth;

  // Header display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  el.calendarMonthTitle.innerText = `${monthNames[month]} ${year}`;

  // Get date metrics
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Adjust so Monday is first day of the week
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Clear previous grid
  el.calendarGrid.innerHTML = "";

  // Render blanks/padding for previous month days
  for (let i = 0; i < adjustedFirstDay; i++) {
    const blank = document.createElement("div");
    blank.className = "h-16 md:h-20 bg-zinc-950/20 border border-zinc-900/40 rounded-lg opacity-25";
    el.calendarGrid.appendChild(blank);
  }

  const todayStr = getTodayStr();

  // Render days of current month
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const cycleInfo = calculateCyclePhase(dateObj);
    const dayCell = document.createElement("div");
    
    // Base styles
    dayCell.className = `h-16 md:h-20 p-2 border rounded-lg cursor-pointer flex flex-col justify-between transition-all duration-200 glass-panel-hover ${PHASE_CLASSES[cycleInfo.phase]}`;
    
    // Content layout
    let logBadge = "";
    if (state.logs[dateStr]) {
      logBadge = `<span class="w-2 h-2 rounded-full bg-rose-400 inline-block animate-pulse" title="Symptom Logged"></span>`;
    }

    dayCell.innerHTML = `
      <div class="flex justify-between items-start">
        <span class="text-xs md:text-sm font-semibold">${d}</span>
        ${logBadge}
      </div>
      <div class="text-[9px] md:text-[11px] leading-tight font-medium opacity-85 truncate">
        ${cycleInfo.label.split(" ")[0]}
      </div>
    `;

    // Highlighters
    if (dateStr === todayStr) {
      dayCell.classList.add("day-today");
    }
    if (dateStr === state.selectedDateStr) {
      dayCell.classList.add("day-selected");
    }

    // Interaction handler
    dayCell.addEventListener("click", () => {
      state.selectedDateStr = dateStr;
      
      // Re-render grid to show selected highlights
      document.querySelectorAll(".day-selected").forEach(c => c.classList.remove("day-selected"));
      dayCell.classList.add("day-selected");

      updateSelectedDayPanel(dateStr, cycleInfo);
    });

    el.calendarGrid.appendChild(dayCell);
  }

  // Update selection card for default/current selection
  const selectedDate = new Date(state.selectedDateStr + "T00:00:00");
  const initCycleInfo = calculateCyclePhase(selectedDate);
  updateSelectedDayPanel(state.selectedDateStr, initCycleInfo);
}

/**
 * Sidebar details & log symptoms widget for selected calendar day
 */
function updateSelectedDayPanel(dateStr, cycleInfo) {
  const d = new Date(dateStr + "T00:00:00");
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.selectedDayLabel.innerText = d.toLocaleDateString('en-US', options);
  
  // Phase details
  el.selectedDayPhase.innerText = cycleInfo.label;
  el.selectedDayPhase.className = `text-sm font-bold tracking-wide ${cycleInfo.color}`;
  
  el.selectedDayCycleDay.innerText = cycleInfo.cycleDay ? `Cycle Day ${cycleInfo.cycleDay}` : "N/A";
  el.selectedDayProbability.innerText = cycleInfo.probability;
  el.selectedDayPhaseDesc.innerText = cycleInfo.desc;

  // Load existing symptoms
  const log = state.logs[dateStr] || {};
  el.logFlow.value = log.flow || "none";
  el.logPain.value = log.pain || "none";
  el.logMood.value = log.mood || "good";
  el.logNotes.value = log.notes || "";
  
  // Display logged summary
  if (state.logs[dateStr]) {
    el.loggedSummaryText.innerHTML = `
      <div class="mt-2 text-xs border-t border-zinc-800 pt-2 text-zinc-300">
        <strong>Currently Logged:</strong><br/>
        • Flow: <span class="capitalize text-rose-300 font-semibold">${log.flow || 'None'}</span><br/>
        • Pain: <span class="capitalize text-rose-300 font-semibold">${log.pain || 'None'}</span><br/>
        • Mood: <span class="capitalize text-rose-300 font-semibold">${log.mood || 'Standard'}</span><br/>
        ${log.notes ? `• Notes: <span class="italic text-zinc-400">"${log.notes}"</span>` : ""}
      </div>
    `;
    el.deleteLogBtn.classList.remove("hidden");
  } else {
    el.loggedSummaryText.innerHTML = `<p class="text-xs text-zinc-500 italic mt-2">No symptoms logged for this date.</p>`;
    el.deleteLogBtn.classList.add("hidden");
  }
}

/**
 * Handle saving symptoms logs
 */
function saveSymptomLog() {
  const dateStr = state.selectedDateStr;
  const flow = el.logFlow.value;
  const pain = el.logPain.value;
  const mood = el.logMood.value;
  const notes = el.logNotes.value.trim();

  // If all are standard/empty, check if we should delete or just save default
  state.logs[dateStr] = {
    flow: flow,
    pain: pain,
    mood: mood,
    notes: notes
  };

  saveLogs();
  renderCalendar();
  showNotification("Symptoms Logged Successfully!", "success");
}

/**
 * Handle deleting symptoms logs
 */
function deleteSymptomLog() {
  const dateStr = state.selectedDateStr;
  if (state.logs[dateStr]) {
    delete state.logs[dateStr];
    saveLogs();
    renderCalendar();
    showNotification("Logged Data Cleared", "info");
  }
}

/**
 * Renders the full checklist history in the data logs tab
 */
function renderLogsList() {
  const container = el.logsListContainer;
  container.innerHTML = "";

  const loggedDates = Object.keys(state.logs).sort((a, b) => new Date(b) - new Date(a));

  if (loggedDates.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-zinc-500 glass-panel rounded-xl border border-dashed border-zinc-800">
        <i class="fas fa-notes-medical text-3xl mb-3 text-zinc-600"></i>
        <p>No symptoms logged yet.</p>
        <p class="text-xs mt-1 text-zinc-600">Select any day on the calendar visualizer to log symptoms.</p>
      </div>
    `;
    return;
  }

  loggedDates.forEach(dateStr => {
    const log = state.logs[dateStr];
    const logDate = new Date(dateStr + "T00:00:00");
    const formattedDate = logDate.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
    
    // Cycle metrics relative to this log date
    const cycleInfo = calculateCyclePhase(logDate);

    const logCard = document.createElement("div");
    logCard.className = "glass-panel p-4 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4";
    
    logCard.innerHTML = `
      <div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-white text-sm">${formattedDate}</span>
          <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${cycleInfo.color} bg-white/5 border border-current">
            ${cycleInfo.label}
          </span>
        </div>
        <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
          <span>Flow: <strong class="text-zinc-200 capitalize">${log.flow}</strong></span>
          <span>Pain: <strong class="text-zinc-200 capitalize">${log.pain}</strong></span>
          <span>Mood: <strong class="text-zinc-200 capitalize">${log.mood}</strong></span>
        </div>
        ${log.notes ? `<div class="mt-2 text-xs text-zinc-500 bg-black/20 p-2 rounded italic border-l-2 border-rose-400">"${log.notes}"</div>` : ""}
      </div>
      <div>
        <button class="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all" onclick="deleteHistoryLog('${dateStr}')">
          <i class="fas fa-trash-alt mr-1"></i> Delete
        </button>
      </div>
    `;
    container.appendChild(logCard);
  });
}

// Global scope mapping for delete history buttons
window.deleteHistoryLog = function(dateStr) {
  if (confirm(`Are you sure you want to delete the log for ${dateStr}?`)) {
    delete state.logs[dateStr];
    saveLogs();
    renderLogsList();
    showNotification("Log deleted", "info");
  }
};

/**
 * Tab 2: "When to Test" calculator logic
 */
function calculateTestingIntel() {
  if (!state.lastPeriodDate) return;

  const startDate = new Date(state.lastPeriodDate + "T00:00:00");
  
  // Cycle definitions
  const cycleL = state.cycleLength;
  
  // Ovulation typically occurs 14 days before the next expected period
  const ovulationOffset = cycleL - 14;
  const estOvulationDate = new Date(startDate.getTime());
  estOvulationDate.setDate(estOvulationDate.getDate() + ovulationOffset);
  
  // Test dates: Missed period (which matches cycleLength days from last period start)
  const missedPeriodDate = new Date(startDate.getTime());
  missedPeriodDate.setDate(missedPeriodDate.getDate() + cycleL);
  
  // Standard logic: Exactly 14 days after estimated ovulation
  const optimalTestingDate = new Date(estOvulationDate.getTime());
  optimalTestingDate.setDate(optimalTestingDate.getDate() + 14);

  // Early window (e.g. 10-12 days post ovulation)
  const earlyTestingDate = new Date(estOvulationDate.getTime());
  earlyTestingDate.setDate(earlyTestingDate.getDate() + 11);

  // Dates formatting
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  
  el.calcOvulationDate.innerText = estOvulationDate.toLocaleDateString('en-US', options);
  el.calcMissedDate.innerText = missedPeriodDate.toLocaleDateString('en-US', options);
  el.calcOptimalTestDate.innerText = optimalTestingDate.toLocaleDateString('en-US', options);
  
  // Calculate relative counters
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const diffTimeOptimal = optimalTestingDate.getTime() - today.getTime();
  const diffDaysOptimal = Math.ceil(diffTimeOptimal / (1000 * 60 * 60 * 24));
  
  const diffTimeEarly = earlyTestingDate.getTime() - today.getTime();
  const diffDaysEarly = Math.ceil(diffTimeEarly / (1000 * 60 * 60 * 24));

  // Render user alert countdowns
  let statusHTML = "";
  if (diffDaysOptimal > 0) {
    statusHTML = `
      <div class="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200">
        <div class="flex items-center gap-2 mb-1">
          <i class="fas fa-clock text-lg"></i>
          <span class="font-bold">Wait to Test: ${diffDaysOptimal} Days Remaining</span>
        </div>
        <p class="text-xs opacity-90">
          Testing before <span class="font-semibold text-rose-300">${optimalTestingDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span> may lead to a <strong>False Negative</strong> due to low hormonal concentrations in urine.
        </p>
      </div>
    `;
  } else {
    statusHTML = `
      <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
        <div class="flex items-center gap-2 mb-1">
          <i class="fas fa-check-circle text-lg"></i>
          <span class="font-bold">Optimal Testing Window Open</span>
        </div>
        <p class="text-xs opacity-90">
          You are past the threshold (missed period). A urine test conducted now will deliver high reliability (>99%).
        </p>
      </div>
    `;
  }
  
  el.calcTestingCountdown.innerHTML = statusHTML;
}

/**
 * Tab 3: Gestational Timeline and scrub controller
 */
const milestones = {
  4: {
    title: "Week 4: Blastocyst Implantation",
    fruit: "Poppy Seed",
    fruitSize: "1-2 mm",
    fruitIcon: "🍒", // Representing seed/tiny scale
    babyText: "The fertilized egg, now a blastocyst, completes its journey down the fallopian tube and implants firmly into the vascular uterine wall. Rapid cell division splits the cells into the embryo and the placenta.",
    bodyText: "High level progesterone and hCG production begins. You may experience baseline hormonal shifts like subtle implantation cramping, extreme fatigue, early breast tenderness, or light nausea triggers.",
    babyGlow: "w-6 h-6 bg-rose-500/40 blur"
  },
  5: {
    title: "Week 5: System Foundations",
    fruit: "Apple Seed",
    fruitSize: "2-3 mm",
    fruitIcon: "🍎",
    babyText: "The embryonic disc splits into three germ layers: the ectoderm (forms brain/nervous system), mesoderm (skeletal/circulatory system), and endoderm (lungs/organs). The primitive heart begins forming.",
    bodyText: "Morning sickness symptoms may intensify as hCG levels double every 48 hours. Frequent urination becomes noticeable as your blood volume expands, and mood fluctuations occur due to rapid hormonal surges.",
    babyGlow: "w-8 h-8 bg-rose-500/45 blur"
  },
  8: {
    title: "Week 8: The Embryonic Heartbeat",
    fruit: "Raspberry",
    fruitSize: "1.6 cm",
    fruitIcon: "🍓",
    babyText: "Fingers and toes are webbing, the heart tube beat consolidates at roughly 150 BPM (twice the adult rate), and neural pathways in the brain develop rapidly. Hands and feet start flexing.",
    bodyText: "Your uterus is expanding to the size of a lemon, resting on your bladder. Estrogen peaks, which can trigger headaches, olfactory sensitivities, and skin changes. Physical signs are still hidden externally.",
    babyGlow: "w-16 h-16 bg-rose-500/50 blur"
  },
  12: {
    title: "Week 12: Transition to Fetal Stage",
    fruit: "Lime",
    fruitSize: "5.4 cm",
    fruitIcon: "🍋",
    babyText: "The embryonic stage concludes; the baby is officially a fetus. Organs are fully formed, limbs are complete with fingernails, and the kidneys begin filtering amniotic fluid. Refined movements occur.",
    bodyText: "The placenta assumes principal responsibility for progesterone production. Morning sickness and fatigue typically begin to subside. Your uterus rises above the pelvic bone, reducing bladder pressure.",
    babyGlow: "w-24 h-24 bg-rose-500/60 blur"
  }
};

function updateGestationalTimeline(week) {
  state.selectedWeek = parseInt(week);
  
  // Set slider value
  el.timelineSlider.value = week;
  el.weekDisplayBubble.innerText = `Week ${week}`;
  
  // Find closest milestone data
  const milKeys = Object.keys(milestones).map(Number);
  // Find the exact or closest milestone lower or equal to selected week
  let closestMil = milKeys[0];
  for (let k of milKeys) {
    if (week >= k) {
      closestMil = k;
    }
  }
  
  const m = milestones[closestMil];
  
  el.timelineMilestoneTitle.innerText = `${m.title} (Milestone View)`;
  el.babyFruitName.innerText = m.fruit;
  el.babyFruitSize.innerText = m.fruitSize;
  el.babyFruitIcon.innerText = m.fruitIcon;
  el.babyDevText.innerText = m.babyText;
  el.bodyDevText.innerText = m.bodyText;
  
  // Update structural render of visual scale
  el.fetalGlowGraphic.className = `rounded-full transition-all duration-300 ${m.babyGlow}`;
}

/**
 * Tab 4: Clinical Triage & Risk Matrix logic
 */
function evaluateTriageSymptoms() {
  const symptomPelvic = document.querySelector('input[name="triage-pelvic"]:checked')?.value || "none";
  const symptomBleeding = document.querySelector('input[name="triage-bleeding"]:checked')?.value || "none";
  const symptomAmenorrhea = el.triageAmenorrhea.checked;
  const symptomFever = el.triageFever.checked;
  const symptomDizzy = el.triageDizzy.checked;
  const triageNotes = el.triageNotes.value.trim();

  // Evaluate assessment
  let riskLevel = "normal";
  let alertTitle = "Routine Wellness Recommendations";
  let alertDesc = "Your inputs show no high-risk clinical markers at this time. Standard preventative care, continuous hydration, tracking logs, and a regular schedule are advised.";
  let alertInstructions = "Continue tracking your daily cycle dates, maintain a balanced diet rich in leafy greens and iron, and follow up with a routine wellness consultation with a gynecologist or practitioner annually.";
  let alertClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-200";

  // Check severe rules (Red flags)
  if (symptomPelvic === "severe" || symptomBleeding === "heavy") {
    riskLevel = "red";
    alertTitle = "CRITICAL: Urgent Medical Consultation Required";
    alertDesc = "You have flagged severe pelvic pain or heavy bleeding. These symptoms can be clinical markers for ectopic pregnancy risks, miscarriage, or severe pelvic inflammatory pathology.";
    alertInstructions = "<strong>IMMEDIATE ACTION REQUIRED:</strong> Please proceed to the nearest emergency obstetric care facility or contact your gynecologist immediately. Avoid self-treatment or waiting.";
    alertClass = "bg-red-500/15 border-red-500/30 text-red-200";
  } 
  // Check moderate rules (Yellow flags)
  else if (symptomPelvic === "mild" || symptomBleeding === "spotting" || symptomAmenorrhea || symptomFever || symptomDizzy) {
    riskLevel = "yellow";
    alertTitle = "WARNING: Professional Gynecologist Consultation Advised";
    
    let reasons = [];
    if (symptomPelvic === "mild") reasons.push("persistent mild pain");
    if (symptomBleeding === "spotting") reasons.push("unexplained light spotting");
    if (symptomAmenorrhea) reasons.push("amenorrhea exceeding 90 consecutive days (potential hormone imbalance or PCOS)");
    if (symptomFever) reasons.push("persistent fever over 100.4°F");
    if (symptomDizzy) reasons.push("severe dizziness or fainting");

    alertDesc = `You logged markers requiring clinical assessment: ${reasons.join(", ")}.`;
    alertInstructions = "<strong>ACTION ADVISED:</strong> Schedule an appointment with a licensed gynaecologist/obstetrician within the next 48-72 hours. Present your logged cycle metrics and symptoms history during the consultation.";
    alertClass = "bg-amber-500/10 border-amber-500/30 text-amber-200";
  }

  // Display results
  el.triageResultsBox.className = `p-5 rounded-xl border ${alertClass} transition-all duration-300`;
  el.triageResultsTitle.innerText = alertTitle;
  el.triageResultsDesc.innerHTML = alertDesc;
  el.triageResultsAction.innerHTML = alertInstructions;
  el.triageResultsBox.classList.remove("hidden");

  // Keep triage parameters on state for export
  state.lastTriageAssessment = {
    evaluatedAt: new Date().toLocaleString(),
    riskLevel: riskLevel,
    title: alertTitle,
    desc: alertDesc.replace(/<[^>]*>/g, ''), // Strip tags for print
    action: alertInstructions.replace(/<[^>]*>/g, ''),
    symptoms: {
      pelvicPain: symptomPelvic,
      bleedingSpotting: symptomBleeding,
      amenorrhea: symptomAmenorrhea,
      fever: symptomFever,
      dizziness: symptomDizzy
    },
    notes: triageNotes
  };

  // Scroll to results
  el.triageResultsBox.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Build and trigger a clean printable clinical consultation document
 */
function exportDoctorReport() {
  if (!state.lastTriageAssessment) {
    alert("Please complete the triage form and generate an assessment first.");
    return;
  }

  const assessment = state.lastTriageAssessment;
  
  // Format HTML Template inside #print-report-area
  const printArea = document.getElementById("print-report-area");
  
  // Gather user profiles
  const profileDetails = `
    <strong>Last Known Period Date:</strong> ${state.lastPeriodDate}<br/>
    <strong>Average Cycle Duration:</strong> ${state.cycleLength} Days<br/>
    <strong>Menstruation Window:</strong> ${state.periodLength} Days
  `;

  // Process checklist representation
  const s = assessment.symptoms;
  const pelvicText = s.pelvicPain === "severe" ? "🔴 Severe Pain" : (s.pelvicPain === "mild" ? "🟡 Mild Pain" : "🟢 None");
  const bleedText = s.bleedingSpotting === "heavy" ? "🔴 Heavy Bleeding" : (s.bleedingSpotting === "spotting" ? "🟡 Light Spotting" : "🟢 None");
  
  printArea.innerHTML = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #000;">
      <div style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">AURA HEALTH</h1>
          <p style="margin: 0; font-size: 12px; color: #555;">Clinical Symptom Triage Report</p>
        </div>
        <div style="text-align: right; font-size: 11px; color: #555;">
          <strong>Date Generated:</strong> ${assessment.evaluatedAt}<br/>
          <strong>Security Protocol:</strong> 100% Client-Side Private Document
        </div>
      </div>

      <div class="clinical-box">
        <h3>1. PATIENT CYCLE PARAMETERS</h3>
        <p>${profileDetails}</p>
      </div>

      <div class="clinical-box">
        <h3>2. SYMPTOM CHECKLIST ASSESSMENT</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 50%;">Symptom Evaluated</th>
              <th style="text-align: right; width: 50%;">Reported State</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Severe/Sharp Pelvic Pain</td>
              <td style="text-align: right;"><strong>${pelvicText}</strong></td>
            </tr>
            <tr>
              <td>Persistent Spotting or Heavy Bleeding</td>
              <td style="text-align: right;"><strong>${bleedText}</strong></td>
            </tr>
            <tr>
              <td>Amenorrhea Exceeding 90 Days</td>
              <td style="text-align: right;"><strong>${s.amenorrhea ? "🔴 Yes" : "🟢 No"}</strong></td>
            </tr>
            <tr>
              <td>Persistent Fever (>100.4°F)</td>
              <td style="text-align: right;"><strong>${s.fever ? "🔴 Yes" : "🟢 No"}</strong></td>
            </tr>
            <tr>
              <td>Severe Dizziness or Fainting</td>
              <td style="text-align: right;"><strong>${s.dizziness ? "🔴 Yes" : "🟢 No"}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="clinical-box" style="border-left: 4px solid ${assessment.riskLevel === 'red' ? '#ef4444' : (assessment.riskLevel === 'yellow' ? '#f59e0b' : '#10b981')} !important;">
        <h3>3. RISK ASSESSMENT & TRIAGE RECOMMENDATION</h3>
        <p><strong>Clinical Risk Tier:</strong> <span style="text-transform: uppercase; font-weight: bold; color: ${assessment.riskLevel === 'red' ? '#ef4444' : (assessment.riskLevel === 'yellow' ? '#f59e0b' : '#10b981')}">${assessment.riskLevel}</span></p>
        <p><strong>Assessment:</strong> ${assessment.desc}</p>
        <p><strong>Physician Action Plan:</strong> ${assessment.action}</p>
      </div>

      ${assessment.notes ? `
      <div class="clinical-box">
        <h3>4. PATIENT-INPUTTED CLINICAL NOTES</h3>
        <p style="font-style: italic; white-space: pre-wrap;">"${assessment.notes}"</p>
      </div>
      ` : ""}

      <div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 10px; color: #888; text-align: center;">
        Disclaimer: This checklist utilizes mathematical algorithms and screening logic for clinical guidelines and does not substitute for emergency medical care or diagnosis.
      </div>
    </div>
  `;

  // Trigger browser print interface
  window.print();
}

/**
 * Handle purging all data from local storage
 */
function purgeAllMyData() {
  if (confirm("WARNING: This will permanently delete all logged cycle history, profile parameters, and clinical logs. This action is irreversible. Proceed?")) {
    localStorage.removeItem("aura_profile");
    localStorage.removeItem("aura_logs");
    
    // Reset State
    state.logs = {};
    setupDefaults();
    saveProfile();
    
    // Refresh components
    renderCalendar();
    calculateTestingIntel();
    renderLogsList();
    
    // Clear inputs in profile
    el.inputLastPeriod.value = state.lastPeriodDate;
    el.inputCycleLength.value = state.cycleLength;
    el.inputPeriodLength.value = state.periodLength;

    // Reset Triage results
    el.triageResultsBox.classList.add("hidden");
    document.querySelectorAll("input[name='triage-pelvic']").forEach(r => r.checked = r.value === 'none');
    document.querySelectorAll("input[name='triage-bleeding']").forEach(r => r.checked = r.value === 'none');
    el.triageAmenorrhea.checked = false;
    el.triageFever.checked = false;
    el.triageDizzy.checked = false;
    el.triageNotes.value = "";
    state.lastTriageAssessment = null;

    showNotification("All personal data has been securely purged.", "info");
  }
}

/**
 * Floating temporary toast notifications for action feedback
 */
function showNotification(msg, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  let bg = "bg-rose-600";
  if (type === "info") bg = "bg-purple-600";
  if (type === "success") bg = "bg-emerald-600";

  toast.className = `${bg} text-white text-xs md:text-sm font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 transform translate-y-2 opacity-0 transition-all duration-300`;
  toast.innerHTML = `<i class="fas fa-info-circle"></i> <span>${msg}</span>`;

  container.appendChild(toast);

  // Trigger animation frame
  setTimeout(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  }, 10);

  // Clear timeout
  setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

/**
 * Handle manual update of settings
 */
function updateSettings(e) {
  e.preventDefault();
  
  const rawDate = el.inputLastPeriod.value;
  const rawCycle = parseInt(el.inputCycleLength.value);
  const rawPeriod = parseInt(el.inputPeriodLength.value);

  if (!rawDate) {
    showNotification("Please select a valid date.", "info");
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
  
  // Refresh views
  renderCalendar();
  calculateTestingIntel();
  
  showNotification("Cycle Settings Updated Successfully", "success");
}

/**
 * Handle month-to-month calendar navigation
 */
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

/**
 * Initialize Event Listeners and load system properties
 */
document.addEventListener("DOMContentLoaded", () => {
  // Bind Elements
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
    
    // Triage elements
    triageForm: document.getElementById("triage-form"),
    triageAmenorrhea: document.getElementById("triage-amenorrhea"),
    triageFever: document.getElementById("triage-fever"),
    triageDizzy: document.getElementById("triage-dizzy"),
    triageNotes: document.getElementById("triage-notes"),
    triageResultsBox: document.getElementById("triage-results-box"),
    triageResultsTitle: document.getElementById("triage-results-title"),
    triageResultsDesc: document.getElementById("triage-results-desc"),
    triageResultsAction: document.getElementById("triage-results-action"),
    exportReportBtn: document.getElementById("export-report-btn"),
    
    // History tab
    logsListContainer: document.getElementById("logs-list-container"),
    
    // Data Management
    purgeDataBtn: document.getElementById("purge-data-btn")
  };

  // Load state from localStorage
  loadData();

  // Populate configuration forms
  el.inputLastPeriod.value = state.lastPeriodDate;
  el.inputCycleLength.value = state.cycleLength;
  el.inputPeriodLength.value = state.periodLength;

  // Bind general event listeners
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Calendar listeners
  el.prevMonthBtn.addEventListener("click", () => navigateMonth(-1));
  el.nextMonthBtn.addEventListener("click", () => navigateMonth(1));
  el.saveLogBtn.addEventListener("click", saveSymptomLog);
  el.deleteLogBtn.addEventListener("click", deleteSymptomLog);
  el.settingsForm.addEventListener("submit", updateSettings);

  // Timeline slider listener
  el.timelineSlider.addEventListener("input", (e) => {
    updateGestationalTimeline(e.target.value);
  });

  // Triage logic listeners
  el.triageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    evaluateTriageSymptoms();
  });
  el.exportReportBtn.addEventListener("click", exportDoctorReport);

  // Purge button listener
  el.purgeDataBtn.addEventListener("click", purgeAllMyData);

  // Initial UI Render
  renderCalendar();
  updateGestationalTimeline(state.selectedWeek);
});
