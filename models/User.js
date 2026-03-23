const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: true,
      unique: true,
      enum: ['Tojo', 'Mendrika'],
    },
    couleur: {
      type: String,
      enum: ['rouge', 'bleu-clair'],
      default: function() {
        return this.pseudo === 'Tojo' ? 'rouge' : 'bleu-clair';
      },
    },
    totalTaches: {
      type: Number,
      default: 0,
    },
    tachesCompletes: {
      type: Number,
      default: 0,
    },
    moyenneImportance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
