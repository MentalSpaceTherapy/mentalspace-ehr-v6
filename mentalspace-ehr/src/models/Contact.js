const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },
  address: {
    street: {
      type: String,
      maxlength: [100, 'Street cannot be more than 100 characters']
    },
    city: {
      type: String,
      maxlength: [50, 'City cannot be more than 50 characters']
    },
    state: {
      type: String,
      maxlength: [50, 'State cannot be more than 50 characters']
    },
    zipCode: {
      type: String,
      maxlength: [20, 'Zip code cannot be more than 20 characters']
    },
    country: {
      type: String,
      maxlength: [50, 'Country cannot be more than 50 characters'],
      default: 'USA'
    }
  },
  organization: {
    type: String,
    maxlength: [100, 'Organization name cannot be more than 100 characters']
  },
  title: {
    type: String,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  type: {
    type: String,
    enum: ['Referral Source', 'Partner', 'Vendor', 'Insurance', 'Other'],
    default: 'Referral Source'
  },
  category: {
    type: String,
    enum: ['Healthcare', 'Education', 'Business', 'Community', 'Government', 'Other'],
    default: 'Healthcare'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Active'
  },
  notes: {
    type: String
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  socialMedia: {
    linkedin: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    instagram: {
      type: String
    }
  },
  preferredContactMethod: {
    type: String,
    enum: ['Email', 'Phone', 'Mail', 'No Preference'],
    default: 'Email'
  },
  referralRelationship: {
    isReferrer: {
      type: Boolean,
      default: false
    },
    isReferralDestination: {
      type: Boolean,
      default: false
    },
    specialties: [{
      type: String
    }],
    referralNotes: {
      type: String
    }
  },
  tags: [{
    type: String
  }],
  interactions: [{
    type: {
      type: String,
      enum: ['Call', 'Email', 'Meeting', 'Text', 'Other'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String
    },
    outcome: {
      type: String
    },
    staff: {
      type: mongoose.Schema.ObjectId,
      ref: 'Staff',
      required: true
    }
  }],
  campaigns: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Campaign'
  }],
  tasks: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Task'
  }],
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff'
  }
});

// Set updatedAt on save
ContactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Contact', ContactSchema);
