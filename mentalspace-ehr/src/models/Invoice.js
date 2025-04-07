const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: [true, 'Please add a client']
  },
  invoiceNumber: {
    type: String,
    required: [true, 'Please add an invoice number'],
    unique: true
  },
  dateIssued: {
    type: Date,
    required: [true, 'Please add an issue date'],
    default: Date.now
  },
  dateDue: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  items: [{
    description: {
      type: String,
      required: [true, 'Please add an item description']
    },
    serviceDate: {
      type: Date,
      required: [true, 'Please add a service date']
    },
    appointment: {
      type: mongoose.Schema.ObjectId,
      ref: 'Appointment'
    },
    claim: {
      type: mongoose.Schema.ObjectId,
      ref: 'Claim'
    },
    billingCode: {
      type: String
    },
    units: {
      type: Number,
      required: [true, 'Please add units'],
      default: 1
    },
    rate: {
      type: Number,
      required: [true, 'Please add a rate']
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount']
    },
    insuranceResponsibility: {
      type: Number,
      default: 0
    },
    patientResponsibility: {
      type: Number,
      default: 0
    }
  }],
  subtotal: {
    type: Number,
    required: [true, 'Please add a subtotal']
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  discountReason: {
    type: String
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please add a total amount']
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    required: [true, 'Please add a balance']
  },
  status: {
    type: String,
    enum: ['Draft', 'Issued', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled', 'Void'],
    default: 'Draft'
  },
  paymentTerms: {
    type: String,
    default: 'Due on receipt'
  },
  notes: {
    type: String
  },
  payments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Payment'
  }],
  sentVia: {
    type: String,
    enum: ['Email', 'Mail', 'Portal', 'In Person', 'Other'],
    default: 'Email'
  },
  sentDate: {
    type: Date
  },
  remindersSent: [{
    date: {
      type: Date,
      required: true
    },
    method: {
      type: String,
      enum: ['Email', 'SMS', 'Portal', 'Mail', 'Phone', 'Other'],
      required: true
    },
    sentBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'Staff',
      required: true
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
InvoiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate totals if not provided
InvoiceSchema.pre('save', function(next) {
  // Calculate subtotal from items if not provided
  if (!this.subtotal && this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((total, item) => {
      return total + item.amount;
    }, 0);
  }
  
  // Calculate total amount if not provided
  if (!this.totalAmount) {
    this.totalAmount = this.subtotal - this.discountAmount + this.taxAmount;
  }
  
  // Calculate balance if not provided
  if (!this.balance) {
    this.balance = this.totalAmount - this.amountPaid;
  }
  
  // Update status based on payment status
  if (this.status !== 'Draft' && this.status !== 'Cancelled' && this.status !== 'Void') {
    if (this.balance <= 0) {
      this.status = 'Paid';
    } else if (this.amountPaid > 0) {
      this.status = 'Partially Paid';
    } else if (this.dateDue < new Date() && this.status !== 'Paid') {
      this.status = 'Overdue';
    }
  }
  
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
