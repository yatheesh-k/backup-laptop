import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { EmployeeGetApi } from "../Utils/Axios";

// Async thunk to fetch employee data
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await EmployeeGetApi();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.data || "Something went wrong");
    }
  }
);

// Employee slice
const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    data: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.filter(emp => emp.employeeType !== "CompanyAdmin");
        state.error = null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch employees";
      });
  },
});

export default employeeSlice.reducer;
