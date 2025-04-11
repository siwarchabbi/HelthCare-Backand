const mongoose = require("mongoose");

const prestataireSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  speciality: String,
  experience: Number,
  diplomas: [
    {
      name: String,
      institution: String,
      year: Number,
      fileUrl: String,
    },
  ],
  consultationModes: [String], // ex: ["En ligne", "En cabinet"]
  languagesSpoken: [String],   // ex: ["Français", "Arabe"]
  availableTimes: [
    {
      day: String,
      from: String,
      to: String,
    },
  ],
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0], // Default to [0, 0] if no coordinates are provided
      required: false, // Make it optional
      validate: {
        validator: function(value) {
          // Check if coordinates are in correct format, i.e., an array of two numbers
          return Array.isArray(value) && value.length === 2 && !isNaN(value[0]) && !isNaN(value[1]);
        },
        message: "Coordinates must be an array of two numbers (longitude, latitude).",
      },
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

prestataireSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Prestataire", prestataireSchema);
