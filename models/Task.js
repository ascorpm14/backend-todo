const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    importance: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 3,
      description: '1 = basse, 5 = haute',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    dateCompletion: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
