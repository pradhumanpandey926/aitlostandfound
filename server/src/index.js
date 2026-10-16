import express from 'express';
import cors from 'cors';
import { AIT_LOCATIONS, CATEGORIES, SEEDED_ITEMS, INITIAL_ALERTS } from './data.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-Memory Database initialized with seed data
let items = JSON.parse(JSON.stringify(SEEDED_ITEMS));
let claims = [
  {
    id: "claim-001",
    itemId: "item-008",
    itemRefCode: "AIT-2026-F008",
    itemTitle: "AIT Official Squad Blazer (Navy Blue / Brass Crest)",
    claimantName: "Devansh Singh",
    claimantEmail: "devansh.singh_2310@aitpune.edu.in",
    claimantRoll: "23102",
    claimantPhone: "+91 98230 44521",
    answers: "Tailor tag says Raymond Tailors Pune with serial 749, has extra brass button in right pocket.",
    additionalProof: "I was wearing it for the NCC drill on Monday and left it on row F.",
    status: "Pending", // Pending, Approved, Rejected
    submittedAt: "2026-10-14T10:30:00Z"
  }
];

let alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
let notifications = [
  {
    id: "notif-001",
    type: "system",
    title: "System Initialized",
    message: "AIT Campus Recovery Portal is live with official landmarks & anti-fraud verification.",
    timestamp: new Date().toISOString(),
    read: false,
    refCode: "AIT-SYSTEM"
  },
  {
    id: "notif-002",
    type: "claim_pending",
    title: "New Claim Received",
    message: "Claim submitted for 'AIT Official Squad Blazer (Navy Blue)' by Devansh Singh (23102).",
    timestamp: "2026-10-14T10:31:00Z",
    read: false,
    itemId: "item-008",
    refCode: "AIT-2026-F008"
  }
];

// Helper: Generate Ref Code
function generateRefCode(type) {
  const prefix = type === 'lost' ? 'L' : 'F';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `AIT-${year}-${prefix}${randomNum}`;
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AIT Lost & Found API', version: '1.0.0' });
});

// Metadata: Locations & Categories
app.get('/api/meta', (req, res) => {
  res.json({
    locations: AIT_LOCATIONS,
    categories: CATEGORIES
  });
});

// In-Memory Users Registry
let users = [
  {
    id: "user-001",
    name: "Priya Sharma",
    email: "priya.sharma_2311@aitpune.edu.in",
    role: "Student",
    regId: "23112",
    dept: "TE Computer Engineering",
    password: "password123"
  },
  {
    id: "user-002",
    name: "Dr. S. K. Kulkarni",
    email: "sk.kulkarni@aitpune.edu.in",
    role: "Faculty / Teacher",
    regId: "FAC-041",
    dept: "Mechanical Engineering Dept",
    password: "password123"
  },
  {
    id: "user-003",
    name: "Havaldar R. K. Singh",
    email: "security.desk@aitpune.edu.in",
    role: "Staff / Other / Security",
    regId: "SEC-882",
    dept: "Main Security & Guard Post",
    password: "password123"
  }
];

// Helper: Normalize role
function normalizeRole(role) {
  if (!role) return 'Student';
  const r = role.toLowerCase();
  if (r.includes('faculty') || r.includes('teacher')) return 'Faculty / Teacher';
  if (r.includes('staff') || r.includes('security') || r.includes('admin') || r.includes('other')) return 'Staff / Other / Security';
  return 'Student';
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AIT Lost & Found API', version: '1.0.0' });
});

// Metadata: Locations & Categories
app.get('/api/meta', (req, res) => {
  res.json({
    locations: AIT_LOCATIONS,
    categories: CATEGORIES
  });
});

// Authentication: Register New User
app.post('/api/auth/register', (req, res) => {
  const { name, email, role, regId, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Please use your official college email (e.g., name_id@aitpune.edu.in)' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.endsWith('@aitpune.edu.in')) {
    return res.status(400).json({ 
      error: 'Please use your official college email (e.g., name_id@aitpune.edu.in)' 
    });
  }

  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }

  if (!regId || !regId.trim()) {
    return res.status(400).json({ error: 'Registration Number / Student ID / Employee ID is required.' });
  }

  const userRole = normalizeRole(role);
  const userName = name?.trim() || cleanEmail.split('@')[0].replace(/[._\d]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();

  // Check if user already exists
  const existingUser = users.find(u => u.email === cleanEmail);
  if (existingUser) {
    existingUser.name = userName;
    existingUser.role = userRole;
    existingUser.regId = regId.trim();
    existingUser.password = password;
    return res.json({
      message: 'Account updated successfully.',
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        regId: existingUser.regId,
        dept: existingUser.dept || 'Army Institute of Technology'
      },
      token: `ait-auth-${Date.now()}`
    });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: userName,
    email: cleanEmail,
    role: userRole,
    regId: regId.trim(),
    dept: userRole === 'Staff / Other / Security' ? 'Security & Administration' : userRole === 'Faculty / Teacher' ? 'Academic Faculty' : 'Undergraduate Student',
    password
  };

  users.push(newUser);

  res.status(201).json({
    message: 'Registration successful! Welcome to AIT Lost & Found.',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      regId: newUser.regId,
      dept: newUser.dept
    },
    token: `ait-auth-${Date.now()}`
  });
});

