/**
 * =======================================================
 * BMI & HEALTH CALCULATOR - CENTRALIZED APP ARCHITECTURE
 * Discrete Mathematics / Data Mathematics College Project
 * =======================================================
 */

const APP_KEYS = {
  USER_PROFILE: 'userProfile',
  HEALTH_DATA: 'healthData',
  WEIGHT_HISTORY: 'weightHistory',
  BMI_HISTORY: 'bmiHistory',
  WATER_HISTORY: 'waterHistory',
  SLEEP_HISTORY: 'sleepHistory',
  ACTIVITY_HISTORY: 'activityHistory',
  GOALS: 'goals',
  NUTRITION_HISTORY: 'nutritionHistory'
};

/**
 * Default Storage Data Seeder
 */
const DEFAULT_APP_DATA = {
  [APP_KEYS.USER_PROFILE]: {
    name: "Alex Morgan",
    age: 21,
    gender: "male",
    height: 175, // cm
    currentWeight: 72.5, // kg
    targetWeight: 68.0, // kg
    activityLevel: "moderate", // sedentary, light, moderate, active, extra_active
    primaryGoal: "weight_loss",
    memberSince: "2026-09-01"
  },
  [APP_KEYS.HEALTH_DATA]: {
    currentBmi: 23.67,
    bmiCategory: "Normal Weight",
    bmr: 1685, // kcal/day
    tdee: 2611, // kcal/day
    bodyFatEstimate: 16.5, // %
    bloodPressure: "118/76", // mmHg
    heartRate: 72, // bpm
    bloodGlucose: 95, // mg/dL
    oxygenLevel: 98, // %
    lastUpdated: new Date().toISOString()
  },
  [APP_KEYS.WEIGHT_HISTORY]: [
    { date: "2026-09-15", weight: 74.2 },
    { date: "2026-09-20", weight: 73.8 },
    { date: "2026-09-25", weight: 73.1 },
    { date: "2026-09-28", weight: 72.8 },
    { date: "2026-10-01", weight: 72.5 }
  ],
  [APP_KEYS.BMI_HISTORY]: [
    { date: "2026-09-15", bmi: 24.23 },
    { date: "2026-09-20", bmi: 24.10 },
    { date: "2026-09-25", bmi: 23.87 },
    { date: "2026-09-28", bmi: 23.77 },
    { date: "2026-10-01", bmi: 23.67 }
  ],
  [APP_KEYS.WATER_HISTORY]: [
    { date: "2026-09-29", glasses: 8, target: 10, totalMl: 2000 },
    { date: "2026-09-30", glasses: 9, target: 10, totalMl: 2250 },
    { date: "2026-10-01", glasses: 7, target: 10, totalMl: 1750 }
  ],
  [APP_KEYS.SLEEP_HISTORY]: [
    { date: "2026-09-29", hours: 7.5, quality: "Good", score: 85 },
    { date: "2026-09-30", hours: 8.0, quality: "Excellent", score: 92 },
    { date: "2026-10-01", hours: 7.2, quality: "Good", score: 82 }
  ],
  [APP_KEYS.ACTIVITY_HISTORY]: [
    { date: "2026-09-29", steps: 8400, activeMinutes: 45, caloriesBurned: 420 },
    { date: "2026-09-30", steps: 10200, activeMinutes: 60, caloriesBurned: 530 },
    { date: "2026-10-01", steps: 9150, activeMinutes: 50, caloriesBurned: 460 }
  ],
  [APP_KEYS.GOALS]: {
    dailyWaterMl: 2500,
    dailyCaloriesKcal: 2100,
    dailySteps: 10000,
    dailySleepHours: 8.0,
    targetWeightKg: 68.0,
    weeklyWorkouts: 4
  },
  [APP_KEYS.NUTRITION_HISTORY]: [
    { date: "2026-10-01", calories: 1950, protein: 120, carbs: 210, fat: 55 }
  ]
};

// ==========================================
// CENTRALIZED LOCAL STORAGE HELPER FUNCTIONS
// ==========================================

/**
 * Save data to localStorage
 * @param {string} key 
 * @param {any} value 
 */
function saveData(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.error(`Error saving key "${key}" to localStorage:`, err);
    return false;
  }
}

/**
 * Retrieve data from localStorage
 * @param {string} key 
 * @param {any} defaultValue 
 * @returns {any}
 */
