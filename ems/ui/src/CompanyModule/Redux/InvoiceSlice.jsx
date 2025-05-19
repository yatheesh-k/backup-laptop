import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { InvoiceGetAllApi } from '../../Utils/Axios';

export const fetchInvoices = createAsyncThunk('invoices/fetchInvoices', async (companyId) => {
  try {
    const response = await InvoiceGetAllApi(companyId);  
    console.log('Fetched Invoices data from invoiceSlice:', response.data);
    return response.data; 
  } catch (error) {
    console.error('Error in fetchInvoices thunk:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch invoices');
  }
});

const InvoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    invoices: [],   
    loading: false,    
    error: null,     
  },
  reducers: {
    removeInvoiceFromState: (state, action) => {
        state.invoices = state.invoices.filter(invoice => invoice.invoiceId !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;   
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false; 
        console.log('Action Payload (Invoices):', action.payload);
        state.invoices = action.payload; 
        console.log('Updated invoices in Redux state:', state.invoices);
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false; 
        state.error = action.error.message;  
      });
  },
});

export const { removeInvoiceFromState } = InvoiceSlice.actions;
export default InvoiceSlice.reducer;
