/**
 * =======================================================
 * BMI & HEALTH CALCULATOR - BMI CALCULATOR MODULE (STEP 3)
 * Discrete Mathematics / Data Mathematics College Project
 * =======================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initBMICalculatorModule();
});

/**
 * Initialize BMI Calculator Event Listeners and Initial Load
 */
function initBMICalculatorModule() {
  const profile = loadProfileForBMI();

  // Attach Calculate Button Listener
  const btnCalculate = document.getElementById('btn-calculate-bmi');
  if (btnCalculate) {
    btnCalculate.addEventListener('click', () => {
      handleCalculateBMI();
    });
  }

  // Attach Save Measurement Button Listener
  const btnSave = document.getElementById('btn-save-bmi-measurement');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      saveBMIMeasurement();
    });
  }

  // Real-time calculation on input change
  const inputHeight = document.getElementById('calc-height-cm');
  const inputWeight = document.getElementById('calc-weight-kg');

  if (inputHeight) inputHeight.addEventListener('input', handleCalculateBMI);
  if (inputWeight) inputWeight.addEventListener('input', handleCalculateBMI);
}

/**
 * Reusable Core Mathematical Formula
 * BMI = Weight(kg) / (Height(m))^2
 * @param {number} weightKg 
 * @param {number} heightCm 
 * @returns {number} raw numeric BMI
 */
function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * Load User Profile for BMI Calculator
 * Checks if profile exists and has valid height & weight.
 */
function loadProfileForBMI() {
  const profile = getData(APP_KEYS.USER_PROFILE, null);
  const reqBanner = document.getElementById('bmi-profile-required');
  const calcBody = document.getElementById('bmi-calculator-body');

  if (!profile || !profile.heightCm || profile.heightCm <= 0 || !profile.weightKg || profile.weightKg <= 0) {
    if (reqBanner) reqBanner.classList.remove('d-none');
    if (calcBody) calcBody.classList.add('d-none');
    return null;
  }

  if (reqBanner) reqBanner.classList.add('d-none');
  if (calcBody) calcBody.classList.remove('d-none');

  // Fill Profile Overview Specs
  const userName = document.getElementById('bmi-user-name');
  const userAgeGender = document.getElementById('bmi-user-age-gender');
  const userHeight = document.getElementById('bmi-user-height');
  const userWeight = document.getElementById('bmi-user-weight');

  if (userName) userName.textContent = profile.name || "User";
  if (userAgeGender) {
    const ageStr = profile.age ? profile.age + " yrs" : "Age not set";
    const genderStr = profile.gender || "Gender not set";
    userAgeGender.textContent = `${ageStr} / ${genderStr}`;
  }

  if (userHeight) {
    const ftIn = cmToFeetInches(profile.heightCm);
    userHeight.textContent = `${profile.heightCm} cm (${ftIn.feet}'${ftIn.inches}")`;
  }

  if (userWeight) {
    const weightLb = Math.round(profile.weightKg * 2.20462 * 10) / 10;
    userWeight.textContent = `${profile.weightKg} kg (${weightLb} lbs)`;
  }

  // Pre-populate input fields
  const inputHeight = document.getElementById('calc-height-cm');
  const inputWeight = document.getElementById('calc-weight-kg');

  if (inputHeight) inputHeight.value = profile.heightCm;
  if (inputWeight) inputWeight.value = profile.weightKg;

  // Run initial calculation
  handleCalculateBMI();

  return profile;
}

/**
 * Execute Calculation & Update UI Elements
 */
function handleCalculateBMI() {
  const inputHeight = parseFloat(document.getElementById('calc-height-cm')?.value);
  const inputWeight = parseFloat(document.getElementById('calc-weight-kg')?.value);

  if (!validateBMIInputs(inputHeight, inputWeight)) {
    return;
  }

  const profile = getData(APP_KEYS.USER_PROFILE, {});
  const age = parseInt(profile.age, 10) || 21;

  const bmi = calculateBMI(inputWeight, inputHeight);

  displayBMIResult(bmi, age, inputWeight, inputHeight);
  updateBMIScale(bmi, age);
  updateComparisonPreview(bmi);
}

/**
 * Validate Height and Weight Inputs
 * @param {number} heightCm 
 * @param {number} weightKg 
 * @returns {boolean}
 */
