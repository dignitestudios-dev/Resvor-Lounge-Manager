export const floorPlanSetupValues = (previousData = {}) => ({
  // From PersonalDetails
  userImage: previousData.userImage || null,
  name: previousData.name || "",
  email: previousData.email || "",
  phone: previousData.phone || "",
  operatingHours: previousData.operatingHours || "",
  offers: previousData.offers || "",
  location: previousData.location || "",
  role: previousData.role || "lounge_manager",

  // From PersonalDetailsRemaining
  specialization: previousData.specialization || "",
  images: previousData.images || [],
  description: previousData.description || "",

  // From FloorPlanSetup
  floorPlan: previousData.floorPlan || null,
  regularTables: previousData.regularTables || "",
  vipTables: previousData.vipTables || "",
});
