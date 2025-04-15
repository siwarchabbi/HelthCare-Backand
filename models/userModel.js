const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add the user name"],
    },
    email: {
      type: String,
      required: [true, "Please add the user email address"],
      unique: [true, "Email address already taken"],
    },
    password: {
      type: String,
      required: [true, "Please add the user password"],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    age: String,
    photoProfile: String,
    phone: String,
    firstname: String,
    lastname: String,
    address: String,
    image: String,
    
    imageuser: String,
    cin: String,

    etat: {
      type: String,
      enum: ["ADMIN", "PRESTATAIRE","ASSUREUR","PATIENT"],
      default: "PATIENT"
    }
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("imageUrl").get(function () {
  return `/uploads/${this.image}`;
});

userSchema.virtual("imageUserUrl").get(function () {
  return `/uploads/${this.imageuser}`;
});


userSchema.methods.displayProfile = function () {
  return {
    username: this.username,
    email: this.email,
    age: this.age,
    photoProfile: this.photoProfile,
    phone: this.phone,
    firstname: this.firstname,
    lastname: this.lastname,
    address: this.address,
    image: this.image,
    imageuser: this.imageuser,
    etat: this.etat,
    cin: this.cin,
  };
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return resetToken;
};

// Method to update user information
userSchema.methods.updateInfo = function (updateData) {
  if (updateData.etat) this.etat = updateData.etat;
  if (updateData.age) this.age = updateData.age;
  if (updateData.photoProfile) this.photoProfile = updateData.photoProfile;
  if (updateData.phone) this.phone = updateData.phone;
  if (updateData.firstname) this.firstname = updateData.firstname;
  if (updateData.lastname) this.lastname = updateData.lastname;
  if (updateData.address) this.address = updateData.address;
  if (updateData.image) this.image = updateData.image;
  if (updateData.imageuser) this.imageuser = updateData.imageuser;
  if (updateData.cin) this.cin = updateData.cin;

  return this.save();
};

module.exports = mongoose.model("User", userSchema);
