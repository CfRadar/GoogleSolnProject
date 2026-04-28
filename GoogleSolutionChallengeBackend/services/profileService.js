const User = require("../models/User");

async function getProfile(userId) {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * First-time profile setup — marks isProfileComplete = true
 */
async function setupProfile(userId, profileData) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (profileData.skills !== undefined) user.skills = profileData.skills;
  if (profileData.interests !== undefined) user.interests = profileData.interests;
  if (profileData.availability !== undefined) user.availability = profileData.availability;
  if (profileData.location?.address !== undefined) {
    user.location = { address: profileData.location.address };
  }

  user.isProfileComplete = true;
  user.profileCompleted = true;

  await user.save();

  const result = user.toObject();
  delete result.password;
  return result;
}

/**
 * General profile update (no profile completion side-effect)
 */
async function updateProfile(userId, profileData) {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");

  if (profileData.skills !== undefined) user.skills = profileData.skills;
  if (profileData.interests !== undefined) user.interests = profileData.interests;
  if (profileData.availability !== undefined) user.availability = profileData.availability;
  if (profileData.location?.address !== undefined) {
    user.location = { address: profileData.location.address };
  }

  await user.save();
  return user;
}

module.exports = { getProfile, setupProfile, updateProfile };
