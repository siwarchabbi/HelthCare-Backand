const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendPasswordResetEmail = require("../models/emailUtils"); 

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, etat } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }

  if (password.length < 7 || !/[A-Z]/.test(password)) {
    res.status(400);
    throw new Error(
      "Password must be at least 7 characters long and include at least one uppercase letter."
    );
  }

  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed Password: ", hashedPassword);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    etat: etat || "ADMIN", // <-- this is the fix!
  });

  console.log(`User created ${user}`);
  if (user) {
    res.status(201).json({ _id: user.id, email: user.email, etat: user.etat });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
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

const getProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = user.displayProfile();
    res.json(userProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//@desc Update user profile
//@route PUT /api/users/update/:userId
//@access private
const putProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updateData = req.body;
    const image = req.file ? req.file.filename : null;
    const imageuser = req.file ? req.file.filename : null;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user information
    if (updateData.etat) user.etat = updateData.etat;
    if (updateData.username) user.username = updateData.username;
    if (updateData.email) user.email = updateData.email;
    if (updateData.password) user.password = updateData.password;
    if (updateData.age) user.age = updateData.age;
    if (updateData.photoProfile) user.photoProfile = updateData.photoProfile;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.firstname) user.firstname = updateData.firstname;
    if (updateData.lastname) user.lastname = updateData.lastname;
    if (updateData.address) user.address = updateData.address;

    // Update user's image only if a new image is provided
    if (image) {
      user.image = image;
    }
    if (imageuser) {
      user.imageuser = imageuser;
    }

    await user.save(); // Save the changes to the user

    const updatedUser = await User.findById(userId);
    res.json(updatedUser.displayProfile());
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while updating the profile. Please try again." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  currentUser,
  getProfile,
  putProfile,
};


module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  currentUser,
  getProfile,
  putProfile,
};
