const mongoose = require('mongoose');

const NoteVersionSchema = new mongoose.Schema({
  note: {
    type: mongoose.Schema.ObjectId,
    ref: 'Note',
    required: [true, 'Please add a note reference']
  },
  content: {
    type: Object,
    required: [true, 'Please add note content']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Staff',
    required: true
  }
});

module.exports = mongoose.model('NoteVersion', NoteVersionSchema);
