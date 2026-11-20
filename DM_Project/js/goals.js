/**
 * =======================================================
 * BMI & HEALTH CALCULATOR - GOALS MODULE (STEP 5)
 * Discrete Mathematics / Data Mathematics College Project
 * =======================================================
 */

let currentStatusFilter = 'ALL';
let currentCategoryFilter = 'ALL';
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initGoalsModule();
});

/**
 * Initialize Goals Module Listeners & Modals
 */
function initGoalsModule() {
  loadGoals();

  // Attach Open Create Goal Modal Listener
  const btnCreateModal = document.getElementById('btn-open-create-goal-modal');
  const btnEmptyCreate = document.getElementById('btn-empty-create-goal');

  if (btnCreateModal) btnCreateModal.addEventListener('click', () => openCreateGoalModal());
  if (btnEmptyCreate) btnEmptyCreate.addEventListener('click', () => openCreateGoalModal());

  // Goal Form Submit Listener
  const formGoal = document.getElementById('form-goal');
  if (formGoal) formGoal.addEventListener('submit', handleSaveGoal);

  // Update Progress Form Submit Listener
  const formUpdate = document.getElementById('form-update-progress');
  if (formUpdate) formUpdate.addEventListener('submit', handleSaveUpdateProgress);

  // Status Filter Pill Listeners
  const btnAll = document.getElementById('filter-status-all');
  const btnActive = document.getElementById('filter-status-active');
  const btnCompleted = document.getElementById('filter-status-completed');

  if (btnAll) btnAll.addEventListener('click', () => setStatusFilter('ALL', btnAll));
  if (btnActive) btnActive.addEventListener('click', () => setStatusFilter('ACTIVE', btnActive));
  if (btnCompleted) btnCompleted.addEventListener('click', () => setStatusFilter('COMPLETED', btnCompleted));

  // Category Filter Listener
  const filterCat = document.getElementById('filter-category');
  if (filterCat) {
    filterCat.addEventListener('change', (e) => {
      currentCategoryFilter = e.target.value;
      renderGoals();
    });
  }

  // Search Filter Listener
  const filterSearch = document.getElementById('filter-search');
  if (filterSearch) {
    filterSearch.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      renderGoals();
    });
  }
}

/**
 * Reusable Core Mathematical Function: Calculate Goal Progress Percentage
 * P(C,T) = min(100, round((C / T) * 100))
 * @param {number} currentValue 
 * @param {number} targetValue 
 * @returns {number} integer 0 to 100
 */
function calculateGoalProgress(currentValue, targetValue) {
  const c = parseFloat(currentValue);
  const t = parseFloat(targetValue);
  if (isNaN(c) || isNaN(t) || t <= 0) return 0;
  if (c <= 0) return 0;
  const rawP = (c / t) * 100;
  return Math.min(100, Math.max(0, Math.round(rawP)));
}

/**
 * Calculate Days Remaining from Target Date
 * @param {string} targetDateStr 
 * @param {string} status 
 * @returns {object} { text, badgeClass }
 */
function calculateDaysRemaining(targetDateStr, status) {
  if (status === 'completed') {
    return { text: "Completed", badgeClass: "bg-success" };
  }

  if (!targetDateStr) {
    return { text: "No target date", badgeClass: "bg-secondary" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: "Target date passed", badgeClass: "bg-danger" };
  } else if (diffDays === 0) {
    return { text: "Due today", badgeClass: "bg-warning text-dark" };
  } else if (diffDays === 1) {
    return { text: "1 day remaining", badgeClass: "bg-info text-white" };
  } else {
    return { text: `${diffDays} days remaining`, badgeClass: "bg-info text-white" };
  }
}

/**
 * Load Goals from LocalStorage
 */
function loadGoals() {
  const goals = getData(APP_KEYS.GOALS, []);
  renderGoalStatistics(goals);
  renderGoals();
}

/**
 * Save Goals to LocalStorage & Sync Dashboard
 * @param {array} goalsArray 
 */
function saveGoals(goalsArray) {
  saveData(APP_KEYS.GOALS, goalsArray);
  renderGoalStatistics(goalsArray);
  renderGoals();
  updateDashboardGoals();
}

/**
 * Open Create Goal Modal with pre-filled dates
 */
