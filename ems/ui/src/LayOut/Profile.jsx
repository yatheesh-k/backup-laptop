import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Modal,
  Button,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "react-bootstrap";
import LayOut from "./LayOut";
import { CameraFill, Upload } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CompanyImagePatchApi,
  CompanyStampPatchApi,
  companyUpdateByIdApi,
  companyViewByIdApi,
} from "../Utils/Axios";
import { useAuth } from "../Context/AuthContext";

function Profile() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const [companyData, setCompanyData] = useState({});
  const [postImage, setPostImage] = useState(null);
  const [stampImage, setStampImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(null);
  const [stampError, setStampError] = useState("");
  const [showStampModal, setShowStampModal] = useState(false);
  const { user = {}, logoFileName,stamp } = useAuth();
  const navigate = useNavigate();
  const [response, setResponse] = useState({ data: {} });
  const [hasCinNo, setHasCinNo] = useState(false);
  const [hasCompanyRegNo, setHasCompanyRegNo] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user.companyId) return;

      try {
        const response = await companyViewByIdApi(user.companyId);
        const data = response.data;
        setCompanyData(data);

        // Set form values
        Object.keys(data).forEach((key) => setValue(key, data[key]));

        // Determine CIN and Registration number presence
        setHasCinNo(!!data.cinNo);
        setHasCompanyRegNo(!!data.companyRegNo);
      } catch (err) {
        setError(err);
      }
    };

    fetchCompanyData();
  }, [user.companyId, setValue, setError]);

  const handleDetailsSubmit = async (data) => {
    if (!user.companyId) return;
    const updateData = {
      companyAddress: data.companyAddress,
      mobileNo: data.mobileNo,
      alternateNo: data.alternateNo,
      name: data.name,
      personalMailId: data.personalMailId,
      personalMobileNo: data.personalMobileNo,
      address: data.address,
    };
    try {
      // Attempt to update company details
      await companyUpdateByIdApi(user.companyId, updateData);
      // Clear any previous error message
      setErrorMessage("");
      setError(null);
      // If the update is successful, show success message
      setSuccessMessage("Profile Updated Successfully.");
      toast.success("Company Details Updated Successfully");
      // Redirect to main page
      navigate("/main");
    } catch (err) {
      // Log the error to the console
      console.error("Details update error:", err);
      // Clear any previous success message
      setSuccessMessage("");
      // Set the error message and display error notification
      setErrorMessage("Failed To Update Profile Details.");
      setError(err);
      const errorMessage = err?.response?.data?.message || "An error occurred";
      // Show error notification with the error message from the API
      toast.error(errorMessage);
    }
  };

  const handleLogoSubmit = async (e) => {
    e.preventDefault(); // Prevent form default action
    if (!user.companyId) return;
    if (!postImage) {
      setErrorMessage("Logo is Required");
      setImgError("Logo is Required")
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", "string");
      formData.append("file", postImage);
      await CompanyImagePatchApi(user.companyId, formData);
      setPostImage(null);
      setSuccessMessage("Logo updated successfully.");
      toast.success("Company Logo Updated Successfully");
      setErrorMessage("");
      setImgError(""); // Clear image error if everything goes fine
      closeModal();
      setTimeout(() => {
        window.location.href = "/main";
      }, 2000);
    } catch (err) {
      console.error("Logo update error:", err);
      setSuccessMessage("");
      toast.error("Failed To Update Logo");
      setError(err);
    }
  };

  const handleStampSubmit = async (e) => {
    e.preventDefault();
    if (!user.companyId) return;
    if (!stampImage) {
      setStampError("Stamp is Required");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", "string");
      formData.append("file", stampImage);
      await CompanyStampPatchApi(user.companyId, formData); // API call

      setStampImage(null);
      setSuccessMessage("Stamp updated successfully.");
      toast.success("Company Stamp Updated Successfully");
      setStampError("");
      closeStampModal();
      setTimeout(() => {
        window.location.href = "/main";
      }, 2000);
    } catch (err) {
      console.error("Stamp update error:", err);
      setSuccessMessage("");
      toast.error("Failed To Update Stamp");
      setStampError("Error uploading stamp");
    }
  };


  const handleEmailChange = (e) => {
    const value = e.target.value;
    if (value.trim() !== "") {
      return;
    }
    if (e.keyCode === 32) {
      e.preventDefault();
    }
  };
 // Validate Logo Upload
 const onChangePicture = (e) => {
  validateFile(e, setPostImage, setImgError);
};

// Validate Stamp Upload
const onChangeStampPicture = (e) => {
  validateFile(e, setStampImage, setStampError);
};

