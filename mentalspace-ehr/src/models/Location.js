const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [100, 'Location name cannot be more than 100 characters']
  },
  address: {
    street1: {
      type: String,
      required: [true, 'Street address is required'],
      maxlength: [100, 'Street address cannot be more than 100 characters']
    },
    street2: {
      type: String,
      maxlength: [100, 'Street address line 2 cannot be more than 100 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      maxlength: [50, 'City cannot be more than 50 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      maxlength: [50, 'State cannot be more than 50 characters']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      maxlength: [20, 'Zip code cannot be more than 20 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'United States',
      maxlength: [50, 'Country cannot be more than 50 characters']
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      maxlength: [20, 'Phone number cannot be more than 20 characters']
    },
    fax: {
      type: String,
      maxlength: [20, 'Fax number cannot be more than 20 characters']
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ],
      maxlength: [100, 'Email cannot be more than 100 characters']
    },
    website: {
      type: String,
      maxlength: [100, 'Website cannot be more than 100 characters']
    }
  },
  operatingHours: [{
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    openTime: {
      type: String,
      required: [true, 'Open time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please add a valid time in HH:MM format']
    },
    closeTime: {
      type: String,
      required: [true, 'Close time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please add a valid time in HH:MM format']
    },
    isClosed: {
      type: Boolean,
      default: false
    }
  }],
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    default: 'America/New_York'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  taxId: {
    type: String,
    maxlength: [50, 'Tax ID cannot be more than 50 characters']
  },
  npi: {
    type: String,
    maxlength: [20, 'NPI cannot be more than 20 characters']
  },
  services: [{
    type: String,
    trim: true
  }],
  facilities: {
    totalRooms: {
      type: Number,
      default: 0
    },
    hasWaitingRoom: {
      type: Boolean,
      default: true
    },
    hasHandicapAccess: {
      type: Boolean,
      default: false
    },
    hasParking: {
      type: Boolean,
      default: false
    },
    parkingDetails: {
      type: String,
      maxlength: [200, 'Parking details cannot be more than 200 characters']
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one primary location
LocationSchema.pre('save', async function(next) {
  if (this.isPrimary) {
    // Find any other primary locations and unset them
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isPrimary: true },
      { $set: { isPrimary: false } }
    );
  }
  
  this.updatedAt = Date.now();
  next();
});

// Create indexes for faster lookups
LocationSchema.index({ name: 1 });
LocationSchema.index({ isActive: 1 });
LocationSchema.index({ isPrimary: 1 });

module.exports = mongoose.model('Location', LocationSchema);
