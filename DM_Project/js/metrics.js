/**
 * =======================================================
 * BMI & HEALTH CALCULATOR - HEALTH METRICS MODULE (STEP 4)
 * Discrete Mathematics / Data Mathematics College Project
 * =======================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initHealthMetricsModule();
});

/**
 * Initialize Health Metrics Module
 */
function initHealthMetricsModule() {
  loadHealthMetrics();
}

/**
 * Main Controller to load profile data and compute health metrics
 */
function loadHealthMetrics() {
  const profile = getData(APP_KEYS.USER_PROFILE, null);
  const reqBanner = document.getElementById('metrics-profile-required');
  const dashBody = document.getElementById('metrics-dashboard-body');

  // Check if profile is complete with required parameters
  if (
    !profile ||
    !profile.age || profile.age <= 0 ||
    !profile.heightCm || profile.heightCm <= 0 ||
    !profile.weightKg || profile.weightKg <= 0 ||
    !profile.activityLevel
  ) {
    if (reqBanner) reqBanner.classList.remove('d-none');
    if (dashBody) dashBody.classList.add('d-none');
    return;
  }

  if (reqBanner) reqBanner.classList.add('d-none');
  if (dashBody) dashBody.classList.remove('d-none');

  // 1. Populate Overview Header Banner Chips
  populateProfileChips(profile);

  // 2. Compute BMR (Mifflin-St Jeor Equation)
  const bmrResult = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  renderBMRCard(bmrResult);

  // 3. Compute TDEE
  const actMultiplier = getActivityMultiplier(profile.activityLevel);
  const bmrVal = typeof bmrResult === 'number' ? bmrResult : (bmrResult?.bmr || 0);
  const tdeeVal = bmrVal > 0 ? calculateTDEE(bmrVal, actMultiplier) : 0;
  renderTDEECard(tdeeVal, bmrVal, profile.activityLevel, actMultiplier);

  // 4. BMI Integration
  renderBMICard(profile);

  // 5. Waist-to-Height Ratio
  const waistRatio = calculateWaistToHeightRatio(profile.waistCm, profile.heightCm);
  renderWaistRatioCard(waistRatio, profile.waistCm, profile.heightCm);

  // 6. Heart Rate Metrics
  const maxHr = calculateMaxHeartRate(profile.age);
  const hrZones = calculateHeartRateZones(maxHr);
  renderHeartRateCard(maxHr, hrZones, profile.age);

  // 7. Update Centralized HealthData in LocalStorage
  const latestBmi = getLatestBMI(profile);
  updateData(APP_KEYS.HEALTH_DATA, {
    currentBmi: parseFloat(latestBmi.bmi.toFixed(2)),
    bmiCategory: latestBmi.category,
    bmr: bmrVal > 0 ? Math.round(bmrVal) : 0,
    tdee: tdeeVal > 0 ? Math.round(tdeeVal) : 0,
    lastUpdated: new Date().toISOString()
  });

  // 8. Sync Top Navigation Header and Dashboard Cards
  if (typeof updateTopNavUserProfile === 'function') {
    updateTopNavUserProfile();
  }
}

/**
 * Populate Banner Chips
 * @param {object} profile 
 */
function populateProfileChips(profile) {
  const nameEl = document.getElementById('metrics-profile-name');
  const ageEl = document.getElementById('chip-age');
  const genderEl = document.getElementById('chip-gender');
  const heightEl = document.getElementById('chip-height');
  const weightEl = document.getElementById('chip-weight');
  const activityEl = document.getElementById('chip-activity');

  if (nameEl) nameEl.textContent = profile.name || "User";
  if (ageEl) ageEl.textContent = `Age: ${profile.age} yrs`;
  if (genderEl) genderEl.textContent = `Gender: ${profile.gender || 'Not specified'}`;
  if (heightEl) heightEl.textContent = `Height: ${profile.heightCm} cm`;
  if (weightEl) weightEl.textContent = `Weight: ${profile.weightKg} kg`;
  if (activityEl) activityEl.textContent = `Activity: ${profile.activityLevel || 'Not specified'}`;
}

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 * @param {number} weightKg 
 * @param {number} heightCm 
 * @param {number} age 
 * @param {string} gender 
 * @returns {number|object}
 */
