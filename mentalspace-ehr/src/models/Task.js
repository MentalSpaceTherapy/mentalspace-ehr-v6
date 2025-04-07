const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
    maxlength: [100, 'Task title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['Call', 'Email', 'Meeting', 'Follow-up', 'Appointment', 'Other'],
    default: 'Follow-up'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Deferred', 'Cancelled'],
    default: 'Not Started'
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  completedDate: {
    type: Date
  },
  reminderDate: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Lead', 'Client', 'Contact', 'Campaign', 'Appointment', 'None'],
      default: 'None'
    },
    id: {
      type: mongoose.Schema.ObjectId,
      refPath: 'relatedTo.model'
    }
  },
  notes: {
    type: String
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: [true, 'Please assign the task to a staff member']
  },
  tags: [{
    type: String
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Custom'],
      default: 'Weekly'
    },
    interval: {
      type: Number,
      default: 1
    },
    daysOfWeek: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    endDate: {
      type: Date
    },
    occurrences: {
      type: Number
    }
  },
  parentTask: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task'
  },
  subtasks: [{
    title: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: {
      type: Date
    }
  }],
  attachments: [{
    name: {
      type: String,
      required: [true, 'Please add attachment name']
    },
    fileUrl: {
      type: String,
      required: [true, 'Please add file URL']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
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
TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update status when completed
TaskSchema.pre('save', function(next) {
  if (this.completedDate && this.status !== 'Completed') {
    this.status = 'Completed';
  }
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
