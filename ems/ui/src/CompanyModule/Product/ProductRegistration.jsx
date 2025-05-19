import React, { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Slide, toast } from 'react-toastify';
import LayOut from "../../LayOut/LayOut";
import { ProductGetApiById, ProductPostApi, ProductPutApiById } from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";


const ProductRegistration = () => {
  const { register, handleSubmit, reset, trigger, setValue, formState: { errors } } = useForm();
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [productData, setProductData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [update, setUpdate] = useState([]);
  const {user} = useAuth();
  const companyId=user.companyId
  console.log(companyId);
  const navigate = useNavigate();
  const location = useLocation();


  const onSubmit = (data) => {
    const payload = {
      productName: data.productName,
      productCost: data.productCost,
      hsnNo: data.hsnNo,
      gst: data.gst,
      service: data.service
    };

    console.log('Flattened Payload:', payload); // Log the payload to verify its structure

    if (location && location.state && location.state.productId) {
      // If updating, call the PUT API
      ProductPutApiById(companyId, location.state.productId, payload)
        .then((res) => {
          const successMessage = res.data.message || 'Product Account updated successfully';
          toast.success(successMessage, {
            position: 'top-right',
            autoClose: 1000,
          });
          setUpdate(res.data.data);
          navigate('/productsView');
        })
        .catch((error) => {
          console.error('Error updating Product:', error); // Log the error for debugging
          const errorMsg = error.response?.data?.error?.message || error.message || 'Error updating Product';
          toast.error(errorMsg, {
            position: 'top-right',
            autoClose: 1000,
          });
        });
    } else {
      // If adding new bank, call the POST API
      ProductPostApi(companyId, payload)
        .then((response) => {
          toast.success('Product added successfully', {
            position: 'top-right',
            autoClose: 1000,
          });
          setUpdate((prevState) => [...prevState, response.data.data]);
          navigate('/productsView');
        })
        .catch((error) => {
          console.error('Error adding product:', error); // Log the full error object
          const errorMessage = error.response?.data?.error?.message || 'Error adding product';
          toast.error(errorMessage, {
            position: 'top-right',
            autoClose: 1000,
          });
        });
    }
  };

  useEffect(() => {
    console.log('Location state:', location.state);
    console.log('companyId:', companyId);
    if (location && location.state && location.state.productId) {
      const productId = location.state.productId;
      console.log('productId:', productId);
      ProductGetApiById(companyId, productId)
        .then((response) => {
          console.log('product data:', response);
          reset(response);
          setIsUpdating(true);
        })
        .catch((error) => {
          console.error('Error fetching data:', error.response || error);
          if (error.response) {
            console.error('API Error Response:', error.response.data);
          }
          toast.error('Error fetching Product data.');
        });
    }
  }, [location.state?.productId, companyId, reset]);


  const validateField = (value, type) => {
    switch (type) {

      case 'productName':
        return value.length >= 3 && value.length <= 60 || "Product name must be between 3 and 60 characters";

      case 'serviceName':
        return value.length >= 3 && value.length <= 60 || "Service name must be between 3 and 60 characters";

      case 'productCost':
        return /^[0-9]{1,8}(\.[0-9]{1,2})?$/.test(value) || "Product cost must be a valid number (max 8 digits before decimal, e.g., 99999999.99)";

      case 'hsnNo':
        return /^[0-9]{6}$/.test(value) || "HSN number must be exactly 6 digits";

      case 'gst':
        return /^[0-9]{1,2}(\.[0-9]{1,2})?$/.test(value) && parseFloat(value) < 100 || "GST must be a valid number less than 100%";
      default:
        return true;
    }
  };

  const preventInvalidInput = (e, type) => {
    const key = e.key;
    const inputValue = e.target.value;

    if (type === 'alpha' && /[^a-zA-Z\s]/.test(key)) {
      e.preventDefault();
    }
    // Numeric check for fields that should only allow numbers
    if (type === 'numeric' && !/^[0-9]$/.test(key)) {
      e.preventDefault();
    }
    if (type === 'decimal') {
      // Prevent invalid decimal input
      if (!/^[0-9.]$/.test(key)) {
        e.preventDefault();
      }
      // Prevent multiple dots
      if (key === '.' && inputValue.includes('.')) {
        e.preventDefault();
      }
    }
    // Prevent spaces (if any additional validation is needed)
    if (type === 'whitespace' && key === ' ') {
      e.preventDefault();
    }
  };
  const handleInputChange = (e, fieldName) => {
    let value = e.target.value;

    // Remove leading and trailing spaces
    value = value.trimStart().replace(/ {2,}/g, ' ');

    if (fieldName === 'productName' || fieldName === 'service') {
      // Capitalize the first letter of each word
      value = value.replace(/\b\w/g, (char) => char.toUpperCase());
    } else if (fieldName === 'productCost' || fieldName === 'gst') {
      // Ensure only numeric or decimal input
      value = value.replace(/[^0-9.]/g, '');

      // Disallow multiple leading zeros unless followed by a decimal
      if (value.startsWith('0') && value.length > 1 && value[1] !== '.') {
        value = value.replace(/^0+/, '0'); // Retain only a single leading zero
      }

      // Prevent multiple decimals
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
    } else if (fieldName === 'hsnNo') {
      // Ensure only numeric input for HSN
      value = value.replace(/[^0-9]/g, '');
    }
    // Set value and trigger validation
    setValue(fieldName, value);
    trigger(fieldName); // Validate the updated field
  };

  const noTrailingSpaces = (value) => {
    if (value.endsWith(' ')) {
      return "Spaces are not allowed at the end";
    }
    return true; // Return true if the value is valid
  };

  const clearForm = () => {
    reset();
  };
  const backForm = () => {
    reset();
    navigate("/productsView");
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Registration</strong>{" "}
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="/employeeView">Products</a>
                </li>
                <li className="breadcrumb-item active">Registration</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title" style={{ marginBottom: "0px" }}>
                  {isUpdating ? "Customer Data" : "Product Registration"}
                </h5>
                <div
                  className="dropdown-divider"
                  style={{ borderTopColor: "#d7d9dd" }}
                />
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row ">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Product Name<span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type={isUpdating ? "text" : "text"}
                        className="form-control"
                        placeholder="Enter Product Name"
                        name="productName"
                        autoComplete="off"
                        {...register("productName", {
                          required: "Product Name is Required",
                          validate: {
                            noTrailingSpaces: (value) => noTrailingSpaces(value),
                            validProductName: (value) => validateField(value, 'productName')
                          }
                        })}
                        onChange={(e) => handleInputChange(e, "productName")}
                        onKeyPress={(e) => preventInvalidInput(e, 'alpha')}
                      />
                      {errors.productName && (
                        <p className="errorMsg">{errors.productName.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Product Cost <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type={isUpdating ? "text" : "text"}
                        className="form-control"
                        placeholder="Enter Product Cost"
                        name="productCost"
                        autoComplete="off"
                        {...register("productCost", {
                          required: "Product Cost is Required",
                          validate: {
                            noTrailingSpaces: (value) => noTrailingSpaces(value),
                            validProductName: (value) => validateField(value, 'productCost')
                          }
                        })}
                        onChange={(e) => handleInputChange(e, "productCost")}
                        onKeyPress={(e) => preventInvalidInput(e, 'decimal')}
                      />
                      {errors.productCost && (
                        <p className="errorMsg">{errors.productCost.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        HSN Number <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="hsnNo"
                        placeholder="Enter HSN Number"
                        className="form-control"
                        autoComplete="off"
                        {...register("hsnNo", {
                          required: true,
                          validate: {
                            noTrailingSpaces: (value) => noTrailingSpaces(value),
                            validProductName: (value) => validateField(value, 'hsnNo')
                          }
                        })}
                        onChange={(e) => handleInputChange(e, "hsnNo")}
                        onKeyPress={(e) => preventInvalidInput(e, 'numeric')}
                      />
                      {errors.hsnNo && (
                        <p className="errorMsg">
                          {errors.hsnNo.message ||
                            "HSN Number is Required"}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        GST%<span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="gst"
                        placeholder="Enter GST Percentage"
                        className="form-control"
                        autoComplete="off"
                        {...register("gst", {
                          required: true,
                          validate: {
                            noTrailingSpaces: (value) => noTrailingSpaces(value),
                            validProductName: (value) => validateField(value, 'gst')
                          }
                        })}
                        onChange={(e) => handleInputChange(e, "gst")}
                        onKeyPress={(e) => preventInvalidInput(e, 'decimal')}
                      />
                      {errors.gst && (
                        <p className="errorMsg">
                          {errors.gst.message ||
                            "GST Percentage is Required"}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Service <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="service"
                        placeholder="Enter Product Service"
                        className="form-control"
                        autoComplete="off"
                        {...register("service", {
                          required: true,
                          validate: {
                            noTrailingSpaces: (value) => noTrailingSpaces(value),
                            validProductName: (value) => validateField(value, 'serviceName')
                          }
                        })}
                        onChange={(e) => handleInputChange(e, "service")}
                        onKeyPress={(e) => preventInvalidInput(e, 'alpha')}
                      />
                      {errors.service && (
                        <p className="errorMsg">
                          {errors.service.message ||
                            "Product Service is Required"}
                        </p>
                      )}
                    </div>
                    {errorMessage && (
                      <div className="alert alert-danger mt-4 text-center">
                        {errorMessage}
                      </div>
                    )}
                    <div
                      className="col-12 mt-4  d-flex justify-content-end"
                      style={{ background: "none" }}
                    >
                      {!isUpdating ? (
                        <button
                          className="btn btn-secondary me-2"
                          type="button"
                          onClick={clearForm}
                        >
                          Clear
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary me-2"
                          type="button"
                          onClick={backForm}
                        >
                          Back
                        </button>
                      )}

                      <button
                        className={
                          isUpdating
                            ? "btn btn-danger bt-lg"
                            : "btn btn-primary btn-lg"
                        }
                        style={{ marginRight: "85px" }}
                        type="submit"
                      >
                        {isUpdating ? "Update Product" : "Add Product"}{" "}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default ProductRegistration;
