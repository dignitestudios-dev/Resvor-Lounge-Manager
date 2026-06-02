export const personalDetailsRemainingValues = (previousData = {}) => ({
  // From PersonalDetails (preserved)
  userImage: previousData.userImage || null,
  name: previousData.name || "",
  email: previousData.email || "",
  phone: previousData.phone || "",
  operatingHours: previousData.operatingHours || "",
  offers: previousData.offers || "",
  location: previousData.location || "",
  role: previousData.role || "lounge_manager",

  // From PersonalDetailsRemaining (new)
  specialization: previousData.specialization || "",
  images: previousData.images || [],
  description: previousData.description || "",
});
