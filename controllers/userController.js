const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendPasswordResetEmail = require("../models/emailUtils"); 
const Prestataire = require("../models/PrestataireModel"); // import
const Patient = require("../models/patientModel");

//@desc Register a user
//@route POST /api/users/register
//@access public


const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, etat } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already registered!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    etat: etat || "ADMIN", // Default to "ADMIN" if no etat is provided
  });

  // 👉 If it's a PRESTATAIRE, create extra doc
  if (etat === "PRESTATAIRE") {
    try {
      const prestataire = await Prestataire.create({
        userId: user._id,
        speciality: "",
        experience: 0,
      });
      console.log("Prestataire created:", prestataire);
    } catch (error) {
      console.error("Error creating Prestataire:", error);
      res.status(500).json({ error: error.message, stack: error.stack });
      return; // Prevent further processing if there is an error creating Prestataire
    }
  }

  // 👉 If it's a PATIENT, create extra doc
  if (user.etat === "PATIENT") {
    try {
      const patient = new Patient({
        userId: user._id, // Link to the User model
        // Add patient-specific fields here, if needed
      });
      await patient.save();  // Save the patient document to the database
      console.log("Patient created:", patient);
    } catch (error) {
      console.error("Error creating Patient:", error);
      res.status(500).json({ error: error.message, stack: error.stack });
      return; // Prevent further processing if there is an error creating Patient
    }
  }

  res.status(201).json({
    _id: user.id,
    email: user.email,
    etat: user.etat,
  });
});




//@desc Login user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "All fields are mandatory!" });
      return;
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = jwt.sign(
        {
          user: {
            id: user.id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      // Include user details in the response
      res.status(200).json({
        message: "User found and logged in successfully",
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          etat: user.etat,
        },
      });
    } else {
      res.status(401).json({ error: "Email or password is not valid" });
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

//@desc Forgot password
//@route POST /api/users/forgot-password
//@access public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Generate unique code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Save code to user document
  user.resetPasswordToken = resetCode;
  await user.save();

  // Send password reset email with the code
  try {
    await sendPasswordResetEmail(email, resetCode); // Implement this function
    res.status(200).json({ message: "Password reset code sent successfully" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ error: "Failed to send password reset code email" });
  }
});

//@desc Get full profile by userId depending on role
//@route GET /api/profile/:userId
//@access private
const getUserProfileByRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Trouver le user
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  let profileData = null;

  if (user.etat === "PRESTATAIRE") {
    profileData = await Prestataire.findOne({ userId }).populate("userId");
  } else if (user.etat === "PATIENT") {
    profileData = await Patient.findOne({ userId }).populate("userId");
  } else {
    res.status(400).json({ message: "Unsupported user role" });
    return;
  }

  if (!profileData) {
    res.status(404).json({ message: "Profile not found" });
    return;
  }

  res.status(200).json(profileData);
});
 
//@desc Reset password
//@route POST /api/users/reset-password
//@access public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  const user = await User.findOne({ email, resetPasswordToken: resetCode });

  if (!user) {
    res.status(400).json({ message: "Invalid email or reset code" });
    return;
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user's password
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});

//@desc Current user info
//@route POST /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});





module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  currentUser,
  getUserProfileByRole,

};



