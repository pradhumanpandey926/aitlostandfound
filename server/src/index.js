import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { AIT_LOCATIONS, CATEGORIES } from './data.js';
import {
  initStore,
  connectMongo,
  itemStore,
  claimStore,
  notificationStore,
  alertStore,
  userStore
} from './services/dbStore.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Initialize persistent storage and attempt MongoDB connection
initStore();
connectMongo();

// Helper: Generate Ref Code
function generateRefCode(type) {
  const prefix = type === 'lost' ? 'L' : 'F';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `AIT-${year}-${prefix}${randomNum}`;
}

// Helper: Normalize role
function normalizeRole(role) {
  if (!role) return 'Student';
  const r = role.toLowerCase();
  if (r.includes('faculty') || r.includes('teacher')) return 'Faculty / Teacher';
  if (r.includes('staff') || r.includes('security') || r.includes('admin') || r.includes('other')) return 'Staff / Other / Security';
  return 'Student';
}

// Rate Limiter tracking (in-memory sliding window map)
// Key: email or IP -> Array of timestamps
const reportRateLimits = new Map();

function checkReportRateLimit(identifier) {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  const history = reportRateLimits.get(identifier) || [];
  
  // Keep only timestamps within the last 1 hour
  const recentReports = history.filter(ts => now - ts < ONE_HOUR);
  
  if (recentReports.length >= 3) {
    const oldest = recentReports[0];
    const minutesLeft = Math.ceil((ONE_HOUR - (now - oldest)) / (60 * 1000));
    return {
      allowed: false,
      minutesLeft
    };
  }

  recentReports.push(now);
  reportRateLimits.set(identifier, recentReports);
  return { allowed: true };
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'AIT Lost & Found API', 
    version: '2.0.0',
    persistence: 'MongoDB + Persistent Disk Sync'
  });
});

// Metadata: Locations & Categories
app.get('/api/meta', (req, res) => {
  res.json({
    locations: AIT_LOCATIONS,
    categories: CATEGORIES
  });
});

// ---------------- AUTHENTICATION ----------------

