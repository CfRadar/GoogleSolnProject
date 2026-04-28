const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function buildAuthUser(user) {
  return {
    email: user.email,
    isProfileComplete: Boolean(user.isProfileComplete ?? user.profileCompleted),
    profileCompleted: Boolean(user.profileCompleted ?? user.isProfileComplete)
  };
}

async function signup(email, password) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("User already exists, please login");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    password: hashedPassword,
    isVerified: true,
    isProfileComplete: false,
    profileCompleted: false
  });

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: buildAuthUser(user)
  };
}

async function login(email, password) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: buildAuthUser(user)
  };
}

module.exports = { signup, login };
