import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BankGetAllApi } from '../Utils/Axios';

// Create the async thunk for fetching banks
export const fetchBanks = createAsyncThunk('banks/fetchBanks', async (companyId) => {
  try {
    console.log('Fetching banks for companyId:', companyId);
    const response = await BankGetAllApi(companyId); // Call the Bank API
    console.log('Fetched banks data from BankSlice:', response.data.data); // Log the banks data
    return response.data.data; // Return the banks data
  } catch (error) {
    console.error('Error in fetchBanks thunk:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch banks');
  }
});

// Create the slice for banks
const BankSlice = createSlice({
  name: 'banks',
  initialState: {
    banks: [],       // stores the list of banks
    loading: false,  // flag for loading state
    error: null,     // stores any error message
  },
  reducers: {
    // You can add other reducer actions here as needed (e.g., to remove/update a bank)
    removeBankFromState: (state, action) => {
      state.banks = state.banks.filter(bank => bank.bankId !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanks.pending, (state) => {
        state.loading = true; // Set loading to true when the fetch starts
      })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.loading = false; // Set loading to false when the fetch succeeds
        console.log('Action Payload (banks):', action.payload); // Log the action payload
        state.banks = action.payload; // Update the banks state with the fetched data
        console.log('Updated banks in Redux state:', state.banks);
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.loading = false; // Set loading to false when the fetch fails
        state.error = action.error.message; // Store the error message
      });
  },
});

export const { removeBankFromState } = BankSlice.actions;
export default BankSlice.reducer;

