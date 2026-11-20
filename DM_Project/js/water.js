/**
 * =======================================================
 * WATER TRACKER MODULE - DISCRETE MATHEMATICS HEALTH APP
 * Step 6: Water Intake Tracker, Discrete Summations, 
 * Progress Metrics & Statistics
 * =======================================================
 */

const WATER_CONFIG = {
  TARGET_KEY: 'waterTarget',
  HISTORY_KEY: 'waterHistory',
  DEFAULT_TARGET: 2000,
  MIN_ENTRY_ML: 1,
  MAX_ENTRY_ML: 5000,
  MIN_TARGET_ML: 100,
  MAX_TARGET_ML: 20000
};

/**
 * Initialize Water Tracker module on DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initWaterTracker();
});

/**
 * Main initialization entry point
 */
function initWaterTracker() {
  bindEventListeners();
  renderWaterPage();
}

/**
 * Bind DOM Event Listeners for controls, quick add, custom form, and target modal
 */
function bindEventListeners() {
  // Quick Add Buttons
  const btn100 = document.getElementById('btn-quick-100');
  const btn200 = document.getElementById('btn-quick-200');
  const btn250 = document.getElementById('btn-quick-250');
  const btn500 = document.getElementById('btn-quick-500');

  if (btn100) btn100.addEventListener('click', () => addWater(100));
  if (btn200) btn200.addEventListener('click', () => addWater(200));
  if (btn250) btn250.addEventListener('click', () => addWater(250));
  if (btn500) btn500.addEventListener('click', () => addWater(500));

  // Custom Water Entry Form
  const customForm = document.getElementById('form-custom-water');
  if (customForm) {
    customForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputEl = document.getElementById('input-custom-water');
      const amountVal = inputEl ? inputEl.value.trim() : '';

      const validation = validateWaterAmount(amountVal);
      if (!validation.valid) {
        showWaterMessage(validation.error, 'danger');
        return;
      }

      hideWaterMessage();
      addWater(validation.amount);
      if (inputEl) inputEl.value = '';
    });
  }

  // Edit Target Modal
  const editTargetBtn = document.getElementById('btn-edit-target');
  const targetForm = document.getElementById('form-water-target');
  
  if (editTargetBtn) {
    editTargetBtn.addEventListener('click', () => {
      const targetInput = document.getElementById('input-target-ml');
      const currentTarget = loadWaterTarget();
      if (targetInput) targetInput.value = currentTarget;
      
      const modalEl = document.getElementById('modal-water-target');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
      }
    });
  }

  if (targetForm) {
    targetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const targetInput = document.getElementById('input-target-ml');
      const valStr = targetInput ? targetInput.value.trim() : '';
      const numVal = Number(valStr);

      const targetErr = document.getElementById('target-form-error');

      if (!valStr || isNaN(numVal) || !isFinite(numVal) || numVal < WATER_CONFIG.MIN_TARGET_ML || numVal > WATER_CONFIG.MAX_TARGET_ML) {
        if (targetErr) {
          targetErr.textContent = `Please enter a valid numeric target between ${WATER_CONFIG.MIN_TARGET_ML} and ${WATER_CONFIG.MAX_TARGET_ML.toLocaleString()} ml.`;
          targetErr.classList.remove('d-none');
        }
        return;
      }

      if (targetErr) targetErr.classList.add('d-none');

      saveWaterTarget(numVal);
      renderWaterPage();
      updateDashboardWater();

      const modalEl = document.getElementById('modal-water-target');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }

      if (typeof showToast === 'function') {
        showToast(`Daily water target updated to ${numVal.toLocaleString()} ml`, 'success');
      }
    });
  }
}

// ==========================================
// DATA STORAGE & RETRIEVAL FUNCTIONS
// ==========================================

/**
 * Load water history from localStorage
 * @returns {Array}
 */
