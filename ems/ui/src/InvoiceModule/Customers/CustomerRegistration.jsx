import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import {
  CustomerGetApiById,
  CustomerPostApi,
  CustomerPutApiById,
} from "../../Utils/Axios";
import Select from "react-select";
import { useAuth } from "../../Context/AuthContext";

const CustomersRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const companyId = user.companyId
  console.log("company Id from Customer registration", companyId);
  const location = useLocation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [update, setUpdate] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    control,
    trigger,
    setValue,
    formState: { errors },
  } = useForm({mode:"onChange"});
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  const onSubmit = (data) => {
    if (location && location.state && location.state.customerId) {
      // Build the update payload with only the specified fields
      const updatePayload = {
        address: data.address,
        state: data.state,
        city: data.city,
        pinCode: data.pinCode,
        status: data.status.value, // Assuming status is a select option object
        customerGstNo: data.customerGstNo,
        stateCode: data.stateCode,
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

  useEffect(() => {
    console.log("Location state:", location.state);
    console.log("companyId:", companyId);
    if (location && location.state && location.state.customerId) {
      const customerId = location.state.customerId;
      CustomerGetApiById(companyId, customerId)
        .then((response) => {
          const customerData = {
            ...response,
            status: { value: response.status, label: response.status }
          };
          reset(customerData);
          setIsUpdating(true);
        })
        .catch((error) => {
          console.error("Error fetching data:", error.response || error);
          if (error.response) {
            console.error("API Error Response:", error.response.data);
          }
          toast.error("Error fetching customer data.");
        });
    }
  }, [location.state?.customerId, reset]);

  const handleEmailChange = (e) => {
    // Get the current value of the input field
    const value = e.target.value;
    // Check if the value is empty
    if (value.trim() !== "") {
      return; // Allow space button
    }
    // Prevent space character entry if the value is empty
    if (e.keyCode === 32) {
      e.preventDefault();
    }
  };

  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position

    // Remove leading spaces
    value = value.replace(/^\s+/g, "");

    // Ensure only allowed characters (alphabets, numbers, and some special chars)
    const allowedCharsRegex = /^[a-zA-Z\s]+$/;
    value = value
      .split("")
      .filter((char) => allowedCharsRegex.test(char))
      .join("");

    // Capitalize the first letter of each word
    const words = value.split(" ");

    // Capitalize the first letter of each word and leave the rest of the characters as they are
    const capitalizedWords = words.map((word) => {
      if (word.length > 0) {
        // Capitalize the first letter, keep the rest as is
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return "";
    });

    // Join the words back into a string
    let formattedValue = capitalizedWords.join(" ");

    // Remove spaces not allowed (before the first two characters)
    if (formattedValue.length > 1) {
      formattedValue =
        formattedValue.slice(0, 1) +
        formattedValue.slice(1).replace(/\s+/g, " ");
    }

    // Update input value
    input.value = formattedValue;

    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
  };
  // Function to handle input formatting
  function handlePhoneNumberChange(event) {
    let value = event.target.value;

    // Ensure the value starts with +91 and one space
    if (value.startsWith("+91") && value.charAt(3) !== " ") {
      value = "+91 " + value.slice(3); // Ensure one space after +91
    }

    // Allow only numeric characters after +91 and the space
    const numericValue = value.slice(4).replace(/[^0-9]/g, ""); // Remove any non-numeric characters after +91
    if (numericValue.length <= 10) {
      value = "+91 " + numericValue; // Keep the +91 with a space
    }

    // Limit the total length to 14 characters (including +91 space)
    if (value.length > 14) {
      value = value.slice(0, 14); // Truncate if the length exceeds 14 characters
    }

    // Update the input field's value
    event.target.value = value;
  }

  const validateField = (value, type) => {
    switch (type) {
      case "customerName":
        return(
          /^[a-zA-Z\s.,]+$/.test(value)||
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
        return /^\d{6}$/.test(value) || "Zip Code must be exactly 6 digits";

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
      return(
        /^[a-zA-Z0-9\s!-_@#&()*/,.\\-{}]+$/.test(value)||
        "Invalid Address Format Special Characters should allow !-_@#&()*,. "
      )
      default:
        return true;
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
    if (type === "address" && !/[a-zA-Z0-9\s&,-\/]/.test(key)) {
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
                  <a href="/main">Home</a>
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
                        disabled={isUpdating}
                        {...register("customerName", {
                          required: "Client Name is Required",
                          validate: (value) => validateField(value, "customerName"),
                          maxLength: {
                            value: 60,
                            message:
                              "Client Name must not exceed 60 characters.",
                          },
                          minLength: {
                            value: 3,
                            message:
                              "Minimum 3 Characters Required.",
                          },
                        })}
                        onChange={(e) => handleInputChange(e, "customerName")}
                        // onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                        readOnly={isUpdating}
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
                        disabled={isUpdating}
                        {...register("email", {
                          required: "Email Id is Required",
                          validate: (value) => validateField(value, "email"),
                        })}
                        onChange={(e) => handleInputChange(e, "email")}
                        onKeyPress={(e) => preventInvalidInput(e, "whitespace")}
                        readOnly={isUpdating}
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
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Personal Mobile Number"
                        autoComplete="off"
                        disabled={isUpdating}
                        maxLength={14} // Limit input to 14 characters (3 for +91, 1 for space, 10 for digits)
                        defaultValue="+91 " // Set the initial value to +91 with a space
                        onInput={handlePhoneNumberChange} // Handle input changes
                        {...register("mobileNumber", {
                          required: "Mobile Number is Required",
                          validate: {
                            startsWithPlus91: (value) => {
                              if (!value.startsWith("+91 ")) {
                                return "Mobile Number must start with +91.";
                              }
                              return true;
                            },
                            correctLength: (value) => {
                              if (value.length !== 14) {
                                return "Mobile Number must be 10 digits.";
                              }
                              return true;
                            },
                           notRepeatingDigits: (value) => {
          // Extract only numeric digits
          const numericValue = value.replace(/\D/g, ""); // Remove non-numeric characters
          const repeatingPattern = /(\d)\1{7,}/; // Matches any digit repeated 8 or more times
          return (
            !repeatingPattern.test(numericValue) ||
            "Mobile Number cannot have the same digit repeated 8 or more times."
          );
        },
      },
                          pattern: {
                            value: /^\+91\s[6-9]\d{9}$/, // Ensure it starts with +91, followed by a space, and then 6-9 and 9 more digits
                            message: "Mobile Number must be 10 digits.",
                          },
                        })}
                        readOnly={isUpdating}
                      />
                      {errors.mobileNumber && (
                        <p className="errorMsg">
                          {errors.mobileNumber.message}
                        </p>
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
                        autoComplete="off"
                        {...register("stateCode", {
                         // required: "State Code is Required",
                          validate: (value) =>
                            !value || validateField(value, "stateCode"), // Validate only if the field is not empty
                          minLength: {
                            value: 2,
                            message: "State Code must be exactly 2 digits.",
                          },
                          maxLength: {
                            value: 2,
                            message: "State Code must not exceed 2 digits.",
                          },
                        })}
                        onChange={(e) => handleInputChange(e, "stateCode")}
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
                          pattern: {
                            value: /^(?=.*[a-zA-Z])[a-zA-Z0-9\s!@#&()*/.,_+:;-]+$/,
                            message:
                              "Invalid Address Format. Only letters, numbers, spaces, and !@#&()*/.,_- are allowed.",
                          },
                          maxLength: {
                            value: 250,
                            message:
                              "Address must be at most 250 characters long",
                          },
                        })}
                        //onChange={(e) => handleInputChange(e, "address")}
                        //onKeyPress={(e) => preventInvalidInput(e, "address")}
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