function getData(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading key "${key}" from localStorage:`, err);
    return defaultValue;
  }
}

/**
 * Update existing data in localStorage via object merge or updater callback
 * @param {string} key 
 * @param {object|function} updateFnOrObj 
 */
function updateData(key, updateFnOrObj) {
  const current = getData(key, {});
  let updated;
  if (typeof updateFnOrObj === 'function') {
    updated = updateFnOrObj(current);
  } else if (typeof updateFnOrObj === 'object' && updateFnOrObj !== null) {
    if (Array.isArray(current)) {
      updated = updateFnOrObj;
    } else {
      updated = { ...current, ...updateFnOrObj };
    }
  } else {
    updated = updateFnOrObj;
  }
  saveData(key, updated);
  return updated;
}

/**
 * Delete a specific key from localStorage
 * @param {string} key 
 */
function deleteData(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`Error deleting key "${key}" from localStorage:`, err);
    return false;
  }
}

/**
 * Clear all application data and re-initialize default structure
 */
function clearAllData() {
  try {
    Object.values(APP_KEYS).forEach(key => localStorage.removeItem(key));
    initDefaultStorage();
    return true;
  } catch (err) {
    console.error("Error clearing localStorage:", err);
    return false;
  }
}

/**
 * Initialize default storage if empty
 */
function initDefaultStorage() {
  Object.keys(DEFAULT_APP_DATA).forEach(key => {
    if (localStorage.getItem(key) === null) {
      saveData(key, DEFAULT_APP_DATA[key]);
    }
  });
}

// Ensure default storage is present on load
initDefaultStorage();

// ==========================================
// UI & NAVIGATION INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  setupSidebarNavigation();
  setupMobileSidebarToggle();
  updateTopNavUserProfile();
});

/**
 * Set active page link in sidebar based on window.location
 */
function setupSidebarNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
  const navLinks = document.querySelectorAll('.nav-item-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'dashboard.html') || (currentPath === 'index.html' && href === 'dashboard.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Mobile Sidebar Toggle Handler
 */
function setupMobileSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      if (overlay) overlay.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      if (sidebar) sidebar.classList.remove('show');
      overlay.classList.remove('active');
    });
  }
}

/**
 * Update user avatar & name in top header dynamically from localStorage
 */
function updateTopNavUserProfile() {
  const profile = getData(APP_KEYS.USER_PROFILE);
  if (!profile) return;

  const nameEl = document.getElementById('header-user-name');
  const avatarEl = document.getElementById('header-user-avatar');

  if (nameEl && profile.name) {
    nameEl.textContent = profile.name;
  }
  if (avatarEl && profile.name) {
    const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    avatarEl.textContent = initials || 'U';
  }

  // Sync Dashboard Welcome Banner
  const dashWelcome = document.getElementById('dash-welcome-name');
  if (dashWelcome && profile.name) {
    const firstName = profile.name.split(' ')[0] || profile.name;
    dashWelcome.textContent = `Hello, ${firstName}! 👋`;
  }

  // Sync Dashboard Weight Card if present
  const dashWeight = document.getElementById('dash-current-weight');
  if (dashWeight && profile.weightKg > 0) {
    dashWeight.innerHTML = `${profile.weightKg} <span class="stat-unit">kg</span>`;
  }

  // Sync Dashboard BMI, BMR & TDEE Cards if present
  const healthData = getData(APP_KEYS.HEALTH_DATA);
  const dashBmi = document.getElementById('dash-current-bmi');
  const dashBadge = document.getElementById('dash-bmi-badge');
  const dashBmr = document.getElementById('dash-bmr-val');
  const dashTdee = document.getElementById('dash-tdee-val');
  const dashTdeeBadge = document.getElementById('dash-tdee-badge');

  if (dashBmi && healthData && healthData.currentBmi) {
    dashBmi.innerHTML = `${healthData.currentBmi} <span class="stat-unit">kg/m²</span>`;
  }
  if (dashBadge && healthData && healthData.bmiCategory) {
    dashBadge.innerHTML = `<i class="fas fa-check"></i> ${healthData.bmiCategory}`;
  }
  if (dashBmr && healthData && healthData.bmr > 0) {
    dashBmr.innerHTML = `${healthData.bmr.toLocaleString()} <span class="stat-unit">kcal/day</span>`;
  }
  if (dashTdee && healthData && healthData.tdee > 0) {
    dashTdee.innerHTML = `${healthData.tdee.toLocaleString()} <span class="stat-unit">kcal/day</span>`;
  }
  if (dashTdeeBadge && profile && profile.activityLevel) {
    dashTdeeBadge.textContent = profile.activityLevel;
  }

  // Sync Dashboard Overall Goal Progress Card if present
  const goalsArray = getData(APP_KEYS.GOALS, []);
  const dashGoalVal = document.getElementById('dash-goal-progress-val');
  const dashGoalBar = document.getElementById('dash-goal-progress-bar');

  if ((dashGoalVal || dashGoalBar) && Array.isArray(goalsArray)) {
    if (goalsArray.length === 0) {
      if (dashGoalVal) dashGoalVal.innerHTML = `0% <span class="stat-unit">completed</span>`;
      if (dashGoalBar) dashGoalBar.style.width = `0%`;
    } else {
      let totalP = 0;
      goalsArray.forEach(g => {
        const cur = parseFloat(g.currentValue) || 0;
        const tgt = parseFloat(g.targetValue) || 1;
        const p = Math.min(100, Math.round((cur / tgt) * 100));
        totalP += p;
      });
      const avgP = Math.round(totalP / goalsArray.length);
      if (dashGoalVal) dashGoalVal.innerHTML = `${avgP}% <span class="stat-unit">completed</span>`;
      if (dashGoalBar) dashGoalBar.style.width = `${avgP}%`;
    }
  }

  // Sync Dashboard Water Intake Card if present
  const dashWaterVal = document.getElementById('dash-water-val');
  const dashWaterBar = document.getElementById('dash-water-bar');

  if (dashWaterVal || dashWaterBar) {
    const waterHistory = getData(APP_KEYS.WATER_HISTORY, []);
    const target = getData('waterTarget', 2000);
    const d = new Date();
    const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    let todayTotal = 0;
    if (Array.isArray(waterHistory)) {
      waterHistory.forEach(item => {
        if (item.date === todayKey) {
          todayTotal += (parseFloat(item.amountMl) || 0);
        }
      });
    }

    const progressP = Math.min(100, Math.round((todayTotal / target) * 100));
    if (dashWaterVal) dashWaterVal.innerHTML = `${todayTotal.toLocaleString()} / ${target.toLocaleString()} <span class="stat-unit">ml</span>`;
    if (dashWaterBar) dashWaterBar.style.width = `${progressP}%`;
  }
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('app-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'app-toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#10b981' : type === 'danger' ? '#f43f5e' : '#4f46e5';
  toast.style.cssText = `
    background-color: ${bgColor};
    color: #ffffff;
    padding: 12px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 0.875rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: fadeIn 0.3s ease;
  `;
  toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;

  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}
