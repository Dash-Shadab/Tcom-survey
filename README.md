# Deepfake Detection Training Research Questionnaire

A professional, minimal, and user-friendly empirical research platform for evaluating the effectiveness of deepfake and AI-generated image detection training.

---

## 🚀 Quick Start (Running the Form)

You can run this questionnaire immediately in either of two ways:

### Option 1: Direct Browser Launch (Zero Installation)
Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Safari).
- All features, timers, randomized group assignment, and local data persistence work out of the box with zero external dependencies.

### Option 2: Local Node.js Server (Recommended for Labs)
From the `deepfake-study` folder, run:
```bash
node server.js
```
Open **`http://localhost:3000`** in your browser.
Participant submissions will automatically save locally to `data/submissions.json` in addition to browser `localStorage`.

---

## 🖼️ How to Add Your Images Later

The questionnaire has dedicated, formatted image slots ready. When you have your image files ready, follow these simple steps:

1. Place your 10 images into the **`deepfake-study/assets/images/`** folder.
2. Recommended default filenames:
   - **Set A:**
     - `set_a1.jpg` (Human Portrait - Default: REAL)
     - `set_a2.jpg` (Human Portrait - Default: AI-GENERATED)
     - `set_a3.jpg` (Urban Scene - Default: REAL)
     - `set_a4.jpg` (Architecture/Interior - Default: AI-GENERATED)
     - `set_a5.jpg` (Hands / Object Interaction - Default: AI-GENERATED)
   - **Set B:**
     - `set_b1.jpg` (Human Portrait - Default: REAL)
     - `set_b2.jpg` (Human Portrait - Default: AI-GENERATED)
     - `set_b3.jpg` (Urban Scene - Default: REAL)
     - `set_b4.jpg` (Cityscape / Text - Default: AI-GENERATED)
     - `set_b5.jpg` (Group / Hands - Default: AI-GENERATED)

3. **To customize file names, categories, or ground truth answers:**
   Open **`study-data.js`** in any text editor and adjust the `src`, `groundTruth` (`"REAL"` or `"AI-GENERATED"`), or `forensicNotes` for each image.

> **Note on Placeholders:** Until you add image files, the application will automatically display a clean placeholder card indicating the image slot, category, and target path so you can preview the questionnaire layout immediately.

---

## 🧪 Experimental Methodology & Design

### 1. Counterbalanced A/B Crossover Design
To control for image set difficulty and testing order effects, participants are automatically and equally randomized into one of two groups:
- **Group 1:** Baseline Assessment (Set A) &rarr; Training Module &rarr; Follow-up Assessment (Set B)
- **Group 2:** Baseline Assessment (Set B) &rarr; Training Module &rarr; Follow-up Assessment (Set A)

### 2. Experimental Safeguards
- **Disjoint Sets:** No participant ever sees the same image in both pre- and post-tests.
- **Strict Forward Progression:** Back-navigation and browser history manipulation are disabled during testing to prevent re-answering after seeing hints or reflecting.
- **Double-Blind Feedback:** Neither correctness nor hints are revealed to the participant at any point during testing.
- **Anonymity:** No personally identifying information (PII) is collected. Each participant is assigned a unique anonymous ID (e.g. `PID-7F3A2`).

---

## 📊 Evaluation & Metrics Computed

For every participant session, the engine calculates:
- **Pre-Training Accuracy:** Correct answers out of 5 (and percentage).
- **Post-Training Accuracy:** Correct answers out of 5 (and percentage).
- **Net Improvement Delta:** `Improvement = Post-training accuracy − Pre-training accuracy`
- **Real Image Detection Accuracy:** Percentage of authentic photographs correctly identified.
- **AI-Generated Detection Accuracy:** Percentage of synthetic images correctly identified.
- **Response Latency:** Precise response time in milliseconds for each question.
- **Training Time:** Elapsed time spent reviewing the training material.

---

## 🔐 Researcher Portal & Answer Key

The predefined answer key and aggregate research statistics are hidden from participants and protected by a researcher gate.

1. Click **"Researcher Portal & Answer Key"** in the footer of any screen.
2. Enter the passcode:
   ```
   researcher2026
   ```
3. From the Researcher Portal, you can:
   - Inspect the predefined Master Answer Key for Set A and Set B with forensic explanations.
   - View aggregate statistical metrics (Mean Pre, Mean Post, Mean Delta, Group split, Accuracy breakdowns).
   - Inspect individual participant logs.
   - Click **"Export Dataset (.csv)"** to download the clean dataset ready for SPSS, R, or Python Pandas.
   - Click **"Export Dataset (.json)"** for structured JSON analysis.
   - Click **"+ Generate Sample Participant"** to test and preview the dashboard with realistic simulated responses.

---

## 📁 File Structure

```
deepfake-study/
├── index.html            # Main clean, responsive questionnaire interface
├── styles.css            # Modern minimalist styling and layout system
├── study-data.js         # Image set definitions, ground-truth labels, and training modules
├── app.js                # Experimental engine, state machine, timers, and metrics
├── server.js             # Optional Node.js Express server for lab collection
├── README.md             # Quick start and configuration guide
├── RESEARCH_PROTOCOL.md  # Detailed scientific methodology and analysis guide
└── assets/
    └── images/           # Folder to drop your 10 test image files
```
