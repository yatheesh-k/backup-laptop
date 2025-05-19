import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import {
  DepartmentGetApi,
  DesignationGetApi,
  EmployeeGetApiById,
  EmployeePatchApiById,
  EmployeePostApi,
} from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";

const EmployeeRegistration = () => {
  const {
    register,
    watch,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      status: "Active", // Initialize with default value or leave empty if fetching dynamically
      roles: null,
    },
    mode: "onChange",
  });
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // State to track if updating or creating
  const [employeeId, setEmployeeId] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [showNoticePeriodOption, setShowNoticePeriodOption] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const navigate = useNavigate();
  const location = useLocation();
  console.log(user.company);
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };
  const handlePasswordChange = (e) => {
    setPasswordShown(e.target.value);
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

  const Employement = [
    { value: "Permanent", label: "Permanent" },
    { value: "Contract", label: "Contract" },
    { value: "Trainee", label: "Trainee" },
    { value: "Support", label: "Support" },
    { value: "Associate", label: "Associate" },
  ];

  const Roles = [
    { value: "Employee", label: "Employee" },
    { value: "Hr", label: "Hr" },
    { value: "Manager", label: "Manager" },
    { value: "Accountant", label: "Accountant" },
  ];

  useEffect(() => {
    // Retrieve companyName from session storage
    const storedCompanyName = localStorage.getItem("name");
    setCompanyName(storedCompanyName);

    // Generate employeeId only if data is not submitted
    if (!isDataSubmitted && storedCompanyName) {
      const generatedEmployeeId = generateEmployeeId(storedCompanyName);
      setEmployeeId(generatedEmployeeId);
    }
  }, [isDataSubmitted, companyName]);

  const generateEmployeeId = (companyName) => {
    const seriesCounter = localStorage.getItem("seriesCounter") || 1;
    const formattedSeriesCounter = String(seriesCounter).padStart(4, "0");
    const newEmployeeId =
      companyName.toUpperCase().substring(0, 3) + formattedSeriesCounter;

    return newEmployeeId;
  };

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

  const fetchDesignations = async () => {
    try {
      const data = await DesignationGetApi();
      setDesignations(data);
    } catch (error) {
      // handleApiErrors(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position

    // Remove leading spaces
    value = value.replace(/^\s+/g, "");

    // Ensure only allowed characters (alphabets and spaces)
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

  const toInputLowerCase = (e) => {
    const input = e.target;
    let value = input.value;
    // Remove leading spaces
    value = value.replace(/^\s+/g, "");

    // Initially disallow spaces if there are no non-space characters
    if (!/\S/.test(value)) {
      // If no non-space characters are present, prevent spaces
      value = value.replace(/\s+/g, "");
    } else {
      // Allow spaces if there are non-space characters
      value = value.toLowerCase();
      value = value.replace(/^\s+/g, ""); // Remove leading spaces
      const words = value.split(" ");
      const capitalizedWords = words.map((word) => {
        return word.charAt(0).toLowerCase() + word.slice(1);
      });
      value = capitalizedWords.join(" ");
    }
    // Update input value
    input.value = value;
  };

  const toInputSpaceCase = (e) => {
    let inputValue = e.target.value;
    let newValue = "";
    let capitalizeNext = true; // Flag to determine if the next character should be capitalized

    // Remove spaces from the beginning of inputValue
    inputValue = inputValue.trimStart();

    for (let i = 0; i < inputValue.length; i++) {
      const char = inputValue.charAt(i);

      // Check if the current character is a space
      if (char === " ") {
        newValue += char;
        capitalizeNext = true; // Set flag to capitalize next non-space character
      } else if (capitalizeNext && char.match(/[a-zA-Z0-9]/)) {
        newValue += char.toUpperCase();
        capitalizeNext = false; // Reset flag after capitalizing a character
      } else {
        newValue += char; // Add character as is if it's not the first one after a space
      }
    }

    // Update the input value
    e.target.value = newValue;
  };

  let company = user.company;
  const onSubmit = async (data) => {
    // const roles = data.roles ? [data.roles] : [];
    // Constructing the payload
    let payload = {
      companyName: company,
      employeeType: data.employeeType,
      emailId: data.emailId,
      password: data.password,
      designation: data.designation,
      location: data.location,
      manager: data.manager,
      //roles: roles,
      mobileNo: data.mobileNo,
      status: data.status,
      accountNo: data.accountNo,
      ifscCode: data.ifscCode,
      bankName: data.bankName,
      aadhaarId: data.aadhaarId,
    };
    if (location.state && location.state.id) {
      payload = {
        ...payload,
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfHiring: data.dateOfHiring,
        department: data.department,
        panNo: data.panNo,
        uanNo: data.uanNo,
        dateOfBirth: data.dateOfBirth,
      };
    } else {
      payload = {
        ...payload,
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfHiring: data.dateOfHiring,
        department: data.department,
        panNo: data.panNo,
        aadhaarId: data.aadhaarId,
        uanNo: data.uanNo,
        dateOfBirth: data.dateOfBirth,
      };
    }

    try {
      if (location.state && location.state.id) {
        const response = await EmployeePatchApiById(location.state.id, payload);
        console.log("Update successful", response.data);
        toast.success("Employee Updated Successfully");
      } else {
        const response = await EmployeePostApi(payload);
        console.log("Employee created", response.data);
        toast.success("Employee Created Successfully");
      }
      setTimeout(() => {
        navigate("/employeeView");
      }, 1000); // Adjust the delay time as needed (in milliseconds)

      reset();
    } catch (error) {
      let errorList = [];

      // Check if error response exists
      if (error.response) {
        console.log("Axios response error:", error.response.data.error); // Log Axios error response

        // Case 1: General error message
        if (error.response.data.error && error.response.data.error.message) {
          const generalErrorMessage = error.response.data.error.message;
          errorList.push(generalErrorMessage);
          toast.error(generalErrorMessage);
        }

        // Case 2: Specific error messages (multiple messages, such as form validation errors)
        if (error.response.data.error && error.response.data.error.messages) {
          const specificErrorMessages = error.response.data.error.messages;
          toast.error("Invalid Format Fields");
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
            conflictMessage += `${key}: ${value}\n,`;
          });

          // Display detailed conflict message in toast and add to error list
          errorList.push(conflictMessage);
        }

        // Handle HTTP 409 Conflict Error (duplicate or other conflicts)
        if (error.response.status === 409) {
          const conflictMessage = "A conflict occurred.";
          toast.error(conflictMessage); // Show conflict error in toast
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

  const handleApiErrors = (error) => {
    // if (error.response && error.response.data && error.response.data.message) {
    //   const alertMessage = `${error.response.data.message} (Duplicate Values)`;
    //   alert(alertMessage);
    // }
    if (
      error.response &&
      error.response.data &&
      error.response.data.error &&
      error.response.data.error.message
    ) {
      const errorMessage = error.response.data.error.message;
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
    } else {
      // toast.error("Network Error !");
    }
    console.error(error.response);
  };

  useEffect(() => {
    if (location && location.state && location.state.id) {
      const fetchData = async () => {
        try {
          const response = await EmployeeGetApiById(location.state.id);
          console.log(response.data);
          reset(response.data);
          setIsUpdating(true);
          // Assuming roles is an array and setting the first role
          const status = response.data.data.status;
          setValue("status", status.toString());

          // Conditionally show the "Notice Period" option based on the status
          if (status === "NoticePeriod") {
            setShowNoticePeriodOption(true);
          }

          // Check if roles array has any items
          const role = response.data.data.roles[0]; // Assuming roles is an array
          const selectedRole = Roles.find((option) => option.value === role);
          setValue("roles", selectedRole || null);
        } catch (error) {
          handleApiErrors(error);
        }
      };

      fetchData();
    }
  }, [location.state, reset, setValue]);

  const today = new Date();
  const threeMonthsFromNow = new Date(
    today.getFullYear(),
    today.getMonth() + 3,
    today.getDate()
  )
    .toISOString()
    .split("T")[0];
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    if (month < 10) {
      month = `0${month}`;
    }
    if (day < 10) {
      day = `0${day}`;
    }

    return `${year}-${month}-${day}`;
  };
  const validateDate = (value) => {
    const selectedDate = new Date(value);
    if (selectedDate > new Date(threeMonthsFromNow)) {
      return "Date of Hiring cannot be more than 3 months from today.";
    }
    return true; // Return true if no errors
  };
  // Custom validation function for date of birth based on date of hiring
  const validateDateOfBirth = (value, dateOfHiring) => {
    const selectedDateOfBirth = new Date(value);
    const selectedDateOfHiring = new Date(dateOfHiring); // Ensure this is a Date object
    // Calculate limits
    const minDateOfBirth = new Date(selectedDateOfHiring);
    minDateOfBirth.setFullYear(selectedDateOfHiring.getFullYear() - 15); // 21 years ago from date of hiring

    const maxDateOfBirth = new Date(selectedDateOfHiring);
    maxDateOfBirth.setFullYear(selectedDateOfHiring.getFullYear() - 80); // 80 years ago from date of hiring

    // Validate against the limits
    if (selectedDateOfBirth > minDateOfBirth) {
      return "Date of Birth must be at least 15 years before the Date of Joining.";
    }
    if (selectedDateOfBirth < maxDateOfBirth) {
      return "Date of Birth must not exceed 80 years before the Date of Joining.";
    }

    return true; // Return true if no errors
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

  const validateLastName = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();

    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Field is Required.";
    }

    // Check for trailing spaces first
    if (/\s$/.test(value)) {
      return "Spaces at the end are not allowed.";
    } else if (/^\s/.test(value)) {
      return "No Leading Space Allowed.";
    }

    // Ensure only alphabetic characters and spaces
    else if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
      return "Only Alphabetic Characters are Allowed.";
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

      // Check minimum character length after other validations
      if (trimmedValue.length < 1) {
        return "Minimum 1 Characters Required.";
      }
    }

    return true; // Return true if all conditions are satisfied
  };

  const validateFirstName = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();

    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Field is Required.";
    }

    // Check for trailing spaces first
    if (/\s$/.test(value)) {
      return "Spaces e at the end are not allowed.";
    } else if (/^\s/.test(value)) {
      return "No Leading Space Allowed.";
    }

    // Ensure only alphabetic characters and spaces
    else if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
      return "Only Alphabetic Characters are Allowed.";
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

      // Check minimum character length after other validations
      if (trimmedValue.length < 3) {
        return "Minimum 3 Characters Required.";
      }
    }

    return true; // Return true if all conditions are satisfied
  };

  const validateNumber = (value) => {
    // Check if the input is empty
    if (!value || value.trim().length === 0) {
      return true;
    }

    // Check if the value contains only digits
    if (!/^\d+$/.test(value)) {
      return "Only Numeric Characters Are Allowed.";
    }

    // Check if there are any leading or trailing spaces
    if (/^\s|\s$/.test(value)) {
      return "No Leading or Trailing Spaces Are Allowed.";
    }

    // Check for multiple spaces in between numbers
    if (/\s{2,}/.test(value)) {
      return "No Multiple Spaces Between Numbers Allowed.";
    }

    // Optionally: Check if the number is composed of repeating digits
    const isRepeating = /^(\d)\1{11}$/.test(value); // Check if all digits are the same (e.g., "111111111111")
    if (isRepeating) {
      return "The Number Cannot Consist Of The Same Digit Repeated.";
    }

    return true; // Return true if all validations pass
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

  // Function to handle keydown for specific actions (e.g., prevent multiple spaces)
  function handlePhoneNumberKeyDown(event) {
    let value = event.target.value;

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

  // In your component
  const dateOfHiring = watch("dateOfHiring"); // Use `watch` from react-hook-form

  const clearForm = () => {
    reset();
  };
  const backForm = () => {
    reset();
    navigate("/employeeView");
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
                  <a href="/employeeView">Employees</a>
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
                  {isUpdating ? "Employee Data" : "Employee Registration"}
                </h5>
                <div
                  className="dropdown-divider"
                  style={{ borderTopColor: "#d7d9dd" }}
                />
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row ">
                    {isUpdating ? (
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">
                          Employee Type <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Employee Type"
                          name="employeeType"
                          readOnly
                          {...register("employeeType", {
                            required: "Employee Type Required",
                            pattern: {
                              value: /^[A-Za-z ]+$/,
                              message:
                                "This field accepts only alphabetic characters",
                            },
                          })}
                        />
                        {errors.employeeType && (
                          <p className="errorMsg">
                            {errors.employeeType.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">
                          Employee Type <span style={{ color: "red" }}>*</span>
                        </label>
                        <Controller
                          name="employeeType"
                          control={control}
                          rules={{ required: "Employee Type is Required" }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={Employement}
                              value={field.value ? Employement.find((option) => option.value === field.value) : null}
                              onChange={(val) => field.onChange(val.value)}
                              placeholder="Select Employee Type"
                            />
                          )}
                        />
                        {errors.employeeType && (
                          <p className="errorMsg">
                            {errors.employeeType.message}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Employee Id <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type={isUpdating ? "text" : "text"}
                        readOnly={isUpdating}
                        className="form-control"
                        placeholder="Enter Employee Id"
                        name="employeeId"
                        minLength={1}
                        maxLength={20}
                        onKeyDown={handleEmailChange}
                        autoComplete="off"
                        {...register("employeeId", {
                          required: "Employee Id is Required",
                          pattern: {
                            value: /^(?=.*\d)[A-Z0-9]+$/,
                            message:
                              "These fields accepts only Integers and UpperCase Alphabets Characters",
                          },
                          minLength: {
                            value: 2,
                            message: "Minimum 2 Character Required",
                          },
                          maxLength: {
                            value: 20,
                            message: "not exceed 20 characters",
                          },
                        })}
                      />
                      {errors.employeeId && (
                        <p className="errorMsg">{errors.employeeId.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        First Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        readOnly={isUpdating}
                        className="form-control"
                        placeholder="Enter First Name"
                        name="firstName"
                        onInput={toInputTitleCase}
                        minLength={2}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("firstName", {
                          required: "First Name is Required",
                          maxLength: {
                            value: 150,
                            message: "Max lenght 150 Characters Exceeded.", // Maximum 150 characters
                          },
                          validate: {
                            validateFirstName,
                          },
                        })}
                      />
                      {errors.firstName && (
                        <p className="errorMsg">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Last Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Last Name"
                        name="lastName"
                        readOnly={isUpdating}
                        minLength={1}
                        onInput={toInputTitleCase}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("lastName", {
                          required: "Last Name is Required",
                          validate: { validateLastName },
                        })}
                      />
                      {errors.lastName && (
                        <p className="errorMsg">{errors.lastName.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Email Id <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type={isUpdating ? "email" : "email"}
                        readOnly={isUpdating}
                        className="form-control"
                        placeholder="Enter Email Id"
                        name="emailId"
                        autoComplete="off"
                        // onInput={toInputEmailCase}
                        onKeyDown={handleEmailChange}
                        {...register("emailId", {
                          required: "Email Id is Required",
                          pattern: {
                            value:
                              /^[a-z][a-zA-Z0-9._+-]*@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                            message: "Invalid Email Format",
                          },
                        })}
                      />
                      {errors.emailId && (
                        <p className="errorMsg">{errors.emailId.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Date of Joining <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type={isUpdating ? "date" : "date"}
                        readOnly={isUpdating}
                        name="dateOfHiring"
                        placeholder="Enter Hiring Date"
                        className="form-control"
                        autoComplete="off"
                        max={threeMonthsFromNow}
                        {...register("dateOfHiring", {
                          required: true,
                          validate: validateDate,
                        })}
                      />
                      {errors.dateOfHiring && (
                        <p className="errorMsg">
                          {errors.dateOfHiring.message ||
                            "Date of Joining is Required"}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Department <span style={{ color: "red" }}>*</span>
                      </label>
                      <Controller
                        name="department"
                        control={control}
                        defaultValue=""
                        rules={{ required: "Department is Required" }}
                        render={({ field }) => (
                          <select {...field} className="form-select">
                            <option value="" disabled>
                              Select Department
                            </option>
                            {departments.map((department) => (
                              <option key={department.id} value={department.id}>
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
                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                      <label className="form-label">
                        Designation <span style={{ color: "red" }}>*</span>
                      </label>
                      <Controller
                        name="designation"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <select {...field} className="form-select">
                            <option value="" disabled>
                              Select Designation
                            </option>
                            {designations.map((designation) => (
                              <option
                                key={designation.id}
                                value={designation.id}
                              >
                                {designation.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors && errors.designation && (
                        <p className="errorMsg">Designation is Required</p>
                      )}
                    </div>

                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Manager <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Manager"
                        onInput={toInputTitleCase}
                        autoComplete="off"
                        minLength={1}
                        onKeyDown={handleEmailChange}
                        {...register("manager", {
                          required: "Manager is Required",
                          maxLength: {
                            value: 150,
                            message: "Max lenght 150 Characters Exceeded.", // Maximum 150 characters
                          },
                          validate: {
                            validateFirstName,
                          },
                        })}
                      />
                      {errors.manager && (
                        <p className="errorMsg">{errors.manager.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Location <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Location"
                        //onInput={toInputTitleCase}
                        autoComplete="off"
                        minLength={2}
                        onKeyDown={handleEmailChange}
                        onInput={toInputAddressCase}
                        {...register("location", {
                          required: "Location is Required",
                          validate: validateLocation,
                          maxLength: {
                            value: 250,
                            message: "Maximum 250 Characters allowed",
                          },
                        })}
                      />
                      {errors.location && (
                        <p className="errorMsg">{errors.location.message}</p>
                      )}
                    </div>
                    {isUpdating && <div className="col-lg-1"></div>}
                    {isUpdating ? (
                      <></>
                    ) : (
                      <>
                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                          <label className="form-label">
                            Password <span style={{ color: "red" }}>*</span>
                          </label>
                          <div className="col-sm-12  password-input-container">
                            <input
                              className="form-control"
                              placeholder="Enter Password"
                              onChange={handlePasswordChange}
                              autoComplete="off"
                              onKeyDown={handleEmailChange}
                              maxLength={16}
                              type={passwordShown ? "text" : "password"}
                              {...register("password", {
                                required: "Password is Required",
                                validate: validatePassword,
                                minLength: {
                                  value: 6,
                                  message: "Minimum 6 Characters are Required",
                                },
                                maxLength: {
                                  value: 16,
                                  message: "Maximum 16 Characters!",
                                },
                              })}
                            />
                            <span
                              className={`bi bi-eye field-icon pb-1 toggle-password ${passwordShown ? "text-primary" : ""
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
                    {!isUpdating && <div className="col-lg-1"></div>}
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Date of Birth <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type={isUpdating ? "date" : "date"}
                        readOnly={isUpdating}
                        name="dateOfBirth"
                        placeholder="Enter Birth Date"
                        className="form-control"
                        autoComplete="off"
                        {...register("dateOfBirth", {
                          required: true,
                          validate: (value) =>
                            validateDateOfBirth(value, dateOfHiring), // Custom validation
                        })}
                        max={getCurrentDate()}
                        {...register("dateOfBirth", {
                          required: true,
                        })}
                      />
                      {errors.dateOfBirth && (
                        <p className="errorMsg">
                          {errors.dateOfBirth.message ||
                            "Date of Birth is Required"}
                        </p>
                      )}
                    </div>
                    {isUpdating && <div className="col-lg-1"></div>}
                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                      <label className="form-label">
                        Status <span style={{ color: "red" }}>*</span>
                      </label>
                      <Controller
                        name="status"
                        control={control}
                        defaultValue="Active"
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={
                              showNoticePeriodOption
                                ? [
                                  { value: "Active", label: "Active" },
                                  { value: "InActive", label: "InActive" },
                                  {
                                    value: "NoticePeriod",
                                    label: "Notice Period",
                                  }, // Show Notice Period
                                ]
                                : [
                                  { value: "Active", label: "Active" },
                                  { value: "InActive", label: "InActive" }, // Show only Active and InActive
                                ]
                            }
                            value={
                              field.value
                                ? { value: field.value, label: field.value }
                                : { value: "Active", label: "Active" }
                            }
                            onChange={(val) => field.onChange(val.value)}
                            placeholder="Select Status"
                          />
                        )}
                      />
                      {errors.status && (
                        <p className="errorMsg">Status is Required</p>
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
                                return "Mobile Number is Required.";
                              }
                              return true;
                            },
                            notRepeatingDigits: (value) => {
                              const isRepeating = /^(\d)\1{12}$/.test(value); // Check for repeating digits
                              return (
                                !isRepeating ||
                                "Mobile Number cannot consist of the same digit repeated."
                              );
                            },
                          },
                          pattern: {
                            value: /^\+91\s[6-9]\d{9}$/, // Ensure it starts with +91, followed by a space, and then 6-9 and 9 more digits
                            message: "Mobile Number is Required.",
                          },
                        })}
                      />
                      {errors.mobileNo && (
                        <p className="errorMsg">{errors.mobileNo.message}</p>
                      )}
                    </div>
                    <div className="card-header" style={{ paddingLeft: "0px" }}>
                      <h5 className="card-title ">Account Details</h5>
                      <div
                        className="dropdown-divider"
                        style={{ borderTopColor: "#d7d9dd" }}
                      />
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Bank Account Number{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Bank Account Number"
                        name="accountNo"
                        onInput={toInputSpaceCase}
                        onKeyDown={handleEmailChange}
                        maxLength={18}
                        autoComplete="off"
                        {...register("accountNo", {
                          required: "Bank Account Number is Required",
                          minLength: {
                            value: 9,
                            message: "Account Number Minimum 9 Digits Required",
                          },
                          maxLength: {
                            value: 18,
                            message: "Account Number must not exceed 18 Digits",
                          },
                          validate: {
                            // Check for trailing spaces first
                            noTrailingSpaces: (value) => {
                              const trimmedValue = value.trim(); // Removes leading/trailing spaces
                              if (value !== trimmedValue) {
                                return "Spaces at the end are not allowed"; // Custom message for trailing spaces
                              }
                              return true; // Return true if valid
                            },
                            // Check for repeating digits (check after the space validation)
                            notRepeatingDigits: (value) => {
                              const isRepeating = /^(\d)\1{9}$/.test(value); // Check for repeated digits
                              return (
                                !isRepeating ||
                                "Account Number cannot consist of the same digit repeated."
                              );
                            },
                            // Check if the value contains only digits and matches the pattern
                            pattern: (value) => {
                              const regex = /^\d{9,18}$/;
                              if (!regex.test(value)) {
                                return "Bank Account Number must only contain digits";
                              }
                              return true;
                            },
                          },
                        })}
                      />
                      {errors.accountNo && (
                        <p className="errorMsg">{errors.accountNo.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Bank IFSC Code <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Bank IFSC Code"
                        name="ifscCode"
                        onInput={toInputSpaceCase}
                        maxLength={11}
                        onKeyDown={handleEmailChange}
                        autoComplete="off"
                        {...register("ifscCode", {
                          required: "Bank IFSC Code is Required",
                          pattern: {
                            value: /^[A-Z]{4}0[0-9]{6}$/,
                            message: "Please enter a valid IFSC code ",
                          },
                          maxLength: {
                            value: 11,
                            message: "IFSC Code must not exceed 11 characters",
                          },
                        })}
                      />
                      {errors.ifscCode && (
                        <p className="errorMsg">{errors.ifscCode.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Bank Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Bank Name"
                        name="bankName"
                        onInput={toInputTitleCase}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("bankName", {
                          required: "Bank Name is Required",
                          validate: validateFirstName,
                          maxLength: {
                            value: 50,
                            message: "Maximum 50 Characters Required",
                          },
                        })}
                      // disabled={editMode}
                      />
                      {errors.bankName && (
                        <p className="errorMsg">{errors.bankName.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">UAN Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter UAN Number"
                        name="uanNo"
                        readOnly={isUpdating}
                        // onInput={toInputSpaceCase}
                        maxLength={12}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("uanNo", {
                          validate: validateNumber,
                          pattern: {
                            value: /^\d{12}$/,
                            message: "Only 12 digits are allowed.",
                          },
                          minLength: {
                            value: 12,
                            message: "Minimum 12 Digits Required",
                          },
                          maxLength: {
                            value: 12,
                            message: "UAN Number Must Not Exceed 12 Digits",
                          },
                        })}
                      />
                      {errors.uanNo && (
                        <p className="errorMsg">{errors.uanNo.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">PAN Number</label>
                      <input
                        type={isUpdating ? "text" : "text"}
                        readOnly={isUpdating}
                        className="form-control"
                        placeholder="Enter PAN Number"
                        name="panNo"
                        onInput={toInputSpaceCase}
                        maxLength={10}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("panNo", {
                          maxLength: {
                            value: 10,
                            message: "Pan Number must not exceed 10 Characters",
                          },
                          pattern: {
                            value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                            message: "Pan Number is Invalid Format",
                          },
                          validate: {
                            notRepeatingDigits: (value) => {
                              const isRepeating = /^(\d)\1{9}$/.test(value); // Check for repeated digits
                              return (
                                !isRepeating ||
                                " PAN cannot consist of the same digit repeated."
                              );
                            },
                          },
                        })}
                      />
                      {errors.panNo && (
                        <p className="errorMsg">{errors.panNo.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Aadhaar Number <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        readOnly={isUpdating}
                        className="form-control"
                        placeholder="Enter Aadhaar Number"
                        name="aadhaarId"
                        onInput={toInputSpaceCase}
                        autoComplete="off"
                        maxLength={12}
                        onKeyDown={handleEmailChange}
                        {...register("aadhaarId", {
                          required: "Aadhaar Number is Required",
                          pattern: {
                            value: /^\d{12}$/,
                            message: "Allows only Integers",
                          },
                          maxLength: {
                            value: 12,
                            message:
                              "Aadhar Number must not exceed 12 Characters",
                          },
                          validate: {
                            notRepeatingDigits: (value) => {
                              const isRepeating = /^(\d)\1{12}$/.test(value); // Check for repeated digits
                              return (
                                !isRepeating ||
                                "Aadhar Number cannot consist of the same digit repeated."
                              );
                            },
                          },
                        })}
                      />
                      {errors.aadhaarId && (
                        <p className="errorMsg">{errors.aadhaarId.message}</p>
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
                        {isUpdating ? "Update Employee" : "Add Employee"}{" "}
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

export default EmployeeRegistration;