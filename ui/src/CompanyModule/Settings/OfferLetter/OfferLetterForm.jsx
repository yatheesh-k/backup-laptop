import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router-dom";
import LayOut from "../../../LayOut/LayOut";
import { DepartmentGetApi, DesignationGetApi } from "../../../Utils/Axios";

const OfferLetterForm = () => {
  const location = useLocation();
  // const initialFormData = location.state?.formData || null;
  const initialFormData = location.state?.clearForm ? null : location.state?.formData || null;
  const formData = location.state?.formData || null;
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    reset,
    trigger
  } = useForm({
    mode: "onChange",
    defaultValues: initialFormData || {
      offerDate: "",
      referenceNo: "",
      employeeName: "",
      employeeFatherName: "",
      employeeAddress: "",
      employeeContactNo: "+91 ",
      joiningDate: "",
      jobLocation: "",
      salaryPackage: "",
      salaryConfigurationId: "",
      department: "",
      designation: "",
      draft: undefined,
      generatedDate: "",
    }
  });
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const navigate = useNavigate();

  const nextSixMonths = new Date();
  nextSixMonths.setMonth(nextSixMonths.getMonth() + 6);
  const sixMonthsFromNow = nextSixMonths.toISOString().split("T")[0];
  const watchDepartment = watch("department");

  const fetchDepartments = async () => {
    try {
      const data = await DepartmentGetApi();
      setDepartments(data.data.data);
    } catch (error) {
      // handleApiErrors(error)
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignations = async (departmentId) => {
    try {
      if (departmentId) {
        const data = await DesignationGetApi(departmentId); // Pass departmentId to API
        setDesignations(data);
      } else {
        setDesignations([]); // Clear designations if no department selected
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
      setDesignations([]);
    }
  };


  useEffect(() => {
    if (watchDepartment) {
      // Find the department object to get its ID
      const selectedDept = departments.find(dept => dept.name === watchDepartment);
      if (selectedDept) {
        fetchDesignations(selectedDept.id);
      }
    } else {
      setDesignations([]); // Clear designations when no department selected
    }
  }, [watchDepartment]);

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  useEffect(() => {
    if (formData?.department && departments.length > 0) {
      const selectedDept = departments.find(dept => dept.name === formData.department);
      if (selectedDept) {
        fetchDesignations(selectedDept.id).then(() => {
          setTimeout(() => {
            if (formData.designation) {
              setValue("designation", formData.designation);
            }
          }, 100);
        });
      }
    }
  }, [formData, departments, setValue]);

  const onSubmit = (data) => {
    const draftValue = data.draft === "true";
    console.log("offerLetter", data)

    const previewData = {
      offerDate: data.offerDate,
      referenceNo: data.referenceNo,
      employeeName: data.employeeName,
      employeeFatherName: data.employeeFatherName,
      employeeAddress: data.employeeAddress,
      employeeContactNo: data.employeeContactNo,
      joiningDate: data.joiningDate,
      jobLocation: data.jobLocation,
      salaryPackage: data.salaryPackage,
      salaryConfigurationId: data.salaryConfigurationId,
      department: data.department,
      designation: data.designation,
      draft: draftValue,
      generatedDate: data.generatedDate,

    };
    setPreviewData(previewData);
    console.log("preview:", previewData);

    navigate("/offerLetterPreview", {
      state: {
        previewData,
        formData: data
      }
    });
  };

  const clearForm = () => {
  reset({
    offerDate: "",
    referenceNo: "",
    employeeName: "",
    employeeFatherName: "",
    employeeAddress: "",
    employeeContactNo: "+91 ",
    joiningDate: "",
    jobLocation: "",
    salaryPackage: "",
    salaryConfigurationId: "",
    department: "",
    designation: "",
    draft: undefined,
    generatedDate: "",
  });
   navigate('.', {
      state: { clearForm: true },
      replace: true
    });
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

  const isValidReferenceFormat = (value) => {
    const validPattern = /^[A-Z0-9\-_\/]+$/;
    if (!validPattern.test(value)) {
      return "Only letters, numbers, and - _ / are allowed";
    }

    const hasLetter = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);

    if (!hasLetter || !hasNumber) {
      return "Invalid Reference Number format: Must contain both letters and numbers";
    }

    return true;
  };
  const validateYear = (dateString) => {
    if (!dateString) return true; // Skip validation if empty
    
    const year = new Date(dateString).getFullYear();
    return year.toString().length === 4 || "Year must be exactly 4 digits";
  };


  // Capitalize the first letter of each word expect email
  const handleInputChange = (e, fieldName) => {
    let value = e.target.value;

    // Allow only letters, numbers, and - _ /
    value = value.replace(/[^A-Z0-9\-_\/ ]/gi, ""); // keep space for now if needed for uppercase logic
    value = value.trimStart().replace(/ {2,}/g, " "); // remove leading and multiple spaces

    // Convert to uppercase
    if (fieldName !== "email") {
      value = value.toUpperCase();
    }

    setValue(fieldName, value);
    trigger(fieldName); // Trigger validation
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

  const validateName = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();

    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Field is Required.";
    }

    // Allow alphabetic characters, spaces, and numbers
    else if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
      return "Only Alphabetic Characters are Allowed.";
    } else {
      const words = trimmedValue.split(" ");

      // Check for minimum and maximum word length, allowing one-character words at the end
      for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // If the word length is less than 3 and it's not the last word, show error
        if (word.length < 3 && i !== words.length - 1) {
          return "Minimum Length 3 Characters Required.";
        }

        // Check maximum word length
        if (word.length > 100) {
          return "Max Length 100 Characters Exceeded.";
        }
      }

      // Check for trailing and leading spaces
      if (/\s$/.test(value)) {
        return "Spaces at the end are not allowed."; // Trailing space error
      } else if (/^\s/.test(value)) {
        return "No Leading Space Allowed."; // Leading space error
      }

      // Check if there are multiple spaces between words
      else if (/\s{2,}/.test(trimmedValue)) {
        return "No Multiple Spaces Between Words Allowed.";
      }
    }

    return true; // Return true if all conditions are satisfied
  };

  const validatePosition = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();

    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Department Name is Required.";
    }

    // Allow alphabetic characters, numbers, spaces, and some special characters like /, !, @, #, &...
    else if (!/^[A-Za-z\s/]+$/.test(trimmedValue)) {
      return "Only Alphabetic Characters, Spaces, and '/' are Allowed.";
    } else {
      const words = trimmedValue.split(" ");

      // Check for minimum and maximum word length
      for (const word of words) {
        // If the word is a single character and it's not the only word in the string, skip this rule
        if (word.length < 2 && words.length === 1) {
          return "Minimum Length 2 Characters Required."; // If any word is shorter than 2 characters and it's a single word
        } else if (word.length > 40) {
          return "Max Length 40 Characters Required."; // If any word is longer than 40 characters
        }
      }

      // Check for multiple spaces between words
      if (/\s{2,}/.test(trimmedValue)) {
        return "No Multiple Spaces Between Words Allowed.";
      }

      // Check if the value has leading or trailing spaces (shouldn't happen due to trimming)
      if (/^\s/.test(value)) {
        return "Leading space not allowed."; // Leading space error
      } else if (/\s$/.test(value)) {
        return "Spaces at the end are not allowed."; // Trailing space error
      }
    }

    return true; // Return true if all conditions are satisfied
  };

  const today = new Date();
  const threeMonthsFromNow = new Date(
    today.getFullYear(),
    today.getMonth() + 3,
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1">
          <div className="col">
            <h1 className="h3">
              <strong>Offer Letter Form</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">
                  Generate Offer Letter
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Employee Offer Letter Form</h5>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Employee Name"
                        name="firstName"
                        onInput={toInputTitleCase}
                        minLength={2}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("employeeName", {
                          required: "Employee Name is Required",
                          minLength: {
                            value: 3,
                            message: "Minimum 3 Characters Required",
                          },
                          validate: {
                            validateName,
                          },
                        })}
                      />
                      {errors.employeeName && (
                        <p className="errorMsg">
                          {errors.employeeName.message}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Father Name/Husband Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Father Name/Husband Name"
                        name="firstName"
                        onInput={toInputTitleCase}
                        minLength={2}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("employeeFatherName", {
                          required: "Employees Father Name is Required",
                          minLength: {
                            value: 3,
                            message: "Minimum 3 Characters Required",
                          },
                          validate: {
                            validateName,
                          },
                        })}
                      />
                      {errors.employeeFatherName && (
                        <p className="errorMsg">
                          {errors.employeeFatherName.message}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Reference Number</label>
                      <input
                        type="text"
                        placeholder="Enter Reference Number"
                        className="form-control"
                        name="referenceNo"
                        {...register("referenceNo", {
                          required: "Reference Number is required",
                          maxLength: {
                            value: 20,
                            message: "Maximum 20 Characters allowed"
                          },
                          validate: {
                            noTrailingSpaces: (value) => noTrailingSpaces(value, "referenceNo"),
                            referenceFormat: isValidReferenceFormat,
                          },
                        })}
                        onChange={(e) => handleInputChange(e, "referenceNo")}
                      />
                      {errors.referenceNo && <p className="errorMsg">{errors.referenceNo.message}</p>}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Contact No</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Mobile Number"
                        autoComplete="off"
                        maxLength={14} // Limit input to 15 characters (including +91)
                        defaultValue="+91 " // Set the initial value to +91 with a space
                        onInput={handlePhoneNumberChange} // Handle input changes
                        {...register("employeeContactNo", {
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
                            startsWithValidDigit: (value) => {
                              const validStart = /^[+91\s][6789]/.test(value);
                              if (!validStart) {
                                return "Contact Number must start with +91 followed by 6, 7, 8, or 9.";
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
                            value: /^\+91\s[6-9]\d{9}$/, // Ensure it starts with +91, followed by a space, and then 6-9 and 9 more digits
                            message: "Contact Number is Required.",
                          },
                        })}
                      />
                      {errors.employeeContactNo && (
                        <p className="errorMsg">
                          {errors.employeeContactNo.message}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Joining Date</label>
                      <input
                        type="date"
                        name="joiningDate"
                        placeholder="Enter Joining Date"
                        className="form-control"
                        autoComplete="off"
                        max={threeMonthsFromNow}
                        onClick={(e) => e.target.showPicker()}
                        {...register("joiningDate", {
                          required: "Joining Date is required",
                          validate: {
                            notMoreThanThreeMonths: (value) => {
                              const threeMonthsFromNow = new Date();
                              threeMonthsFromNow.setMonth(
                                threeMonthsFromNow.getMonth() + 3
                              );
                              const joiningDate = new Date(value);
                              return (
                                joiningDate <= threeMonthsFromNow ||
                                "Joining Date cannot be more than 3 months from today"
                              );
                            },
                          },
                        })}
                      />
                      {errors.joiningDate && (
                        <p className="errorMsg">{errors.joiningDate.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Job Location</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Location"
                        autoComplete="off"
                        minLength={2}
                        onKeyDown={handleEmailChange}
                        onInput={toInputAddressCase}
                        {...register("jobLocation", {
                          required: "Job Location is Required",
                          pattern: {
                            value:
                              /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,-_&*.()^\-/]*$/, // Your pattern for valid characters
                            message: "Please enter valid Job Location",
                          },
                          minLength: {
                            value: 3,
                            message: "Minimum 3 Characters allowed",
                          },
                          maxLength: {
                            value: 200,
                            message: "Maximum 200 Characters allowed",
                          },
                          validate: {
                            // Custom validation for trailing spaces
                            noTrailingSpaces: (value) => {
                              if (/\s$/.test(value)) {
                                // Check for trailing space
                                return "Spaces at the end are not allowed"; // Error message
                              }
                              return true; // Validation passes
                            },
                          },
                        })}
                      />
                      {errors.jobLocation && (
                        <p className="errorMsg">
                          {errors.jobLocation.message}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Department</label>
                      <Controller
                        name="department"
                        control={control}
                        defaultValue=""
                        rules={{ required: "Department is Required" }}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="form-select"
                            onChange={(e) => {
                              field.onChange(e); // Update form state
                              // Reset designation when department changes
                              setValue("designation", "");
                              // Find department and fetch its designations
                              const selectedDept = departments.find(dept => dept.name === e.target.value);
                              if (selectedDept) {
                                fetchDesignations(selectedDept.id);
                              }
                            }}
                          >
                            <option value="" disabled>Select Department</option>
                            {departments.map((department) => (
                              <option key={department.id} value={department.name}>
                                {department.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.department && (
                        <p className="errorMsg">{errors.department.message}</p>
                      )}
                    </div>

                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Designation</label>
                      <Controller
                        name="designation"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: {
                            value: true,
                            message: watchDepartment ? "Designation is Required" : "Please select a department first"
                          }
                        }}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="form-select"
                            disabled={!watchDepartment}
                          >
                            <option value="" disabled>Select Designation</option>
                            {designations.map((designation) => (
                              <option key={designation.id} value={designation.name}>
                                {designation.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.designation && (
                        <p className="errorMsg">{errors.designation.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Salary Package</label>
                      <input
                        type="text"
                        className="form-control"
                        minLength={5}
                        maxLength={10}
                        placeholder="Enter Salary Package"
                        name="salaryPackage"
                        {...register("salaryPackage", {
                          required: "Salary Package is required",
                          min: {
                            value: 5,
                            message: "Minimum 5 Numbers Required",
                          },
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "These field accepts only Integers",
                          },
                        })}
                      />
                      {errors.salaryPackage && (
                        <p className="errorMsg">
                          {errors.salaryPackage.message}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Letter Generated Date</label>
                      <input
                        type="date"
                        name="generatedDate"
                        placeholder="Enter Genatated Date"
                        className="form-control"
                        autoComplete="off"
                        onClick={(e) => e.target.showPicker()}
                        {...register("generatedDate", {
                          required: "Generated Date is required",
                          validate: {
                              notAfterJoiningDate: (value) => {
                                const joiningDate = watch("joiningDate");
                                if (!joiningDate) return true; // Skip this check if joiningDate isn't selected yet
                                return (
                                  new Date(value) <= new Date(joiningDate) ||
                                  "Generated Date cannot be after Joining Date"
                                );
                              },
                              validateYear: (value) => validateYear(value),                           
                          },
                        })}
                      />
                      {errors.generatedDate && (
                        <p className="errorMsg">{errors.generatedDate.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Address</label>
                      <textarea
                        type="text"
                        className="form-control"
                        placeholder="Enter Address"
                        autoComplete="off"
                        minLength={2}
                        onKeyDown={handleEmailChange}
                        onInput={toInputAddressCase}
                        {...register("employeeAddress", {
                          required: "Address is Required",
                          pattern: {
                            value:
                              /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,-_&*.()^\-/]*$/,
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
                          validate: (value) =>
                            value.trim().length === value.length ||
                            "Spaces at the end are not allowed.",
                        })}
                      />
                      {errors.employeeAddress && (
                        <p className="errorMsg">
                          {errors.employeeAddress.message}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label mb-3">Select Mode</label>
                      <div className="d-flex">
                        <div className="form-check me-3">
                          <input
                            type="radio"
                            className="form-check-input"
                            id="draft"
                            name="draft"
                            value="true"
                            {...register("draft", { required: true })}
                          />
                          <label className="form-check-label" htmlFor="draft">
                            Draft Copy
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            id="undraft"
                            name="draft"
                            value="false"
                            {...register("draft", { required: true })}
                          />
                          <label className="form-check-label" htmlFor="undraft">
                            Digital Copy
                          </label>
                        </div>
                      </div>
                      {errors.draft && (
                        <p className="errorMsg">Please select draft copy or digital copy</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-footer" style={{ marginLeft: "80%" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={clearForm}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ marginLeft: "10px" }}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default OfferLetterForm;
