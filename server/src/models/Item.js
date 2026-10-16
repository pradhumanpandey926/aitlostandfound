import mongoose from 'mongoose';
import { AIT_LOCATIONS, CATEGORIES } from '../data.js';

const itemSchema = new mongoose.Schema(
  {
    id: { 
      type: String, 
      required: true, 
      unique: true 
    },
    refCode: { 
      type: String, 
      required: true, 
      unique: true 
    },
    type: { 
      type: String, 
      enum: ['found', 'lost'], 
      required: true 
    },
    title: { 
      type: String, 
      required: [true, 'Item title is required'], 
      trim: true 
    },
    category: { 
      type: String, 
      required: [true, 'Category is required'],
      enum: CATEGORIES
    },
    location: { 
      type: String, 
      required: [true, 'AIT Campus Landmark is required'],
      enum: AIT_LOCATIONS
    },
    date: { 
      type: String, 
      required: [true, 'Incident date is required'] 
    },
    time: { 
      type: String, 
      default: '12:00' 
    },
    description: { 
      type: String, 
      required: [true, 'High-detail description is required'], 
      minlength: [25, 'Description must be at least 25 characters long to prevent spam'] 
    },
    status: { 
      type: String, 
      enum: ['Active', 'Under Review', 'Claimed', 'Rejected', 'Removed'], 
      default: 'Active' 
    },
    reporterName: { 
      type: String, 
      required: [true, 'Reporter name is required'] 
    },
    reporterEmail: { 
      type: String, 
      required: [true, 'Official college email is required'],
      validate: {
        validator: function(v) {
          return typeof v === 'string' && v.trim().toLowerCase().endsWith('@aitpune.edu.in');
        },
        message: 'Reporter email must be an official @aitpune.edu.in address'
      }
    },
    reporterRegId: { 
      type: String, 
      required: [true, 'Registration / Roll / Employee ID is required'] 
    },
    reporterRole: { 
      type: String, 
      default: 'Student' 
    },
    verificationQuestion: { 
      type: String, 
      required: [true, 'Anti-fraud verification question is required'] 
    },
    privateAnswerHint: { 
      type: String, 
      default: '' 
    },
    hasRedactedImage: { 
      type: Boolean, 
      default: false 
    },
    imageData: { 
      type: String, 
      default: null 
    },
    imagePlaceholder: { 
      type: String, 
      default: 'default' 
    },
    urgency: { 
      type: String, 
      default: 'Medium' 
    },
    genuineAcknowledgement: { 
      type: Boolean, 
      required: [true, 'Genuine acknowledgement is mandatory'],
      default: true 
    },
    flagsCount: { 
      type: Number, 
      default: 0 
    },
    flaggedBy: { 
      type: [String], 
      default: [] 
    },
    isSpamHidden: { 
      type: Boolean, 
      default: false 
    },
    claimedBy: { 
      type: String, 
      default: null 
    },
    handoffPass: { 
      type: String, 
      default: null 
    },
    handoffInstructions: { 
      type: String, 
      default: null 
    }
  },
  { 
    timestamps: true 
  }
);

// Mongoose model export
export const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);