function openCreateGoalModal(editGoal = null) {
  const modalElem = document.getElementById('modal-goal-form');
  const modalTitle = document.getElementById('modal-goal-title');
  const errContainer = document.getElementById('goal-form-error');

  if (errContainer) errContainer.classList.add('d-none');

  const inputId = document.getElementById('goal-form-id');
  const inputTitle = document.getElementById('goal-input-title');
  const inputType = document.getElementById('goal-input-type');
  const inputDesc = document.getElementById('goal-input-desc');
  const inputTarget = document.getElementById('goal-input-target');
  const inputCurrent = document.getElementById('goal-input-current');
  const inputUnit = document.getElementById('goal-input-unit');
  const inputStart = document.getElementById('goal-input-start-date');
  const inputTargetDate = document.getElementById('goal-input-target-date');

  const todayStr = new Date().toISOString().split('T')[0];
  const tenDaysLater = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (editGoal) {
    if (modalTitle) modalTitle.innerHTML = `<i class="fas fa-pen text-primary me-2"></i> Edit Goal`;
    if (inputId) inputId.value = editGoal.id;
    if (inputTitle) inputTitle.value = editGoal.title;
    if (inputType) inputType.value = editGoal.type;
    if (inputDesc) inputDesc.value = editGoal.description || "";
    if (inputTarget) inputTarget.value = editGoal.targetValue;
    if (inputCurrent) inputCurrent.value = editGoal.currentValue;
    if (inputUnit) inputUnit.value = editGoal.unit;
    if (inputStart) inputStart.value = editGoal.startDate || todayStr;
    if (inputTargetDate) inputTargetDate.value = editGoal.targetDate || tenDaysLater;
  } else {
    if (modalTitle) modalTitle.innerHTML = `<i class="fas fa-bullseye text-primary me-2"></i> Create Wellness Goal`;
    if (inputId) inputId.value = "";
    if (inputTitle) inputTitle.value = "";
    if (inputType) inputType.value = "";
    if (inputDesc) inputDesc.value = "";
    if (inputTarget) inputTarget.value = "";
    if (inputCurrent) inputCurrent.value = "0";
    if (inputUnit) inputUnit.value = "";
    if (inputStart) inputStart.value = todayStr;
    if (inputTargetDate) inputTargetDate.value = tenDaysLater;
  }

  const bsModal = new bootstrap.Modal(modalElem);
  bsModal.show();
}

/**
 * Handle Goal Form Submit (Create or Edit)
 * @param {Event} e 
 */
