import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import {
  CustomerGetApiById,
  CustomerPostApi,
  CustomerPutApiById,
  DialCodesListApi
} from "../../Utils/Axios";
import Select from "react-select";
import { useAuth } from "../../Context/AuthContext";

const CustomersRegistration = () => {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const companyId = employee?.companyId
  console.log("company Id from Customer registration", companyId);
  const location = useLocation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [update, setUpdate] = useState([]);
  const [isCountryCodesLoading, setIsCountryCodesLoading] = useState(true);
  const [countryCodes, setCountryCodes] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const defaultOption = {
      value: "+91",
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src="https://flagcdn.com/w40/in.png" alt="India Flag" width="20" height="15" />
          India (+91)
        </div>
      ),
      labelText: "India (+91)", // Ensuring it works with search
    };

    return defaultOption;
  });
  const {
    register,
    handleSubmit,
    reset,
    control,
    trigger,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  useEffect(() => {
    const fetchCountryCodes = async () => {
      setIsCountryCodesLoading(true); // Start loading
      try {
        const response = await DialCodesListApi();
        const options = (response.data.data || []).map((country) => ({
          value: country.dialCode,
          label: (
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={country.flag}
                alt={country.name}
                style={{ width: "20px", height: "15px", marginRight: "8px" }}
              />
              {`${country.name} (${country.dialCode})`}
            </div>
          ),
          labelText: `${country.name} (${country.dialCode})`,
        }));
        setCountryCodes(options);
      } catch (error) {
        console.error("Failed to fetch country codes:", error.message);
        toast.error("Failed to load country codes.");
      } finally {
        setIsCountryCodesLoading(false); // End loading
      }
    };

    fetchCountryCodes();
  }, []);

  useEffect(() => {
    if (location.state?.customerId && countryCodes.length > 0) {
      const customerId = location.state.customerId;
      CustomerGetApiById(companyId, customerId)
        .then((response) => {
          const fullMobileNumber = response.mobileNumber || "";

          // Handle different mobile formats safely
          let dialCode = "+91";
          let mobileNumberOnly = "";

          if (fullMobileNumber.includes(" ")) {
            const parts = fullMobileNumber.split(" ");
            dialCode = parts[0];
            mobileNumberOnly = parts.slice(1).join(" ").replace(/\D/g, "");
          } else {
            dialCode = countryCodes.find((c) => fullMobileNumber.startsWith(c.value))?.value || "+91";
            mobileNumberOnly = fullMobileNumber.replace(dialCode, "").replace(/\D/g, "");
          }

          const matchingOption = countryCodes.find(
            (option) => option.value === dialCode
          );

          const customerData = {
            ...response,
            mobileNumber: mobileNumberOnly, // Only mobile number
            status: { value: response.status, label: response.status },
          };

          reset(customerData);

          setSelectedCountry(
            matchingOption || {
              value: "+91",
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img
                    src="https://flagcdn.com/w40/in.png"
                    alt="India Flag"
                    width="20"
                    height="15"
                  />
                  India (+91)
                </div>
              ),
            }
          );

          setIsUpdating(true);
        })
        .catch((error) => {
          console.error("Error fetching customer data:", error);
          toast.error("Failed to fetch customer data.");
        });
    }
  }, [companyId, location.state, reset, countryCodes]);


  const handleCountryCodeChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setValue("mobileNumber", ""); // Reset mobile number field when country changes
    trigger("mobileNumber"); // Trigger validation
  };


  const onSubmit = (data) => {
    const formattedMobileNumber = `${selectedCountry.value}${data.mobileNumber.replace(/\D/g, "")}`;
    if (location && location.state && location.state.customerId) {
      // Build the update payload with only the specified fields
      const updatePayload = {
        address: data.address,
        state: data.state,
        city: data.city,
        pinCode: data.pinCode,
        mobileNumber: formattedMobileNumber,
        status: data.status.value, // Assuming status is a select option object
        customerGstNo: data.customerGstNo,
        stateCode: data.stateCode,
        email: data.email,
        customerName: data.customerName
      };

      console.log("Update Payload:", updatePayload);

      CustomerPutApiById(companyId, location.state.customerId, updatePayload)
        .then((res) => {
          const successMessage =
            res.data.message || "Client updated successfully";

          setUpdate(res.data.data);
          setTimeout(() => {
            toast.success(successMessage);
            navigate("/customersView");
          }, 1000); // 2-second delay  
        })
        .catch((error) => {
          console.error("Error updating Client:", error);
          const errorMsg =
            error.response?.data?.error?.message ||
            error.message ||
            "Error updating Client";
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 1000,
          });
        });
    } else {
      // Build the full payload for creating a new customer
      const createPayload = {
        ...data,
        mobileNumber: formattedMobileNumber,
        status: data.status.value,
      };

      console.log("Create Payload:", createPayload);

      CustomerPostApi(companyId, createPayload)
        .then((response) => {
          setTimeout(() => {
            toast.success("Client added successfully");
            navigate("/customersView");
          }, 1000); // 2-second delay  
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.error?.message || "Error adding Client";
          console.error("API Error:", errorMessage);
          toast.error(errorMessage);
        });
    }
  };

  const mobileValidationRules = {
    "+91": /^[6-9]\d{9}$/, // India: 10-digit number, starts with 6-9
    "+1": /^\d{10}$/, // USA: 10-digit number
    "+44": /^\d{10,11}$/, // UK: 10 or 11-digit number
    "+81": /^\d{10,11}$/, // Japan: 10 or 11-digit number
    "+971": /^\d{9}$/, // UAE: 9-digit number
  };

  const validateMobileNumber = (value) => {
    const numericValue = value.replace(/\D/g, ""); // Remove non-numeric characters
    const regex = mobileValidationRules[selectedCountry.value] || /^\d{7,15}$/; // Default fallback
    return regex.test(numericValue) || "Invalid mobile number format for selected country";
  };

  const validateField = (value, type) => {
    switch (type) {
      case "customerName":
        return (
          /^[a-zA-Z\s.,]+$/.test(value) ||
          "Invalid Client Name Format"
        );
      case "email":
        const emailRegex =
          /^(?![0-9]+@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/;
        if (/[A-Z]/.test(value))
          return "Email cannot contain uppercase letters"; // Ensure no uppercase letters in email
        return emailRegex.test(value) || "Invalid Email format";

      case "mobile":
        return (
          /^[6-9][0-9]{9}$/.test(value) ||
          "Mobile Number must start with 6-9 and be exactly 10 digits long"
        );

      case "pincode":
        return /^\d{5,8}$/.test(value) || "Zip Code must be between 5 and 8 digits";

      case "gst":
        return (
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9][Z][A-Z0-9]$/.test(value) ||
          "Invalid GST Number format. It should be in the format: 22AAAAA0000A1Z5."
        );

      case "stateCode":
        return (
          /^[0-9]{1,2}$/.test(value) ||
          "State Code must be a numeric value (1-2 digits)"
        );
      case "address":
        return (
          /^[a-zA-Z0-9\s!-_@#&()*/,.\\-{}]+$/.test(value) ||
          "Invalid Address Format Special Characters should allow !-_@#&()*,. "
        )
      default:
        return true;
    }
  };

  const handleStateCodeChange = (e) => {
    const stateCodeValue = e.target.value.trim();
    const gstNumber = getValues("customerGstNo"); // Get current GST number
    const expectedStateCode = gstNumber.slice(0, 2); // Extract first two characters

    if (stateCodeValue !== expectedStateCode) {
      setError("stateCode", {
        type: "manual",
        message: "State Code must match the first two characters of the GST Number."
      });
    } else {
      clearErrors("stateCode"); // Clear errors if valid
    }
  };

  const noTrailingSpaces = (value, fieldName) => {
    // Check if the value ends with a space
    if (value.endsWith(' ')) {
      return "Spaces are not allowed at the end";
    }

    // Check if the value is less than 3 characters long
    if (value.length < 3) {
      return "Minimum 3 characters Required";
    }
    // If no error, return true
    return true;
  };

  const preventInvalidInput = (e, type) => {
    const key = e.key;

    // Alphanumeric check for customerName, state, city fields (no special characters allowed except spaces)
    if (type === "alpha" && /[^a-zA-Z\s]/.test(key)) {
      e.preventDefault();
    }

    if (type === "alphaNumeric" && /[^a-zA-Z0-9]/.test(key)) {
      e.preventDefault();
    }

    // Address-specific special characters: only allow &, /, and ,
    if (type === "address" && !/[a-zA-Z0-9\s!@#&()*/.,_+:;'"-]/.test(key)) {
      e.preventDefault();
    }
    // Numeric check for fields that should only allow numbers
    if (type === "numeric" && !/^[0-9]$/.test(key)) {
      e.preventDefault();
    }

    // Prevent spaces (if any additional validation is needed)
    if (type === "whitespace" && key === " ") {
      e.preventDefault();
    }
  };

  // Capitalize the first letter of each word expect email
  const handleInputChange = (e, fieldName) => {
    let value = e.target.value.trimStart().replace(/ {2,}/g, " "); // Remove leading spaces and extra spaces

    if (fieldName !== "email") {
      value = value.replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter after space
    }

    setValue(fieldName, value);
    trigger(fieldName); // Trigger validation
  };

  const clientStatus = [
    { value: "Active", label: "Active" },
    { value: "InActive", label: "InActive" },
  ];

  const clearForm = () => {
    reset();
  };
  const backForm = () => {
    reset();
    navigate("/customersView");
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Client Registration</strong>{" "}
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Clients</li>
                <li className="breadcrumb-item active">Client Registration</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title" style={{ marginBottom: "0px" }}>
                  {isUpdating ? "Client Data" : "Client Registration Form"}
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
                        Client Name<span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Client Name"
                        name="customerName"
                        autoComplete="off"
                        {...register("customerName", {
                          required: "Client Name is Required",
                          validate: (value) => noTrailingSpaces(value, "customerName"),
                          maxLength: {
                            value: 60,
                            message:
                              "Client Name must not exceed 60 characters.",
                          },
                        })}
                        onChange={(e) => handleInputChange(e, "customerName")}
                        onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                      />
                      {errors.customerName && (
                        <p className="errorMsg">
                          {errors.customerName.message}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Email Id <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Email Id"
                        name="email"
                        autoComplete="off"
                        {...register("email", {
                          required: "Email Id is Required",
                          validate: (value) => validateField(value, "email"),
                        })}
                        onChange={(e) => handleInputChange(e, "email")}
                        onKeyPress={(e) => preventInvalidInput(e, "whitespace")}
                      />
                      {errors.email && (
                        <p className="errorMsg">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Mobile Number <span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="input-group">
                        {/* Country Code Dropdown */}

                        <div className="input-group-prepend">
                          {isCountryCodesLoading ? (
                            <div className="d-flex align-items-center" style={{ width: "160px", height: "38px", justifyContent: "center" }}>
                              <div className="spinner-border text-primary" role="status" style={{ width: "1.5rem", height: "1.5rem" }}>
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>
                          ) : (
                            <Select
                              options={countryCodes}
                              value={selectedCountry}
                              onChange={handleCountryCodeChange}
                              placeholder="Code"
                              className="react-select-container"
                              classNamePrefix="react-select"
                              isSearchable
                              menuPortalTarget={document.body}
                              getOptionLabel={(option) => option.labelText} // Ensures filtering by text
                              getOptionValue={(option) => option.value} // Keeps correct values
                              formatOptionLabel={(option) => option.label} // Restores flag display
                              styles={{
                                control: (base) => ({ ...base, width: "160px" }),
                                menu: (base) => ({ ...base, width: "280px" }),
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                              }}
                            />
                          )}
                        </div>

                        {/* Mobile Number Input Field */}
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="Enter Mobile Number"
                          autoComplete="off"
                          {...register("mobileNumber", {
                            required: "Mobile Number is Required",
                            validate: validateMobileNumber,
                          })}
                          onKeyPress={(e) => preventInvalidInput(e, "numeric")}
                        />
                      </div>
                      {errors.mobileNumber && (
                        <p className="errorMsg">{errors.mobileNumber.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        State <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        placeholder="Enter State Name"
                        className="form-control"
                        autoComplete="off"
                        {...register("state", {
                          required: "State Name is Required.",
                          validate: (value) => noTrailingSpaces(value, "state"),
                          maxLength: {
                            value: 60,
                            message: "State Name must not be exceed 60 Characters.",
                          },
                        })}
                        onChange={(e) => handleInputChange(e, "state")}
                        onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                      />
                      {errors.state && (
                        <p className="errorMsg">
                          {errors.state.message || "State Name is Required"}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        City <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        placeholder="Enter City Name"
                        className="form-control"
                        autoComplete="off"
                        {...register("city", {
                          required: "City Name is Required.",
                          validate: (value) => noTrailingSpaces(value, "city"),
                          maxLength: {
                            value: 60,
                            message: "City Name must not exceed 60 Characters.",
                          },
                        })}
                        onChange={(e) => handleInputChange(e, "city")}
                        onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                      />
                      {errors.city && (
                        <p className="errorMsg">
                          {errors.city.message || "City Name is Required"}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Zip Code <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        // readOnly={isUpdating}
                        name="pinCode"
                        placeholder="Enter Pin Code"
                        className="form-control"
                        autoComplete="off"
                        {...register("pinCode", {
                          required: "Zip Code is Required.",
                          validate: (value) => validateField(value, "pincode"),
                        })}
                        onChange={(e) => handleInputChange(e, "pinCode")}
                        onKeyPress={(e) => preventInvalidInput(e, "numeric")}
                      />
                      {errors.pinCode && (
                        <p className="errorMsg">
                          {errors.pinCode.message || "Pin Code is Required"}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        GST Number <span style={{ color: "red" }}></span>
                      </label>
                      <input
                        type="text"
                        name="gstNo"
                        placeholder="Enter Gst Number"
                        className="form-control"
                        autoComplete="off"
                        {...register("customerGstNo", {
                          validate: (value) =>
                            !value || validateField(value, "gst"), // Validate only if the field is not empty
                          maxLength: {
                            value: 15,
                            message: "GST Number should be 15 characters long",
                          },
                        })}
                        onChange={(e) => handleInputChange(e, "customerGstNo")}
                        onKeyPress={(e) =>
                          preventInvalidInput(e, "alphaNumeric")
                        }
                        onInput={(e) => {
                          e.target.value = e.target.value.toUpperCase(); // Convert to uppercase
                        }}
                      />
                      {errors.customerGstNo && (
                        <p className="errorMsg">
                          {errors.customerGstNo.message || "Gst Number is Required"}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        State Code <span style={{ color: "red" }}></span>
                      </label>
                      <input
                        type="text"
                        name="stateCode"
                        placeholder="Enter State Code"
                        className="form-control"
                        {...register("stateCode", {
                          validate: (value) => {
                            const gstNumber = getValues("customerGstNo");
                            return !gstNumber || value === gstNumber.slice(0, 2)
                              ? true
                              : "State Code must match the first two characters of GST Number.";
                          }
                        })}
                        onChange={(e) => {
                          handleStateCodeChange(e);
                          handleInputChange(e, "stateCode");
                        }}
                        onKeyPress={(e) => preventInvalidInput(e, "numeric")}
                      />
                      {errors.stateCode && (
                        <p className="errorMsg">
                          {errors.stateCode.message || "State Code is Required"}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Status <span style={{ color: "red" }}>*</span>
                      </label>
                      <Controller
                        name="status"
                        control={control}
                        rules={{ required: "Status is required" }} // Ensure required validation is applied
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={clientStatus}
                            getOptionLabel={(e) => e.label}
                            getOptionValue={(e) => e.value}
                            onChange={(selectedOption) =>
                              field.onChange(selectedOption)
                            } // Ensure onChange is handled
                          />
                        )}
                      />
                      {errors.status && (
                        <p className="errorMsg">
                          {errors.status.message || "Status is required"}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Address <span style={{ color: "red" }}>*</span>
                      </label>
                      <textarea
                        name="address"
                        placeholder="Enter Address"
                        className="form-control"
                        autoComplete="off"
                        rows="4"
                        {...register("address", {
                          required: "Address is Required",
                          validate: (value) => noTrailingSpaces(value, "address"),
                          pattern: {
                            value: /^(?=.*[a-zA-Z])[a-zA-Z0-9\s!@#&()*/.,_+:;'"-]+$/,
                            message: "Invalid Address Format. Only letters, numbers, spaces, and !@#&()*/.,_- \" ' : ; are allowed."
                          },
                          maxLength: {
                            value: 250,
                            message:
                              "Address must be at most 250 characters long",
                          },
                        })}
                        onChange={(e) => handleInputChange(e, "address")}
                        onKeyPress={(e) => preventInvalidInput(e, "address")}
                      />
                      {errors.address && (
                        <p className="errorMsg">
                          {errors.address.message || "Address is Required"}
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
                        {isUpdating ? "Update Client" : "Add Client"}{" "}
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

export default CustomersRegistration;
