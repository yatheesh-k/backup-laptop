import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import LayOut from "../../LayOut/LayOut";
import {
  CompanyRegistrationApi,
  companyUpdateByIdApi,
  companyViewByIdApi,
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const CompanyRegistration = () => {
  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({ mode: "onChange" });
  const [postImage, setPostImage] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [passwordShown, setPasswordShown] = useState("");
  const [editMode, setEditMode] = useState(false); // State to track edit mode
  const [errorMessage, setErrorMessage] = useState("");
  const watchRegistrationNumber = watch("cinNo", "");

  const location = useLocation();
  const navigate = useNavigate();

  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };
  const handlePasswordChange = (e) => {
    setPasswordShown(e.target.value);
  };
  const handleEmailChange = (e) => {
    const value = e.target.value;

    // Prevent space key (keyCode 32) from being entered
    if (e.keyCode === 32) {
      e.preventDefault();
    }

    // If there is any space already entered, prevent re-render with spaces
    if (value.includes(" ")) {
      e.preventDefault();
    }
  };

  const handleCompanyTypeChange = (e) => {
    setCompanyType(e.target.value);
  };

  const onSubmit = async (data) => {
    try {
      const updateData = {
        companyAddress: data.companyAddress,
        mobileNo: data.mobileNo,
        alternateNo: data.alternateNo,
        name: data.name,
        personalMailId: data.personalMailId,
        personalMobileNo: data.personalMobileNo,
        companyBranch: data.address,
        address: data.address,
        companyType: data.companyType,
      };

      // Conditionally add CIN number or Company Registration Number
      if (data.companyType === "Private Limited") {
        updateData.cinNumber = data.cinNumber;
      } else if (data.companyType === "Firm") {
        updateData.companyRegistrationNumber = data.companyRegistrationNumber;
      }
      if (location.state && location.state.id) {
        // Update existing company
        await companyUpdateByIdApi(location.state.id, updateData);
        toast.success("Company Updated Successfully");
      } else {
        // Create new company
        await CompanyRegistrationApi(data);
        toast.success("Company Created Successfully");
      }

      navigate("/companyView");
      reset();
    } catch (error) {
      console.log("Entered catch block"); // Add this line
      console.log("Full error object:", error);
      let errorList = [];

      // Check if error response exists
      if (error.response) {
        // Case 1: General error message
        if (error.response.data.error && error.response.data.error.message) {
          const generalErrorMessage = error.response.data.error.message;
          // toast.error("Invalid Format");  // Display general error message
          errorList.push(generalErrorMessage);
        }

        // Case 2: Specific error messages (multiple messages, such as form validation errors)
        if (error.response.data.error && error.response.data.error.messages) {
          const specificErrorMessages = error.response.data.error.messages;
          // toast.error("Invalid Format Fields");
          specificErrorMessages.forEach((message) => {
            // Display each error message individually
            errorList.push(message);
          });
        }

        // Case 3: Specific error data (duplicate value conflicts)
        if (error.response.data.data) {
          const conflictData = error.response.data.data;
          let conflictMessage = "Error Details:\n";
          toast.error(error.response.data.message);
          // Check if data contains specific conflict details (e.g., duplicate values)
          Object.keys(conflictData).forEach((key) => {
            const value = conflictData[key];
            conflictMessage += `${key}: ${value}\n`;
          });

          // Display detailed conflict message in toast and add to error list
          errorList.push(conflictMessage);
        }

        // Handle HTTP 409 Conflict Error (duplicate or other conflicts)
        if (error.response.status === 409) {
          const conflictMessage =
            error.response.data.message || "A conflict occurred.";
          // toast.error(conflictMessage);  // Show conflict error in toast
        }
      } else {
        // General error (non-Axios)
        console.log("Error without response:", error);
        toast.error("An unexpected error occurred. Please try again later.");
      }

      // Update the error messages in the state
      setErrorMessage(errorList);
    }
  };

  useEffect(() => {
    if (location && location.state && location.state.id) {
      const fetchData = async () => {
        try {
          const response = await companyViewByIdApi(location.state.id);
          console.log(response.data);
          reset(response.data);
          setCompanyType(response.data.companyType);
          setEditMode(true);
        } catch (error) {
          handleApiErrors(error);
        }
      };

      fetchData();
    }
  }, [location.state]);

  const handleApiErrors = (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error &&
      error.response.data.error.message
    ) {
      // toast.error(errorMessage);
    } else {
      // toast.error("Network Error !");
    }
    console.error(error.response);
  };

  const clearForm = () => {
    setCompanyType("");
    reset();
    // setEditMode(true);  // Optionally, if you want to reset edit mode
  };
  const backForm = () => {
    setCompanyType("");
    reset();
    navigate("/companyView")
    // setEditMode(true);  // Optionally, if you want to reset edit mode
  };
  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position

    // Remove leading spaces
    value = value.replace(/^\s+/g, "");

    // Ensure only allowed characters (alphabets, numbers, and some special chars)
    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
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
    if (formattedValue.length > 3) {
      formattedValue =
        formattedValue.slice(0, 3) +
        formattedValue.slice(3).replace(/\s+/g, " ");
    }

    // Update input value
    input.value = formattedValue;

    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  const validatePassword = (value) => {
    const errors = [];
    if (!/(?=.*[0-9])/.test(value)) {
      errors.push("at least one digit");
    }
    if (!/(?=.*[a-z])/.test(value)) {
      errors.push("at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      errors.push("at least one uppercase letter");
    }
    if (!/(?=.*\W)/.test(value)) {
      errors.push("at least one special character");
    }
    if (value.includes(" ")) {
      errors.push("no spaces");
    }

    if (errors.length > 0) {
      return `Password must contain ${errors.join(", ")}.`;
    }
    return true; // Return true if all conditions are satisfied
  };

  const toInputLowerCase = (e) => {
    const input = e.target;
    let value = input.value;

    // Remove all spaces
    value = value.replace(/\s+/g, "");

    // Convert the entire string to lowercase
    value = value.toLowerCase();

    // Update input value
    input.value = value;
  };

  // const toInputEmailCase = (e) => {
  //   const input = e.target;
  //   let value = input.value;

  //   // Remove all spaces from the input
  //   value = value.replace(/\s+/g, '');

  //   // If the first character is not lowercase, make it lowercase
  //   if (value.length > 0 && value[0] !== value[0].toLowerCase()) {
  //     value = value.charAt(0).toLowerCase() + value.slice(1);
  //   }

  //   // Only update the value if it was changed
  //   if (input.value !== value) {
  //     input.value = value;
  //   }
  // };
  const toInputSpaceCase = (e) => {
    let inputValue = e.target.value;
    let newValue = "";

    // Remove spaces from the beginning of inputValue
    inputValue = inputValue.trimStart(); // Keep spaces only after the initial non-space character

    // Track if we've encountered any non-space character yet
    let encounteredNonSpace = false;

    for (let i = 0; i < inputValue.length; i++) {
      const char = inputValue.charAt(i);

      // Allow any alphabetic characters (both lowercase and uppercase) and numbers
      // Allow spaces only after encountering non-space characters
      if (char.match(/[a-zA-Z0-9]/) || (encounteredNonSpace && char === " ")) {
        if (char !== " ") {
          encounteredNonSpace = true;
        }
        newValue += char;
      }
    }

    // Update the input value
    e.target.value = newValue;
  };

  const toInputAddressCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position
  
    // Remove leading spaces but keep trailing spaces
    const leadingTrimmedValue = value.replace(/^\s+/g, "");
  
    // Ensure only alphabets (upper and lower case), numbers, and allowed special characters
    const allowedCharsRegex = /^[a-zA-Z0-9\s!-_@#&()*/,.\\-{}]+$/;
    value = leadingTrimmedValue
      .split("") // Split value into characters
      .filter((char) => allowedCharsRegex.test(char)) // Keep only allowed characters
      .join(""); // Join characters back to a string
  
    // Capitalize the first letter of each word
    const words = value.split(" ");
    const capitalizedWords = words.map((word) => {
      // Capitalize first letter, ensure the rest of the word is lowercase
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  
    // Join the words back into a string with a single space between them
    let formattedValue = capitalizedWords.join(" ");
  
    // Allow spaces at the end if the user typed them (by preserving the original input length)
    if (value.length < leadingTrimmedValue.length) {
      formattedValue = formattedValue + " ".repeat(input.value.length - formattedValue.length);
    }
  
    // Update input value
    input.value = formattedValue;
  
    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
  };
   

  const validateREGISTER = (value) => {
    const spaceError = "Spaces are not allowed in the Register Number.";
    const patternError = "Invalid Register Number format";

    if (/\s/.test(value)) {
      return spaceError; // Return space error if spaces are found
    }

    // Check the pattern for the CIN Number
    if (
      !/^([LU]{1})([0-9]{5})([A-Z]{2})([0-9]{4})([A-Z]{3})([0-9]{6})$/.test(
        value
      )
    ) {
      return patternError; // Return pattern error if it doesn't match
    }

    return true; // Return true if all checks pass
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('Text');
    const sanitizedText = pastedText.replace(/[^A-Za-z0-9]/g, ''); // Keep only alphanumeric characters
    e.preventDefault(); // Prevent the default paste action
    e.target.value = sanitizedText; // Insert the sanitized text back into the input
  };

  const validateCIN = (value) => {
    const spaceError = "Spaces are not allowed in the CIN Number.";
    const patternError = "Invalid CIN Number format";

    if (/\s/.test(value)) {
      return spaceError; // Return space error if spaces are found
    }

    // Check the pattern for the CIN Number
    if (
      !/^([LU]{1})([0-9]{5})([A-Z]{2})([0-9]{4})([A-Z]{3})([0-9]{6})$/.test(
        value
      )
    ) {
      return patternError; // Return pattern error if it doesn't match
    }

    return true; // Return true if all checks pass
  };

  const validateGST = (value) => {
    const spaceError = "Spaces are not allowed in the GST Number.";
    const patternError = "Invalid GST Number format";

    if (!value){
      return true;
    }

    if (/\s/.test(value)) {
      return spaceError; // Return space error if spaces are found
    }

    // Check the pattern for the CIN Number
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9]{1}Z[0-9A-Z]{1}$/.test(value)) {
      return patternError; // Return pattern error if it doesn't match
    }

    return true; // Return true if all checks pass
  };

  const validateName = (value) => {
    // Trim leading and trailing spaces
    const trimmedValue = value.trim();

    // Check for leading or trailing spaces
    if (/^\s/.test(value)) {
      return "Leading space not allowed."; // Leading space error
    } else if (/\s$/.test(value)) {
      return "Spaces at the end are not allowed."; // Trailing space error
    }

    // Check for multiple spaces between words
    if (/\s{2,}/.test(value)) {
      return "No Multiple Spaces Between Words Allowed.";
    }

    // Validate special characters and alphabets (including @, $, &, ())
    const validCharsRegex = /^[A-Za-z\s,.'\-/&@$()]*$/;
    if (!validCharsRegex.test(value)) {
      return "Field accepts only alphabets and special characters: ( , ' - . / & @ $ ( ) )";
    }

    // Check word lengths (min 2 characters for alphabetic words)
    const words = trimmedValue.split(" ");

    for (const word of words) {
      // Allow words that are only special characters (e.g., "-")
      if (/^[\W]+$/.test(word)) {
        continue; // Skip special characters only words
      }

      // If the word contains special characters (e.g., "dsad-@dsad"), it is valid
      // Ensure at least 2 alphabetic characters before any special characters in a word
      if (/^[A-Za-z]+[\W]*[A-Za-z]*$/.test(word)) {
        continue; // Word contains at least 2 alphabetic characters with or without special characters
      }

      // If the word is alphabetic and has less than 2 characters, show error
      if (/^[A-Za-z]+$/.test(word) && word.length < 2) {
        return "Minimum Length 2 Characters Required."; // If any alphabetic word is shorter than 2 characters
      }

      // If the word exceeds 100 characters, show error
      if (word.length > 100) {
        return "Max Length 100 Characters Exceed."; // If any word is longer than 100 characters
      }
    }

    return true; // Return true if all conditions are satisfied
  };

  const validateAddress = (value) => {
    // Check for leading or trailing spaces
    if (/^\s/.test(value)) {
      return "Leading space not allowed."; // Leading space error
    } else if (/\s$/.test(value)) {
      return "Spaces at the end are not allowed."; // Trailing space error
    }
  
    // Check for multiple spaces between words
    if (/\s{2,}/.test(value)) {
      return "No multiple spaces between words allowed."; // Multiple spaces error
    }
  
    // Validate special characters and alphanumeric characters
    const validCharsRegex = /^[A-Za-z0-9\s,.'\-/&@#$()*+!:;]*$/;
    if (!validCharsRegex.test(value)) {
      return "Invalid characters used. Only alphabets, numbers, and special characters (, . ' - / & @ # $ ( ) *) are allowed.";
    }
  
    return true; // Return true if all conditions are satisfied
  };
  
  const validatePAN = (value) => {
    const spaceError = "Spaces are not allowed in the PAN Number.";
    const patternError = "Invalid PAN Number format";

    if (/\s/.test(value)) {
      return spaceError; // Return space error if spaces are found
    }

    // Check the pattern for the CIN Number
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
      return patternError; // Return pattern error if it doesn't match
    }

    return true; // Return true if all checks pass
  };

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
                <li className="breadcrumb-item active">Registration</li>
              </ol>
            </nav>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header ">
                  <div className="d-flex justify-content-start align-items-start">
                    <h5 className="card-title" style={{ marginBottom: "0px" }}>
                      Company Type
                    </h5>
                    <span
                      className="text-danger"
                      style={{ marginLeft: "10px" }}
                    >
                      {errors.companyType && (
                        <p className="mb-0">{errors.companyType.message}</p>
                      )}
                    </span>
                  </div>
                  <hr
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd", width: "100%" }}
                  />
                </div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <div>
                        <label>
                          <input
                            type="radio"
                            name="companyType"
                            value="Private Limited"
                            style={{ marginRight: "10px" }}
                            {...register("companyType", {
                              required: !editMode
                                ? "Please Select Your Company Type"
                                : false,
                            })}
                            disabled={editMode}
                            onChange={handleCompanyTypeChange}
                          />
                          Private Limited
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="ml-3">
                        <input
                          type="radio"
                          name="companyType"
                          value="Firm"
                          style={{ marginRight: "10px" }}
                          {...register("companyType", {
                            required: !editMode
                              ? "Please Select Your Company Type"
                              : false,
                          })}
                          disabled={editMode}
                          onChange={handleCompanyTypeChange}
                        />
                        Firm
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title" style={{ marginBottom: "0px" }}>
                    Company Details
                  </h5>
                  <div
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd" }}
                  />
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Company Name <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Company Name"
                        onInput={toInputTitleCase}
                        autoComplete="off"
                        {...register("companyName", {
                          required: "Company Name is Required",
                          validate: {
                            validateName,
                          },
                          minLength: {
                            value: 2,
                            message: "Minimum 2 Characters Required",
                          },
                          maxLength: {
                            value: 200,
                            message: "Maximum 200 Characters Required",
                          },
                        })}
                        disabled={editMode}
                      />
                      {errors.companyName && (
                        <p className="errorMsg">{errors.companyName.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Service Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        onInput={toInputLowerCase}
                        placeholder="Enter Service Name"
                        autoComplete="off"
                        {...register("shortName", {
                          required: "Service Name is Required",
                          pattern: {
                            value: /^[a-zA-Z]+$/,
                            message:
                              "No Spaces allowed. These fields only accept small cases only.",
                          },
                          minLength: {
                            value: 2,
                            message: "Minimum 2 Characters Required",
                          },
                          maxLength: {
                            value: 30,
                            message:
                              "Minimum 2 and Maximum 30 Characters allowed",
                          },
                        })}
                        disabled={editMode}
                      />
                      {errors.shortName && (
                        <p className="errorMsg">{errors.shortName.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Company Email Id <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter Company Email Id"
                        autoComplete="off"
                        //onInput={toInputEmailCase}
                        onKeyDown={handleEmailChange}
                        onPaste={handlePaste}
                        {...register("emailId", {
                          required: "Company Email Id is Required",
                          pattern: {
                            value:
                          /^[a-z][a-zA-Z0-9._+-]*@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                            message: "Invalid email format",
                          },
                        })}
                        disabled={editMode}
                      />
                      {errors.emailId && (
                        <p className="errorMsg">{errors.emailId.message}</p>
                      )}
                    </div>
                    {editMode ? (
                      <>
                        <div className="col-lg-1"></div>
                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                          <label className="form-label">
                            Mobile Number{" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="Enter Mobile Number"
                            autoComplete="off"
                            maxLength={14} // Limit input to 14 characters (3 for +91, 1 for space, 10 for digits)
                            defaultValue="+91 " // Set the initial value to +91 with a space
                            onInput={handlePhoneNumberChange} // Handle input changes
                            {...register("mobileNo", {
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
                                    return "Mobile Number is Required";
                                  }
                                  return true;
                                },
                                notRepeatingDigits: (value) => {
                                  const isRepeating = /^(\d)\1{12}$/.test(
                                    value
                                  ); // Check for repeating digits
                                  return (
                                    !isRepeating ||
                                    "Mobile Number cannot consist of the same digit repeated."
                                  );
                                },
                              },
                              pattern: {
                                value: /^\+91\s[6-9]\d{9}$/, // Ensure it starts with +91, followed by a space, and then 6-9 and 9 more digits
                                message: "Mobile Number is Required",
                              },
                            })}
                          />
                          {errors.mobileNo && (
                            <p className="errorMsg">
                              {errors.mobileNo.message}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-lg-1"></div>
                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                          <label className="form-label">
                            Password <span style={{ color: "red" }}>*</span>
                          </label>
                          <div className="col-sm-12 password-input-container">
                            <input
                              className="form-control"
                              placeholder="Enter Password"
                              onChange={handlePasswordChange}
                              autoComplete="off"
                              onPaste={handlePaste}
                              onKeyDown={handleEmailChange}
                              type={passwordShown ? "text" : "password"}
                              {...register("password", {
                                required: "Password is Required",
                                validate: validatePassword,
                                minLength: {
                                  value: 6,
                                  message: "Minimum 6 Characters Required",
                                },
                                maxLength: {
                                  value: 16,
                                  message:
                                    "Minimum 6 & Maximum 16 Characters allowed",
                                },
                              })}
                            />
                            {/* Eye Icon to toggle password visibility */}
                            <span
                              className={`bi bi-eye field-icon pb-1 toggle-password ${
                                passwordShown ? "text-primary" : ""
                              }`}
                              onClick={togglePasswordVisiblity}
                              style={{
                                background: "transparent",
                                borderLeft: "none",
                              }}
                            ></span>
                          </div>
                          {errors.password && (
                            <p className="errorMsg">
                              {errors.password.message}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    {!editMode && (
                      <>
                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                          <label className="form-label">
                            Mobile Number{" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="Enter Mobile Number"
                            autoComplete="off"
                            maxLength={14} // Limit input to 15 characters
                            defaultValue="+91 " // Set the initial value to +91 with a space
                            onInput={handlePhoneNumberChange} // Handle input changes
                            // onKeyDown={handlePhoneNumberKeyDown} // Handle keydown for specific actions
                            {...register("mobileNo", {
                              required: "Mobile Number is Required",
                              validate: {
                                startsWithPlus91: (value) => {
                                  if (!value.startsWith("+91 ")) {
                                    return "Mobile Number must start with +91 and a space.";
                                  }
                                  return true;
                                },
                                correctLength: (value) => {
                                  if (value.length !== 14) {
                                    return "Mobile Number is Required";
                                  }
                                  return true;
                                },
                                notRepeatingDigits: (value) => {
                                  const isRepeating = /^(\d)\1{12}$/.test(
                                    value
                                  ); // Check for repeating digits
                                  return (
                                    !isRepeating ||
                                    "Mobile Number cannot consist of the same digit repeated."
                                  );
                                },
                              },
                              pattern: {
                                value: /^\+91\s[6-9]\d{9}$/, // Ensure it starts with +91, followed by a space, and then 6-9 and 9 more digits
                                message: "Mobile Number is Required",
                              },
                            })}
                          />
                          {errors.mobileNo && (
                            <p className="errorMsg">
                              {errors.mobileNo.message}
                            </p>
                          )}
                        </div>

                        <div className="col-lg-1"></div>
                      </>
                    )}
                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                      <label className="form-label">
                        Alternate Number <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Alternate Number"
                        autoComplete="off"
                        maxLength={14}
                        defaultValue="+91 " // Set the initial value to +91 with a space
                        onInput={handlePhoneNumberChange} // Handle input changes
                        // onKeyDown={handlePhoneNumberKeyDown} // Handle keydown for specific actions
                        {...register("alternateNo", {
                          validate: {
                            startsWithPlus91: (value) => {
                              if (!value.startsWith("+91 ")) {
                                return "Alternate Number must start with +91 and a space.";
                              }
                              return true;
                            },
                            correctLength: (value) => {
                              if (value.length !== 14) {
                                return "Alternate Number is Required";
                              }
                              return true;
                            },
                            notRepeatingDigits: (value) => {
                              const isRepeating = /^(\d)\1{12}$/.test(value); // Check for repeating digits
                              return (
                                !isRepeating ||
                                "Alternate Number cannot consist of the same digit repeated."
                              );
                            },
                          },
                          pattern: {
                            value: /^\+91\s[6-9]\d{9}$/, // Ensure it starts with +91, followed by a space, and then 6-9 and 9 more digits
                            message: "Alternate Number is Required",
                          },
                        })}
                      />
                      {errors.alternateNo && (
                        <p className="errorMsg">{errors.alternateNo.message}</p>
                      )}
                    </div>
                    {editMode && <div className="col-lg-1"></div>}
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Company Address <span style={{ color: "red" }}>*</span>
                      </label>
                      <textarea
                        type="text"
                        className="form-control"
                        placeholder="Enter Company Address"
                        //onKeyDown={handleEmailChange}
                        onInput={toInputAddressCase}
                        autoComplete="off"
                        {...register("companyAddress", {
                          required: "Company Address is Required",
                          pattern: {
                            value:
                              /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,-_&*.+()^\-/:;]*$/,
                            message: "Please enter valid Address",
                          },
                          minLength: {
                            value: 3,
                            message: "Minimum 3 Characters allowed",
                          },
                          maxLength: {
                            value: 250,
                            message: "Maximum 250 Characters allowed",
                          },
                          validate: validateAddress
                        })}
                      />
                      {errors.companyAddress && (
                        <p className="errorMsg">
                          {errors.companyAddress.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title" style={{ marginBottom: "0px" }}>
                    Company Registration Details
                  </h5>
                  <div
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd" }}
                  />
                </div>
                <div className="card-body">
                  <div className="row">
                    {companyType === "Private Limited" && (
                      <>
                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                          <label className="form-label">
                            Company CIN Number
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Company CIN Number"
                            onKeyDown={handleEmailChange}
                            onInput={toInputSpaceCase}
                            autoComplete="off"
                            maxLength={21}
                            onPaste={handlePaste}
                            {...register("cinNo", {
                              required: "Company CIN Number is Required",
                              maxLength: {
                                value: 21,
                                message:
                                  "CIN Number must not exceed 21 characters",
                              },

                              validate: validateCIN,
                            })}
                            disabled={editMode}
                          />
                          {errors.cinNo && (
                            <p className="errorMsg">{errors.cinNo.message}</p>
                          )}
                        </div>
                        <div className="col-lg-1"></div>
                      </>
                    )}
                    {companyType === "Firm" && (
                      <>
                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                          <label className="form-label">
                            Company Registration Number{" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Company Registration Number"
                            autoComplete="off"
                            maxLength={21}
                            onPaste={handlePaste}
                            {...register("companyRegNo", {
                              required:
                                "Company Registration Number is Required",
                              maxLength: {
                                value: 21,
                                message:
                                  "Registration Number must not exceed 21 characters",
                              },
                              validate: validateREGISTER,
                            })}
                            disabled={editMode}
                          />
                          {errors.companyRegNo && (
                            <p className="errorMsg">
                              {errors.companyRegNo.message}
                            </p>
                          )}
                        </div>
                        <div className="col-lg-1"></div>
                      </>
                    )}
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Company GST Number{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Company GST Number"
                        autoComplete="off"
                        onInput={toInputSpaceCase}
                        onKeyDown={handleEmailChange}
                        maxLength={15}
                        onPaste={handlePaste} 
                        {...register("gstNo", {
                          maxLength: {
                            value: 15,
                            message: "GST Number must not exceed 15 characters",
                          },
                          validate: validateGST,
                        })}
                        disabled={editMode}
                      />
                      {errors.gstNo && (
                        <p className="errorMsg">{errors.gstNo.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Company PAN Number{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        onInput={toInputSpaceCase}
                        placeholder="Enter Company PAN Number"
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        onPaste={handlePaste}
                        maxLength={10}
                        {...register("panNo", {
                          required: "Company PAN Number is Required",
                          maxLength: {
                            value: 10,
                            message: "PAN Number must not exceed 10 characters",
                          },
                          validate: validatePAN,
                        })}
                        disabled={editMode}
                      />
                      {errors.panNo && (
                        <p className="errorMsg">{errors.panNo.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title" style={{ marginBottom: "0px" }}>
                    Authorized Details
                  </h5>
                  <div
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd" }}
                  />
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Name"
                        // onKeyDown={handleEmailChange}
                        onInput={toInputTitleCase}
                        autoComplete="off"
                        {...register("name", {
                          required: "Name is Required",
                          minLength: {
                            value: 3,
                            message: "Minimum 3 characters Required",
                          },
                          maxLength: {
                            value: 100,
                            message: "Name must not exceed 100 characters",
                          },
                          validate: {
                            validateName,
                          },
                        })}
                      />
                      {errors.name && (
                        <p className="errorMsg">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Personal Email Id{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter Personal Email Id"
                        autoComplete="off"
                        // onInput={toInputEmailCase}
                        onPaste={handlePaste}
                        onKeyDown={handleEmailChange}
                        {...register("personalMailId", {
                          required: "Personal Email Id is Required",
                          pattern: {
                            value:
                          /^[a-z][a-zA-Z0-9._+-]*@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                            message: "Invalid Email Format ",
                          },
                        })}
                      />
                      {errors.personalMailId && (
                        <p className="errorMsg">
                          {errors.personalMailId.message}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Personal Mobile Number{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Personal Mobile Number"
                        autoComplete="off"
                        maxLength={14}
                        defaultValue="+91 " // Set the initial value to +91 with a space
                        onInput={handlePhoneNumberChange} // Handle input changes
                        // onKeyDown={handlePhoneNumberKeyDown} // Handle keydown for specific actions
                        {...register("personalMobileNo", {
                          required: "Personal Mobile Number is Required",
                          validate: {
                            startsWithPlus91: (value) => {
                              if (!value.startsWith("+91 ")) {
                                return "Personal Mobile Number must start with +91 and a space.";
                              }
                              return true;
                            },
                            correctLength: (value) => {
                              if (value.length !== 14) {
                                return "Personal Mobile Number is Required";
                              }
                              return true;
                            },
                            notRepeatingDigits: (value) => {
                              const isRepeating = /^(\d)\1{12}$/.test(value); // Check for repeating digits
                              return (
                                !isRepeating ||
                                "Personal Mobile Number cannot consist of the same digit repeated."
                              );
                            },
                          },
                          pattern: {
                            value: /^\+91\s[6-9]\d{9}$/, // Ensure it starts with +91, followed by a space, and then 6-9 and 9 more digits
                            message: "Personal Mobile Number is Required",
                          },
                        })}
                      />
                      {errors.personalMobileNo && (
                        <p className="errorMsg">
                          {errors.personalMobileNo.message}
                        </p>
                      )}
                    </div>

                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Address <span style={{ color: "red" }}>*</span>
                      </label>
                      <textarea
                        type="text"
                        className="form-control"
                        placeholder="Enter Company Address"
                        //onKeyDown={handleEmailChange}
                        onInput={toInputAddressCase}
                        autoComplete="off"
                        {...register("address", {
                          required: "Address is Required",
                          pattern: {
                            value:
                              /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,-_&*.+()^\-/:;]*$/,
                            message: "Please enter valid Address",
                          },
                          minLength: {
                            value: 3,
                            message: "Minimum 3 Characters allowed",
                          },
                          maxLength: {
                            value: 250,
                            message: "Maximum 250 Characters allowed",
                          },
                          validate:validateAddress
                        })}
                      />
                      {errors.address && (
                        <p className="errorMsg">{errors.address.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-1"></div>
          <div className="col-12 mt-1">
            {/* Display error message above the button if there are any error messages */}
            {errorMessage.length > 0 && (
              <div className="alert alert-danger text-center mt-1">
                {errorMessage.map((msg, index) => (
                  <p key={index}>{msg}</p> // Display each message in a <p> tag
                ))}
              </div>
            )}

            <div className="d-flex justify-content-end mt-1">
              {/* Conditionally render the "Clear" button only when not in editMode */}
              {!editMode ? (
                <button
                  className="btn btn-secondary me-2"
                  type="button"
                  onClick={clearForm}
                >
                  Clear
                </button>
              ):(
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
                  editMode ? "btn btn-danger btn-lg" : "btn btn-primary btn-lg"
                }
                style={{ marginRight: "85px" }}
                type="submit"
              >
                {editMode ? "Update Company" : "Add Company"}
              </button>
            </div>
          </div>
        </form>
      </div>,,
    </LayOut>
  );
};

export default CompanyRegistration;