// Authentication: Login User
app.post('/api/auth/login', (req, res) => {
  const { email, password, role, regId } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Please use your official college email (e.g., name_id@aitpune.edu.in)' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.endsWith('@aitpune.edu.in')) {
    return res.status(400).json({ 
      error: 'Please use your official college email (e.g., name_id@aitpune.edu.in)' 
    });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  // Look for existing user
  let user = users.find(u => u.email === cleanEmail);

  if (!user) {
    const userRole = normalizeRole(role);
    const userName = cleanEmail.split('@')[0].replace(/[._\d]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim() || 'AIT Member';
    user = {
      id: `user-${Date.now()}`,
      name: userName,
      email: cleanEmail,
      role: userRole,
      regId: regId?.trim() || cleanEmail.split('@')[0].split('_')[1] || '2026',
      dept: userRole === 'Staff / Other / Security' ? 'Main Security Post' : 'Army Institute of Technology',
      password
    };
    users.push(user);
  }

  res.json({
    message: 'Authentication successful.',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      regId: user.regId,
      dept: user.dept
    },
    token: `ait-auth-${Date.now()}`
  });
});

// Authentication: Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// Legacy Email Verification Compatibility Route
app.post('/api/auth/verify-email', (req, res) => {
  const { email, rolePreference, regId } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.endsWith('@aitpune.edu.in')) {
    return res.status(400).json({ 
      error: 'Please use your official college email (e.g., name_id@aitpune.edu.in)' 
    });
  }

  const userRole = normalizeRole(rolePreference);
  const username = cleanEmail.split('@')[0];

  const userProfile = {
    email: cleanEmail,
    name: username.replace(/[._\d]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim() || 'AIT Member',
    role: userRole,
    regId: regId || username.split('_')[1] || '23112',
    verified: true,
    department: 'Army Institute of Technology, Pune',
    avatarLetter: username.charAt(0).toUpperCase()
  };

  res.json({
    message: 'College credentials verified successfully.',
    user: userProfile,
    token: `ait-auth-${Date.now()}`
  });
});

// Get Items with Query Filters
app.get('/api/items', (req, res) => {
  const { search, category, location, type, status, urgency } = req.query;

  let results = [...items];

  if (type && type !== 'all') {
    results = results.filter(item => item.type.toLowerCase() === type.toLowerCase());
  }

  if (category && category !== 'all') {
    results = results.filter(item => item.category === category);
  }

  if (location && location !== 'all') {
    results = results.filter(item => item.location === location);
  }

  if (status && status !== 'all') {
    results = results.filter(item => item.status.toLowerCase() === status.toLowerCase());
  }

  if (urgency && urgency !== 'all') {
    results = results.filter(item => item.urgency === urgency);
  }

  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    results = results.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.refCode.toLowerCase().includes(q)
    );
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    total: results.length,
    items: results
  });
});

// Get Single Item
app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(400).json({ error: 'Item not found' });
  }

  const itemClaims = claims.filter(c => c.itemId === item.id);
  res.json({ item, claims: itemClaims });
});

