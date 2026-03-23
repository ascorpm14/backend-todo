const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    semaine: {
      type: Date,
      required: true,
    },
    tachesCompletes: {
      type: Number,
      default: 0,
    },
    totalTaches: {
      type: Number,
      default: 0,
    },
    moyenneImportance: {
      type: Number,
      default: 0,
    },
    tachesParJour: [
      {
        jour: String,
        nombre: Number,
        importance: Number,
      },
    ],
    tendance: {
      type: String,
      enum: ['montante', 'descendante', 'stable'],
      default: 'stable',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Stats', statsSchema);
