const mongoose = require("mongoose");

const assureurSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agencyName: String,
    insuranceTypes: [String], // e.g., ["Auto", "Health", "Home"]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assureur", assureurSchema);
