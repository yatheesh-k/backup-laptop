import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProductGetAllApi } from '../../Utils/Axios';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (companyId) => {
    try {
        const response = await ProductGetAllApi(companyId);  
        console.log('Fetched Products response:', response);
        if (Array.isArray(response.data)) {
            console.log('Fetched Products data from productSlice:', response.data);
            return response.data;
        } else {
            throw new Error('Invalid response structure');
        }
    } catch (error) {
        console.error('Error in fetchProducts thunk:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
});

const ProductSlice = createSlice({
    name: 'products',
    initialState: {
        products: [],
        loading: false,
        error: null,
    },
    reducers: {
        removeProductFromState: (state, action) => {
            state.products = state.products.filter(product => product.productId !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                console.log('Action Payload (Products):', action.payload);
                state.products = action.payload;
                console.log('Updated products in Redux state:', state.products);
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { removeProductFromState } = ProductSlice.actions;
export default ProductSlice.reducer;