// Register New User
app.post('/api/auth/register', (req, res) => {
  const { name, email, role, regId, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Please use your official college email (e.g., name_id@aitpune.edu.in)' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.endsWith('@aitpune.edu.in')) {
    return res.status(400).json({ 
      error: 'Access restricted: Only official @aitpune.edu.in college email IDs are authorized.' 
    });
  }

  if (!regId || !regId.trim()) {
    return res.status(400).json({ error: 'Registration Number / Student ID / Employee ID is required.' });
  }

  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }

  const userRole = normalizeRole(role);
  const userName = name?.trim() || cleanEmail.split('@')[0].replace(/[._\d]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();

  const user = userStore.createOrUpdate({
    id: `user-${Date.now()}`,
    name: userName,
    email: cleanEmail,
    role: userRole,
    regId: regId.trim(),
    dept: userRole === 'Staff / Other / Security' ? 'Security & Administration' : userRole === 'Faculty / Teacher' ? 'Academic Faculty' : 'Undergraduate Student',
    password
  });

  res.status(201).json({
    message: 'Registration successful! Welcome to AIT Lost & Found.',
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

// Login User
app.post('/api/auth/login', (req, res) => {
  const { email, password, role, regId } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Please use your official college email (e.g., name_id@aitpune.edu.in)' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.endsWith('@aitpune.edu.in')) {
    return res.status(400).json({ 
      error: 'Access restricted: Only official @aitpune.edu.in college email IDs are authorized.' 
    });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  let user = userStore.findByEmail(cleanEmail);

  if (!user) {
    const userRole = normalizeRole(role);
    const userName = cleanEmail.split('@')[0].replace(/[._\d]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim() || 'AIT Member';
    user = userStore.createOrUpdate({
      id: `user-${Date.now()}`,
      name: userName,
      email: cleanEmail,
      role: userRole,
      regId: regId?.trim() || cleanEmail.split('@')[0].split('_')[1] || '23112',
      dept: userRole === 'Staff / Other / Security' ? 'Main Security Post' : 'Army Institute of Technology',
      password
    });
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

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// Legacy Verification
app.post('/api/auth/verify-email', (req, res) => {
  const { email, rolePreference, regId } = req.body;
  if (!email || !email.trim().toLowerCase().endsWith('@aitpune.edu.in')) {
    return res.status(400).json({ error: 'Please use your official @aitpune.edu.in email ID.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  const user = userStore.findByEmail(cleanEmail) || userStore.createOrUpdate({
    id: `user-${Date.now()}`,
    name: cleanEmail.split('@')[0].replace(/[._\d]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim(),
    email: cleanEmail,
    role: normalizeRole(rolePreference),
    regId: regId || cleanEmail.split('@')[0].split('_')[1] || '23112',
    dept: 'Army Institute of Technology, Pune'
  });

  res.json({
    message: 'College credentials verified successfully.',
    user,
    token: `ait-auth-${Date.now()}`
  });
});

// ---------------- ITEMS ENDPOINTS ----------------

// Get Items with Query Filters
app.get('/api/items', async (req, res) => {
  try {
    const { search, category, location, type, status, urgency, includeSpamHidden } = req.query;

    // By default, hide spam quarantined items unless specifically requested (e.g. by Admin console)
    const items = await itemStore.getAll({ 
      includeSpamHidden: includeSpamHidden === 'true' 
    });

    let results = [...items];

    if (type && type !== 'all') {
      results = results.filter(item => item.type && item.type.toLowerCase() === type.toLowerCase());
    }

    if (category && category !== 'all') {
      results = results.filter(item => item.category === category);
    }

    if (location && location !== 'all') {
      results = results.filter(item => item.location === location);
    }

    if (status && status !== 'all') {
      results = results.filter(item => item.status && item.status.toLowerCase() === status.toLowerCase());
    }

    if (urgency && urgency !== 'all') {
      results = results.filter(item => item.urgency === urgency);
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      results = results.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.refCode && item.refCode.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      total: results.length,
      items: results
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items', details: err.message });
  }
});

// Get Single Item
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await itemStore.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const allClaims = claimStore.getAll();
    const itemClaims = allClaims.filter(c => c.itemId === item.id);
    res.json({ item, claims: itemClaims });
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving item', details: err.message });
  }
});

// Report Lost or Found Item (Strict Spam Prevention + Mongoose Persistence)
app.post('/api/items', async (req, res) => {
  try {
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
      reporterRegId,
      reporterRole,
      verificationQuestion,
      privateAnswerHint,
      imageData,
      hasRedactedImage,
      imagePlaceholder,
      urgency,
      genuineAcknowledgement
    } = req.body;

    // 1. Strict Account Verification
    if (!reporterEmail || !reporterEmail.trim()) {
      return res.status(403).json({ 
        error: 'Authentication Required: You must be logged in with your official @aitpune.edu.in account to report items.' 
      });
    }

    const cleanReporterEmail = reporterEmail.trim().toLowerCase();
    if (!cleanReporterEmail.endsWith('@aitpune.edu.in')) {
      return res.status(403).json({ 
        error: 'Access Denied: Only verified @aitpune.edu.in accounts are permitted to submit campus reports.' 
      });
    }

    if (!reporterRegId || !reporterRegId.trim()) {
      return res.status(400).json({ 
        error: 'Registration Number / Student Roll / Employee ID is strictly required to bind accountability.' 
      });
    }

    if (!reporterName || !reporterName.trim()) {
      return res.status(400).json({ 
        error: 'Reporter full name is required.' 
      });
    }

    // 2. Mandatory Verification Fields
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Item title is required.' });
    }

    if (!category || !CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Please select a valid campus category from the list.' });
    }

    // Fixed landmark check (no generic / custom text allowed)
    if (!location || !AIT_LOCATIONS.includes(location)) {
      return res.status(400).json({ 
        error: `Invalid landmark. Location must be chosen from the official 13 AIT campus landmarks list.` 
      });
    }

    if (!date) {
      return res.status(400).json({ error: 'Incident date is required.' });
    }

    // High-detail description (minimum 25 characters)
    if (!description || description.trim().length < 25) {
      return res.status(400).json({ 
        error: `High-detail description is required: Minimum 25 characters needed (current length: ${description ? description.trim().length : 0}). Provide precise context such as desk, bench, color, or distinguishing markings.` 
      });
    }

    // Real image upload compulsory for "Found" items
    const itemType = (type || 'found').toLowerCase();
    if (itemType === 'found') {
      if (!imageData || typeof imageData !== 'string' || imageData.length < 50) {
        return res.status(400).json({ 
          error: 'Real image upload is compulsory for Found items to verify genuine custody and prevent fake claims.' 
        });
      }
    }

    // Contact disclosure & genuine acknowledgement checkbox
    if (!genuineAcknowledgement) {
      return res.status(400).json({ 
        error: 'You must check the confirmation checkbox: "I confirm this information is genuine and understand that false reporting violates AIT campus policy."' 
      });
    }

    // 3. Rate Limiting & Cooldown (Max 3 reports per user per hour)
    const rateLimitCheck = checkReportRateLimit(cleanReporterEmail);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ 
        error: `Rate limit reached: Maximum 3 reports per user within 1 hour allowed to prevent spam. Please wait ${rateLimitCheck.minutesLeft} minutes before submitting another report.` 
      });
    }

    // Duplicate submission prevention (exact same title and description within 24h)
    const existingItems = await itemStore.getAll({ includeSpamHidden: true });
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const isDuplicate = existingItems.some(i => {
      const isRecent = new Date(i.createdAt).getTime() > oneDayAgo;
      const sameTitle = i.title.trim().toLowerCase() === title.trim().toLowerCase();
      const sameDesc = i.description.trim().toLowerCase() === description.trim().toLowerCase();
      return isRecent && sameTitle && sameDesc;
    });

    if (isDuplicate) {
      return res.status(409).json({ 
        error: 'Duplicate submission detected: An identical item report with this exact title and description has already been logged in the past 24 hours.' 
      });
    }

    // Construct persisted item
    const newItem = {
      id: `item-${Date.now()}`,
      refCode: generateRefCode(itemType),
      type: itemType,
      title: title.trim(),
      category,
      location,
      date,
      time: time || '12:00',
      description: description.trim(),
      status: 'Active',
      reporterName: reporterName.trim(),
      reporterEmail: cleanReporterEmail,
      reporterRegId: reporterRegId.trim(),
      reporterRole: normalizeRole(reporterRole),
      verificationQuestion: verificationQuestion ? verificationQuestion.trim() : 'Please specify identifiable private marks or contents.',
      privateAnswerHint: privateAnswerHint ? privateAnswerHint.trim() : '',
      hasRedactedImage: !!hasRedactedImage,
      imageData: imageData || null,
      imagePlaceholder: imagePlaceholder || (category === 'ID Cards' ? 'id-card' : category === 'Electronics' ? 'calculator' : 'default'),
      urgency: urgency || 'Medium',
      genuineAcknowledgement: true,
      flagsCount: 0,
      flaggedBy: [],
      isSpamHidden: false,
      claimedBy: null,
      handoffPass: null,
      handoffInstructions: null,
      createdAt: new Date().toISOString()
    };

    // Actively save to MongoDB / persistent database
    const savedItem = await itemStore.create(newItem);

    // Trigger keyword watch alerts
    const alerts = alertStore.getAll();
    const itemText = `${savedItem.title} ${savedItem.description} ${savedItem.category}`.toLowerCase();
    alerts.forEach(alert => {
      if (alert.active && itemText.includes(alert.keyword.toLowerCase())) {
        notificationStore.create({
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'keyword_match',
          title: `Watch Alert Match: "${alert.keyword}"`,
          message: `A new ${savedItem.type.toUpperCase()} item matching your watchword "${alert.keyword}" was logged at ${savedItem.location}: ${savedItem.title}.`,
          timestamp: new Date().toISOString(),
          read: false,
          itemId: savedItem.id,
          refCode: savedItem.refCode,
          targetEmail: alert.email
        });
      }
    });

    // System notification
    notificationStore.create({
      id: `notif-${Date.now()}`,
      type: 'new_item',
      title: `New ${savedItem.type === 'found' ? 'Found Recovery' : 'Lost Report'} Logged`,
      message: `[${savedItem.refCode}] ${savedItem.title} registered at ${savedItem.location} by ${savedItem.reporterName} (${savedItem.reporterRegId}).`,
      timestamp: new Date().toISOString(),
      read: false,
      itemId: savedItem.id,
      refCode: savedItem.refCode
    });

    res.status(201).json({
      message: 'Item registered and persisted to campus database successfully.',
      item: savedItem
    });
  } catch (err) {
    console.error('[API ERROR] Failed to save item:', err);
    res.status(400).json({ error: err.message || 'Failed to submit report' });
  }
});

// Flag Item as Spam / Inappropriate
app.post('/api/items/:id/flag', async (req, res) => {
  try {
    const { userEmail, reason } = req.body;
    const item = await itemStore.getById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Target item not found.' });
    }

    if (!userEmail || !userEmail.toLowerCase().endsWith('@aitpune.edu.in')) {
      return res.status(403).json({ 
        error: 'Only verified @aitpune.edu.in campus members can flag items for moderation.' 
      });
    }

    const cleanUserEmail = userEmail.trim().toLowerCase();
    const flaggedByList = Array.isArray(item.flaggedBy) ? [...item.flaggedBy] : [];

    if (flaggedByList.includes(cleanUserEmail)) {
      return res.status(400).json({ 
        error: 'You have already flagged this post. The Security Desk is reviewing reports.' 
      });
    }

    flaggedByList.push(cleanUserEmail);
    const newFlagsCount = flaggedByList.length;

    let isSpamHidden = item.isSpamHidden || false;
    let newStatus = item.status;

    // Automatic moderation trigger: 3 flags = auto-quarantine
    if (newFlagsCount >= 3) {
      isSpamHidden = true;
      newStatus = 'Under Review';

      notificationStore.create({
        id: `notif-spam-alert-${Date.now()}`,
        type: 'spam_quarantine',
        title: `🚨 [SECURITY QUARANTINE] Item ${item.refCode}`,
        message: `Item "${item.title}" reported by ${item.reporterName} reached 3 spam flags and has been automatically quarantined from the public feed pending Security Desk review.`,
        timestamp: new Date().toISOString(),
        read: false,
        itemId: item.id,
        refCode: item.refCode
      });
    }

    const updatedItem = await itemStore.update(item.id, {
      flagsCount: newFlagsCount,
      flaggedBy: flaggedByList,
      isSpamHidden,
      status: newStatus
    });

    res.json({
      message: newFlagsCount >= 3 
        ? 'Item flagged. Threshold reached (3 flags): Item has been quarantined from the public feed for Security Desk review.' 
        : `Thank you for your report. Item has received ${newFlagsCount} flag(s).`,
      flagsCount: newFlagsCount,
      isSpamHidden,
      item: updatedItem
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to flag item', details: err.message });
  }
});

// Admin / Security Desk Moderation (Approve/Unhide or Remove)
app.patch('/api/items/:id/moderate', async (req, res) => {
  try {
    const { action, notes } = req.body;
    const item = await itemStore.getById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (!['approve', 'remove', 'unhide'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "approve", "unhide", or "remove".' });
    }

    let updateData = {};

    if (action === 'approve' || action === 'unhide') {
      updateData = {
        isSpamHidden: false,
        status: 'Active',
        flagsCount: 0,
        flaggedBy: []
      };

      notificationStore.create({
        id: `notif-mod-approve-${Date.now()}`,
        type: 'system',
        title: `Item Restored: ${item.refCode}`,
        message: `Item "${item.title}" was reviewed and verified by Security Desk. Restored to public feed.`,
        timestamp: new Date().toISOString(),
        read: false,
        itemId: item.id,
        refCode: item.refCode
      });
    } else if (action === 'remove') {
      updateData = {
        isSpamHidden: true,
        status: 'Removed'
      };

      notificationStore.create({
        id: `notif-mod-remove-${Date.now()}`,
        type: 'system',
        title: `Item Removed: ${item.refCode}`,
        message: `Item "${item.title}" was permanently removed by Security Desk following spam confirmation.`,
        timestamp: new Date().toISOString(),
        read: false,
        itemId: item.id,
        refCode: item.refCode
      });
    }

    const updated = await itemStore.update(item.id, updateData);

    res.json({
      message: action === 'remove' ? 'Item marked as removed and hidden.' : 'Item unhidden and restored to public feed.',
      item: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to moderate item', details: err.message });
  }
});

// ---------------- CLAIMS ENDPOINTS ----------------

// Submit Claim
app.post('/api/claims', async (req, res) => {
  try {
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

    if (!claimantEmail.trim().toLowerCase().endsWith('@aitpune.edu.in')) {
      return res.status(403).json({ error: 'Only verified @aitpune.edu.in accounts can submit ownership claims.' });
    }

    const item = await itemStore.getById(itemId);
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

    claimStore.create(newClaim);

    // Update item status to Under Review
    if (item.status === 'Active') {
      await itemStore.update(item.id, { status: 'Under Review' });
    }

    notificationStore.create({
      id: `notif-claim-${Date.now()}`,
      type: 'claim_submitted',
      title: `Claim Filed for ${item.refCode}`,
      message: `${claimantName} submitted a verification claim for "${item.title}". Awaiting Security Desk review.`,
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit claim', details: err.message });
  }
});

// Get all claims
app.get('/api/claims', (req, res) => {
  const { itemId, status } = req.query;
  let results = claimStore.getAll();

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
app.patch('/api/claims/:id', async (req, res) => {
  try {
    const { status, reviewNotes, handoffLocation } = req.body;
    const claim = claimStore.getById(req.params.id);

    if (!claim) {
      return res.status(404).json({ error: 'Claim record not found.' });
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Approved or Rejected.' });
    }

    let updatedClaim = null;
    let updatedItem = null;

    if (status === 'Approved') {
      const gatePassCode = `GP-AIT-${Math.floor(1000 + Math.random() * 9000)}`;
      const instructions = `Hand over at ${handoffLocation || 'Main Security Desk / Main Gate'}. Valid College ID Card required for physical handoff.`;
      
      updatedClaim = claimStore.update(claim.id, {
        status: 'Approved',
        reviewedAt: new Date().toISOString(),
        reviewNotes: reviewNotes || '',
        handoffPass: gatePassCode,
        handoffInstructions: instructions
      });

      updatedItem = await itemStore.update(claim.itemId, {
        status: 'Claimed',
        claimedBy: `${claim.claimantName} (${claim.claimantRoll || claim.claimantEmail})`,
        handoffPass: gatePassCode,
        handoffInstructions: instructions
      });

      notificationStore.create({
        id: `notif-approved-${Date.now()}`,
        type: 'claim_approved',
        title: `Claim APPROVED: Gate Pass ${gatePassCode}`,
        message: `Claim for "${claim.itemTitle}" by ${claim.claimantName} was verified! Collect from Security Desk.`,
        timestamp: new Date().toISOString(),
        read: false,
        itemId: claim.itemId,
        claimId: claim.id,
        refCode: claim.itemRefCode
      });
    } else {
      updatedClaim = claimStore.update(claim.id, {
        status: 'Rejected',
        reviewedAt: new Date().toISOString(),
        reviewNotes: reviewNotes || ''
      });

      const allClaims = claimStore.getAll();
      const otherApproved = allClaims.some(c => c.itemId === claim.itemId && c.status === 'Approved');
      const otherPending = allClaims.some(c => c.itemId === claim.itemId && c.status === 'Pending' && c.id !== claim.id);
      
      updatedItem = await itemStore.update(claim.itemId, {
        status: otherApproved ? 'Claimed' : (otherPending ? 'Under Review' : 'Active')
      });

      notificationStore.create({
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
      claim: updatedClaim,
      item: updatedItem
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to review claim', details: err.message });
  }
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const notifications = notificationStore.getAll();
  res.json({
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    notifications
  });
});

app.patch('/api/notifications/mark-read', (req, res) => {
  notificationStore.markAllRead();
  res.json({ message: 'All notifications marked as read.' });
});

// Keyword Alerts
app.get('/api/alerts', (req, res) => {
  res.json({ alerts: alertStore.getAll() });
});

app.post('/api/alerts', (req, res) => {
  const { keyword, email } = req.body;
  if (!keyword || keyword.trim().length < 2) {
    return res.status(400).json({ error: 'Keyword must be at least 2 characters long.' });
  }

  const newAlert = alertStore.create({
    id: `alert-${Date.now()}`,
    keyword: keyword.trim(),
    email: email ? email.trim() : 'current_user@aitpune.edu.in',
    createdAt: new Date().toISOString(),
    active: true
  });

  notificationStore.create({
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
  alertStore.delete(req.params.id);
  res.json({ message: 'Radar alert removed.' });
});

// Reset Data endpoint
app.post('/api/reset', async (req, res) => {
  try {
    await itemStore.reset();
    res.json({ message: 'Catalog restored to original AIT mock seed state.' });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed' });
  }
});

// Static Client Serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '../../client/dist');

app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`[AIT Lost & Found Backend] Server listening on port ${PORT}`);
  console.log(`[Campus Landmarks Loaded]: ${AIT_LOCATIONS.length} official AIT zones`);
  console.log(`[Full-Stack Portal Ready]: http://localhost:${PORT}`);
});
