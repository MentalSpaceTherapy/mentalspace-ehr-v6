const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client'
  },
  claim: {
    type: mongoose.Schema.ObjectId,
    ref: 'Claim'
  },
  invoice: {
    type: mongoose.Schema.ObjectId,
    ref: 'Invoice'
  },
  paymentType: {
    type: String,
    enum: ['Insurance', 'Patient', 'Adjustment', 'Refund', 'Other'],
    required: [true, 'Please add a payment type']
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Check', 'Cash', 'Electronic', 'Bank Transfer', 'Other'],
    required: [true, 'Please add a payment method']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  date: {
    type: Date,
    required: [true, 'Please add a payment date'],
    default: Date.now
  },
  checkNumber: {
    type: String
  },
  transactionId: {
    type: String
  },
  insuranceEOB: {
    eobDate: {
      type: Date
    },
    eobNumber: {
      type: String
    },
    insuranceCarrier: {
      type: mongoose.Schema.ObjectId,
      ref: 'InsuranceCarrier'
    },
    payerId: {
      type: String
    },
    allowedAmount: {
      type: Number
    },
    adjustmentAmount: {
      type: Number
    },
    adjustmentReason: {
      type: String
    },
    patientResponsibility: {
      type: Number
    },
    processingNotes: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Processed', 'Failed', 'Refunded', 'Voided'],
    default: 'Processed'
  },
  notes: {
    type: String
  },
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
    },
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'Staff'
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
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update claim or invoice when payment is added
PaymentSchema.post('save', async function() {
  try {
    // Update claim if this payment is associated with a claim
    if (this.claim) {
      const Claim = mongoose.model('Claim');
      const claim = await Claim.findById(this.claim);
      
      if (claim) {
        // Add payment to claim's payments array if not already there
        if (!claim.payments.includes(this._id)) {
          claim.payments.push(this._id);
        }
        
        // Update claim's payment totals
        if (this.paymentType === 'Insurance' || this.paymentType === 'Patient') {
          claim.totalPaid = (claim.totalPaid || 0) + this.amount;
        } else if (this.paymentType === 'Adjustment') {
          claim.totalAdjustment = (claim.totalAdjustment || 0) + this.amount;
        } else if (this.paymentType === 'Refund') {
          claim.totalPaid = (claim.totalPaid || 0) - this.amount;
        }
        
        // Update claim status based on payment
        if (claim.totalPaid >= claim.totalCharged) {
          claim.status = 'Paid';
        } else if (claim.totalPaid > 0) {
          claim.status = 'Partially Paid';
        }
        
        await claim.save();
      }
    }
    
    // Update invoice if this payment is associated with an invoice
    if (this.invoice) {
      const Invoice = mongoose.model('Invoice');
      const invoice = await Invoice.findById(this.invoice);
      
      if (invoice) {
        // Add payment to invoice's payments array if not already there
        if (!invoice.payments.includes(this._id)) {
          invoice.payments.push(this._id);
        }
        
        // Update invoice's payment totals
        if (this.paymentType === 'Patient' || this.paymentType === 'Insurance') {
          invoice.amountPaid = (invoice.amountPaid || 0) + this.amount;
        } else if (this.paymentType === 'Refund') {
          invoice.amountPaid = (invoice.amountPaid || 0) - this.amount;
        }
        
        // Update invoice status based on payment
        if (invoice.amountPaid >= invoice.totalAmount) {
          invoice.status = 'Paid';
        } else if (invoice.amountPaid > 0) {
          invoice.status = 'Partially Paid';
        }
        
        await invoice.save();
      }
    }
  } catch (err) {
    console.error('Error updating claim or invoice after payment:', err);
  }
});

module.exports = mongoose.model('Payment', PaymentSchema);
