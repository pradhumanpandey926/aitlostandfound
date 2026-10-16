import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { SEEDED_ITEMS, INITIAL_ALERTS } from '../data.js';
import { Item } from '../models/Item.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory state that is synchronized with persistent storage
let memoryStore = {
  items: [],
  claims: [
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
  ],
  alerts: JSON.parse(JSON.stringify(INITIAL_ALERTS || [])),
  notifications: [
    {
      id: "notif-001",
      type: "system",
      title: "System Initialized",
      message: "AIT Campus Recovery Portal is live with official landmarks & anti-fraud verification.",
      timestamp: new Date().toISOString(),
      read: false,
      refCode: "AIT-SYSTEM"
    }
  ],
  users: [
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
  ]
};

let isMongoConnected = false;

// Connect to MongoDB using Mongoose
export async function connectMongo() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ait_lost_found';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log('[DATABASE] Successfully connected to MongoDB via Mongoose:', mongoUri);
    
    // Sync existing items to MongoDB collection if empty
    const count = await Item.countDocuments();
    if (count === 0 && memoryStore.items.length > 0) {
      console.log(`[DATABASE] Seeding ${memoryStore.items.length} items to MongoDB collection...`);
      for (const item of memoryStore.items) {
        try {
          await Item.create(item);
        } catch (e) {
          // Ignore duplicate key or validation quirks on seed
        }
      }
    }
  } catch (err) {
    isMongoConnected = false;
    console.log('[DATABASE] Note: MongoDB service offline or unreachable. Using persistent JSON disk-sync storage at:', DB_FILE);
  }
}

// Load data from disk or seed
export function initStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        memoryStore = {
          ...memoryStore,
          ...parsed
        };
        console.log(`[DATABASE] Loaded ${memoryStore.items.length} persistent items from disk store.`);
        return;
      }
    }
  } catch (err) {
    console.error('[DATABASE] Error reading persistent store:', err.message);
  }

  // Seed default data if not present
  memoryStore.items = SEEDED_ITEMS.map((item) => ({
    ...item,
    flagsCount: 0,
    flaggedBy: [],
    isSpamHidden: false,
    genuineAcknowledgement: true,
    reporterRegId: item.reporterEmail.split('@')[0].split('_')[1] || '23112'
  }));
  saveStore();
  console.log(`[DATABASE] Initialized and seeded ${memoryStore.items.length} campus items to disk.`);
}

// Persist memoryStore to disk synchronously
export function saveStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DATABASE] Error saving persistent store to disk:', err.message);
  }
}

// Item Store Operations
export const itemStore = {
  // Get all items with optional moderation visibility
  async getAll({ includeSpamHidden = false } = {}) {
    if (isMongoConnected) {
      try {
        const query = includeSpamHidden ? {} : { isSpamHidden: { $ne: true } };
        const mongoItems = await Item.find(query).sort({ createdAt: -1 }).lean();
        if (mongoItems && mongoItems.length > 0) {
          return mongoItems;
        }
      } catch (err) {
        console.error('[DATABASE] MongoDB read error, falling back to disk store:', err.message);
      }
    }

    if (includeSpamHidden) {
      return [...memoryStore.items];
    }
    return memoryStore.items.filter(item => !item.isSpamHidden);
  },

  // Find item by ID or refCode
  async getById(id) {
    if (isMongoConnected) {
      try {
        const mongoItem = await Item.findOne({ $or: [{ id }, { refCode: id }] }).lean();
        if (mongoItem) return mongoItem;
      } catch (err) {}
    }
    return memoryStore.items.find(i => i.id === id || i.refCode === id) || null;
  },

  // Save new item
  async create(newItemData) {
    // Validate with Mongoose Item schema
    const mongooseDoc = new Item(newItemData);
    const validationError = mongooseDoc.validateSync();
    if (validationError) {
      const firstError = Object.values(validationError.errors)[0]?.message || 'Validation failed';
      throw new Error(firstError);
    }

    const plainItem = mongooseDoc.toObject();

    // Persist to MongoDB if connected
    if (isMongoConnected) {
      try {
        await Item.create(plainItem);
      } catch (err) {
        console.error('[DATABASE] Error writing to MongoDB collection:', err.message);
      }
    }

    // Always persist to disk memory store for cross-user reliability
    memoryStore.items.unshift(plainItem);
    saveStore();

    return plainItem;
  },

  // Update item
  async update(id, updateData) {
    let updatedItem = null;

    if (isMongoConnected) {
      try {
        updatedItem = await Item.findOneAndUpdate(
          { $or: [{ id }, { refCode: id }] },
          { $set: updateData },
          { new: true }
        ).lean();
      } catch (err) {}
    }

    const idx = memoryStore.items.findIndex(i => i.id === id || i.refCode === id);
    if (idx !== -1) {
      memoryStore.items[idx] = {
        ...memoryStore.items[idx],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      saveStore();
      if (!updatedItem) updatedItem = memoryStore.items[idx];
    }

    return updatedItem;
  },

  // Reset to default seed items
  async reset() {
    memoryStore.items = SEEDED_ITEMS.map((item) => ({
      ...item,
      flagsCount: 0,
      flaggedBy: [],
      isSpamHidden: false,
      genuineAcknowledgement: true,
      reporterRegId: item.reporterEmail.split('@')[0].split('_')[1] || '23112'
    }));
    saveStore();

    if (isMongoConnected) {
      try {
        await Item.deleteMany({});
        await Item.insertMany(memoryStore.items);
      } catch (err) {}
    }

    return memoryStore.items;
  }
};

// Claims Store Operations
export const claimStore = {
  getAll() {
    return memoryStore.claims;
  },
  getById(id) {
    return memoryStore.claims.find(c => c.id === id);
  },
  create(claimData) {
    memoryStore.claims.unshift(claimData);
    saveStore();
    return claimData;
  },
  update(id, updateData) {
    const idx = memoryStore.claims.findIndex(c => c.id === id);
    if (idx !== -1) {
      memoryStore.claims[idx] = { ...memoryStore.claims[idx], ...updateData };
      saveStore();
      return memoryStore.claims[idx];
    }
    return null;
  }
};

// Alerts & Notifications & Users Store
export const notificationStore = {
  getAll() {
    return memoryStore.notifications;
  },
  create(notif) {
    memoryStore.notifications.unshift(notif);
    saveStore();
    return notif;
  },
  markAllRead() {
    memoryStore.notifications.forEach(n => { n.read = true; });
    saveStore();
  }
};

export const alertStore = {
  getAll() {
    return memoryStore.alerts;
  },
  create(alert) {
    memoryStore.alerts.unshift(alert);
    saveStore();
    return alert;
  },
  delete(id) {
    memoryStore.alerts = memoryStore.alerts.filter(a => a.id !== id);
    saveStore();
  }
};

export const userStore = {
  getAll() {
    return memoryStore.users;
  },
  findByEmail(email) {
    if (!email) return null;
    return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  createOrUpdate(userData) {
    const idx = memoryStore.users.findIndex(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (idx !== -1) {
      memoryStore.users[idx] = { ...memoryStore.users[idx], ...userData };
      saveStore();
      return memoryStore.users[idx];
    } else {
      memoryStore.users.push(userData);
      saveStore();
      return userData;
    }
  }
};
