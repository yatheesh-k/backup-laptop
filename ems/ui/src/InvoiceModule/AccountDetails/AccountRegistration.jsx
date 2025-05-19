import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import Select from "react-select";
import { BankGetApiById, BankPostApi, BankPutApiById } from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";

const AccountRegistartion = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    trigger,
    setValue,
    reset,
  } = useForm();

  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const companyId = user.companyId;
  console.log("companyId from accounts registartion", companyId);
  const [passwordShown, setPasswordShown] = useState(false);
  const [update, setUpdate] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [accountDetails, setAccountDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const existingAccountTypeValue = isUpdating
    ? accountDetails?.accountType
    : "";

  const onSubmit = (data) => {
    if (location && location.state && location.state.bankId) {
      // If updating, build the update payload with only the required fields
      const updatePayload = {
        branch: data.branch,
        ifscCode: data.ifscCode,
        address: data.address,
        accountType: data.accountType.value, // Extract the value from the accountType object
      };

      console.log("Update Payload:", updatePayload);

      BankPutApiById(companyId, location.state.bankId, updatePayload)
        .then((res) => {
          const successMessage =
            res.data.message || "Bank Account updated successfully";
          setUpdate(res.data.data);
          setTimeout(() => {
            toast.success(successMessage);
            navigate("/accountsView");
          }, 1000); // 2-second delay
          })
        .catch((error) => {
          console.error("Error updating bank:", error);
          const errorMsg =
            error.response?.data?.error?.message ||
            error.message ||
            "Error updating bank";
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 1000,
          });
        });
    } else {
      // If creating a new bank account, build the full payload
      const createPayload = {
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        branch: data.branch,
        ifscCode: data.ifscCode,
        address: data.address,
        accountType: data.accountType.value, // Extract the value of the accountType object
      };

      console.log("Create Payload:", createPayload);

      BankPostApi(companyId, createPayload)
        .then((response) => {
          setUpdate((prevState) => [...prevState, response.data.data]);
          setTimeout(() => {
            toast.success("Bank Account added successfully");
            navigate("/accountsView");
          }, 1000); // 2-second delay    
          })
        .catch((error) => {
          console.error("Error adding bank account:", error);
          const errorMessage =
            error.response?.data?.error?.message || "Error adding bank details";
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 1000,
          });
        });
    }
  };

  useEffect(() => {
    console.log("Location state:", location.state);
    console.log("companyId:", companyId);

    if (location && location.state && location.state.bankId) {
      const bankId = location.state.bankId;
      console.log("bankId:", bankId);

      BankGetApiById(companyId, bankId)
        .then((response) => {
          console.log("bank data:", response);

          // Assuming the response.data is the correct object to reset the form with
          const bankData = {
            ...response.data,
            // If the response contains accountType as a string (e.g. 'checking' or 'savings')
            accountType: {
              value: response.data.accountType,
              label: response.data.accountType,
            }, // Formatting for Select dropdown
          };

          // Reset the form with the correctly formatted data
          reset(bankData);
          setIsUpdating(true);
        })
        .catch((error) => {
          console.error("Error fetching data:", error.response || error);
          if (error.response) {
            console.error("API Error Response:", error.response.data);
          }
          toast.error("Error fetching Bank data.");
        });
    }
  }, [location.state?.bankId, companyId, reset]);

  const validateField = (value, type) => {
    switch (type) {
      case "ifscCode":
        return (
         /^[A-Z]{4}0[0-9]{6}$/.test(value) ||
          "Invalid IFSC Code format."
        );
      default:
        return true;
    }
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

    // Numeric check for fields that should only allow numbers
    if (type === "numeric" && !/^[0-9]$/.test(key)) {
      e.preventDefault();
    }
  };

  const validateLocation = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();
    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Location is Required.";
    }
    // Check for trailing spaces first
    if (/\s$/.test(value)) {
      return "Spaces at the end are not allowed."; // Trailing space error
    } else if (/^\s/.test(value)) {
      return "No Leading Space Allowed."; // Leading space error
    }
    // Ensure only allowed characters (alphabets, numbers, spaces, and some special chars)
    else if (!/^[a-zA-Z0-9\s!-_@#&()*/,.\\-{}]+$/.test(trimmedValue)) {
      return "Invalid Format of Location.";
    }

    // Check for minimum and maximum word length
    else {
      const words = trimmedValue.split(" ");
      for (const word of words) {
        if (word.length < 1) {
          return "Minimum Length 1 Character Required."; // If any word is shorter than 1 character
        } else if (word.length > 100) {
          return "Max Length 100 Characters Required."; // If any word is longer than 100 characters
        }
      }

      // Check if there are multiple spaces between words
      if (/\s{2,}/.test(trimmedValue)) {
        return "No Multiple Spaces Between Words Allowed.";
      }
       if (trimmedValue.length < 3) {
        return "Minimum 3 Characters Required.";
      }
    }

    return true; // Return true if all conditions are satisfied
  };

  const noTrailingSpaces = (value, fieldName) => {
    // Check if the value ends with a space
    if (value.endsWith(" ")) {
      return "Spaces are not allowed at the end";
    }

    // Check if the value is less than 3 characters long
    if (value.length < 3) {
      return `${fieldName} must be at least 3 characters long`;
    }

    // If no error, return true
    return true;
  };

  const handleInputChange = (e, fieldName) => {
    // Get the input value, trim leading spaces and replace multiple spaces with a single space
    let value = e.target.value.trimStart().replace(/ {2,}/g, " ");

    // Capitalize the first letter of each word
    value = value.replace(/\b\w/g, (char) => char.toUpperCase());

    // Update the field value and trigger validation
    setValue(fieldName, value);
    trigger(fieldName); // Trigger validation
  };

  const clearForm = () => {
    reset();
  };

  const backForm = () => {
    reset();
    navigate("/accountsView");
  };
  const accountTypes = [
    { value: "Savings", label: "Savings" },
    { value: "Current", label: "Current" },
    { value: "NRI", label: "NRI" },
    { value: "Demat", label: "Demat" },
    { value: "Corporate", label: "Corporate" },
    { value:"Business",label:"Business"}
  ];

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
                <li className="breadcrumb-item active">Settings</li>
                <li className="breadcrumb-item">
                  <a href="/accountsView">Bank Details</a>
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
                  {isUpdating ? "Bank Account View" : "Bank Account Registration"}
                </h5>
                <div
                  className="dropdown-divider"
                  style={{ borderTopColor: "#d7d9dd" }}
                />
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Bank Account Number<span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Bank Account Number"
                        name="accountNumber"
                        autoComplete="off"
                        {...register("accountNumber", {
                          required: "Bank Account Number is Required",
                          minLength: {
                            value: 9,
                            message:
                              "Bank Account Number must be at least 9 characters long",
                          },
                          maxLength: {
                            value: 18,
                            message:
                              "Bank Account Number must be at most 18 characters long",
                          },
                        })}
                        onChange={(e) => handleInputChange(e, "accountNumber")}
                        onKeyPress={(e) => preventInvalidInput(e, "numeric")}
                        readOnly={isUpdating}
                      />
                      {errors.accountNumber && (
                        <p className="errorMsg">
                          {errors.accountNumber.message}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Bank Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Bank Name"
                        name="bankName"
                        autoComplete="off"
                        {...register("bankName", {
                          required: "Bank Name is Required",
                          validate: (value) =>
                            noTrailingSpaces(value, "bankName"),
                          maxLength: {
                            value: 60,
                            message: "Bank Name must not exceed 60 characters.",
                          },
                        })}
                        onChange={(e) => handleInputChange(e, "bankName")}
                        onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                        readOnly={isUpdating}
                      />
                      {errors.bankName && (
                        <p className="errorMsg">{errors.bankName.message}</p>
                      )}
                    </div>
                    {/* Branch Name Field */}
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Branch Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Branch Name"
                        name="branch"
                        autoComplete="off"
                        {...register("branch", {
                          required: "Branch Name is Required",
                          validate: (value) =>
                            noTrailingSpaces(value, "branch"),
                          maxLength: {
                            value: 60,
                            message:
                              "Branch Name must not exceed 60 characters.",
                          },
                        })}
                        onChange={(e) => handleInputChange(e, "branch")}
                        onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                      />
                      {errors.branch && (
                        <p className="errorMsg">{errors.branch.message}</p>
                      )}
                    </div>

                    {/* IFSC Code Field */}
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        IFSC Code <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter IFSC Code"
                        name="ifscCode"
                        autoComplete="off"
                        {...register("ifscCode", {
                          required: "IFSC Code is Required",
                          maxLength: {
                            value: 11,
                            message: "IFSC Code must be 11 characters long",
                          },
                          validate: (value) => validateField(value, "ifscCode"),
                        })}
                        onChange={(e) => handleInputChange(e, "ifscCode")}
                        onKeyPress={(e) =>
                          preventInvalidInput(e, "alphaNumeric")
                        }
                        onInput={(e) => {
                          e.target.value = e.target.value.toUpperCase(); // Convert to uppercase
                        }}
                      />
                      {errors.ifscCode && (
                        <p className="errorMsg">{errors.ifscCode.message}</p>
                      )}
                    </div>

                    {/* Account Type Field */}
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Account Type <span style={{ color: "red" }}>*</span>
                      </label>
                      <Controller
                        name="accountType"
                        control={control}
                        rules={{ required: "Account Type is Required" }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={accountTypes}
                            getOptionLabel={(e) => e.label}
                            getOptionValue={(e) => e.value}
                            onChange={(selectedOption) =>
                              field.onChange(selectedOption)
                            }
                            placeholder="Select Account Type"
                          />
                        )}
                      />
                      {errors.accountType && (
                        <p className="errorMsg">{errors.accountType.message}</p>
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
                          validate: validateLocation,
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
                        <p className="errorMsg">{errors.address.message}</p>
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
                        {isUpdating ? "Update Bank Details" : "Add Bank Details"}{" "}
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
export default AccountRegistartion;
