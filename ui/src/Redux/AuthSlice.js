import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

// Decode token from localStorage
let decodedToken = null;
const token = localStorage.getItem("token");

if (token) {
  try {
    decodedToken = jwtDecode(token);
  } catch (error) {
    console.error("❌ Invalid token:", error);
  }
}

// Helper to always return roles as array
const normalizeRoles = (roles) => {
  if (!roles) return [];
  return Array.isArray(roles) ? roles : [roles];
};

// Initial state setup
const initialState = {
  userId: decodedToken?.sub || null,
  userRole: normalizeRoles(decodedToken?.roles),
  company: decodedToken?.company || null,
  employeeId: decodedToken?.employee || null,  // ✅ Use 'employee' key
  source: token ? "company" : null,           // default guess; overridden by dispatch
  resourceType: decodedToken?.resourceType || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthDetails: (state, action) => {
      console.log("🟢 Setting Auth Details in Redux:", action.payload);
      state.userId = action.payload.userId;
      state.userRole = normalizeRoles(action.payload.userRole);
      state.company = action.payload.company;
      state.employeeId = action.payload.employeeId || null;
      state.source = action.payload.source || null;
      state.resourceType = action.payload.resourceType || null;
    },
    clearAuthDetails: (state) => {
      state.userId = null;
      state.userRole = [];
      state.company = null;
      state.employeeId = null;
      state.source = null;
      state.resourceType = null;
    },
  },
});

export const { setAuthDetails, clearAuthDetails } = authSlice.actions;
export default authSlice.reducer;