function handleSaveGoal(e) {
  e.preventDefault();

  const id = document.getElementById('goal-form-id')?.value;
  const title = document.getElementById('goal-input-title')?.value.trim();
  const type = document.getElementById('goal-input-type')?.value;
  const desc = document.getElementById('goal-input-desc')?.value.trim();
  const targetVal = parseFloat(document.getElementById('goal-input-target')?.value);
  const currentVal = parseFloat(document.getElementById('goal-input-current')?.value) || 0;
  const unit = document.getElementById('goal-input-unit')?.value.trim();
  const startDate = document.getElementById('goal-input-start-date')?.value;
  const targetDate = document.getElementById('goal-input-target-date')?.value;

  if (!validateGoal(title, type, targetVal, currentVal, unit, startDate, targetDate)) {
    const errContainer = document.getElementById('goal-form-error');
    if (errContainer) errContainer.classList.remove('d-none');
    return;
  }

  const errContainer = document.getElementById('goal-form-error');
  if (errContainer) errContainer.classList.add('d-none');

  let goals = getData(APP_KEYS.GOALS, []);
  if (!Array.isArray(goals)) goals = [];

  const timestamp = new Date().toISOString();
  const isCompleted = currentVal >= targetVal;
  const status = isCompleted ? "completed" : "active";

  if (id) {
    // Update existing goal
    goals = goals.map(g => {
      if (g.id === id) {
        return {
          ...g,
          title,
          type,
          description: desc,
          targetValue: targetVal,
          currentValue: currentVal,
          unit,
          startDate,
          targetDate,
          status: isCompleted ? "completed" : g.status,
          updatedAt: timestamp
        };
      }
      return g;
    });
  } else {
    // Create new goal
    const newGoal = {
      id: "goal_" + Date.now(),
      title,
      type,
      description: desc,
      targetValue: targetVal,
      currentValue: currentVal,
      unit,
      startDate,
      targetDate,
      status: status,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    goals.unshift(newGoal);
  }

  saveGoals(goals);

  // Close Bootstrap Modal
  const modalElem = document.getElementById('modal-goal-form');
  const bsModal = bootstrap.Modal.getInstance(modalElem);
  if (bsModal) bsModal.hide();

  showToast(id ? "Goal updated successfully!" : "Goal created successfully!", "success");
}

/**
 * Validate Goal Form Fields
 */
function validateGoal(title, type, targetVal, currentVal, unit, startDate, targetDate) {
  if (!title || title.length < 2) return false;
  if (!type) return false;
  if (isNaN(targetVal) || targetVal <= 0 || !isFinite(targetVal)) return false;
  if (isNaN(currentVal) || currentVal < 0 || !isFinite(currentVal)) return false;
  if (!unit) return false;
  if (!startDate || !targetDate) return false;

  // Target Date should not be earlier than Start Date
  if (new Date(targetDate) < new Date(startDate)) return false;

  return true;
}

/**
 * Render Goal Cards Grid based on Active Filters
 */
function renderGoals() {
  let goals = getData(APP_KEYS.GOALS, []);
  if (!Array.isArray(goals)) goals = [];

  // Filter 1: Status Filter (ALL / ACTIVE / COMPLETED)
  if (currentStatusFilter === 'ACTIVE') {
    goals = goals.filter(g => g.status === 'active');
  } else if (currentStatusFilter === 'COMPLETED') {
    goals = goals.filter(g => g.status === 'completed');
  }

  // Filter 2: Category Filter
  if (currentCategoryFilter !== 'ALL') {
    goals = goals.filter(g => g.type === currentCategoryFilter);
  }

  // Filter 3: Search Query
  if (currentSearchQuery !== '') {
    goals = goals.filter(g => 
      g.title.toLowerCase().includes(currentSearchQuery) ||
      (g.description && g.description.toLowerCase().includes(currentSearchQuery)) ||
      g.type.toLowerCase().includes(currentSearchQuery)
    );
  }

  const container = document.getElementById('goals-grid-container');
  const emptyState = document.getElementById('goals-empty-state');

  if (goals.length === 0) {
    if (emptyState) emptyState.classList.remove('d-none');
    if (container) container.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.classList.add('d-none');

  let html = '';
  goals.forEach(goal => {
    const progressP = calculateGoalProgress(goal.currentValue, goal.targetValue);
    const daysInfo = calculateDaysRemaining(goal.targetDate, goal.status);
    const iconClass = getCategoryIcon(goal.type);
    const isCompleted = goal.status === 'completed' || progressP >= 100;

    html += `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="custom-card h-100 d-flex flex-direction-column justify-content-between">
          <div>
            <!-- Card Header -->
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="d-flex align-items-center gap-2">
                <div class="card-icon-badge ${isCompleted ? 'icon-emerald' : 'icon-primary'}">
                  <i class="fas ${iconClass}"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 text-main">${escapeHtml(goal.title)}</h6>
                  <span class="badge bg-light text-muted border fs-8">${escapeHtml(goal.type)}</span>
                </div>
              </div>
              <span class="badge ${isCompleted ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'} fw-bold fs-8">
                ${isCompleted ? 'Completed' : 'Active'}
              </span>
            </div>

            <!-- Description -->
            ${goal.description ? `<p class="fs-7 text-muted mb-3">${escapeHtml(goal.description)}</p>` : '<div class="mb-3"></div>'}

            <!-- Progress Meter -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1 fs-7">
                <span class="fw-bold text-main">${goal.currentValue.toLocaleString()} / ${goal.targetValue.toLocaleString()} ${escapeHtml(goal.unit)}</span>
                <span class="fw-extrabold ${isCompleted ? 'text-success' : 'text-primary'}">${progressP}%</span>
              </div>
              <div class="progress progress-thin" style="height: 10px;">
                <div class="progress-bar ${isCompleted ? 'bg-success' : 'bg-primary'}" role="progressbar" style="width: ${progressP}%"></div>
              </div>
            </div>

            <!-- Dates & Target Badge -->
            <div class="d-flex justify-content-between align-items-center fs-8 text-muted mb-3 pt-2 border-top">
              <span><i class="fas fa-calendar-day me-1"></i> Target: ${goal.targetDate || 'N/A'}</span>
              <span class="badge ${daysInfo.badgeClass}">${daysInfo.text}</span>
            </div>
          </div>

          <!-- Card Action Buttons -->
          <div class="d-flex gap-2 pt-2 border-top">
            ${!isCompleted ? `
              <button class="btn btn-sm btn-outline-primary flex-grow-1 fw-bold" onclick="openUpdateProgressModal('${goal.id}')">
                <i class="fas fa-pen me-1"></i> Update
              </button>
              <button class="btn btn-sm btn-outline-success flex-grow-1 fw-bold" onclick="markGoalComplete('${goal.id}')">
                <i class="fas fa-check me-1"></i> Complete
              </button>
            ` : `
              <button class="btn btn-sm btn-light text-success flex-grow-1 fw-bold disabled" disabled>
                <i class="fas fa-circle-check me-1"></i> Achieved
              </button>
            `}
            <button class="btn btn-sm btn-outline-danger" onclick="deleteGoal('${goal.id}')" title="Delete Goal">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  if (container) container.innerHTML = html;
}

/**
 * Render Goal Summary Statistics Cards at top of page
 * @param {array} goals 
 */
function renderGoalStatistics(goalsArray = null) {
  const goals = goalsArray || getData(APP_KEYS.GOALS, []);
  const total = goals.length;
  const active = goals.filter(g => g.status === 'active').length;
  const completed = goals.filter(g => g.status === 'completed').length;

  let sumProgress = 0;
  if (total > 0) {
    goals.forEach(g => {
      sumProgress += calculateGoalProgress(g.currentValue, g.targetValue);
    });
  }

  const avgProgress = total > 0 ? Math.round(sumProgress / total) : 0;

  const totalEl = document.getElementById('stat-total-goals');
  const activeEl = document.getElementById('stat-active-goals');
  const completedEl = document.getElementById('stat-completed-goals');
  const avgEl = document.getElementById('stat-avg-progress');

  if (totalEl) totalEl.textContent = total;
  if (activeEl) activeEl.textContent = active;
  if (completedEl) completedEl.textContent = completed;
  if (avgEl) avgEl.textContent = `${avgProgress}%`;
}

/**
 * Set Status Filter Active Pill
 */
function setStatusFilter(status, btnElem) {
  currentStatusFilter = status;
  const pills = document.querySelectorAll('#filter-status-all, #filter-status-active, #filter-status-completed');
  pills.forEach(p => p.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');
  renderGoals();
}

/**
 * Open Update Progress Modal
 * @param {string} id 
 */
function openUpdateProgressModal(id) {
  const goals = getData(APP_KEYS.GOALS, []);
  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  const inputId = document.getElementById('update-goal-id');
  const titleText = document.getElementById('update-goal-title-text');
  const targetText = document.getElementById('update-goal-target-text');
  const inputVal = document.getElementById('update-current-val');
  const unitText = document.getElementById('update-unit-text');
  const errBox = document.getElementById('update-form-error');

  if (errBox) errBox.classList.add('d-none');
  if (inputId) inputId.value = goal.id;
  if (titleText) titleText.textContent = goal.title;
  if (targetText) targetText.textContent = `Target: ${goal.targetValue.toLocaleString()} ${goal.unit}`;
  if (inputVal) inputVal.value = goal.currentValue;
  if (unitText) unitText.textContent = goal.unit;

  const modalElem = document.getElementById('modal-update-progress');
  const bsModal = new bootstrap.Modal(modalElem);
  bsModal.show();
}

/**
 * Handle Update Progress Submit
 * @param {Event} e 
 */
function handleSaveUpdateProgress(e) {
  e.preventDefault();

  const id = document.getElementById('update-goal-id')?.value;
  const newVal = parseFloat(document.getElementById('update-current-val')?.value);
  const errBox = document.getElementById('update-form-error');

  if (isNaN(newVal) || newVal < 0 || !isFinite(newVal)) {
    if (errBox) errBox.classList.remove('d-none');
    return;
  }

  if (errBox) errBox.classList.add('d-none');

  let goals = getData(APP_KEYS.GOALS, []);
  goals = goals.map(g => {
    if (g.id === id) {
      const isCompleted = newVal >= g.targetValue;
      return {
        ...g,
        currentValue: newVal,
        status: isCompleted ? 'completed' : g.status,
        updatedAt: new Date().toISOString()
      };
    }
    return g;
  });

  saveGoals(goals);

  const modalElem = document.getElementById('modal-update-progress');
  const bsModal = bootstrap.Modal.getInstance(modalElem);
  if (bsModal) bsModal.hide();

  showToast("Goal progress updated!", "success");
}

/**
 * Mark Goal Complete Explicitly
 * @param {string} id 
 */
function markGoalComplete(id) {
  let goals = getData(APP_KEYS.GOALS, []);
  goals = goals.map(g => {
    if (g.id === id) {
      return {
        ...g,
        currentValue: g.targetValue,
        status: 'completed',
        updatedAt: new Date().toISOString()
      };
    }
    return g;
  });

  saveGoals(goals);
  showToast("Goal marked as completed!", "success");
}

/**
 * Delete Goal with Confirmation Prompt
 * @param {string} id 
 */
function deleteGoal(id) {
  if (!confirm("Are you sure you want to delete this goal?")) return;

  let goals = getData(APP_KEYS.GOALS, []);
  goals = goals.filter(g => g.id !== id);

  saveGoals(goals);
  showToast("Goal deleted.", "info");
}

/**
 * Update Dashboard Stats Helper
 */
function updateDashboardGoals() {
  if (typeof updateTopNavUserProfile === 'function') {
    updateTopNavUserProfile();
  }
}

/**
 * Helper to get FontAwesome Icon for Goal Categories
 */
function getCategoryIcon(type) {
  const map = {
    "General Wellness": "fa-heartbeat",
    "Hydration": "fa-tint",
    "Sleep": "fa-bed",
    "Activity": "fa-running",
    "Nutrition": "fa-utensils",
    "Fitness": "fa-dumbbell",
    "Personal": "fa-bullseye"
  };
  return map[type] || "fa-bullseye";
}

/**
 * Escape HTML Helper
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
