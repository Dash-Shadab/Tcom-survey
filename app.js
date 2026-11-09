/**
 * Deepfake Image Detection Study - Core Application Engine
 * Handles experimental state, counterbalanced randomization,
 * strict forward navigation, metrics computation, and researcher portal.
 */

(function () {
  'use strict';

  // --- APPLICATION STATE ---
  const state = {
    participantId: null,
    assignedGroup: null, // "Group 1" (Pre Set A -> Post Set B) or "Group 2" (Pre Set B -> Post Set A)
    currentPhase: "DEMOGRAPHICS", // DEMOGRAPHICS, PRE_TEST, TRAINING_TRANSITION, TRAINING, POST_TEST, COMPLETE
    currentQuestionIndex: 0, // 0 to 4 for each 5-image test
    currentTrainingStep: 0,
    
    // Demographics collected
    demographics: {
      ageRange: "Prefer not to say",
      familiarity: "beginner"
    },

    // Session Timers
    timers: {
      sessionStartTime: null,
      preTestStartTime: null,
      trainingStartTime: null,
      trainingEndTime: null,
      postTestStartTime: null,
      questionStartTime: null
    },

    // Responses
    preTestAnswers: [],  // array of { imageId, response, groundTruth, isCorrect, latencyMs }
    postTestAnswers: [], // array of { imageId, response, groundTruth, isCorrect, latencyMs }
    
    // Evaluation summary
    results: null
  };

  // --- DOM ELEMENTS ---
  const el = {
    // Header
    participantBadge: document.getElementById("participantBadge"),
    progressFill: document.getElementById("progressFill"),
    progressPercentage: document.getElementById("progressPercentage"),
    progressPhaseLabel: document.getElementById("progressPhaseLabel"),
    
    // Phases
    viewDemographics: document.getElementById("viewDemographics"),
    viewAssessment: document.getElementById("viewAssessment"),
    viewTrainingTransition: document.getElementById("viewTrainingTransition"),
    viewTraining: document.getElementById("viewTraining"),
    viewComplete: document.getElementById("viewComplete"),
    
    // Demographics Form
    displayPid: document.getElementById("displayPid"),
    ageSelect: document.getElementById("ageSelect"),
    btnStartStudy: document.getElementById("btnStartStudy"),

    // Assessment Screen
    assessmentBadge: document.getElementById("assessmentBadge"),
    assessmentCounter: document.getElementById("assessmentCounter"),
    imageContainer: document.getElementById("imageContainer"),
    imageEl: document.getElementById("assessmentImage"),
    imagePlaceholder: document.getElementById("imagePlaceholder"),
    btnInspectImage: document.getElementById("btnInspectImage"),
    btnChooseReal: document.getElementById("btnChooseReal"),
    btnChooseAi: document.getElementById("btnChooseAi"),

    // Training Transition
    btnBeginTraining: document.getElementById("btnBeginTraining"),

    // Training Module
    trainingBadge: document.getElementById("trainingBadge"),
    trainingStepIndicator: document.getElementById("trainingStepIndicator"),
    trainingPillsContainer: document.getElementById("trainingPillsContainer"),
    trainingContentContainer: document.getElementById("trainingContentContainer"),
    btnPrevTraining: document.getElementById("btnPrevTraining"),
    btnNextTraining: document.getElementById("btnNextTraining"),
    btnProceedPostTest: document.getElementById("btnProceedPostTest"),

    // Complete Screen
    completionPid: document.getElementById("completionPid"),
    completionGroup: document.getElementById("completionGroup"),
    
    // Researcher Portal & Modal
    researcherModal: document.getElementById("researcherModal"),
    researcherPasscodePrompt: document.getElementById("researcherPasscodePrompt"),
    researcherDashboard: document.getElementById("researcherDashboard"),
    passcodeInput: document.getElementById("passcodeInput"),
    passcodeError: document.getElementById("passcodeError"),
    btnVerifyPasscode: document.getElementById("btnVerifyPasscode"),
    btnCloseModal: document.getElementById("btnCloseModal"),
    btnOpenResearcher: document.getElementById("btnOpenResearcher"),
    btnExportCsv: document.getElementById("btnExportCsv"),
    btnExportJson: document.getElementById("btnExportJson"),
    btnGenerateMock: document.getElementById("btnGenerateMock"),
    btnClearData: document.getElementById("btnClearData"),
    answerKeyContainer: document.getElementById("answerKeyContainer"),
    participantsTableBody: document.getElementById("participantsTableBody"),
    
    // Summary Stat Elements in Researcher View
    statTotalParticipants: document.getElementById("statTotalParticipants"),
    statMeanPreAccuracy: document.getElementById("statMeanPreAccuracy"),
    statMeanPostAccuracy: document.getElementById("statMeanPostAccuracy"),
    statMeanDelta: document.getElementById("statMeanDelta"),
    statGroupSplit: document.getElementById("statGroupSplit"),
    statRealAccuracy: document.getElementById("statRealAccuracy"),
    statAiAccuracy: document.getElementById("statAiAccuracy"),

    // Image Zoom Modal
    zoomModal: document.getElementById("zoomModal"),
    zoomImage: document.getElementById("zoomImage"),
    zoomModalTitle: document.getElementById("zoomModalTitle"),
    btnCloseZoom: document.getElementById("btnCloseZoom")
  };

  // --- INITIALIZATION ---
  function init() {
    setupParticipant();
    populateDemographicsOptions();
    bindEvents();
    enforceAntiBacktracking();
    updateProgressUI();
  }

  // Generate unique anonymous Participant ID & Randomly assign 50/50 Group
  function setupParticipant() {
    // Generate PID: e.g. PID-9824B
    const randPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    state.participantId = `PID-${randPart}`;
    
    // Counterbalanced Group Assignment:
    // Group 1: Pre-test Set A -> Training -> Post-test Set B
    // Group 2: Pre-test Set B -> Training -> Post-test Set A
    state.assignedGroup = Math.random() < 0.5 ? "Group 1" : "Group 2";
    state.timers.sessionStartTime = new Date().toISOString();

    if (el.participantBadge) el.participantBadge.textContent = state.participantId;
    if (el.displayPid) el.displayPid.textContent = state.participantId;
  }

  function populateDemographicsOptions() {
    // Age range options
    if (el.ageSelect && STUDY_CONFIG.ageRanges) {
      el.ageSelect.innerHTML = STUDY_CONFIG.ageRanges.map(range => 
        `<option value="${range}">${range}</option>`
      ).join('');
    }
  }

  // --- EVENT LISTENERS ---
  function bindEvents() {
    // Familiarity radio cards
    document.querySelectorAll('input[name="familiarity"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('selected'));
        const card = e.target.closest('.radio-card');
        if (card) card.classList.add('selected');
        state.demographics.familiarity = e.target.value;
      });
    });

    // Start Study
    if (el.btnStartStudy) {
      el.btnStartStudy.addEventListener('click', () => {
        if (el.ageSelect) state.demographics.ageRange = el.ageSelect.value;
        startPreTest();
      });
    }

    // Assessment Decision Buttons: 1 to 5 Confidence Scale
    document.querySelectorAll('.confidence-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.getAttribute('data-rating'), 10);
        handleConfidenceRating(rating, btn);
      });
    });

    // Image Zoom / Inspect
    if (el.btnInspectImage) {
      el.btnInspectImage.addEventListener('click', openImageZoomModal);
    }
    if (el.btnCloseZoom) {
      el.btnCloseZoom.addEventListener('click', closeImageZoomModal);
    }
    if (el.zoomModal) {
      el.zoomModal.addEventListener('click', (e) => {
        if (e.target === el.zoomModal) closeImageZoomModal();
      });
    }

    // Training Navigation
    if (el.btnBeginTraining) {
      el.btnBeginTraining.addEventListener('click', startTrainingModule);
    }
    if (el.btnPrevTraining) {
      el.btnPrevTraining.addEventListener('click', prevTrainingStep);
    }
    if (el.btnNextTraining) {
      el.btnNextTraining.addEventListener('click', nextTrainingStep);
    }
    if (el.btnProceedPostTest) {
      el.btnProceedPostTest.addEventListener('click', startPostTest);
    }

    // Researcher Modal
    if (el.btnOpenResearcher) {
      el.btnOpenResearcher.addEventListener('click', openResearcherModal);
    }
    if (el.btnCloseModal) {
      el.btnCloseModal.addEventListener('click', closeResearcherModal);
    }
    if (el.btnVerifyPasscode) {
      el.btnVerifyPasscode.addEventListener('click', verifyResearcherPasscode);
    }
    if (el.passcodeInput) {
      el.passcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyResearcherPasscode();
      });
    }

    // Researcher Actions
    if (el.btnExportCsv) {
      el.btnExportCsv.addEventListener('click', exportDatasetCsv);
    }
    if (el.btnExportJson) {
      el.btnExportJson.addEventListener('click', exportDatasetJson);
    }
    if (el.btnGenerateMock) {
      el.btnGenerateMock.addEventListener('click', generateMockParticipant);
    }
    if (el.btnClearData) {
      el.btnClearData.addEventListener('click', clearAllStoredData);
    }

    // Google Sheet Webhook Sync
    const sheetWebhookInput = document.getElementById("sheetWebhookInput");
    const btnSaveSheetWebhook = document.getElementById("btnSaveSheetWebhook");
    const sheetSyncStatus = document.getElementById("sheetSyncStatus");

    if (sheetWebhookInput) {
      sheetWebhookInput.value = localStorage.getItem('deepfake_study_google_webhook') || '';
    }

    if (btnSaveSheetWebhook) {
      btnSaveSheetWebhook.addEventListener('click', async () => {
        const url = sheetWebhookInput ? sheetWebhookInput.value.trim() : '';
        if (!url || !url.startsWith('http')) {
          alert("Please enter a valid Google Apps Script Webhook URL (starts with https://script.google.com/...)");
          return;
        }

        localStorage.setItem('deepfake_study_google_webhook', url);

        if (sheetSyncStatus) {
          sheetSyncStatus.className = "";
          sheetSyncStatus.style.color = "#15803d";
          sheetSyncStatus.textContent = "Connecting to Google Sheet & syncing submissions...";
          sheetSyncStatus.classList.remove('hidden');
        }

        try {
          if (window.location.protocol.startsWith('http')) {
            const res = await fetch('/api/google-sheet-webhook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ webhookUrl: url })
            });
            const data = await res.json();
            if (sheetSyncStatus) {
              sheetSyncStatus.textContent = `Connected! Synced ${data.syncedExistingCount || 0} existing submissions to your Google Sheet.`;
            }
          } else {
            const submissions = JSON.parse(localStorage.getItem('deepfake_study_submissions') || '[]');
            for (const sub of submissions) {
              fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub)
              });
            }
            if (sheetSyncStatus) {
              sheetSyncStatus.textContent = `Connected! Webhook saved for future submissions.`;
            }
          }
        } catch (err) {
          if (sheetSyncStatus) {
            sheetSyncStatus.style.color = "#dc2626";
            sheetSyncStatus.textContent = "Sync note: " + err.message;
          }
        }
      });
    }

    // Image load error fallback
    if (el.imageEl) {
      el.imageEl.addEventListener('error', handleImageLoadError);
      el.imageEl.addEventListener('load', handleImageLoadSuccess);
    }
  }

  // Anti-Backtracking Guardrails
  function enforceAntiBacktracking() {
    history.pushState(null, document.title, location.href);
    window.addEventListener('popstate', function () {
      history.pushState(null, document.title, location.href);
      if (state.currentPhase === "PRE_TEST" || state.currentPhase === "POST_TEST") {
        alert("Navigating backward is disabled during assessment to preserve research validity.");
      }
    });

    window.addEventListener('beforeunload', function (e) {
      if (state.currentPhase === "PRE_TEST" || state.currentPhase === "TRAINING" || state.currentPhase === "POST_TEST") {
        e.preventDefault();
        e.returnValue = "Your assessment progress will be lost if you leave this page.";
        return e.returnValue;
      }
    });
  }

  // --- PHASE TRANSITIONS ---
  function showView(viewElement) {
    [
      el.viewDemographics,
      el.viewAssessment,
      el.viewTrainingTransition,
      el.viewTraining,
      el.viewComplete
    ].forEach(view => {
      if (view) view.classList.add('hidden');
    });

    if (viewElement) {
      viewElement.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // --- PRE-TEST ASSESSMENT ---
  function startPreTest() {
    state.currentPhase = "PRE_TEST";
    state.currentQuestionIndex = 0;
    state.timers.preTestStartTime = new Date().toISOString();
    
    showView(el.viewAssessment);
    renderAssessmentQuestion();
  }

  // Retrieve current active image set based on experimental group and phase
  function getCurrentTestSet() {
    // Group 1: Pre = Set A, Post = Set B
    // Group 2: Pre = Set B, Post = Set A
    if (state.currentPhase === "PRE_TEST") {
      return state.assignedGroup === "Group 1" 
        ? STUDY_CONFIG.imageSets.setA 
        : STUDY_CONFIG.imageSets.setB;
    } else {
      return state.assignedGroup === "Group 1" 
        ? STUDY_CONFIG.imageSets.setB 
        : STUDY_CONFIG.imageSets.setA;
    }
  }

  function renderAssessmentQuestion() {
    const currentSet = getCurrentTestSet();
    const item = currentSet[state.currentQuestionIndex];
    
    // Reset confidence buttons
    document.querySelectorAll('.confidence-option-btn').forEach(btn => {
      btn.classList.remove('selected');
      btn.disabled = false;
    });

    // Set counters & headers
    const phaseLabel = state.currentPhase === "PRE_TEST" ? "Baseline Assessment" : "Follow-up Assessment";
    const phaseBadgeClass = state.currentPhase === "PRE_TEST" ? "badge-blue" : "badge-purple";
    
    if (el.assessmentBadge) {
      el.assessmentBadge.className = `badge ${phaseBadgeClass}`;
      el.assessmentBadge.textContent = phaseLabel;
    }
    
    if (el.assessmentCounter) {
      el.assessmentCounter.textContent = `Image ${state.currentQuestionIndex + 1} of 5`;
    }

    // Load Image
    displayImage(item);

    // Record question presentation timestamp for precise latency measurement
    state.timers.questionStartTime = performance.now();
    updateProgressUI();
  }

  function displayImage(item) {
    if (!el.imageEl || !el.imagePlaceholder) return;

    // Reset visibility
    el.imageEl.classList.add('hidden');
    el.imagePlaceholder.classList.remove('hidden');

    // Populate placeholder metadata
    const titleEl = el.imagePlaceholder.querySelector('.placeholder-title');
    const subEl = el.imagePlaceholder.querySelector('.placeholder-sub');
    const badgeEl = el.imagePlaceholder.querySelector('.placeholder-badge');

    if (titleEl) titleEl.textContent = item.placeholderTitle || item.label;
    if (subEl) subEl.textContent = item.placeholderSubtitle || item.category;
    if (badgeEl) badgeEl.textContent = `Category: ${item.category}`;

    // Attempt to load the image src
    el.imageEl.src = item.src;
    el.imageEl.alt = item.label;
  }

  function handleImageLoadSuccess() {
    if (el.imageEl && el.imagePlaceholder) {
      el.imageEl.classList.remove('hidden');
      el.imagePlaceholder.classList.add('hidden');
    }
  }

  function handleImageLoadError() {
    // If user has not yet dropped the image file, keep the clean placeholder visible
    if (el.imageEl && el.imagePlaceholder) {
      el.imageEl.classList.add('hidden');
      el.imagePlaceholder.classList.remove('hidden');
    }
  }

  // Confidence Rating Mapping (1 to 5 Scale)
  const CONFIDENCE_LEVELS = {
    1: { label: "Definitely Real", category: "REAL", desc: "Confident authentic photo" },
    2: { label: "Likely Real", category: "REAL", desc: "Leaning authentic photo" },
    3: { label: "Unsure (50/50)", category: "UNSURE", desc: "Equal chance / cannot tell" },
    4: { label: "Likely AI", category: "AI-GENERATED", desc: "Leaning AI-generated" },
    5: { label: "Highly AI", category: "AI-GENERATED", desc: "Confident AI / deepfake" }
  };

  // User submits confidence rating (1 to 5)
  function handleConfidenceRating(rating, clickedBtn) {
    const latencyMs = Math.round(performance.now() - state.timers.questionStartTime);
    const currentSet = getCurrentTestSet();
    const item = currentSet[state.currentQuestionIndex];
    const confInfo = CONFIDENCE_LEVELS[rating];

    // Determine correctness based on ground truth:
    // If REAL: rating 1 or 2 is correct (1 = high confidence, 2 = moderate confidence)
    // If AI-GENERATED: rating 4 or 5 is correct (5 = high confidence, 4 = moderate confidence)
    // Rating 3 (unsure) is considered uncalibrated / incorrect
    let isCorrect = false;
    if (item.groundTruth === "REAL" && (rating === 1 || rating === 2)) {
      isCorrect = true;
    } else if (item.groundTruth === "AI-GENERATED" && (rating === 4 || rating === 5)) {
      isCorrect = true;
    }

    // Disable all buttons and show selected state
    document.querySelectorAll('.confidence-option-btn').forEach(btn => {
      btn.disabled = true;
    });
    if (clickedBtn) {
      clickedBtn.classList.add('selected');
    }

    // Record response with 1-5 rating, descriptive label, and derived category
    const record = {
      questionNumber: state.currentQuestionIndex + 1,
      imageId: item.id,
      imageLabel: item.label,
      category: item.category,
      groundTruth: item.groundTruth,
      confidenceRating: rating,
      confidenceLabel: confInfo.label,
      participantResponse: confInfo.category, // "REAL", "AI-GENERATED", or "UNSURE"
      isCorrect: isCorrect,
      latencyMs: latencyMs,
      timestamp: new Date().toISOString()
    };

    if (state.currentPhase === "PRE_TEST") {
      state.preTestAnswers.push(record);
    } else {
      state.postTestAnswers.push(record);
    }

    // Smooth delay before next question (320ms) without revealing correctness
    setTimeout(() => {
      advanceAssessment();
    }, 320);
  }

  function advanceAssessment() {
    state.currentQuestionIndex++;
    
    if (state.currentQuestionIndex < 5) {
      renderAssessmentQuestion();
    } else {
      // Completed the 5 images of this phase
      if (state.currentPhase === "PRE_TEST") {
        transitionToTraining();
      } else {
        finishStudy();
      }
    }
  }

  // --- TRAINING TRANSITION & MODULE ---
  function transitionToTraining() {
    state.currentPhase = "TRAINING_TRANSITION";
    updateProgressUI();
    showView(el.viewTrainingTransition);
  }

  function startTrainingModule() {
    state.currentPhase = "TRAINING";
    state.currentTrainingStep = 0;
    state.timers.trainingStartTime = performance.now();
    
    showView(el.viewTraining);
    renderTrainingStep();
  }

  function renderTrainingStep() {
    const modules = STUDY_CONFIG.trainingModules;
    const currentMod = modules[state.currentTrainingStep];
    const totalSteps = modules.length;

    // Indicators
    if (el.trainingBadge) el.trainingBadge.textContent = currentMod.badge;
    if (el.trainingStepIndicator) {
      el.trainingStepIndicator.textContent = `Module ${state.currentTrainingStep + 1} of ${totalSteps}`;
    }

    // Pills
    if (el.trainingPillsContainer) {
      el.trainingPillsContainer.innerHTML = modules.map((_, i) => {
        let cls = "training-pill";
        if (i === state.currentTrainingStep) cls += " active";
        else if (i < state.currentTrainingStep) cls += " completed";
        return `<div class="${cls}"></div>`;
      }).join('');
    }

    // Content
    if (el.trainingContentContainer) {
      const sectionsHtml = currentMod.sections.map(sec => `
        <div class="training-section-block">
          <h3>${sec.heading}</h3>
          <p>${sec.content}</p>
        </div>
      `).join('');

      const takeawaysHtml = `
        <div class="training-takeaways">
          <div class="takeaway-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
            Key Forensic Takeaways
          </div>
          <ul class="takeaway-list">
            ${currentMod.keyTakeaways.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
      `;

      el.trainingContentContainer.innerHTML = `
        <h2 style="margin-bottom: 0.35rem;">${currentMod.title}</h2>
        <p class="subtitle">${currentMod.summary}</p>
        ${sectionsHtml}
        ${takeawaysHtml}
      `;
    }

    // Footer buttons
    if (el.btnPrevTraining) {
      el.btnPrevTraining.disabled = state.currentTrainingStep === 0;
    }

    const isLastStep = state.currentTrainingStep === totalSteps - 1;
    if (el.btnNextTraining) el.btnNextTraining.classList.toggle('hidden', isLastStep);
    if (el.btnProceedPostTest) el.btnProceedPostTest.classList.toggle('hidden', !isLastStep);

    updateProgressUI();
  }

  function nextTrainingStep() {
    if (state.currentTrainingStep < STUDY_CONFIG.trainingModules.length - 1) {
      state.currentTrainingStep++;
      renderTrainingStep();
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }

  function prevTrainingStep() {
    if (state.currentTrainingStep > 0) {
      state.currentTrainingStep--;
      renderTrainingStep();
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }

  // --- POST-TEST ASSESSMENT ---
  function startPostTest() {
    state.timers.trainingEndTime = performance.now();
    state.currentPhase = "POST_TEST";
    state.currentQuestionIndex = 0;
    state.timers.postTestStartTime = new Date().toISOString();

    showView(el.viewAssessment);
    renderAssessmentQuestion();
  }

  // --- COMPLETION & EVALUATION METRICS ---
  function finishStudy() {
    state.currentPhase = "COMPLETE";
    calculateResearchMetrics();
    saveParticipantSubmission();
    updateProgressUI();

    // Hide progress bar on the final completion page for clean appearance
    const progressContainer = document.querySelector('.progress-container');
    if (progressContainer) progressContainer.style.display = 'none';

    showView(el.viewComplete);
  }

  function calculateResearchMetrics() {
    // Pre-test accuracy
    const preCorrect = state.preTestAnswers.filter(a => a.isCorrect).length;
    const preAccuracyPct = (preCorrect / 5) * 100;

    // Post-test accuracy
    const postCorrect = state.postTestAnswers.filter(a => a.isCorrect).length;
    const postAccuracyPct = (postCorrect / 5) * 100;

    // Improvement = Post - Pre
    const accuracyImprovement = postCorrect - preCorrect;
    const percentageImprovement = postAccuracyPct - preAccuracyPct;

    // Average Confidence (1 to 5 scale)
    const preConfRatings = state.preTestAnswers.map(a => a.confidenceRating || 3);
    const postConfRatings = state.postTestAnswers.map(a => a.confidenceRating || 3);
    const avgPreConfidence = (preConfRatings.reduce((a, b) => a + b, 0) / (preConfRatings.length || 1)).toFixed(1);
    const avgPostConfidence = (postConfRatings.reduce((a, b) => a + b, 0) / (postConfRatings.length || 1)).toFixed(1);

    // Combined answers for Real vs AI breakdown
    const allAnswers = [...state.preTestAnswers, ...state.postTestAnswers];
    const realAnswers = allAnswers.filter(a => a.groundTruth === "REAL");
    const aiAnswers = allAnswers.filter(a => a.groundTruth === "AI-GENERATED");

    const realCorrect = realAnswers.filter(a => a.isCorrect).length;
    const realAccuracyPct = realAnswers.length > 0 ? (realCorrect / realAnswers.length) * 100 : 0;

    const aiCorrect = aiAnswers.filter(a => a.isCorrect).length;
    const aiAccuracyPct = aiAnswers.length > 0 ? (aiCorrect / aiAnswers.length) * 100 : 0;

    // Latency
    const preLatencies = state.preTestAnswers.map(a => a.latencyMs);
    const postLatencies = state.postTestAnswers.map(a => a.latencyMs);
    const avgPreLatencyMs = Math.round(preLatencies.reduce((a, b) => a + b, 0) / (preLatencies.length || 1));
    const avgPostLatencyMs = Math.round(postLatencies.reduce((a, b) => a + b, 0) / (postLatencies.length || 1));

    const trainingDurationSec = state.timers.trainingStartTime && state.timers.trainingEndTime
      ? Math.round((state.timers.trainingEndTime - state.timers.trainingStartTime) / 1000)
      : null;

    state.results = {
      participantId: state.participantId,
      assignedGroup: state.assignedGroup,
      demographics: state.demographics,
      preAccuracyScore: preCorrect,
      preAccuracyPct: preAccuracyPct,
      postAccuracyScore: postCorrect,
      postAccuracyPct: postAccuracyPct,
      accuracyImprovement: accuracyImprovement,
      percentageImprovement: percentageImprovement,
      avgPreConfidence: parseFloat(avgPreConfidence),
      avgPostConfidence: parseFloat(avgPostConfidence),
      realAccuracyPct: Math.round(realAccuracyPct),
      aiAccuracyPct: Math.round(aiAccuracyPct),
      avgPreLatencyMs: avgPreLatencyMs,
      avgPostLatencyMs: avgPostLatencyMs,
      trainingDurationSec: trainingDurationSec,
      completedAt: new Date().toISOString()
    };
  }

  function saveParticipantSubmission() {
    const fullRecord = {
      ...state.results,
      preTestAnswers: state.preTestAnswers,
      postTestAnswers: state.postTestAnswers
    };

    // 1. Always persist to localStorage (works offline or when opened directly via file://)
    try {
      const existing = JSON.parse(localStorage.getItem('deepfake_study_submissions') || '[]');
      existing.push(fullRecord);
      localStorage.setItem('deepfake_study_submissions', JSON.stringify(existing));
    } catch (e) {
      console.error("Failed to save submission to localStorage:", e);
    }

    // 2. Direct Google Sheet Webhook sync (Works on Netlify, GitHub Pages, Vercel, or local!)
    try {
      const webhook = (typeof STUDY_CONFIG !== 'undefined' && STUDY_CONFIG.googleSheetWebhookUrl) || localStorage.getItem('deepfake_study_google_webhook');
      if (webhook) {
        fetch(webhook, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullRecord)
        }).catch(() => {});
      }
    } catch (e) {}

    // 3. Optional local server sync (when hosted with Node.js Express server)
    try {
      if (window.location.protocol.startsWith('http')) {
        fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullRecord)
        }).catch(() => {
          // Server endpoint not active on static hosts, fine to ignore
        });
      }
    } catch (e) {}
  }

  // --- PROGRESS BAR CALCULATION ---
  function updateProgressUI() {
    let pct = 0;
    let label = "Participant Registration";

    switch (state.currentPhase) {
      case "DEMOGRAPHICS":
        pct = 5;
        label = "Study Overview & Consent";
        break;
      case "PRE_TEST":
        // 10% to 35%
        pct = 10 + (state.currentQuestionIndex * 5);
        label = `Baseline Assessment (Image ${state.currentQuestionIndex + 1} of 5)`;
        break;
      case "TRAINING_TRANSITION":
        pct = 40;
        label = "Preparation for Training";
        break;
      case "TRAINING":
        // 45% to 70%
        const modCount = STUDY_CONFIG.trainingModules.length || 6;
        pct = 45 + Math.round((state.currentTrainingStep / modCount) * 25);
        label = `Training Module (${state.currentTrainingStep + 1} of ${modCount})`;
        break;
      case "POST_TEST":
        // 75% to 95%
        pct = 75 + (state.currentQuestionIndex * 4);
        label = `Follow-up Assessment (Image ${state.currentQuestionIndex + 1} of 5)`;
        break;
      case "COMPLETE":
        pct = 100;
        label = "Study Completed";
        break;
    }

    if (el.progressFill) el.progressFill.style.width = `${pct}%`;
    if (el.progressPercentage) el.progressPercentage.textContent = `${pct}%`;
    if (el.progressPhaseLabel) el.progressPhaseLabel.textContent = label;
  }

  // --- IMAGE ZOOM / INSPECTION MODAL ---
  function openImageZoomModal() {
    const currentSet = getCurrentTestSet();
    const item = currentSet[state.currentQuestionIndex];
    if (!item) return;

    if (el.zoomImage) {
      el.zoomImage.src = item.src;
      el.zoomImage.alt = item.label;
    }
    if (el.zoomModalTitle) {
      el.zoomModalTitle.textContent = `Inspect: ${item.label} (${item.category})`;
    }
    if (el.zoomModal) el.zoomModal.classList.add('open');
  }

  function closeImageZoomModal() {
    if (el.zoomModal) el.zoomModal.classList.remove('open');
  }

  // --- RESEARCHER PORTAL & ANSWER KEY ---
  function openResearcherModal() {
    if (el.researcherModal) {
      el.researcherModal.classList.add('open');
      if (el.passcodeInput) el.passcodeInput.focus();
    }
  }

  function closeResearcherModal() {
    if (el.researcherModal) el.researcherModal.classList.remove('open');
  }

  function verifyResearcherPasscode() {
    const inputVal = el.passcodeInput ? el.passcodeInput.value.trim() : "";
    if (inputVal === STUDY_CONFIG.researcherPasscode) {
      if (el.passcodeError) el.passcodeError.classList.add('hidden');
      if (el.researcherPasscodePrompt) el.researcherPasscodePrompt.classList.add('hidden');
      if (el.researcherDashboard) el.researcherDashboard.classList.remove('hidden');
      renderResearcherDashboard();
    } else {
      if (el.passcodeError) el.passcodeError.classList.remove('hidden');
    }
  }

  function renderResearcherDashboard() {
    renderAnswerKey();
    renderParticipantsTable();
    updateAggregateStats();
  }

  // Render ground-truth Answer Key for researcher only
  function renderAnswerKey() {
    if (!el.answerKeyContainer) return;

    const renderSetTable = (setTitle, images) => `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">${setTitle}</h4>
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Category</th>
                <th>Ground Truth</th>
                <th>Difficulty</th>
                <th>Forensic Features / Inconsistencies</th>
              </tr>
            </thead>
            <tbody>
              ${images.map(img => `
                <tr>
                  <td style="font-weight: 600;">${img.label}</td>
                  <td>${img.category}</td>
                  <td>
                    <span class="badge ${img.groundTruth === 'REAL' ? 'badge-green' : 'badge-purple'}">
                      ${img.groundTruth}
                    </span>
                  </td>
                  <td>${img.difficulty}</td>
                  <td style="font-size: 0.78rem;">${img.forensicNotes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    el.answerKeyContainer.innerHTML = `
      ${renderSetTable("Set A (5 Images - 2 Real, 3 AI)", STUDY_CONFIG.imageSets.setA)}
      ${renderSetTable("Set B (5 Images - 2 Real, 3 AI)", STUDY_CONFIG.imageSets.setB)}
    `;
  }

  function renderParticipantsTable() {
    if (!el.participantsTableBody) return;
    const submissions = JSON.parse(localStorage.getItem('deepfake_study_submissions') || '[]');

    if (submissions.length === 0) {
      el.participantsTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2rem; color: #94a3b8;">
            No participant submissions recorded yet. Click "Generate Sample Data" to preview analytics.
          </td>
        </tr>
      `;
      return;
    }

    el.participantsTableBody.innerHTML = submissions.map(sub => {
      const deltaClass = sub.accuracyImprovement > 0 ? "stat-delta-pos" : (sub.accuracyImprovement < 0 ? "color: #dc2626;" : "");
      const deltaSign = sub.accuracyImprovement > 0 ? "+" : "";

      return `
        <tr>
          <td style="font-family: monospace; font-weight: 600;">${sub.participantId}</td>
          <td>${sub.assignedGroup}</td>
          <td>${sub.demographics?.ageRange || "N/A"}</td>
          <td>${sub.demographics?.familiarity || "N/A"}</td>
          <td>${sub.preAccuracyScore}/5 (${sub.preAccuracyPct}%) ${sub.avgPreConfidence !== undefined ? `<br><span style="font-size: 0.72rem; color: #64748b;">Avg: ${sub.avgPreConfidence}/5</span>` : ''}</td>
          <td>${sub.postAccuracyScore}/5 (${sub.postAccuracyPct}%) ${sub.avgPostConfidence !== undefined ? `<br><span style="font-size: 0.72rem; color: #64748b;">Avg: ${sub.avgPostConfidence}/5</span>` : ''}</td>
          <td class="${deltaClass}" style="font-weight: 700;">${deltaSign}${sub.accuracyImprovement} (${deltaSign}${sub.percentageImprovement}%)</td>
          <td>${sub.trainingDurationSec ? `${sub.trainingDurationSec}s` : 'N/A'}</td>
          <td style="font-size: 0.75rem;">${new Date(sub.completedAt).toLocaleTimeString()}</td>
        </tr>
      `;
    }).join('');
  }

  function updateAggregateStats() {
    const submissions = JSON.parse(localStorage.getItem('deepfake_study_submissions') || '[]');
    const count = submissions.length;

    if (el.statTotalParticipants) el.statTotalParticipants.textContent = count;

    if (count === 0) {
      if (el.statMeanPreAccuracy) el.statMeanPreAccuracy.textContent = "—";
      if (el.statMeanPostAccuracy) el.statMeanPostAccuracy.textContent = "—";
      if (el.statMeanDelta) el.statMeanDelta.textContent = "—";
      if (el.statGroupSplit) el.statGroupSplit.textContent = "—";
      if (el.statRealAccuracy) el.statRealAccuracy.textContent = "—";
      if (el.statAiAccuracy) el.statAiAccuracy.textContent = "—";
      return;
    }

    // Averages
    const meanPre = (submissions.reduce((acc, s) => acc + s.preAccuracyScore, 0) / count).toFixed(2);
    const meanPost = (submissions.reduce((acc, s) => acc + s.postAccuracyScore, 0) / count).toFixed(2);
    const meanDelta = ((submissions.reduce((acc, s) => acc + s.accuracyImprovement, 0) / count)).toFixed(2);

    const g1Count = submissions.filter(s => s.assignedGroup === "Group 1").length;
    const g2Count = submissions.filter(s => s.assignedGroup === "Group 2").length;

    const avgRealAcc = Math.round(submissions.reduce((acc, s) => acc + (s.realAccuracyPct || 0), 0) / count);
    const avgAiAcc = Math.round(submissions.reduce((acc, s) => acc + (s.aiAccuracyPct || 0), 0) / count);

    if (el.statMeanPreAccuracy) el.statMeanPreAccuracy.textContent = `${meanPre} / 5 (${((meanPre / 5) * 100).toFixed(0)}%)`;
    if (el.statMeanPostAccuracy) el.statMeanPostAccuracy.textContent = `${meanPost} / 5 (${((meanPost / 5) * 100).toFixed(0)}%)`;
    if (el.statMeanDelta) {
      const sign = meanDelta > 0 ? "+" : "";
      el.statMeanDelta.textContent = `${sign}${meanDelta} (${sign}${((meanDelta / 5) * 100).toFixed(0)}%)`;
    }
    if (el.statGroupSplit) el.statGroupSplit.textContent = `G1: ${g1Count} | G2: ${g2Count}`;
    if (el.statRealAccuracy) el.statRealAccuracy.textContent = `${avgRealAcc}%`;
    if (el.statAiAccuracy) el.statAiAccuracy.textContent = `${avgAiAcc}%`;
  }

  // --- DATA EXPORT UTILITIES ---
  function exportDatasetCsv() {
    const submissions = JSON.parse(localStorage.getItem('deepfake_study_submissions') || '[]');
    if (submissions.length === 0) {
      alert("No participant data available to export.");
      return;
    }

    const headers = [
      "Participant_ID",
      "Assigned_Group",
      "Age_Range",
      "Familiarity",
      "Pre_Score_Out_Of_5",
      "Pre_Score_Percent",
      "Pre_Avg_Confidence_1_5",
      "Post_Score_Out_Of_5",
      "Post_Score_Percent",
      "Post_Avg_Confidence_1_5",
      "Score_Improvement",
      "Percent_Improvement",
      "Real_Accuracy_Pct",
      "AI_Accuracy_Pct",
      "Avg_Pre_Latency_Ms",
      "Avg_Post_Latency_Ms",
      "Training_Duration_Sec",
      "Completed_At"
    ];

    const rows = submissions.map(s => [
      s.participantId,
      s.assignedGroup,
      `"${s.demographics?.ageRange || 'Prefer not to say'}"`,
      s.demographics?.familiarity || 'beginner',
      s.preAccuracyScore,
      s.preAccuracyPct,
      s.avgPreConfidence !== undefined ? s.avgPreConfidence : '',
      s.postAccuracyScore,
      s.postAccuracyPct,
      s.avgPostConfidence !== undefined ? s.avgPostConfidence : '',
      s.accuracyImprovement,
      s.percentageImprovement,
      s.realAccuracyPct,
      s.aiAccuracyPct,
      s.avgPreLatencyMs,
      s.avgPostLatencyMs,
      s.trainingDurationSec || '',
      `"${s.completedAt}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `deepfake_training_study_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportDatasetJson() {
    const submissions = JSON.parse(localStorage.getItem('deepfake_study_submissions') || '[]');
    if (submissions.length === 0) {
      alert("No participant data available to export.");
      return;
    }

    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `deepfake_training_dataset_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Generates realistic mock participant for researcher demo/testing
  function generateMockParticipant() {
    const randPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const pid = `PID-MOCK-${randPart}`;
    const group = Math.random() < 0.5 ? "Group 1" : "Group 2";
    
    // Simulate typical experimental hypothesis: Pre ~ 2-3 out of 5, Post ~ 4-5 out of 5
    const preScore = Math.floor(Math.random() * 2) + 2; // 2 or 3
    const postScore = Math.min(5, preScore + Math.floor(Math.random() * 2) + 1); // +1 or +2 improvement

    const mock = {
      participantId: pid,
      assignedGroup: group,
      demographics: {
        ageRange: STUDY_CONFIG.ageRanges[Math.floor(Math.random() * STUDY_CONFIG.ageRanges.length)],
        familiarity: ["beginner", "somewhat", "very"][Math.floor(Math.random() * 3)]
      },
      preAccuracyScore: preScore,
      preAccuracyPct: (preScore / 5) * 100,
      postAccuracyScore: postScore,
      postAccuracyPct: (postScore / 5) * 100,
      accuracyImprovement: postScore - preScore,
      percentageImprovement: ((postScore - preScore) / 5) * 100,
      avgPreConfidence: 2.6,
      avgPostConfidence: 4.2,
      realAccuracyPct: Math.floor(Math.random() * 20) + 70,
      aiAccuracyPct: Math.floor(Math.random() * 25) + 65,
      avgPreLatencyMs: Math.floor(Math.random() * 2500) + 3000,
      avgPostLatencyMs: Math.floor(Math.random() * 2000) + 2200,
      trainingDurationSec: Math.floor(Math.random() * 60) + 90,
      completedAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('deepfake_study_submissions') || '[]');
    existing.push(mock);
    localStorage.setItem('deepfake_study_submissions', JSON.stringify(existing));
    renderResearcherDashboard();
  }

  function clearAllStoredData() {
    if (confirm("Are you sure you want to permanently clear all stored research participant records?")) {
      localStorage.removeItem('deepfake_study_submissions');
      renderResearcherDashboard();
    }
  }

  // --- BOOTSTRAP ---
  document.addEventListener('DOMContentLoaded', init);

})();
