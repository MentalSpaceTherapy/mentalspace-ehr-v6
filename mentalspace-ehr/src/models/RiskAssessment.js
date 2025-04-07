const mongoose = require('mongoose');

const RiskAssessmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: [true, 'Please add a client']
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: [true, 'Please add a provider']
  },
  note: {
    type: mongoose.Schema.ObjectId,
    ref: 'Note'
  },
  assessmentDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Please add assessment date']
  },
  suicidalIdeation: {
    present: {
      type: Boolean,
      required: true
    },
    severity: {
      type: String,
      enum: ['None', 'Low', 'Moderate', 'High', 'Extreme'],
      default: 'None'
    },
    plan: {
      type: Boolean,
      default: false
    },
    intent: {
      type: Boolean,
      default: false
    },
    means: {
      type: Boolean,
      default: false
    },
    history: {
      type: Boolean,
      default: false
    },
    details: {
      type: String
    }
  },
  homicidalIdeation: {
    present: {
      type: Boolean,
      required: true
    },
    severity: {
      type: String,
      enum: ['None', 'Low', 'Moderate', 'High', 'Extreme'],
      default: 'None'
    },
    plan: {
      type: Boolean,
      default: false
    },
    intent: {
      type: Boolean,
      default: false
    },
    means: {
      type: Boolean,
      default: false
    },
    target: {
      type: String
    },
    details: {
      type: String
    }
  },
  selfHarm: {
    present: {
      type: Boolean,
      required: true
    },
    severity: {
      type: String,
      enum: ['None', 'Low', 'Moderate', 'High', 'Extreme'],
      default: 'None'
    },
    history: {
      type: Boolean,
      default: false
    },
    details: {
      type: String
    }
  },
  substanceUse: {
    present: {
      type: Boolean,
      required: true
    },
    severity: {
      type: String,
      enum: ['None', 'Low', 'Moderate', 'High', 'Extreme'],
      default: 'None'
    },
    substances: [{
      type: String
    }],
    details: {
      type: String
    }
  },
  psychosis: {
    present: {
      type: Boolean,
      required: true
    },
    severity: {
      type: String,
      enum: ['None', 'Low', 'Moderate', 'High', 'Extreme'],
      default: 'None'
    },
    details: {
      type: String
    }
  },
  overallRiskLevel: {
    type: String,
    enum: ['None', 'Low', 'Moderate', 'High', 'Extreme'],
    required: [true, 'Please specify overall risk level']
  },
  safetyPlan: {
    created: {
      type: Boolean,
      default: false
    },
    details: {
      type: String
    }
  },
  interventions: {
    type: String
  },
  followUpPlan: {
    type: String
  },
  hospitalizationRequired: {
    type: Boolean,
    default: false
  },
  mandatedReportingRequired: {
    type: Boolean,
    default: false
  },
  mandatedReportingDetails: {
    type: String
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
RiskAssessmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RiskAssessment', RiskAssessmentSchema);