function calculateBMR(weightKg, heightCm, age, gender) {
  const genderLower = (gender || "").toLowerCase();

  // Base equation terms: 10 * weight + 6.25 * height - 5 * age
  const baseTerm = (10 * weightKg) + (6.25 * heightCm) - (5 * age);

  if (genderLower === 'male') {
    return Math.round(baseTerm + 5);
  } else if (genderLower === 'female') {
    return Math.round(baseTerm - 161);
  } else {
    // Other / Prefer not to say requiring sex-specific equation
    return {
      requiresSexSpecific: true,
      maleEstimate: Math.round(baseTerm + 5),
      femaleEstimate: Math.round(baseTerm - 161)
    };
  }
}

/**
 * Map Activity Level Enum to Scalar Multiplier Factor
 * @param {string} activityLevel 
 * @returns {number}
 */
function getActivityMultiplier(activityLevel) {
  const map = {
    "Sedentary": 1.20,
    "Lightly Active": 1.375,
    "Moderately Active": 1.55,
    "Very Active": 1.725,
    "Extra Active": 1.90
  };
  return map[activityLevel] || 1.55;
}

/**
 * Calculate TDEE = BMR * Activity Multiplier
 * @param {number} bmr 
 * @param {number} multiplier 
 * @returns {number}
 */
function calculateTDEE(bmr, multiplier) {
  if (!bmr || bmr <= 0) return 0;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate Waist-to-Height Ratio = Waist / Height
 * @param {number} waistCm 
 * @param {number} heightCm 
 * @returns {number|null}
 */
function calculateWaistToHeightRatio(waistCm, heightCm) {
  if (!waistCm || waistCm <= 0 || !heightCm || heightCm <= 0) return null;
  return Math.round((waistCm / heightCm) * 100) / 100;
}

/**
 * Calculate Estimated Maximum Heart Rate = 220 - age
 * @param {number} age 
 * @returns {number}
 */
function calculateMaxHeartRate(age) {
  if (!age || age <= 0) return 0;
  return 220 - age;
}

/**
 * Calculate Training Zones (Moderate 50-70%, Vigorous 70-85%)
 * @param {number} maxHr 
 * @returns {object}
 */
function calculateHeartRateZones(maxHr) {
  if (!maxHr || maxHr <= 0) {
    return { modMin: 0, modMax: 0, vigMin: 0, vigMax: 0 };
  }
  return {
    modMin: Math.round(maxHr * 0.50),
    modMax: Math.round(maxHr * 0.70),
    vigMin: Math.round(maxHr * 0.70),
    vigMax: Math.round(maxHr * 0.85)
  };
}

/**
 * Retrieve Latest BMI from history or calculate from profile
 * @param {object} profile 
 */
function getLatestBMI(profile) {
  const history = getData(APP_KEYS.BMI_HISTORY, []);
  if (Array.isArray(history) && history.length > 0) {
    const last = history[history.length - 1];
    const cat = getBMICategoryText(last.bmi, profile.age);
    return { bmi: last.bmi, category: cat };
  }

  // Fallback calculation
  const heightM = profile.heightCm / 100;
  const bmiRaw = profile.weightKg / (heightM * heightM);
  const bmiVal = Math.round(bmiRaw * 100) / 100;
  const cat = getBMICategoryText(bmiVal, profile.age);
  return { bmi: bmiVal, category: cat };
}

function getBMICategoryText(bmi, age) {
  if (age < 18) return "Pediatric Evaluation";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25.0) return "Normal Range";
  if (bmi < 30.0) return "Overweight";
  return "Obesity";
}

/**
 * Render BMR Card UI
 * @param {number|object} bmrResult 
 */
function renderBMRCard(bmrResult) {
  const stdView = document.getElementById('bmr-standard-view');
  const noticeView = document.getElementById('bmr-notice-view');
  const bmrValEl = document.getElementById('metric-bmr-value');

  if (typeof bmrResult === 'number' && bmrResult > 0) {
    if (stdView) stdView.classList.remove('d-none');
    if (noticeView) noticeView.classList.add('d-none');
    if (bmrValEl) {
      bmrValEl.innerHTML = `${bmrResult.toLocaleString()} <span class="stat-unit">kcal/day</span>`;
    }
  } else {
    // Render sex-specific requirement notice
    if (stdView) stdView.classList.add('d-none');
    if (noticeView) noticeView.classList.remove('d-none');
  }
}