function loadWaterData() {
  if (typeof getData === 'function') {
    return getData(WATER_CONFIG.HISTORY_KEY, []);
  }
  try {
    const raw = localStorage.getItem(WATER_CONFIG.HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error loading water history:", err);
    return [];
  }
}

/**
 * Save water history array to localStorage
 * @param {Array} history 
 */
function saveWaterData(history) {
  if (typeof saveData === 'function') {
    saveData(WATER_CONFIG.HISTORY_KEY, history);
  } else {
    localStorage.setItem(WATER_CONFIG.HISTORY_KEY, JSON.stringify(history));
  }
}

/**
 * Load user's water target (default 2000 ml)
 * @returns {number}
 */
function loadWaterTarget() {
  let target;
  if (typeof getData === 'function') {
    target = getData(WATER_CONFIG.TARGET_KEY, WATER_CONFIG.DEFAULT_TARGET);
  } else {
    const raw = localStorage.getItem(WATER_CONFIG.TARGET_KEY);
    target = raw ? Number(raw) : WATER_CONFIG.DEFAULT_TARGET;
  }

  const numTarget = Number(target);
  if (isNaN(numTarget) || !isFinite(numTarget) || numTarget <= 0) {
    return WATER_CONFIG.DEFAULT_TARGET;
  }
  return numTarget;
}

/**
 * Save daily target to localStorage
 * @param {number} targetMl 
 */
function saveWaterTarget(targetMl) {
  const num = Number(targetMl);
  if (isNaN(num) || !isFinite(num) || num <= 0) return false;
  
  if (typeof saveData === 'function') {
    saveData(WATER_CONFIG.TARGET_KEY, num);
  } else {
    localStorage.setItem(WATER_CONFIG.TARGET_KEY, String(num));
  }
  return true;
}

// ==========================================
// DATE & LOCAL TIME UTILITIES
// ==========================================

/**
 * Get current user local date key formatted as YYYY-MM-DD
 * Avoids UTC boundary offset shifting bugs
 * @param {Date} [dateObj=new Date()]
 * @returns {string} YYYY-MM-DD
 */
function getLocalDateKey(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==========================================
// CORE BUSINESS LOGIC & CALCULATION FUNCTIONS
// ==========================================

/**
 * Validate water amount input
 * Rejects NaN, Infinity, <=0, non-numeric, >5000
 * @param {any} amount 
 * @returns {{valid: boolean, amount: number, error: string}}
 */
function validateWaterAmount(amount) {
  if (amount === null || amount === undefined || amount === '') {
    return { valid: false, amount: 0, error: 'Please enter a water amount in ml.' };
  }

  const num = Number(amount);

  if (isNaN(num)) {
    return { valid: false, amount: 0, error: 'Entered value is not a valid number.' };
  }
  if (!isFinite(num)) {
    return { valid: false, amount: 0, error: 'Infinity values are not allowed.' };
  }
  if (num <= 0) {
    return { valid: false, amount: 0, error: 'Water amount must be greater than 0 ml.' };
  }
  if (num > WATER_CONFIG.MAX_ENTRY_ML) {
    return { valid: false, amount: 0, error: `Maximum single entry limit is ${WATER_CONFIG.MAX_ENTRY_ML.toLocaleString()} ml.` };
  }

  return { valid: true, amount: Math.round(num), error: '' };
}

/**
 * Add a new water entry
 * @param {number} amountMl 
 */
function addWater(amountMl) {
  const validation = validateWaterAmount(amountMl);
  if (!validation.valid) {
    showWaterMessage(validation.error, 'danger');
    return false;
  }

  const history = loadWaterData();
  const now = new Date();
  
  const newEntry = {
    id: `water_${now.getTime()}_${Math.floor(Math.random() * 1000)}`,
    amountMl: validation.amount,
    timestamp: now.toISOString(),
    date: getLocalDateKey(now)
  };

  history.push(newEntry);
  saveWaterData(history);

  // Refresh UI
  renderWaterPage();
  updateDashboardWater();

  if (typeof showToast === 'function') {
    showToast(`Added +${validation.amount} ml of water`, 'success');
  }

  return true;
}

/**
 * Delete a water entry by unique ID
 * @param {string} id 
 */
function deleteWaterEntry(id) {
  let history = loadWaterData();
  const initialLen = history.length;
  
  history = history.filter(item => item.id !== id);

  if (history.length < initialLen) {
    saveWaterData(history);
    renderWaterPage();
    updateDashboardWater();

    if (typeof showToast === 'function') {
      showToast('Water entry deleted', 'info');
    }
    return true;
  }
  return false;
}

/**
 * Get entries logged for today's local date
 * @returns {Array}
 */
function getTodayEntries() {
  const history = loadWaterData();
  const todayKey = getLocalDateKey();

  return history.filter(item => item && item.date === todayKey && item.amountMl !== undefined);
}

/**
 * Calculate total intake for a given local date (default today)
 * Summation: I = sum(w_j)
 * @param {Array} [history] 
 * @param {string} [dateKey] 
 * @returns {number}
 */
function calculateTodayTotal(history = null, dateKey = null) {
  const data = history || loadWaterData();
  const key = dateKey || getLocalDateKey();

  let total = 0;
  if (Array.isArray(data)) {
    data.forEach(item => {
      if (item && item.date === key) {
        if (item.amountMl !== undefined) {
          total += Number(item.amountMl) || 0;
        } else if (item.totalMl !== undefined) {
          // Legacy seed fallback support
          total += Number(item.totalMl) || 0;
        }
      }
    });
  }
  return total;
}

/**
 * Calculate progress percentage
 * Progress = min(100, (Intake / Target) * 100)
 * @param {number} totalIntake 
 * @param {number} target 
 * @returns {number}
 */
function calculateWaterProgress(totalIntake, target) {
  if (!target || target <= 0) return 0;
  const p = (totalIntake / target) * 100;
  return Math.min(100, Math.round(p));
}

/**
 * Calculate remaining water amount
 * Remaining = max(0, Target - Intake)
 * @param {number} totalIntake 
 * @param {number} target 
 * @returns {number}
 */
function calculateRemaining(totalIntake, target) {
  if (!target || target <= 0) return 0;
  return Math.max(0, target - totalIntake);
}

/**
 * Group history by date and compute daily total intake for each date
 * Returns array sorted by date descending (newest first)
 * @param {Array} [history] 
 * @returns {Array<{date: string, totalMl: number, count: number}>}
 */
function calculateDailyTotals(history = null) {
  const data = history || loadWaterData();
  const totalsMap = {};

  if (Array.isArray(data)) {
    data.forEach(item => {
      if (item && item.date) {
        const d = item.date;
        let amount = 0;
        if (item.amountMl !== undefined) {
          amount = Number(item.amountMl) || 0;
        } else if (item.totalMl !== undefined) {
          amount = Number(item.totalMl) || 0;
        }

        if (!totalsMap[d]) {
          totalsMap[d] = { date: d, totalMl: 0, count: 0 };
        }
        totalsMap[d].totalMl += amount;
        totalsMap[d].count += 1;
      }
    });
  }

  const result = Object.values(totalsMap);
  result.sort((a, b) => b.date.localeCompare(a.date));
  return result;
}

/**
 * Calculate statistical indicators across all tracked days
 * Average = Total Intake / Number of Tracked Days
 * Min, Max, Tracked Days Count
 * @param {Array} [history] 
 * @returns {{averageMl: number, maxMl: number, minMl: number, trackedDays: number}}
 */
function calculateWaterStatistics(history = null) {
  const dailyTotals = calculateDailyTotals(history);

  if (dailyTotals.length === 0) {
    return { averageMl: 0, maxMl: 0, minMl: 0, trackedDays: 0 };
  }

  let totalSum = 0;
  let maxVal = -Infinity;
  let minVal = Infinity;

  dailyTotals.forEach(day => {
    const val = day.totalMl;
    totalSum += val;
    if (val > maxVal) maxVal = val;
    if (val < minVal) minVal = val;
  });

  const trackedDays = dailyTotals.length;
  const averageMl = Math.round(totalSum / trackedDays);

  return {
    averageMl: averageMl,
    maxMl: maxVal === -Infinity ? 0 : maxVal,
    minMl: minVal === Infinity ? 0 : minVal,
    trackedDays: trackedDays
  };
}

// ==========================================
// RENDER & UI UPDATES
// ==========================================

/**
 * Re-render all sections on the Water Tracker page
 */
function renderWaterPage() {
  const history = loadWaterData();
  const target = loadWaterTarget();
  const todayTotal = calculateTodayTotal(history);
  const progressP = calculateWaterProgress(todayTotal, target);
  const remaining = calculateRemaining(todayTotal, target);

  renderTodaySummary(todayTotal, target, remaining, progressP);
  renderTodayEntries();
  renderWaterHistory();
  renderWaterStatistics();
}

/**
 * Render Summary Cards & Visual Progress Meter
 */
function renderTodaySummary(intake, target, remaining, progressP) {
  // Summary Cards
  const intakeEl = document.getElementById('water-stat-intake');
  const targetEl = document.getElementById('water-stat-target');
  const remainingEl = document.getElementById('water-stat-remaining');
  const progressEl = document.getElementById('water-stat-progress');
  const badgeEl = document.getElementById('water-progress-badge');
  const dateSubtextEl = document.getElementById('water-stat-date');

  if (intakeEl) intakeEl.textContent = `${intake.toLocaleString()} ml`;
  if (targetEl) targetEl.textContent = `${target.toLocaleString()} ml`;
  if (remainingEl) remainingEl.textContent = `${remaining.toLocaleString()} ml`;
  if (progressEl) progressEl.textContent = `${progressP}%`;

  if (dateSubtextEl) {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    dateSubtextEl.textContent = `Today (${dateStr})`;
  }

  if (badgeEl) {
    if (intake >= target) {
      badgeEl.className = 'stat-badge badge-success';
      badgeEl.innerHTML = '<i class="fas fa-check-circle me-1"></i> Target Reached!';
    } else {
      badgeEl.className = 'stat-badge badge-normal';
      badgeEl.textContent = `${progressP}% Goal`;
    }
  }

  // Visual Progress Meter
  const visualIntakeEl = document.getElementById('visual-intake-text');
  const visualSubtextEl = document.getElementById('visual-subtext');
  const progressBarEl = document.getElementById('water-progress-bar');

  if (visualIntakeEl) visualIntakeEl.textContent = `${intake.toLocaleString()} / ${target.toLocaleString()} ml`;
  if (visualSubtextEl) {
    if (intake >= target) {
      visualSubtextEl.textContent = `Goal completed! (${intake.toLocaleString()} ml logged)`;
      visualSubtextEl.className = 'text-success fw-bold fs-7 mb-3';
    } else {
      visualSubtextEl.textContent = `${progressP}% of daily target reached`;
      visualSubtextEl.className = 'text-muted fs-7 mb-3';
    }
  }

  if (progressBarEl) {
    progressBarEl.style.width = `${progressP}%`;
    if (intake >= target) {
      progressBarEl.className = 'progress-bar bg-success progress-bar-striped progress-bar-animated';
    } else {
      progressBarEl.className = 'progress-bar bg-info progress-bar-striped progress-bar-animated';
    }
  }
}

/**
 * Render Today's Water Entries List
 */
function renderTodayEntries() {
  const container = document.getElementById('today-entries-container');
  const countBadge = document.getElementById('today-entries-count');
  if (!container) return;

  const todayEntries = getTodayEntries();

  if (countBadge) {
    countBadge.textContent = `${todayEntries.length} ${todayEntries.length === 1 ? 'entry' : 'entries'}`;
  }

  if (todayEntries.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 px-3 bg-light rounded-3 border">
        <div class="card-icon-badge icon-secondary mx-auto mb-2" style="width: 45px; height: 45px; font-size: 1.2rem;">
          <i class="fas fa-glass-water"></i>
        </div>
        <h6 class="fw-bold text-main mb-1">No water entries yet.</h6>
        <p class="text-muted fs-8 mb-0">Start tracking your water intake by adding your first entry using the quick buttons or custom form above.</p>
      </div>
    `;
    return;
  }

  // Sort newest entries first by timestamp
  todayEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  let html = '';
  todayEntries.forEach(entry => {
    const timeStr = entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
    
    html += `
      <div class="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <div class="card-icon-badge icon-secondary" style="width: 38px; height: 38px; font-size: 0.95rem;">
            <i class="fas fa-tint"></i>
          </div>
          <div>
            <div class="fw-bold text-main fs-7">${entry.amountMl} ml</div>
            <div class="text-muted fs-8"><i class="far fa-clock me-1"></i>${timeStr}</div>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger btn-delete-entry py-1 px-2 fs-8 fw-semibold" onclick="deleteWaterEntry('${entry.id}')">
          <i class="fas fa-trash-can me-1"></i> Delete
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Render Daily History list (past totals per date)
 */
function renderWaterHistory() {
  const container = document.getElementById('daily-history-container');
  if (!container) return;

  const dailyTotals = calculateDailyTotals();

  if (dailyTotals.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 px-3 bg-light rounded-3 border">
        <div class="text-muted fs-8">No daily history logged yet.</div>
      </div>
    `;
    return;
  }

  // Take top 7 recent days
  const recentDays = dailyTotals.slice(0, 7);

  let html = '';
  recentDays.forEach(item => {
    // Format YYYY-MM-DD to readable date (e.g. October 2)
    const parts = item.date.split('-');
    let formattedDate = item.date;
    if (parts.length === 3) {
      const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      formattedDate = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const isToday = item.date === getLocalDateKey();

    html += `
      <div class="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <i class="fas fa-calendar-day text-primary fs-7"></i>
          <div>
            <div class="fw-bold text-main fs-7">${formattedDate} ${isToday ? '<span class="badge bg-primary-subtle text-primary fs-8 ms-1">Today</span>' : ''}</div>
            <div class="text-muted fs-8">${item.count} ${item.count === 1 ? 'entry' : 'entries'}</div>
          </div>
        </div>
        <div class="fw-extrabold text-info fs-6">
          ${item.totalMl.toLocaleString()} ml
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Render Water Statistics Card
 */
function renderWaterStatistics() {
  const stats = calculateWaterStatistics();

  const avgEl = document.getElementById('stat-avg-intake');
  const daysEl = document.getElementById('stat-tracked-days');
  const maxEl = document.getElementById('stat-max-intake');
  const minEl = document.getElementById('stat-min-intake');

  if (avgEl) avgEl.textContent = `${stats.averageMl.toLocaleString()} ml`;
  if (daysEl) daysEl.textContent = `${stats.trackedDays}`;
  if (maxEl) maxEl.textContent = `${stats.maxMl.toLocaleString()} ml`;
  if (minEl) minEl.textContent = `${stats.minMl.toLocaleString()} ml`;
}

/**
 * Trigger dashboard water intake card sync
 */
function updateDashboardWater() {
  if (typeof updateTopNavUserProfile === 'function') {
    updateTopNavUserProfile();
  }
}

/**
 * Display alert error message for custom water form
 * @param {string} msg 
 * @param {string} type 
 */
function showWaterMessage(msg, type = 'danger') {
  const errEl = document.getElementById('water-input-error');
  if (errEl) {
    errEl.textContent = msg;
    errEl.className = `alert alert-${type} fs-8 mt-2`;
  }
}

/**
 * Hide alert error message for custom water form
 */
function hideWaterMessage() {
  const errEl = document.getElementById('water-input-error');
  if (errEl) {
    errEl.classList.add('d-none');
  }
}
