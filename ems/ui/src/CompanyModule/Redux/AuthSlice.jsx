import { createSlice } from '@reduxjs/toolkit';

// Initial state for the authentication slice
const initialState = {
  userId: null,
  userRole: null,
  company: null,
  employeeId: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to set the decoded token data
    setAuthUser: (state, action) => {
      const { userId, userRole, company, employeeId, token } = action.payload;
      state.userId = userId;
      state.userRole = userRole;
      state.company = company;
      state.employeeId = employeeId;
      state.token = token;
    },
    // Action to clear the user data when logging out
    logout: (state) => {
      state.userId = null;
      state.userRole = null;
      state.company = null;
      state.employeeId = null;
      state.token = null;
    },
  },
});

export const { setAuthUser, logout } = authSlice.actions;
export default authSlice.reducer;
