import { configureStore } from '@reduxjs/toolkit';
import authReducer from './AuthSlice';
import CustomerReducer from './CustomerSlice';
import ProductReducer from './ProductSlice';
import InvoiceReducer from './InvoiceSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: CustomerReducer,
    // banks:BankReducer,
    products: ProductReducer,
    invoices: InvoiceReducer,
  },
});
export default store;