/**
 * Render TDEE Card UI
 * @param {number} tdeeVal 
 * @param {number} bmrVal 
 * @param {string} activityLevel 
 * @param {number} multiplier 
 */
function renderTDEECard(tdeeVal, bmrVal, activityLevel, multiplier) {
  const tdeeValEl = document.getElementById('metric-tdee-value');
  const tdeeBreakdownEl = document.getElementById('metric-tdee-breakdown');
  const badgeEl = document.getElementById('metric-activity-badge');

  if (tdeeValEl) {
    tdeeValEl.innerHTML = tdeeVal > 0 ? `${tdeeVal.toLocaleString()} <span class="stat-unit">kcal/day</span>` : 'Not available';
  }

  if (tdeeBreakdownEl) {
    if (bmrVal > 0) {
      tdeeBreakdownEl.textContent = `${bmrVal.toLocaleString()} kcal × ${multiplier} (${activityLevel || 'Active'})`;
    } else {
      tdeeBreakdownEl.textContent = `Requires valid BMR calculation`;
    }
  }

  if (badgeEl) {
    badgeEl.textContent = `${activityLevel || 'Activity'} (x${multiplier})`;
  }
}

/**
 * Render BMI Card UI
 * @param {object} profile 
 */
function renderBMICard(profile) {
  const latest = getLatestBMI(profile);
  const bmiValEl = document.getElementById('metric-bmi-value');
  const badgeEl = document.getElementById('metric-bmi-badge');

  if (bmiValEl) {
    bmiValEl.innerHTML = `${latest.bmi.toFixed(2)} <span class="stat-unit">kg/m²</span>`;
  }

  if (badgeEl) {
    badgeEl.textContent = latest.category;
    if (latest.category === 'Normal Range') {
      badgeEl.className = 'badge bg-success';
    } else if (latest.category === 'Underweight') {
      badgeEl.className = 'badge bg-info';
    } else if (latest.category === 'Overweight') {
      badgeEl.className = 'badge bg-warning text-dark';
    } else if (latest.category === 'Obesity') {
      badgeEl.className = 'badge bg-danger';
    } else {
      badgeEl.className = 'badge bg-secondary';
    }
  }
}

/**
 * Render Waist-to-Height Ratio Card UI
 * @param {number|null} ratio 
 * @param {number} waistCm 
 * @param {number} heightCm 
 */
function renderWaistRatioCard(ratio, waistCm, heightCm) {
  const availView = document.getElementById('waist-available-view');
  const missingView = document.getElementById('waist-missing-view');
  const ratioValEl = document.getElementById('metric-waist-ratio-value');
  const breakdownEl = document.getElementById('waist-ratio-breakdown');

  if (ratio !== null && ratio > 0) {
    if (availView) availView.classList.remove('d-none');
    if (missingView) missingView.classList.add('d-none');
    if (ratioValEl) ratioValEl.textContent = ratio.toFixed(2);
    if (breakdownEl) breakdownEl.textContent = `Waist: ${waistCm} cm / Height: ${heightCm} cm`;
  } else {
    if (availView) availView.classList.add('d-none');
    if (missingView) missingView.classList.remove('d-none');
  }
}

/**
 * Render Heart Rate Cards UI
 * @param {number} maxHr 
 * @param {object} hrZones 
 * @param {number} age 
 */
function renderHeartRateCard(maxHr, hrZones, age) {
  const maxHrValEl = document.getElementById('metric-max-hr-value');
  const maxHrBreakdownEl = document.getElementById('max-hr-breakdown');

  const zoneModEl = document.getElementById('zone-moderate-val');
  const zoneVigEl = document.getElementById('zone-vigorous-val');

  if (maxHrValEl) {
    maxHrValEl.innerHTML = `${maxHr} <span class="stat-unit">bpm</span>`;
  }

  if (maxHrBreakdownEl) {
    maxHrBreakdownEl.textContent = `220 - ${age} yrs = ${maxHr} bpm`;
  }

  if (zoneModEl) {
    zoneModEl.textContent = `${hrZones.modMin} - ${hrZones.modMax} bpm`;
  }

  if (zoneVigEl) {
    zoneVigEl.textContent = `${hrZones.vigMin} - ${hrZones.vigMax} bpm`;
  }
}
