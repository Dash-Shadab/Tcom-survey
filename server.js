/**
 * Optional Lightweight Node.js Server for Multi-Participant Research Lab
 * Runs on http://localhost:3000
 * Serves static questionnaire app and stores submissions in data/submissions.json
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'submissions.json');
const CONFIG_FILE = path.join(__dirname, 'data', 'google-sheet-config.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Google Sheet Webhook Config Helper
function getGoogleSheetConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {}
  }
  return {
    spreadsheetUrl: "https://docs.google.com/spreadsheets/d/12eHKcUxmbpofTkKsFewtNZQKPm9fG608wJtH0Fu9gUs/edit?usp=sharing",
    webhookUrl: ""
  };
}

async function syncToGoogleSheet(submission) {
  const config = getGoogleSheetConfig();
  if (!config.webhookUrl) return;

  try {
    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
    console.log(`[Google Sheet] Synced ${submission.participantId} to Sheet (status ${res.status})`);
  } catch (err) {
    console.error(`[Google Sheet Error] Failed to sync ${submission.participantId}:`, err.message);
  }
}

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Read submissions helper
function readSubmissions() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// Save submissions helper
function writeSubmissions(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// API: Record a participant submission
app.post('/api/submit', async (req, res) => {
  const submission = req.body;
  if (!submission || !submission.participantId) {
    return res.status(400).json({ error: "Invalid submission data" });
  }

  const submissions = readSubmissions();
  submissions.push(submission);
  writeSubmissions(submissions);

  console.log(`[Research Study] New submission recorded: ${submission.participantId} (${submission.assignedGroup})`);
  
  // Asynchronously sync to Google Sheet
  syncToGoogleSheet(submission);

  res.json({ success: true, count: submissions.length });
});

// API: Update Google Sheet Webhook URL
app.post('/api/google-sheet-webhook', async (req, res) => {
  const { webhookUrl } = req.body;
  const config = getGoogleSheetConfig();
  config.webhookUrl = webhookUrl ? webhookUrl.trim() : '';
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');

  // Also sync all existing past submissions
  const submissions = readSubmissions();
  let synced = 0;
  if (config.webhookUrl && submissions.length > 0) {
    for (const sub of submissions) {
      await syncToGoogleSheet(sub);
      synced++;
    }
  }

  res.json({ success: true, webhookUrl: config.webhookUrl, syncedExistingCount: synced });
});

// API: Fetch all submissions
app.get('/api/submissions', (req, res) => {
  const submissions = readSubmissions();
  res.json(submissions);
});

// API: Export CSV
app.get('/api/export/csv', (req, res) => {
  const submissions = readSubmissions();
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

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=deepfake_study_export_${Date.now()}.csv`);
  res.send(csv);
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Deepfake Detection Training Research Application`);
  console.log(` Server running at: http://localhost:${PORT}`);
  console.log(` Submissions file: ${DATA_FILE}`);
  console.log(` Researcher passcode: researcher2026`);
  console.log(`=======================================================`);
});