const validateFile = (e, setFile, setError) => {
  const file = e.target.files[0];
  if (!file) {
    setError("No file selected.");
    return;
  }
  if (file.size > 200 * 1024) {
    setError("File size must be less than 200KB.");
    return;
  }
  const validTypes = ["image/png", "image/jpeg", "image/svg+xml"];
  if (!validTypes.includes(file.type)) {
    setError("Only .png, .jpg, .jpeg, .svg files are allowed.");
    return;
  }
  setError("");
  setFile(file);
};

const openModal = () => setShowModal(true);
const closeModal = () => setShowModal(false);
const openStampModal = () => setShowStampModal(true);
const closeStampModal = () => setShowStampModal(false);

  const handleCloseUploadImageModal = () => {
    setPostImage(null);
    setShowModal(false);
    setErrorMessage("");
  };
  const handleStampCloseModal=()=>{
    setStampImage(null);
    setShowStampModal(false);
    setErrorMessage("");
    setStampError("");
  }

  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position
    // Remove leading spaces
    value = value.replace(/^\s+/g, "");
    // Ensure only alphabets and spaces are allowed
    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
    value = value
      .split("")
      .filter((char) => allowedCharsRegex.test(char))
      .join("");
    // Capitalize the first letter of each word
    const words = value.split(" ");
    // Capitalize the first letter of each word and lowercase the rest
    const capitalizedWords = words.map((word) => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return "";
    });
    // Join the words back into a string
    let formattedValue = capitalizedWords.join(" ");
    // Remove spaces not allowed (before the first two characters)
    if (formattedValue.length > 2) {
      formattedValue =
        formattedValue.slice(0, 2) +
        formattedValue.slice(2).replace(/\s+/g, " ");
    }
    // Update input value
    input.value = formattedValue;
    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  function handlePhoneNumberChange(event) {
    let value = event.target.value;
    // Ensure only one space is allowed after +91
    if (value.startsWith("+91 ") && value.charAt(3) !== " ") {
      value = "+91 " + value.slice(3); // Ensure one space after +91
    }
    // Update the value in the input
    event.target.value = value;
  }

  // Function to handle keydown for specific actions (e.g., prevent multiple spaces)
  function handlePhoneNumberKeyDown(event) {
    let value = event.target.value;
    // Prevent backspace if the cursor is before the "+91 "
    if (
      event.key === "Backspace" &&
      value.startsWith("+91 ") &&
      event.target.selectionStart <= 4
    ) {
      event.preventDefault(); // Prevent the backspace if it's before the "+91 "
    }
    // Prevent multiple spaces after +91
    if (event.key === " " && value.charAt(3) === " ") {
      event.preventDefault();
    }
  }

  const toInputEmailCase = (e) => {
    const input = e.target;
    let value = input.value;

    // Remove all spaces from the input
    value = value.replace(/\s+/g, "");

    // If the first character is not lowercase, make it lowercase
    if (value.length > 0 && value[0] !== value[0].toLowerCase()) {
      value = value.charAt(0).toLowerCase() + value.slice(1);
    }

    // Update the input value
    input.value = value;
  };


  const toInputAddressCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position
    // Remove leading spaces
    value = value.replace(/^\s+/g, "");
    // Ensure only alphabets (upper and lower case), numbers, and allowed special characters
    const allowedCharsRegex = /^[a-zA-Z0-9\s!-_@#&()*/,.\\-{}]+$/;
    value = value
      .split("")
      .filter((char) => allowedCharsRegex.test(char))
      .join("");

    // Capitalize the first letter of each word, but allow uppercase letters in the middle of the word
    const words = value.split(" ");
    const capitalizedWords = words.map((word) => {
      if (word.length > 0) {
        // Capitalize the first letter, but leave the middle of the word intact
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return "";
    });

    // Join the words back into a string
    let formattedValue = capitalizedWords.join(" ");

    // Remove spaces not allowed (before the first two characters)
    if (formattedValue.length > 2) {
      formattedValue =
        formattedValue.slice(0, 2) +
        formattedValue.slice(2).replace(/\s+/g, " ");
    }

    // Update input value
    input.value = formattedValue;

    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
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
    const validCharsRegex = /^[A-Za-z0-9\s,.'\-/&@#$()*+!:]*$/;
    if (!validCharsRegex.test(value)) {
      return "Invalid characters used. Only alphabets, numbers, and special characters (, . ' - / & @ # $ ( ) * + :) are allowed.";
    }

    return true; // Return true if all conditions are satisfied
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <h1 className="h3 mb-3">
          <strong>Profile</strong>
        </h1>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title" style={{ marginBottom: "0px" }}>
                  Add Company Logo
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 col-md-6 mb-3">
                  <div
                      style={{
                        position: "relative",
                        fontSize: "50px",
                        cursor: "pointer",
                        marginRight: "80%",
                      }}
                      onClick={openModal}
                    >
                      <div
                        style={{
                          position: "relative",
                          justifyContent: "center",
                        }}
                      >
                        <CameraFill />
                      </div>
                    </div>
                    <span className="text-info align-start">
                      Max-Size=200 KB{" "}
                    </span>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    {logoFileName && (
                      <img
                        className="align-middle"
                        src={`${logoFileName}`}
                        accept=".png, .jpg. ,svg ,.jpeg,"
                        alt="Company Logo"
                        style={{ height: "80px", width: "200px" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h5 className="card-title" style={{ marginBottom: "0px" }}>
                  Add Company Stamp
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 col-md-6 mb-3">
                  <div
                      style={{
                        position: "relative",
                        fontSize: "50px",
                        cursor: "pointer",
                        marginRight: "80%",
                      }}
                      onClick={openStampModal}
                    >
                      <div
                        style={{
                          position: "relative",
                          justifyContent: "center",
                        }}
                      >
                        <CameraFill />
                      </div>
                    </div>
                    <span className="text-info align-start">
                      Max-Size=200 KB{" "}
                    </span>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    {stamp && (
                      <img
                        className="align-middle"
                        src={`${stamp}`}
                        accept=".png, .jpg. ,svg ,.jpeg,"
                        alt="Company Logo"
                        style={{ height: "80px", width: "200px" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(handleDetailsSubmit)}>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header ">
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
                      <label htmlFor="companyName" className="form-label">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        className="form-control"
                        {...register("companyName")}
                        readOnly
                      />
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Service Name</label>
                      <input
                        type="text"
                        id="shortName"
                        className="form-control"
                        {...register("shortName")}
                        readOnly
                      />
                    </div>
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
                        onKeyDown={handlePhoneNumberKeyDown} // Handle keydown for specific actions
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
                                return "Alternate Number must be exactly 10 digits (including +91).";
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
                            value: /^\+91\s\d{10}$/, // Ensure it starts with +91, followed by a space and exactly 10 digits
                            message: "Alternate Number is Required",
                          },
                        })}
                      />
                      {errors.alternateNo && (
                        <p className="errorMsg">{errors.alternateNo.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Contact Number <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Contact Number"
                        autoComplete="off"
                        maxLength={14} // Limit input to 14 characters
                        defaultValue="+91 " // Set the initial value to +91 with a space
                        onInput={handlePhoneNumberChange} // Handle input changes
                        onKeyDown={handlePhoneNumberKeyDown} // Handle keydown for specific actions
                        {...register("mobileNo", {
                          required: "Contact Number is Required",
                          validate: {
                            startsWithPlus91: (value) => {
                              if (!value.startsWith("+91 ")) {
                                return "Contact Number must start with +91 and a space.";
                              }
                              return true;
                            },
                            correctLength: (value) => {
                              if (value.length !== 14) {
                                return "Contact Number must be exactly 10 digits (including +91).";
                              }
                              return true;
                            },
                            notRepeatingDigits: (value) => {
                              const isRepeating = /^(\d)\1{12}$/.test(value); // Check for repeating digits
                              return (
                                !isRepeating ||
                                "Contact Number cannot consist of the same digit repeated."
                              );
                            },
                          },
                          pattern: {
                            value: /^\+91\s\d{10}$/, // Ensure it starts with +91, followed by a space and exactly 10 digits
                            message: "Contact Number is Required",
                          },
                        })}
                      />
                      {errors.mobileNo && (
                        <p className="errorMsg">{errors.mobileNo.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label htmlFor="emailId" className="form-label">
                        {" "}
                        Company Email Id
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter Company Email Id"
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("emailId", {
                          required: "Company Email Id is Required",
                          pattern: {
                            value:
                              /^(?![0-9]+@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                            message: "Invalid email format",
                          },
                        })}
                        readOnly
                      />
                      {errors.emailId && (
                        <p className="errorMsg">{errors.emailId.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Company Address <span style={{ color: "red" }}>*</span>
                      </label>
                      <textarea
                        type="text"
                        className="form-control"
                        placeholder="Enter Company Address"
                        onInput={toInputAddressCase}
                        autoComplete="off"
                        {...register("companyAddress", {
                          required: "Company Address is Required",
                          pattern: {
                            value:
                              /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,-_&*.()^+\-/+:]*$/,
                            message: "Please enter a valid address.",
                          },
                          minLength: {
                            value: 3,
                            message: "Minimum 3 Characters allowed",
                          },
                          maxLength: {
                            value: 200,
                            message: "Maximum 200 Characters allowed",
                          },
                          validate: validateAddress,
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
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        {hasCinNo ? (
                          <>
                            <label className="form-label">
                              Company CIN Number
                            </label>
                            <input
                              type="text"
                              id="cinNo"
                              className="form-control"
                              value={response.data.cinNo}
                              {...register("cinNo")}
                              readOnly
                            />
                          </>
                        ) : hasCompanyRegNo ? (
                          <>
                            <label className="form-label">
                              Company Registration Number
                            </label>
                            <input
                              type="text"
                              id="companyRegNo"
                              className="form-control"
                              value={response.data.companyRegNo}
                              {...register("companyRegNo")}
                              readOnly
                            />
                          </>
                        ) : null}
                      </div>
                      <div className="col-lg-1"></div>
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">Company GST Number</label>
                        <input
                          type="text"
                          id="gstNo"
                          className="form-control"
                          {...register("gstNo")}
                          readOnly
                        />
                      </div>
                      <div className="col-lg-1"></div>
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">Company PAN Number</label>
                        <input
                          type="text"
                          id="panNo"
                          className="form-control"
                          {...register("panNo")}
                          readOnly
                        />
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
                          onKeyDown={handleEmailChange} // Prevent space key
                          onInput={toInputTitleCase} // Handle case conversion and trim spaces
                          maxLength={100}
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
                            pattern: {
                              value: /^[a-zA-Z\s]*$/,
                              message: "Name should contain only alphabets",
                            },
                            validate: {
                              noTrailingSpaces: (value) => {
                                // Custom validation to check if there's a trailing space
                                if (value.trim() !== value) {
                                  return "Spaces at the end are not allowed.";
                                }
                                return true;
                              },
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
                          onInput={toInputEmailCase}
                          onKeyDown={handleEmailChange}
                          {...register("personalMailId", {
                            required: "Personal Email Id is Required",
                            pattern: {
                              value:
                                /^(?![0-9]+@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
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
                          onKeyDown={handlePhoneNumberKeyDown} // Handle keydown for specific actions
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
                                  return "Personal Mobile Number must be exactly 10 digits (including +91).";
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
                              value: /^\+91\s\d{10}$/, // Ensure it starts with +91, followed by a space and exactly 10 digits
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
                          placeholder="Enter Address"
                          autoComplete="off"
                          onInput={toInputAddressCase}
                          onKeyDown={handleEmailChange}
                          maxLength={200}
                          {...register("address", {
                            required: "Address is Required",
                            pattern: {
                              value:
                                /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,-_&*.()^+\-/+:]*$/,
                              message: "Please enter valid Address",
                            },
                            minLength: {
                              value: 3,
                              message: "Minimum 3 Characters allowed",
                            },
                            maxLength: {
                              value: 200,
                              message: "Maximum 200 Characters allowed",
                            },
                            validate: validateAddress,
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
              <div className="col-lg-1"></div>
              <div className="col-12 d-flex justify-content-end">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
        {/* Modal for Logo Upload */}
        {showModal && (
        <Modal
          show={showModal}
          onHide={handleCloseUploadImageModal}
          style={{ zIndex: "1050" }}
          centered
        >
          <ModalHeader closeButton>
            <ModalTitle>Upload Logo</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <input
              type="file"
              className="form-control"
              accept=".png, .jpg, .svg, .jpeg,"
              onChange={onChangePicture}
            />
           {imgError && <p className="text-danger">{imgError}</p>}
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleLogoSubmit}>
              Upload Logo
            </Button>
          </ModalFooter>
        </Modal>
        )}

         {showStampModal && (
           <Modal
           show={showStampModal}
           onHide={handleStampCloseModal}
           style={{ zIndex: "1050" }}
           centered
         >
           <ModalHeader closeButton>
             <ModalTitle>Upload Stamp</ModalTitle>
           </ModalHeader>
           <ModalBody>
             <input
               type="file"
               className="form-control"
               accept=".png, .jpg, .svg, .jpeg,"
               onChange={onChangeStampPicture}
             />
              {stampError && <p className="text-danger">{stampError}</p>}
           </ModalBody>
           <ModalFooter>
             <Button variant="secondary" onClick={closeStampModal}>
               Cancel
             </Button>
             <Button variant="primary" onClick={handleStampSubmit}>
               Upload Stamp
             </Button>
           </ModalFooter>
         </Modal>
         )}
      </div>
    </LayOut>
  );
}

export default Profile;
