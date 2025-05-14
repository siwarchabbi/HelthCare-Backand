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
  consultationMode: String,
  languagesSpoken: [String],
  availableTimes: {
    type: [String],
    default: ["08:00", "17:00"],
  },
  numberOfDaysPerWeek: {
    type: [Number], // This will store an array of numbers
    enum: [1, 2, 3, 4, 5, 6, 7], // The valid days of the week
    default: [], // Default is an empty array
  },
  consultationDuration: {
    type: Number,
    default: 0,
  },
  consultationPrice: {
    type: Number,
    default: 0,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
      validate: {
        validator: function (value) {
          return (
            Array.isArray(value) &&
            value.length === 2 &&
            !isNaN(value[0]) &&
            !isNaN(value[1])
          );
        },
        message:
          "Coordinates must be an array of two numbers (longitude, latitude).",
      },
    },
  }, 
  specialityViews: [
    {
      name: { type: String, required: true },
      viewCount: { type: Number, default: 0 },
      viewedBy: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          dateViewed: { type: Date, default: Date.now }
        }
      ]
    }
  ],
  
  visitesProfil: {
    type: Number,
    default: 0,
  },
  reservationsConfirmées: {
    type: Number,
    default: 0,
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
