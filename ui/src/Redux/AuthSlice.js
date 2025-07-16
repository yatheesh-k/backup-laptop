import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

// Decode token from localStorage once when this file loads
let decodedToken = null;
const token = localStorage.getItem("token");

if (token) {
  try {
    decodedToken = jwtDecode(token);
  } catch (error) {
    console.error("❌ Invalid token:", error);
  }
}

// Extract values from decoded token
const initialState = {
  userId: decodedToken?.sub || null,
  userRole: decodedToken?.roles || [],
  company: decodedToken?.company || null,
  employee: decodedToken?.employee || null,
  source: decodedToken ? "company" : null, // or 'ems' based on context
  resourceType: decodedToken?.resourceType || null, // Add resourceType if available
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthDetails: (state, action) => {
      console.log("🟢 Setting Auth Details in Redux:", action.payload);
      state.userId = action.payload.userId;
      state.userRole = action.payload.userRole;
      state.company = action.payload.company;
      state.employee = action.payload.employee;
      state.source = action.payload.source;
      state.resourceType = action.payload.resourceType || null; // Add resourceType if available
    },
    clearAuthDetails: (state) => {
      state.userId = null;
      state.userRole = [];
      state.company = null;
      state.employee = null;
      state.source = null;
      state.resourceType = null; // Clear resourceType as well
    },
  },
});

export const { setAuthDetails, clearAuthDetails } = authSlice.actions;
export default authSlice.reducer;
