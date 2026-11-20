/**
 * =======================================================
 * BMI & HEALTH CALCULATOR - USER PROFILE MODULE (STEP 2)
 * Discrete Mathematics / Data Mathematics College Project
 * =======================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initProfileModule();
});

/**
 * Initialize Profile Module Event Listeners and Initial Load
 */
function initProfileModule() {
  loadProfile();

  // Attach Form Submit Listener
  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProfile();
    });
  }

  // Attach Reset Button Listener
  const btnReset = document.getElementById('btn-reset-profile');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      resetProfileForm();
    });
  }

  // Attach Scroll to Edit Button Listener
  const btnScroll = document.getElementById('btn-edit-profile-scroll');
  if (btnScroll) {
    btnScroll.addEventListener('click', () => {
      const inputName = document.getElementById('input-name');
      if (inputName) {
        inputName.focus();
        inputName.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // Attach Height Unit Switch Listeners
  const unitCm = document.getElementById('unit-height-cm');
  const unitFtin = document.getElementById('unit-height-ftin');

  if (unitCm) unitCm.addEventListener('change', handleHeightUnitChange);
  if (unitFtin) unitFtin.addEventListener('change', handleHeightUnitChange);

  // Attach Weight Unit Switch Listeners
  const unitKg = document.getElementById('unit-weight-kg');
  const unitLb = document.getElementById('unit-weight-lb');

  if (unitKg) unitKg.addEventListener('change', handleWeightUnitChange);
  if (unitLb) unitLb.addEventListener('change', handleWeightUnitChange);

  // Attach Waist Unit Switch Listeners
  const unitWaistCm = document.getElementById('unit-waist-cm');
  const unitWaistIn = document.getElementById('unit-waist-in');

  if (unitWaistCm) unitWaistCm.addEventListener('change', handleWaistUnitChange);
  if (unitWaistIn) unitWaistIn.addEventListener('change', handleWaistUnitChange);

  // Real-time live completion updates on form input
  const inputElements = document.querySelectorAll('#profile-form input, #profile-form select');
  inputElements.forEach(elem => {
    elem.addEventListener('input', () => {
      const currentFormObj = getFormValues();
      calculateProfileCompletion(currentFormObj);
    });
  });
}

/**
 * Retrieve Profile from LocalStorage & Populate Form & Summary
 */
function loadProfile() {
  const profile = getData(APP_KEYS.USER_PROFILE, null);
  
  if (profile) {
    populateForm(profile);
    updateProfilePreview(profile);
    calculateProfileCompletion(profile);
  } else {
    // Default fallback if no profile exists
    const defaultProfile = {
      name: "",
      age: "",
      gender: "",
      heightCm: 0,
      weightKg: 0,
      activityLevel: "",
      healthGoal: "",
      waistCm: 0,
      updatedAt: null
    };
    populateForm(defaultProfile);
    updateProfilePreview(defaultProfile);
    calculateProfileCompletion(defaultProfile);
  }
}

/**
 * Populate Form fields from profile object
 * @param {object} profile 
 */
function populateForm(profile) {
  const inputName = document.getElementById('input-name');
  const inputAge = document.getElementById('input-age');
  const inputGender = document.getElementById('input-gender');
  const inputHeightCm = document.getElementById('input-height-cm');
  const inputWeight = document.getElementById('input-weight');
  const inputActivity = document.getElementById('input-activity');
  const inputGoal = document.getElementById('input-goal');
  const inputWaist = document.getElementById('input-waist');

  if (inputName) inputName.value = profile.name || "";
  if (inputAge) inputAge.value = profile.age || "";
  if (inputGender) inputGender.value = profile.gender || "";

  // Height Population (Standardized in CM)
  if (inputHeightCm && profile.heightCm > 0) {
    inputHeightCm.value = profile.heightCm;
    const feetIn = cmToFeetInches(profile.heightCm);
    const inputFt = document.getElementById('input-height-ft');
    const inputIn = document.getElementById('input-height-in');
    if (inputFt) inputFt.value = feetIn.feet;
    if (inputIn) inputIn.value = feetIn.inches;
  }

  // Weight Population (Standardized in KG)
  if (inputWeight && profile.weightKg > 0) {
    const isLb = document.getElementById('unit-weight-lb')?.checked;
    if (isLb) {
      inputWeight.value = Math.round(profile.weightKg * 2.20462 * 10) / 10;
    } else {
      inputWeight.value = profile.weightKg;
    }
  }

  if (inputActivity) inputActivity.value = profile.activityLevel || "";
  if (inputGoal) inputGoal.value = profile.healthGoal || "";

  // Waist Population (Standardized in CM)
  if (inputWaist && profile.waistCm > 0) {
    const isWaistIn = document.getElementById('unit-waist-in')?.checked;
    if (isWaistIn) {
      inputWaist.value = Math.round((profile.waistCm / 2.54) * 10) / 10;
    } else {
      inputWaist.value = profile.waistCm;
    }
  }
}

/**
 * Get current form values converted to standard units (height in cm, weight in kg, waist in cm)
 */
function getFormValues() {
  const name = document.getElementById('input-name')?.value.trim() || "";
  const age = parseInt(document.getElementById('input-age')?.value, 10) || 0;
  const gender = document.getElementById('input-gender')?.value || "";

  // Height Conversion
  let heightCm = 0;
  const isFtIn = document.getElementById('unit-height-ftin')?.checked;
  if (isFtIn) {
    const ft = parseFloat(document.getElementById('input-height-ft')?.value) || 0;
    const inc = parseFloat(document.getElementById('input-height-in')?.value) || 0;
    if (ft > 0 || inc > 0) {
      heightCm = Math.round(((ft * 12) + inc) * 2.54 * 10) / 10;
    }
  } else {
    heightCm = parseFloat(document.getElementById('input-height-cm')?.value) || 0;
  }

  // Weight Conversion
  let weightKg = 0;
  const weightInput = parseFloat(document.getElementById('input-weight')?.value) || 0;
  const isLb = document.getElementById('unit-weight-lb')?.checked;
  if (weightInput > 0) {
    if (isLb) {
      weightKg = Math.round((weightInput / 2.20462) * 10) / 10;
    } else {
      weightKg = weightInput;
    }
  }

  const activityLevel = document.getElementById('input-activity')?.value || "";
  const healthGoal = document.getElementById('input-goal')?.value || "";

  // Waist Conversion
  let waistCm = 0;
  const waistInput = parseFloat(document.getElementById('input-waist')?.value) || 0;
  const isWaistIn = document.getElementById('unit-waist-in')?.checked;
  if (waistInput > 0) {
    if (isWaistIn) {
      waistCm = Math.round(waistInput * 2.54 * 10) / 10;
    } else {
      waistCm = waistInput;
    }
  }

  return {
    name,
    age,
    gender,
    heightCm,
    weightKg,
    activityLevel,
    healthGoal,
    waistCm
  };
}

/**
 * Validate Profile Inputs with User-Friendly Messages
 * @returns {boolean} isValid
 */
function validateProfile() {
  let isValid = true;

  // 1. Full Name Validation
  const inputName = document.getElementById('input-name');
  const errName = document.getElementById('err-name');
  if (inputName) {
    if (!inputName.value || inputName.value.trim().length < 2) {
      setFieldError(inputName, errName, true);
      isValid = false;
    } else {
      setFieldError(inputName, errName, false);
    }
  }

  // 2. Age Validation
  const inputAge = document.getElementById('input-age');
  const errAge = document.getElementById('err-age');
  if (inputAge) {
    const val = parseInt(inputAge.value, 10);
    if (isNaN(val) || val < 1 || val > 120) {
      setFieldError(inputAge, errAge, true);
      isValid = false;
    } else {
      setFieldError(inputAge, errAge, false);
    }
  }

  // 3. Gender Validation
  const inputGender = document.getElementById('input-gender');
  const errGender = document.getElementById('err-gender');
  if (inputGender) {
    if (!inputGender.value) {
      setFieldError(inputGender, errGender, true);
      isValid = false;
    } else {
      setFieldError(inputGender, errGender, false);
    }
  }

  // 4. Height Validation
  const isFtIn = document.getElementById('unit-height-ftin')?.checked;
  const errHeight = document.getElementById('err-height');
  if (isFtIn) {
    const inputFt = document.getElementById('input-height-ft');
    const inputIn = document.getElementById('input-height-in');
    const ft = parseFloat(inputFt?.value);
    const inc = parseFloat(inputIn?.value) || 0;

    if (isNaN(ft) || ft < 1 || ft > 9 || isNaN(inc) || inc < 0 || inc >= 12) {
      if (inputFt) inputFt.classList.add('is-invalid');
      if (inputIn) inputIn.classList.add('is-invalid');
      if (errHeight) errHeight.classList.remove('d-none');
      isValid = false;
    } else {
      if (inputFt) inputFt.classList.remove('is-invalid');
      if (inputIn) inputIn.classList.remove('is-invalid');
      if (errHeight) errHeight.classList.add('d-none');
    }
  } else {
    const inputHeightCm = document.getElementById('input-height-cm');
    if (inputHeightCm) {
      const val = parseFloat(inputHeightCm.value);
      if (isNaN(val) || val < 30 || val > 300) {
        inputHeightCm.classList.add('is-invalid');
        if (errHeight) errHeight.classList.remove('d-none');
        isValid = false;
      } else {
        inputHeightCm.classList.remove('is-invalid');
        inputHeightCm.classList.add('is-valid');
        if (errHeight) errHeight.classList.add('d-none');
      }
    }
  }

  // 5. Weight Validation
  const inputWeight = document.getElementById('input-weight');
  const errWeight = document.getElementById('err-weight');
  if (inputWeight) {
    const val = parseFloat(inputWeight.value);
    if (isNaN(val) || val <= 0 || val > 1000) {
      setFieldError(inputWeight, errWeight, true);
      isValid = false;
    } else {
      setFieldError(inputWeight, errWeight, false);
    }
  }

  // 6. Activity Level Validation
  const inputActivity = document.getElementById('input-activity');
  const errActivity = document.getElementById('err-activity');
  if (inputActivity) {
    if (!inputActivity.value) {
      setFieldError(inputActivity, errActivity, true);
      isValid = false;
    } else {
      setFieldError(inputActivity, errActivity, false);
    }
  }

  // 7. Health Goal Validation
  const inputGoal = document.getElementById('input-goal');
  const errGoal = document.getElementById('err-goal');
  if (inputGoal) {
    if (!inputGoal.value) {
      setFieldError(inputGoal, errGoal, true);
      isValid = false;
    } else {
      setFieldError(inputGoal, errGoal, false);
    }
  }

  // 8. Optional Waist Validation
  const inputWaist = document.getElementById('input-waist');
  const errWaist = document.getElementById('err-waist');
  if (inputWaist && inputWaist.value !== "") {
    const val = parseFloat(inputWaist.value);
    if (isNaN(val) || val <= 0) {
      setFieldError(inputWaist, errWaist, true);
      isValid = false;
    } else {
      setFieldError(inputWaist, errWaist, false);
    }
  } else if (inputWaist) {
    setFieldError(inputWaist, errWaist, false);
  }

  return isValid;
}

/**
 * Helper to toggle field error status
 */
function setFieldError(fieldElem, errorElem, hasError) {
  if (hasError) {
    fieldElem.classList.add('is-invalid');
    fieldElem.classList.remove('is-valid');
    if (errorElem) errorElem.style.display = 'block';
  } else {
    fieldElem.classList.remove('is-invalid');
    fieldElem.classList.add('is-valid');
    if (errorElem) errorElem.style.display = 'none';
  }
}

/**
 * Save User Profile Data to LocalStorage
 */
function saveProfile() {
  if (!validateProfile()) {
    showToast("Please correct the invalid fields in the form.", "danger");
    return;
  }

  const formValues = getFormValues();
  const profileData = {
    ...formValues,
    updatedAt: new Date().toISOString()
  };

  // Save to Centralized LocalStorage using app.js function
  const success = saveData(APP_KEYS.USER_PROFILE, profileData);

  if (success) {
    updateProfilePreview(profileData);
    calculateProfileCompletion(profileData);
    
    // Sync header profile avatar & name
    if (typeof updateTopNavUserProfile === 'function') {
      updateTopNavUserProfile();
    }

    showToast("User profile saved successfully!", "success");
  } else {
    showToast("Error saving profile to storage.", "danger");
  }
}

/**
 * Reset Profile Form to stored data or empty defaults
 */
function resetProfileForm() {
  // Remove all validation classes
  const inputs = document.querySelectorAll('#profile-form input, #profile-form select');
  inputs.forEach(input => {
    input.classList.remove('is-invalid', 'is-valid');
  });

  const errorMsgs = document.querySelectorAll('.invalid-feedback');
  errorMsgs.forEach(msg => {
    msg.style.display = 'none';
  });

  loadProfile();
  showToast("Profile form reset to saved values.", "info");
}

/**
 * Update Left Column Summary Preview Card
 * @param {object} profile 
 */
function updateProfilePreview(profile) {
  const summaryName = document.getElementById('summary-name');
  const summaryAvatar = document.getElementById('summary-avatar');
  const summaryAge = document.getElementById('summary-age');
  const summaryHeight = document.getElementById('summary-height');
  const summaryWeight = document.getElementById('summary-weight');
  const summaryGender = document.getElementById('summary-gender');
  const summaryActivity = document.getElementById('summary-activity');
  const summaryGoal = document.getElementById('summary-goal');
  const summaryWaist = document.getElementById('summary-waist');
  const summaryUpdated = document.getElementById('summary-updated');

  if (summaryName) summaryName.textContent = profile.name || "User Name";

  if (summaryAvatar && profile.name) {
    const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    summaryAvatar.textContent = initials || "U";
  } else if (summaryAvatar) {
    summaryAvatar.textContent = "AM";
  }

  if (summaryAge) {
    summaryAge.innerHTML = `<i class="fas fa-cake-candles me-1"></i> ${profile.age ? profile.age + ' yrs' : 'Not set'}`;
  }

  if (summaryHeight) {
    if (profile.heightCm > 0) {
      const ftIn = cmToFeetInches(profile.heightCm);
      summaryHeight.innerHTML = `<i class="fas fa-ruler-vertical me-1"></i> ${profile.heightCm} cm (${ftIn.feet}'${ftIn.inches}")`;
    } else {
      summaryHeight.innerHTML = `<i class="fas fa-ruler-vertical me-1"></i> Height not set`;
    }
  }

  if (summaryWeight) {
    if (profile.weightKg > 0) {
      const weightLb = Math.round(profile.weightKg * 2.20462 * 10) / 10;
      summaryWeight.innerHTML = `<i class="fas fa-weight-scale me-1"></i> ${profile.weightKg} kg (${weightLb} lbs)`;
    } else {
      summaryWeight.innerHTML = `<i class="fas fa-weight-scale me-1"></i> Weight not set`;
    }
  }

  if (summaryGender) summaryGender.textContent = profile.gender || "Not specified";
  if (summaryActivity) summaryActivity.textContent = profile.activityLevel || "Not specified";
  if (summaryGoal) summaryGoal.textContent = profile.healthGoal || "Not specified";

  if (summaryWaist) {
    if (profile.waistCm > 0) {
      const waistIn = Math.round((profile.waistCm / 2.54) * 10) / 10;
      summaryWaist.textContent = `${profile.waistCm} cm (${waistIn} in)`;
    } else {
      summaryWaist.textContent = "Not specified";
    }
  }

  if (summaryUpdated) {
    if (profile.updatedAt) {
      const dateObj = new Date(profile.updatedAt);
      summaryUpdated.textContent = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      summaryUpdated.textContent = "Just now";
    }
  }
}

/**
 * Calculate Profile Completion Percentage Dynamically
 * @param {object} profile 
 */
function calculateProfileCompletion(profile) {
  const fields = [
    Boolean(profile.name && profile.name.trim().length >= 2),
    Boolean(profile.age && profile.age > 0),
    Boolean(profile.gender),
    Boolean(profile.heightCm && profile.heightCm > 0),
    Boolean(profile.weightKg && profile.weightKg > 0),
    Boolean(profile.activityLevel),
    Boolean(profile.healthGoal),
    Boolean(profile.waistCm && profile.waistCm > 0) // Optional 8th field
  ];

  const completedCount = fields.filter(Boolean).length;
  const percentage = Math.round((completedCount / fields.length) * 100);

  const textElem = document.getElementById('completion-text');
  const barElem = document.getElementById('completion-bar');

  if (textElem) textElem.textContent = `${percentage}%`;
  if (barElem) {
    barElem.style.width = `${percentage}%`;
    
    // Color transitions based on completion level
    if (percentage < 40) {
      barElem.className = "progress-bar bg-danger progress-bar-striped progress-bar-animated";
    } else if (percentage < 75) {
      barElem.className = "progress-bar bg-warning progress-bar-striped progress-bar-animated";
    } else {
      barElem.className = "progress-bar bg-primary progress-bar-striped progress-bar-animated";
    }
  }

  return percentage;
}

/**
 * Handle Height Unit Selector Change (CM <-> FT-IN)
 */
function handleHeightUnitChange() {
  const isFtIn = document.getElementById('unit-height-ftin')?.checked;
  const containerCm = document.getElementById('container-height-cm');
  const containerFtIn = document.getElementById('container-height-ftin');
  const inputCm = document.getElementById('input-height-cm');
  const inputFt = document.getElementById('input-height-ft');
  const inputIn = document.getElementById('input-height-in');

  if (isFtIn) {
    // Switch to Feet/Inches Mode
    containerCm?.classList.add('d-none');
    containerFtIn?.classList.remove('d-none');

    const cmVal = parseFloat(inputCm?.value);
    if (!isNaN(cmVal) && cmVal > 0) {
      const feetIn = cmToFeetInches(cmVal);
      if (inputFt) inputFt.value = feetIn.feet;
      if (inputIn) inputIn.value = feetIn.inches;
    }
  } else {
    // Switch to CM Mode
    containerFtIn?.classList.add('d-none');
    containerCm?.classList.remove('d-none');

    const ft = parseFloat(inputFt?.value);
    const inc = parseFloat(inputIn?.value) || 0;
    if (!isNaN(ft) && ft > 0) {
      const cmVal = feetInchesToCm(ft, inc);
      if (inputCm) inputCm.value = cmVal;
    }
  }
}

/**
 * Handle Weight Unit Selector Change (KG <-> LB)
 */
function handleWeightUnitChange() {
  const isLb = document.getElementById('unit-weight-lb')?.checked;
  const inputWeight = document.getElementById('input-weight');
  const labelUnit = document.getElementById('label-weight-unit');

  if (labelUnit) labelUnit.textContent = isLb ? "lb" : "kg";

  const currentVal = parseFloat(inputWeight?.value);
  if (!isNaN(currentVal) && currentVal > 0) {
    if (isLb) {
      // KG to LB
      inputWeight.value = Math.round(currentVal * 2.20462 * 10) / 10;
    } else {
      // LB to KG
      inputWeight.value = Math.round((currentVal / 2.20462) * 10) / 10;
    }
  }
}

/**
 * Handle Waist Unit Selector Change (CM <-> IN)
 */
function handleWaistUnitChange() {
  const isWaistIn = document.getElementById('unit-waist-in')?.checked;
  const inputWaist = document.getElementById('input-waist');
  const labelUnit = document.getElementById('label-waist-unit');

  if (labelUnit) labelUnit.textContent = isWaistIn ? "in" : "cm";

  const currentVal = parseFloat(inputWaist?.value);
  if (!isNaN(currentVal) && currentVal > 0) {
    if (isWaistIn) {
      // CM to IN
      inputWaist.value = Math.round((currentVal / 2.54) * 10) / 10;
    } else {
      // IN to CM
      inputWaist.value = Math.round(currentVal * 2.54 * 10) / 10;
    }
  }
}

// ==========================================
// CONVERSION MATH HELPERS
// ==========================================

function cmToFeetInches(cm) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round((totalInches % 12) * 10) / 10;
  return { feet, inches };
}

function feetInchesToCm(feet, inches) {
  const totalInches = (feet * 12) + (inches || 0);
  return Math.round(totalInches * 2.54 * 10) / 10;
}

function convertHeight(val, fromUnit, toUnit) {
  if (fromUnit === 'cm' && toUnit === 'ft-in') {
    return cmToFeetInches(val);
  } else if (fromUnit === 'ft-in' && toUnit === 'cm') {
    return feetInchesToCm(val.feet, val.inches);
  }
  return val;
}

function convertWeight(val, fromUnit, toUnit) {
  if (fromUnit === 'kg' && toUnit === 'lb') {
    return Math.round(val * 2.20462 * 10) / 10;
  } else if (fromUnit === 'lb' && toUnit === 'kg') {
    return Math.round((val / 2.20462) * 10) / 10;
  }
  return val;
}