function validateBMIInputs(heightCm, weightKg) {
  const errMsg = document.getElementById('calc-error-msg');
  
  if (isNaN(heightCm) || heightCm <= 0 || isNaN(weightKg) || weightKg <= 0 || !isFinite(heightCm) || !isFinite(weightKg)) {
    if (errMsg) errMsg.classList.remove('d-none');
    return false;
  }

  if (errMsg) errMsg.classList.add('d-none');
  return true;
}

/**
 * Display BMI Results, Breakdown, & Category Badge / Age Notice
 */
function displayBMIResult(bmi, age, weightKg, heightCm) {
  const valueDisplay = document.getElementById('bmi-value-display');
  const categoryBadge = document.getElementById('bmi-category-badge');
  const ageNotice = document.getElementById('bmi-age-notice');

  const bdHeight = document.getElementById('breakdown-height');
  const bdWeight = document.getElementById('breakdown-weight');
  const bdBmi = document.getElementById('breakdown-bmi');

  const roundedBMI = Math.round(bmi * 100) / 100;

  if (valueDisplay) valueDisplay.textContent = roundedBMI.toFixed(2);
  if (bdHeight) bdHeight.textContent = (heightCm / 100).toFixed(2) + " m";
  if (bdWeight) bdWeight.textContent = weightKg.toFixed(1) + " kg";
  if (bdBmi) bdBmi.textContent = roundedBMI.toFixed(2);

  const catResult = getBMICategory(bmi, age);

  if (catResult.isAdult) {
    if (categoryBadge) {
      categoryBadge.classList.remove('d-none');
      categoryBadge.className = `badge ${catResult.badgeClass} px-3 py-2 fs-6 fw-bold`;
      categoryBadge.textContent = catResult.category;
    }
    if (ageNotice) ageNotice.classList.add('d-none');
  } else {
    // Under 18 Age Safety Notice Rule
    if (categoryBadge) categoryBadge.classList.add('d-none');
    if (ageNotice) ageNotice.classList.remove('d-none');
  }
}

/**
 * Categorize Adult BMI or Return Under-18 Flag
 * @param {number} bmi 
 * @param {number} age 
 * @returns {object} { category, badgeClass, isAdult }
 */
function getBMICategory(bmi, age) {
  if (age < 18) {
    return {
      category: "Child/Teenager Growth Chart Required",
      badgeClass: "bg-secondary",
      isAdult: false
    };
  }

  if (bmi < 18.5) {
    return {
      category: "Underweight",
      badgeClass: "bg-info text-white",
      isAdult: true
    };
  } else if (bmi < 25.0) {
    return {
      category: "Normal Range",
      badgeClass: "bg-success text-white",
      isAdult: true
    };
  } else if (bmi < 30.0) {
    return {
      category: "Overweight",
      badgeClass: "bg-warning text-dark",
      isAdult: true
    };
  } else {
    return {
      category: "Obesity",
      badgeClass: "bg-danger text-white",
      isAdult: true
    };
  }
}

/**
 * Position Marker on Visual BMI Scale
 */
function updateBMIScale(bmi, age) {
  const marker = document.getElementById('bmi-scale-marker');
  const markerVal = document.getElementById('marker-bmi-value');

  if (markerVal) {
    markerVal.textContent = (Math.round(bmi * 100) / 100).toFixed(2);
  }

  if (!marker) return;

  // Scale bounds: Min 10, Max 40
  const minScale = 10;
  const maxScale = 40;
  let percentage = ((bmi - minScale) / (maxScale - minScale)) * 100;

  // Clamp percentage between 2% and 98%
  if (percentage < 2) percentage = 2;
  if (percentage > 98) percentage = 98;

  marker.style.left = `${percentage}%`;

  if (age < 18) {
    marker.style.opacity = "0.4";
  } else {
    marker.style.opacity = "1";
  }
}

/**
 * Update Preview Comparison Card Against Saved History
 * @param {number} currentBmi 
 */
