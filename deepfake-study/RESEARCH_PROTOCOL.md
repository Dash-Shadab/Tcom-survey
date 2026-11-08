# Empirical Research Protocol: Deepfake Image Detection Training Study

## 1. Study Objective
The primary aim of this experimental study is to determine whether a structured, beginner-friendly educational training module significantly improves non-expert participants' perceptual ability to differentiate between authentic photographs and AI-generated synthetic images.

---

## 2. Experimental Design

### 2.1 Study Structure: Counterbalanced Crossover (AB / BA)
A fundamental confound in pre-test / post-test designs is that repeated presentation of the same stimuli introduces **practice effects**, while using different stimuli risks **stimulus difficulty discrepancies**.

To eliminate both threats to internal validity, this experiment implements a **2-group counterbalanced crossover design**:

| Group | Pre-Training Assessment | Intervention | Post-Training Assessment |
| :--- | :--- | :--- | :--- |
| **Group 1** | Image Set A (5 items) | Deepfake Awareness Training | Image Set B (5 items) |
| **Group 2** | Image Set B (5 items) | Deepfake Awareness Training | Image Set A (5 items) |

- **Stimulus Balance:**
  - Both Set A and Set B contain exactly 5 images: **2 Authentic Photographs (REAL)** and **3 AI-Generated Images (AI-GENERATED)**.
  - Category and difficulty distributions are matched across sets (Portrait, Scene/Architecture, Hands/Anatomy).
- **Randomization:** Participants are randomly allocated to Group 1 or Group 2 with equal probability upon opening the questionnaire.

---

## 3. Dependent Variables & Metrics

1. **Pre-Training Accuracy ($Acc_{\text{pre}}$):**
   $$\text{Score} \in \{0, 1, 2, 3, 4, 5\}, \quad Acc_{\text{pre}} = \frac{\text{Correct}_{\text{pre}}}{5} \times 100\%$$

2. **Post-Training Accuracy ($Acc_{\text{post}}$):**
   $$\text{Score} \in \{0, 1, 2, 3, 4, 5\}, \quad Acc_{\text{post}} = \frac{\text{Correct}_{\text{post}}}{5} \times 100\%$$

3. **Net Improvement ($\Delta$):**
   $$\Delta_{\text{score}} = \text{Score}_{\text{post}} - \text{Score}_{\text{pre}}$$
   $$\Delta_{\text{pct}} = Acc_{\text{post}} - Acc_{\text{pre}}$$

4. **Category Sensitivity & Specificity:**
   - **Real Image Accuracy (Specificity):** $\frac{\text{Correctly Classified Authentic Images}}{\text{Total Authentic Images Evaluated}} \times 100\%$
   - **AI Image Accuracy (Sensitivity):** $\frac{\text{Correctly Classified AI Images}}{\text{Total AI Images Evaluated}} \times 100\%$

5. **Decision Latency:**
   - Mean reaction time per stimulus in milliseconds ($RT_{\text{pre}}$ vs $RT_{\text{post}}$) to assess whether training increases inspection time or cognitive deliberation.

---

## 4. Participant Protocol & Ethical Safeguards

1. **Zero Personally Identifying Information (PII):** No names, email addresses, phone numbers, or IP addresses are collected or stored.
2. **Anonymous Identification:** A randomized participant code (e.g. `PID-8E4A9`) is generated client-side to link pre- and post-intervention data.
3. **Optional Demographics:** Age range (optional categorical brackets) and baseline familiarity with generative AI (Beginner / Somewhat familiar / Very familiar).
4. **Non-Reversible Progression:** Participants cannot backtrack to previous images or modify past responses, preserving ecological validity and temporal sequence.
5. **Masked Answer Key:** Answers and correctness feedback are hidden during testing to avoid in-test feedback contamination.

---

## 5. Statistical Hypothesis Testing Guide

When analyzing the exported dataset (`.csv` format):

### Primary Hypothesis ($H_1$)
Participants will achieve significantly higher detection accuracy in the post-training assessment compared to the baseline assessment ($Acc_{\text{post}} > Acc_{\text{pre}}$).
- **Statistical Test:** **Paired Samples t-test** (or Wilcoxon Signed-Rank Test if normality is violated).
  - Test statistic: $t = \frac{\bar{D}}{s_D / \sqrt{N}}$, where $D = Acc_{\text{post}} - Acc_{\text{pre}}$.

### Secondary Hypothesis ($H_2$)
The training effect does not differ systematically between Group 1 and Group 2, verifying stimulus set equivalence.
- **Statistical Test:** **Independent Samples t-test** comparing $\Delta_{\text{score}}$ between Group 1 and Group 2.
  - If $p > 0.05$, set difficulty equivalence is supported.

### Exploratory Analysis ($H_3$)
Prior familiarity moderates the degree of improvement (Beginners exhibit higher delta gains than Very Familiar participants).
- **Statistical Test:** **One-Way ANOVA** with Familiarity as between-subject factor and $\Delta$ as dependent variable.
