const mongoose = require("mongoose");

const patientSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  mutuelle: {
    type: String,
    required: false,
  },
  dossierMedical: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prestataire"
    }
  ],
  
}, {
  timestamps: true
});

module.exports = mongoose.model("Patient", patientSchema);
