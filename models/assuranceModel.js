const mongoose = require("mongoose");

const assureurSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agencyName: String,
    insuranceTypes: {
      type: [String],
      default: ["Health"], // ✅ Valeur par défaut
    },
    reductionPercentage: {
      type: Number,
      default: 0, // % de réduction, par défaut 0
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assureur", assureurSchema);