// Report Lost or Found Item
app.post('/api/items', (req, res) => {
  const {
    type,
    title,
    category,
    location,
    date,
    time,
    description,
    reporterName,
    reporterEmail,
    reporterRole,
    verificationQuestion,
    privateAnswerHint,
    imageData,
    hasRedactedImage,
    imagePlaceholder,
    urgency
  } = req.body;

  if (!title || !category || !location || !date || !description) {
    return res.status(400).json({ error: 'Please provide all mandatory fields.' });
  }

  if (!AIT_LOCATIONS.includes(location)) {
    return res.status(400).json({ error: `Invalid location. Must be an official AIT Pune landmark.` });
  }

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Invalid category.` });
  }

  const newItem = {
    id: `item-${Date.now()}`,
    refCode: generateRefCode(type || 'found'),
    type: type || 'found',
    title: title.trim(),
    category,
    location,
    date,
    time: time || '12:00',
    description: description.trim(),
    status: 'Active',
    reporterName: reporterName || 'AIT Member',
    reporterEmail: reporterEmail || 'anonymous@aitpune.edu.in',
    reporterRole: reporterRole || 'Student',
    verificationQuestion: verificationQuestion ? verificationQuestion.trim() : 'Please specify identifiable private marks or contents.',
    privateAnswerHint: privateAnswerHint ? privateAnswerHint.trim() : '',
    hasRedactedImage: !!hasRedactedImage,
    imageData: imageData || null,
    imagePlaceholder: imagePlaceholder || (category === 'ID Cards' ? 'id-card' : category === 'Electronics' ? 'calculator' : 'default'),
    urgency: urgency || 'Medium',
    createdAt: new Date().toISOString()
  };

  items.unshift(newItem);

  // Check keyword watch triggers
  const itemText = `${newItem.title} ${newItem.description} ${newItem.category}`.toLowerCase();
  alerts.forEach(alert => {
    if (alert.active && itemText.includes(alert.keyword.toLowerCase())) {
      notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'keyword_match',
        title: `Watch Alert Match: "${alert.keyword}"`,
        message: `A new ${newItem.type.toUpperCase()} item matching your watchword "${alert.keyword}" was logged at ${newItem.location}: ${newItem.title}.`,
        timestamp: new Date().toISOString(),
        read: false,
        itemId: newItem.id,
        refCode: newItem.refCode,
        targetEmail: alert.email
      });
    }
  });

  // System notification for new report
  notifications.unshift({
    id: `notif-${Date.now()}`,
    type: 'new_item',
    title: `New ${newItem.type === 'found' ? 'Found Recovery' : 'Lost Report'} Logged`,
    message: `[${newItem.refCode}] ${newItem.title} registered at ${newItem.location}.`,
    timestamp: new Date().toISOString(),
    read: false,
    itemId: newItem.id,
    refCode: newItem.refCode
  });

  res.status(201).json({
    message: 'Item registered and cataloged successfully.',
    item: newItem
  });
});

// Submit a Claim for an Item
app.post('/api/claims', (req, res) => {
  const {
    itemId,
    claimantName,
    claimantEmail,
    claimantRoll,
    claimantPhone,
    answers,
    additionalProof
  } = req.body;

  if (!itemId || !claimantName || !claimantEmail || !answers) {
    return res.status(400).json({ error: 'Item ID, claimant details, and verification answers are required.' });
  }

  const item = items.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Target item not found.' });
  }

  const newClaim = {
    id: `claim-${Date.now()}`,
    itemId: item.id,
    itemRefCode: item.refCode,
    itemTitle: item.title,
    claimantName: claimantName.trim(),
    claimantEmail: claimantEmail.trim(),
    claimantRoll: claimantRoll ? claimantRoll.trim() : 'N/A',
    claimantPhone: claimantPhone ? claimantPhone.trim() : 'N/A',
    answers: answers.trim(),
    additionalProof: additionalProof ? additionalProof.trim() : '',
    status: 'Pending',
    submittedAt: new Date().toISOString()
  };

  claims.unshift(newClaim);

  // Update item status to Under Review
  if (item.status === 'Active') {
    item.status = 'Under Review';
  }

  // Push in-app alert
  notifications.unshift({
    id: `notif-claim-${Date.now()}`,
    type: 'claim_submitted',
    title: `Claim Filed for ${item.refCode}`,
    message: `${claimantName} submitted a verification claim for "${item.title}". Awaiting Finder / Security Desk review.`,
    timestamp: new Date().toISOString(),
    read: false,
    itemId: item.id,
    claimId: newClaim.id,
    refCode: item.refCode
  });

  res.status(201).json({
    message: 'Claim questionnaire submitted. Awaiting verification.',
    claim: newClaim
  });
});

// Get all claims (Admin / Security Desk & Finder review)
app.get('/api/claims', (req, res) => {
  const { itemId, status } = req.query;
  let results = [...claims];

  if (itemId) {
    results = results.filter(c => c.itemId === itemId);
  }

  if (status && status !== 'all') {
    results = results.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }

  res.json({
    total: results.length,
    claims: results
  });
});

// Review Claim: Approve or Reject
app.patch('/api/claims/:id', (req, res) => {
  const { status, reviewNotes, handoffLocation } = req.body;
  const claim = claims.find(c => c.id === req.params.id);

  if (!claim) {
    return res.status(404).json({ error: 'Claim record not found.' });
  }

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Approved or Rejected.' });
  }

  claim.status = status;
  claim.reviewedAt = new Date().toISOString();
  claim.reviewNotes = reviewNotes || '';

  const item = items.find(i => i.id === claim.itemId);

  if (status === 'Approved') {
    const gatePassCode = `GP-AIT-${Math.floor(1000 + Math.random() * 9000)}`;
    const instructions = `Hand over at ${handoffLocation || 'Main Security Desk / Main Gate'}. Valid College ID Card required for physical handoff.`;
    
    claim.handoffPass = gatePassCode;
    claim.handoffInstructions = instructions;

    if (item) {
      item.status = 'Claimed';
      item.claimedBy = `${claim.claimantName} (${claim.claimantRoll || claim.claimantEmail})`;
      item.handoffPass = gatePassCode;
      item.handoffInstructions = instructions;
    }

    notifications.unshift({
      id: `notif-approved-${Date.now()}`,
      type: 'claim_approved',
      title: `Claim APPROVED: Gate Pass ${gatePassCode}`,
      message: `Claim for "${claim.itemTitle}" by ${claim.claimantName} was verified and approved! Collect from Security Desk.`,
      timestamp: new Date().toISOString(),
      read: false,
      itemId: claim.itemId,
      claimId: claim.id,
      refCode: claim.itemRefCode
    });
  } else {
    if (item) {
      // Revert to Active if no other approved claim
      const otherApproved = claims.some(c => c.itemId === item.id && c.status === 'Approved');
      const otherPending = claims.some(c => c.itemId === item.id && c.status === 'Pending' && c.id !== claim.id);
      item.status = otherApproved ? 'Claimed' : (otherPending ? 'Under Review' : 'Active');
    }

    notifications.unshift({
      id: `notif-rejected-${Date.now()}`,
      type: 'claim_rejected',
      title: `Claim Rejected for ${claim.itemRefCode}`,
      message: `Claim questionnaire by ${claim.claimantName} did not match identifying marks. Item remains listed.`,
      timestamp: new Date().toISOString(),
      read: false,
      itemId: claim.itemId,
      claimId: claim.id,
      refCode: claim.itemRefCode
    });
  }

  res.json({
    message: `Claim ${status.toLowerCase()} successfully.`,
    claim,
    item
  });
});

// Notifications Endpoints
app.get('/api/notifications', (req, res) => {
  res.json({
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    notifications
  });
});

app.patch('/api/notifications/mark-read', (req, res) => {
  notifications.forEach(n => { n.read = true; });
  res.json({ message: 'All notifications marked as read.' });
});

// Keyword Alerts Endpoints ("Notify Me")
app.get('/api/alerts', (req, res) => {
  res.json({ alerts });
});

app.post('/api/alerts', (req, res) => {
  const { keyword, email } = req.body;
  if (!keyword || keyword.trim().length < 2) {
    return res.status(400).json({ error: 'Keyword must be at least 2 characters long.' });
  }

  const newAlert = {
    id: `alert-${Date.now()}`,
    keyword: keyword.trim(),
    email: email ? email.trim() : 'current_user@aitpune.edu.in',
    createdAt: new Date().toISOString(),
    active: true
  };

  alerts.unshift(newAlert);

  notifications.unshift({
    id: `notif-alert-sub-${Date.now()}`,
    type: 'alert_created',
    title: `Radar Alert Activated`,
    message: `You will be notified immediately whenever items matching "${newAlert.keyword}" are reported anywhere in AIT campus.`,
    timestamp: new Date().toISOString(),
    read: false,
    refCode: 'RADAR'
  });

  res.status(201).json({
    message: `Keyword radar alert for "${keyword}" created.`,
    alert: newAlert
  });
});

app.delete('/api/alerts/:id', (req, res) => {
  alerts = alerts.filter(a => a.id !== req.params.id);
  res.json({ message: 'Radar alert removed.' });
});

// Reset Data endpoint (Convenient for demos)
app.post('/api/reset', (req, res) => {
  items = JSON.parse(JSON.stringify(SEEDED_ITEMS));
  alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
  claims = [
    {
      id: "claim-001",
      itemId: "item-008",
      itemRefCode: "AIT-2026-F008",
      itemTitle: "AIT Official Squad Blazer (Navy Blue / Brass Crest)",
      claimantName: "Devansh Singh",
      claimantEmail: "devansh.singh_2310@aitpune.edu.in",
      claimantRoll: "23102",
      claimantPhone: "+91 98230 44521",
      answers: "Tailor tag says Raymond Tailors Pune with serial 749, has extra brass button in right pocket.",
      additionalProof: "I was wearing it for the NCC drill on Monday and left it on row F.",
      status: "Pending",
      submittedAt: "2026-10-14T10:30:00Z"
    }
  ];
  notifications = [
    {
      id: "notif-001",
      type: "system",
      title: "Data Reset Complete",
      message: "Seeded items and campus logs have been restored to initial state.",
      timestamp: new Date().toISOString(),
      read: false,
      refCode: "AIT-SYSTEM"
    }
  ];

  res.json({ message: 'Catalog restored to original AIT mock seed state.' });
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '../../client/dist');

app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[AIT Lost & Found Backend] Server listening on port ${PORT}`);
  console.log(`[Campus Landmarks Loaded]: ${AIT_LOCATIONS.length} official AIT zones`);
  console.log(`[Seed Items Loaded]: ${items.length} recoveries & lost reports`);
  console.log(`[Full-Stack Portal Ready]: http://localhost:${PORT}`);
});