function updateComparisonPreview(currentBmi) {
  const history = getData(APP_KEYS.BMI_HISTORY, []);
  const prevValElem = document.getElementById('prev-bmi-val');
  const currValElem = document.getElementById('curr-bmi-val');
  const diffValElem = document.getElementById('diff-bmi-val');
  const noteElem = document.getElementById('comparison-note');

  const currRounded = Math.round(currentBmi * 100) / 100;
  if (currValElem) currValElem.textContent = currRounded.toFixed(2);

  if (Array.isArray(history) && history.length > 0) {
    const lastRecord = history[history.length - 1];
    const prevBmi = lastRecord.bmi;
    const diff = currRounded - prevBmi;
    const diffSign = diff >= 0 ? "+" : "";

    if (prevValElem) prevValElem.textContent = prevBmi.toFixed(2);
    if (diffValElem) {
      diffValElem.textContent = `${diffSign}${diff.toFixed(2)}`;
      if (diff > 0) {
        diffValElem.className = "fw-bold fs-6 text-warning";
      } else if (diff < 0) {
        diffValElem.className = "fw-bold fs-6 text-success";
      } else {
        diffValElem.className = "fw-bold fs-6 text-muted";
      }
    }

    if (noteElem) {
      noteElem.textContent = `Compared with your previous saved measurement (${prevBmi.toFixed(2)}), the BMI value changed by ${diffSign}${diff.toFixed(2)}.`;
    }
  } else {
    if (prevValElem) prevValElem.textContent = "--";
    if (diffValElem) {
      diffValElem.textContent = "--";
      diffValElem.className = "fw-bold fs-6 text-muted";
    }
    if (noteElem) {
      noteElem.textContent = "No previous BMI measurement available. Click 'Save Measurement' to store your record.";
    }
  }
}

/**
 * Save BMI Measurement to LocalStorage on Explicit User Click
 */
function saveBMIMeasurement() {
  const inputHeight = parseFloat(document.getElementById('calc-height-cm')?.value);
  const inputWeight = parseFloat(document.getElementById('calc-weight-kg')?.value);

  if (!validateBMIInputs(inputHeight, inputWeight)) {
    showToast("Invalid inputs. Please specify valid height and weight.", "danger");
    return;
  }

  const profile = getData(APP_KEYS.USER_PROFILE, {});
  const age = parseInt(profile.age, 10) || 21;
  const bmiRaw = calculateBMI(inputWeight, inputHeight);
  const bmiRounded = Math.round(bmiRaw * 100) / 100;
  const timestamp = new Date().toISOString();

  // 1. Construct BMI History Record
  const newBmiRecord = {
    id: "bmi_" + Date.now(),
    bmi: bmiRounded,
    weightKg: inputWeight,
    heightCm: inputHeight,
    age: age,
    timestamp: timestamp
  };

  // 2. Construct Weight History Record
  const newWeightRecord = {
    id: "w_" + Date.now(),
    weightKg: inputWeight,
    timestamp: timestamp
  };

  // 3. Save to Centralized LocalStorage
  updateData(APP_KEYS.BMI_HISTORY, (history) => {
    if (!Array.isArray(history)) return [newBmiRecord];
    
    // Prevent duplicate submission within 2 seconds with identical BMI
    if (history.length > 0) {
      const last = history[history.length - 1];
      if (last.bmi === bmiRounded && (Date.now() - new Date(last.timestamp).getTime() < 2000)) {
        return history;
      }
    }
    return [...history, newBmiRecord];
  });

  updateData(APP_KEYS.WEIGHT_HISTORY, (history) => {
    if (!Array.isArray(history)) return [newWeightRecord];
    return [...history, newWeightRecord];
  });

  // 4. Update Centralized HealthData
  const catObj = getBMICategory(bmiRaw, age);
  updateData(APP_KEYS.HEALTH_DATA, {
    currentBmi: bmiRounded,
    bmiCategory: catObj.isAdult ? catObj.category : "Pediatric Evaluation",
    lastUpdated: timestamp
  });

  // 5. Sync Dashboard Components
  updateDashboardBMI();

  // 6. Refresh Comparison Card
  updateComparisonPreview(bmiRaw);

  showToast(`BMI measurement of ${bmiRounded.toFixed(2)} saved successfully!`, "success");
}

/**
 * Sync Dashboard Header and Cards
 */
function updateDashboardBMI() {
  if (typeof updateTopNavUserProfile === 'function') {
    updateTopNavUserProfile();
  }
}

/**
 * Helper to convert CM to Feet & Inches for display
 */
function cmToFeetInches(cm) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round((totalInches % 12) * 10) / 10;
  return { feet, inches };
}
