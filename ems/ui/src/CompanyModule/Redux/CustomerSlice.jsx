import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CustomerGetAllApi } from '../../Utils/Axios';

export const fetchCustomers = createAsyncThunk('customers/fetchCustomers', async (companyId) => {
  try {
    const response = await CustomerGetAllApi(companyId); 
    console.log('Fetched Customers data from customerSlice:', response.data);
    return response.data; 
  } catch (error) {
    console.error('Error in fetchCustomers thunk:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch customers');
  }
});

const CustomerSlice = createSlice({
  name: 'customers',
  initialState: {
    customers: [],
    loading: false,
    error: null,
  },
  reducers: {
    removeCustomerFromState: (state, action) => {
        state.customers = state.customers.filter(customer => customer.customerId !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Action Payload (Customers):', action.payload);
        state.customers = action.payload;
        console.log('Updated customers in Redux state:', state.customers);
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { removeCustomerFromState } = CustomerSlice.actions;
export default CustomerSlice.reducer;
