import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import {
  AllowancesGetApi,
  CompanySalaryStructurePostApi,
  DeductionsGetApi,
} from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CompanySalaryStructure = () => {
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const [activeTab, setActiveTab] = useState("nav-home");
  const [allowanceFields, setAllowanceFields] = useState([
    { label: "", type: "text", value: "" },
  ]);
  const [deductionFields, setDeductionFields] = useState([
    { label: "", type: "text", value: "" },
  ]);
  const [isEditing, setIsEditing] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [allowanceError, setAllowanceError] = useState("");
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState("");
  const [selected, setSelected]=useState(false);
  const { user } = useAuth();
  const [fieldCheckboxes, setFieldCheckboxes] = useState({
    allowances: {},
    deductions: {},
  });
  const navigate = useNavigate();

  const addField = (fieldName) => {
    const newField = { label: fieldName, type: "text", value: "" };

    // Determine which fields to check based on the active tab
    const fieldsToCheck =
      activeTab === "nav-home" ? allowanceFields : deductionFields;
    const fieldExists = fieldsToCheck.some(
      (field) => field.label === fieldName
    );

    // If the field doesn't exist, add it
    if (!fieldExists) {
      if (activeTab === "nav-home") {
        setAllowanceFields((prev) => [...prev, newField]);
        setFieldCheckboxes((prev) => ({
          ...prev,
          allowances: { ...prev.allowances, [fieldName]: true },
        }));
      } else {
        setDeductionFields((prev) => [...prev, newField]);
        setFieldCheckboxes((prev) => ({
          ...prev,
          deductions: { ...prev.deductions, [fieldName]: true },
        }));
      }

      // Clear modal, error messages, and reset form
      setNewFieldName("");
      setShowModal(false);
      reset();
      setErrorMessage("");

      // Validation for the new field
      const validationErrorsCopy = { ...validationErrors };
      if (!newField.value || newField.value === "") {
        validationErrorsCopy[fieldName] = "Value is required";
      } else if (!/^\d+$/.test(newField.value)) {
        validationErrorsCopy[fieldName] = "This field accepts only Integers";
      } else {
        delete validationErrorsCopy[fieldName];
      }

      setValidationErrors(validationErrorsCopy);
    } else {
      // If the field already exists, show an error
      setErrorMessage(`Field "${fieldName}" already exists.`);
    }
  };

  const handleLabelChange = (index, value) => {
    const fields = activeTab === "nav-home" ? allowanceFields : deductionFields;
    const newFields = [...fields];
    newFields[index].label = value;
    if (activeTab === "nav-home") {
      setAllowanceFields(newFields);
    } else {
      setDeductionFields(newFields);
    }
  };

  const handleTypeChange = (index, value) => {
    const fields = activeTab === "nav-home" ? allowanceFields : deductionFields;
    const newFields = [...fields];
    newFields[index].type = value;
    if (activeTab === "nav-home") {
      setAllowanceFields(newFields);
    } else {
      setDeductionFields(newFields);
    }
  };

  /**Checkbox functionality */
  const handleCheckboxChange = (index) => {
    const fields = activeTab === "nav-home" ? allowanceFields : deductionFields;
    const fieldLabel = fields[index].label;

    // Update the checkbox selection state
    setFieldCheckboxes((prev) => {
      const newCheckboxes = {
        ...prev,
        [activeTab === "nav-home" ? "allowances" : "deductions"]: {
          ...prev[activeTab === "nav-home" ? "allowances" : "deductions"],
          [fieldLabel]:
            !prev[activeTab === "nav-home" ? "allowances" : "deductions"][
              fieldLabel
            ],
        },
      };

      // Get selected allowances and selected deductions
      const selectedAllowances = Object.entries(
        newCheckboxes.allowances
      ).filter(([key, value]) => value);
      const selectedDeductions = Object.entries(
        newCheckboxes.deductions
      ).filter(([key, value]) => value);

      // Calculate total percentage for selected allowances
      const totalAllowancePercentage = selectedAllowances
        .map(([key]) => allowanceFields.find((f) => f.label === key))
        .filter((field) => field.type === "percentage" && field.value)
        .reduce((total, field) => total + parseFloat(field.value), 0);

      // Calculate total percentage for selected deductions
      const totalDeductionPercentage = selectedDeductions
        .map(([key]) => deductionFields.find((f) => f.label === key))
        .filter((field) => field.type === "percentage" && field.value)
        .reduce((total, field) => total + parseFloat(field.value), 0);

      // Initialize error object
      let updatedErrors = { ...prev };

      // Check if total percentage for allowances exceeds 100%
      if (totalAllowancePercentage > 100) {
        updatedErrors = {
          ...updatedErrors,
          totalAllowancePercentage:
            "The total percentage for allowances cannot exceed 100%",
        };
      } else {
        // Clear the error message for allowances if the total is valid
        delete updatedErrors.totalAllowancePercentage;
      }

      // Check if total percentage for deductions exceeds 100%
      if (totalDeductionPercentage > 88) {
        updatedErrors = {
          ...updatedErrors,
          totalDeductionPercentage:
            "The total percentage for deductions cannot exceed 100%",
        };
      } else {
        // Clear the error message for deductions if the total is valid
        delete updatedErrors.totalDeductionPercentage;
      }

      // If there are any errors, return the previous state to prevent changing the checkbox state
      if (
        updatedErrors.totalAllowancePercentage ||
        updatedErrors.totalDeductionPercentage
      ) {
        setValidationErrors(updatedErrors);
        return prev; // Prevent state change if there's an error
      }

      // Clear the errors if everything is valid
      setValidationErrors(updatedErrors);

      // Return the updated state
      return newCheckboxes;
    });

    // Handle validation for the current field
    const isChecked =
      !fieldCheckboxes[activeTab === "nav-home" ? "allowances" : "deductions"][
        fieldLabel
      ];
    if (isChecked) {
      validateField(fields[index]);
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldLabel];
        return newErrors;
      });
    }
  };

  const validateField = (field) => {
    const errors = { ...validationErrors };

    if (field.value === "") {
      errors[field.label] = "Value is Required";
    } else if (!/^\d+$/.test(field.value)) {
      errors[field.label] = "This field accepts only Integers";
    } else {
      delete errors[field.label];
    }
    setValidationErrors(errors);
  };

  const fetchAllowances = async () => {
    try {
      const response = await AllowancesGetApi();
      const allowancesData = response.data;
      const filteredAllowances = allowancesData.filter(
        (allowance) => allowance !== "Provident Fund Employer"
      );

      setAllowances(filteredAllowances);
      setAllowanceFields(
        filteredAllowances.map((allowance) => ({
          label: allowance,
          type: "text",
          value: "",
        }))
      );
      setFieldCheckboxes((prev) => ({
        ...prev,
        allowances: allowancesData.reduce((acc, allowance) => {
          acc[allowance] = false;
          return acc;
        }, {}),
      }));
    } catch (error) {
      console.error("API fetch error:", error);
    }
  };

  useEffect(() => {
    fetchAllowances();
  }, []);

  const fetchDeductions = async () => {
    try {
      const response = await DeductionsGetApi();
      const deductionsData = response.data;
      const filteredDeductions = deductionsData.filter(
        (deduction) =>
          deduction !== "Provident Fund Employee" &&
          deduction !== "Provident Fund Employer"
      );
      setDeductions(filteredDeductions);
      setDeductionFields(
        filteredDeductions.map((deduction) => ({
          label: deduction,
          type: "text",
          value: "",
        }))
      );
      setFieldCheckboxes((prev) => ({
        ...prev,
        deductions: deductionsData.reduce((dcc, deduction) => {
          dcc[deduction] = false;
          return dcc;
        }, {}),
      }));
    } catch (error) {
      console.error("API fetch error:", error);
    }
  };

  useEffect(() => {
    fetchDeductions();
  }, []);

  const handleValueChange = (index, value) => {
    const fields = activeTab === "nav-home" ? allowanceFields : deductionFields;
    const newFields = [...fields];
    newFields[index].value = value;
    if (activeTab === "nav-home") {
      setAllowanceFields(newFields);
    } else {
      setDeductionFields(newFields);
    }
  };

  const onSubmit = async () => {
    const jsonData = {
      companyName: user.company,
      status: "Active",
      allowances: {},
      deductions: {
        "Provident Fund Employee": "6%", // Changed key here
        "Provident Fund Employer": "6%", // Changed key here
      },
    };

    // Get selected allowances and deductions
    const selectedAllowances = allowanceFields.filter(
      (field) => fieldCheckboxes.allowances[field.label]
    );
    const selectedDeductions = deductionFields.filter(
      (field) => fieldCheckboxes.deductions[field.label]
    );

    // Validation: Check if any selected allowance or deduction has an empty value
    const errors = {};

    selectedAllowances.forEach((field) => {
      if (!field.value) {
        errors[field.label] = "Value is required for selected allowance.";
      }
    });

    selectedDeductions.forEach((field) => {
      if (!field.value) {
        errors[field.label] = "Value is required for selected deduction.";
      }
    });

    // Validation: Check if the total percentage for allowances exceeds 100%
    const totalAllowancePercentage = selectedAllowances
      .map((field) => {
        // Ensure the field exists before trying to access its properties
        const foundField = allowanceFields.find((f) => f.label === field.label);
        return foundField ? foundField : null; // If field is found, return it, otherwise return null
      })
      .filter((field) => field && field.value) // Ensure the field has a value
      .reduce((total, field) => {
        // Check if the field is Basic Salary or HRA and treat them as percentages
        if (field.label === "Basic Salary" || field.label === "HRA") {
          return total + (parseFloat(field.value) || 0); // Add the percentage directly if the value is numeric
        } else if (field.type === "percentage") {
          return total + parseFloat(field.value); // Add percentage values for other fields
        }
        return total;
      }, 0);

    if (totalAllowancePercentage > 100) {
      errors.totalAllowancePercentage =
        "The total percentage for allowances cannot exceed 100%. Please Adjust";
    }

    // Validation: Check if the total percentage for deductions exceeds 100%
    const totalDeductionPercentage = selectedDeductions
      .map((field) => {
        // Ensure the field exists before trying to access its properties
        const foundField = deductionFields.find((f) => f.label === field.label);
        return foundField ? foundField : null; // If field is found, return it, otherwise return null
      })
      .filter((field) => field && field.type === "percentage" && field.value)
      .reduce((total, field) => total + parseFloat(field.value), 0);

    if (totalDeductionPercentage > 88) {
      errors.totalDeductionPercentage =
        "The total percentage for deductions cannot exceed 100%. Please Adjust";
    }

    // If there are validation errors, show them and prevent submission
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors); // Set validation errors to state
      return; // Prevent form submission
    }

    // Populate the allowances and deductions data for submission
    selectedAllowances.forEach((field) => {
      if (field.label && field.value) {
        if (field.label === "Basic Salary" || field.label === "HRA") {
          // For Basic Salary and HRA, store as percentage value (e.g., "50%")
          jsonData.allowances[field.label] = `${field.value}%`;
        } else {
          // For other fields, store based on their type (percentage or value)
          jsonData.allowances[field.label] =
            field.type === "percentage" ? `${field.value}%` : field.value;
        }
      }
    });

    selectedDeductions.forEach((field) => {
      if (field.label && field.value) {
        jsonData.deductions[field.label] =
          field.type === "percentage" ? `${field.value}%` : field.value;
      }
    });

    console.log("Submitting data:", jsonData);

    try {
      // Submit the data to the backend
      await CompanySalaryStructurePostApi(jsonData);

      // If submission is successful, show a success message
      toast.success("Salary structure submitted successfully");

      // Reset the form, navigate, or reload as needed
      reset();
      setTimeout(() => {
        window.location.href = "/companySalaryView";
      }, 2000);
    } catch (error) {
      if (error.response) {
        console.error("Error response from backend:", error.response.data);
        toast.error(
          `Error: ${error.response.data.message || "An error occurred"}`
        );
      } else {
        console.error("Fetch error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const clearForm = () => {
    reset();
    navigate("/companySalaryView");
  };

  const handleCloseNewFieldModal = () => {
    setNewFieldName("");
    setShowModal(false);
    reset();
    setErrorMessage("");
  };

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
    // Capitalize first letter of each word & keep others as user typed
  const words = value.split(" ");
  const formattedValue = words.map((word) =>
    word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ""
  ).join(" ");
  // Trim multiple spaces after the first 3 characters
  let finalValue = formattedValue.length > 3
    ? formattedValue.slice(0, 3) + formattedValue.slice(3).replace(/\s+/g, " ")
    : formattedValue;
    input.value = finalValue;
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  const handleKeyDown = async (e) => {
    // Check if the key pressed is "Enter"
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default form submission

      // Trigger validation for the field
      const isValid = await trigger("fieldName");

      // If validation passes, save the data
      if (isValid) {
        const fieldName = getValues("fieldName");
        addField(fieldName); // Call your function to save the data
      }
    }
  };

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

  const isSubmitEnabled = () => {
    const hasSelectedAllowance = allowanceFields.some(
      (field, index) => fieldCheckboxes.allowances[field.label]
    );
    return hasSelectedAllowance;
  };

  const handleTabChange = (tab) => {
    // Check for the allowances errors
    if (tab === "nav-profile") {
      // Ensure at least one allowance is selected
      if (
        Object.values(fieldCheckboxes.allowances).every((checkbox) => !checkbox)
      ) {
        setSelected(true);
        setAllowanceError("Please select Allowances.");
        return; // Prevent changing the tab if no allowances are selected
      }
      // Clear the allowance error if everything is valid
      setAllowanceError("");
      setSelected(false)
    }

    // Check for the deductions errors if navigating to the deductions tab
    if (tab === "nav-home") {
      // Check if the total percentage for deductions exceeds 100%
      const selectedDeductions = Object.entries(
        fieldCheckboxes.deductions
      ).filter(([key, value]) => value);
      const totalDeductionPercentage = selectedDeductions
        .map(([key]) => deductionFields.find((f) => f.label === key))
        .filter((field) => field.type === "percentage" && field.value)
        .reduce((total, field) => total + parseFloat(field.value), 0);

      if (totalDeductionPercentage > 88) {
        setValidationErrors({
          totalDeductionPercentage:
            "The total percentage for deductions cannot exceed 100%. Please Adjust",
        });
        return; // Prevent changing the tab if deduction percentage exceeds 100%
      }
    }

    // Clear the validation errors if everything is valid
    setValidationErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors.totalAllowancePercentage;
      delete newErrors.totalDeductionPercentage;
      return newErrors;
    });

    // Allow tab change if there are no errors
    setActiveTab(tab);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Salary Structure</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Salary Structure</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="container">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card">
              <div className="card-header">
                <div className="card-title" style={{ marginBottom: "0px" }}>
                  Company Salary Structure
                </div>
              </div>
              {validationErrors.totalAllowancePercentage && (
                <div
                  className="col-12 mt-2"
                  style={{ marginLeft: "60px", marginRight: "16px" }}
                >
                  <div
                    className="alert alert-danger"
                    style={{ marginRight: "75px" }}
                  >
                    {validationErrors.totalAllowancePercentage}
                  </div>
                </div>
              )}
              {validationErrors.totalDeductionPercentage && (
                <div
                  className="col-12 mt-2"
                  style={{ marginLeft: "60px", marginRight: "16px" }}
                >
                  <div
                    className="alert alert-danger"
                    style={{ marginRight: "75px" }}
                  >
                    {validationErrors.totalDeductionPercentage}
                  </div>
                </div>
              )}
              <div className="card-body">
                <nav className="companyNavOuter">
                  <div className="nav nav-tabs" id="nav-tab" role="tablist">
                    <button
                      type="button"
                      className={`nav-link ${
                        activeTab === "nav-home" ? "active" : ""
                      }`}
                      onClick={() => handleTabChange("nav-home")}
                    >
                      Allowances
                    </button>
                    <button
                      type="button"
                      className={`nav-link ${
                        activeTab === "nav-profile" ? "active" : ""
                      }`}
                      onClick={() => handleTabChange("nav-profile")}
                    >
                      Deductions
                    </button>
                    {selected &&
                    (
                      <span className="m-2 text-danger">{allowanceError}</span>
                    )}
                  </div>
                </nav>
                <div
                  className="tab-content companyTabContent"
                  id="nav-tabContent"
                >
                  {/* Allowance Tab */}
                  <div
                    className={`tab-pane fade ${
                      activeTab === "nav-home" ? "show active" : ""
                    }`}
                    id="nav-home"
                    role="tabpanel"
                  >
                    {allowanceFields.map((field, index) => (
                      <div className="row bbl ptb25" key={index}>
                        <div className="col-auto mt-2">
                          <input
                            type="checkbox"
                            checked={
                              fieldCheckboxes.allowances[field.label] || false
                            }
                            onChange={() => handleCheckboxChange(index)}
                          />
                        </div>
                        <div className="col-sm-3">
                          <input
                            type="text"
                            className="form-control"
                            readOnly
                            value={field.label}
                            onChange={(e) =>
                              handleLabelChange(index, e.target.value)
                            }
                            placeholder="Label Name"
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-sm-3">
                          <select
                            className="form-select"
                            value={
                              field.label === "Basic Salary" ||
                              field.label === "HRA"
                                ? "percentage"
                                : field.type
                            }
                            onChange={(e) => {
                              if (
                                field.label !== "Basic Salary" &&
                                field.label !== "HRA"
                              ) {
                                handleTypeChange(index, e.target.value);
                              }
                            }}
                            disabled={
                              !isEditing ||
                              field.label === "Basic Salary" ||
                              field.label === "HRA"
                            }
                          >
                            <option value="percentage">%</option>
                            <option value="text">₹</option>
                          </select>
                        </div>
                        <div className="col-sm-3">
                          <input
                            type="text"
                            className="form-control"
                            value={field.value}
                            onInput={toInputSpaceCase}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              if (field.type === "percentage") {
                                if (/^\d{0,2}$/.test(newValue)) {
                                  handleValueChange(index, newValue);
                                }
                              } else {
                                handleValueChange(index, newValue);
                              }
                              validateField({ ...field, value: newValue });
                            }}
                            placeholder="Enter Value"
                            disabled={
                              !fieldCheckboxes.allowances[field.label] ||
                              !isEditing
                            }
                            maxLength={
                              field.label === "Basic Salary" ||
                              field.label === "HRA"
                                ? 2
                                : 7
                            }
                            data-bs-toggle="tooltip"
                            title={
                              !fieldCheckboxes.allowances[field.label]
                                ? "Please select checkbox"
                                : ""
                            }
                          />
                          {validationErrors[field.label] && (
                            <div className="text-danger">
                              {validationErrors[field.label]}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="btn btn-primary mt-4"
                    >
                      Add Field
                    </button>
                  </div>
                  {/* Deduction Tab */}
                  <div
                    className={`tab-pane fade ${
                      activeTab === "nav-profile" ? "show active" : ""
                    }`}
                    id="nav-profile"
                    role="tabpanel"
                  >
                    <div className="row bbl ptb25">
                      <div className="col-auto mt-2">
                        <input type="checkbox" checked={true} />
                      </div>
                      <div className="col-sm-3">
                        <input
                          type="text"
                          className="form-control"
                          readOnly
                          value="Provident Fund Employee"
                          onChange={(e) =>
                            handleLabelChange(
                              "Provident Fund Employee",
                              e.target.value
                            )
                          }
                          placeholder="Label Name"
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="col-sm-3">
                        <input
                          className="form-control"
                          value="%"
                          onChange={() => {}}
                          readOnly
                          disabled={!isEditing}
                        ></input>
                      </div>
                      <div className="col-sm-3">
                        <input
                          type="text"
                          className="form-control"
                          value={6}
                          onChange={(e) =>
                            handleValueChange(
                              "Provident Fund Employee",
                              e.target.value
                            )
                          }
                          placeholder="Enter Value"
                          disabled={
                            !fieldCheckboxes.deductions[
                              "Provident Fund Employee"
                            ] || !isEditing
                          }
                        />
                      </div>
                    </div>

                    <div className="row bbl ptb25">
                      <div className="col-auto mt-2">
                        <input type="checkbox" checked={true} />
                      </div>
                      <div className="col-sm-3">
                        <input
                          type="text"
                          className="form-control"
                          readOnly
                          value="Provident Fund Employer"
                          onChange={(e) =>
                            handleLabelChange(
                              "Provident Fund Employer",
                              e.target.value
                            )
                          }
                          placeholder="Label Name"
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="col-sm-3">
                        <input
                          className="form-control"
                          value="%"
                          onChange={() => {}}
                          readOnly
                          disabled={!isEditing}
                        ></input>
                      </div>
                      <div className="col-sm-3">
                        <input
                          type="text"
                          className="form-control"
                          value={6}
                          onChange={(e) =>
                            handleValueChange(
                              "Provident Fund Employer",
                              e.target.value
                            )
                          }
                          placeholder="Enter Value"
                          disabled={
                            !fieldCheckboxes.deductions[
                              "Provident Fund Employer"
                            ] || !isEditing
                          }
                        />
                      </div>
                    </div>

                    {/* Dynamically Added Deduction Fields */}
                    {deductionFields.map((field, index) => {
                      const isChecked =
                        fieldCheckboxes.deductions[field.label] || false;
                      return (
                        <div className="row bbl ptb25" key={index}>
                          {/* Checkbox Field */}
                          <div className="col-auto mt-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(index)} // Handle checkbox change
                            />
                          </div>

                          {/* Label Field */}
                          <div className="col-sm-3">
                            <input
                              type="text"
                              className="form-control"
                              readOnly
                              value={field.label}
                              onChange={(e) =>
                                handleLabelChange(index, e.target.value)
                              }
                              disabled={!isEditing} // Allow edit only in editing mode
                            />
                          </div>

                          {/* Type Field */}
                          <div className="col-sm-3">
                            <select
                              className="form-select"
                              value={field.type}
                              onChange={(e) =>
                                handleTypeChange(index, e.target.value)
                              }
                              disabled={!isEditing || !isChecked} // Disable only if not checked
                            >
                              <option value="percentage">%</option>
                              <option value="text">₹</option>
                            </select>
                          </div>

                          {/* Value Field */}
                          <div className="col-sm-3">
                            <input
                              type="text"
                              className="form-control"
                              value={field.value}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                if (field.type === "percentage") {
                                  if (/^\d{0,2}$/.test(newValue)) {
                                    handleValueChange(index, newValue);
                                  }
                                } else {
                                  handleValueChange(index, newValue);
                                }
                                validateField({ ...field, value: newValue });
                              }}
                              placeholder="Enter Value"
                              disabled={!isEditing || !isChecked} // Disable instead of hiding
                              maxLength={7}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="btn btn-primary mt-4"
                    >
                      Add Field
                    </button>
                  </div>
                </div>
                <div
                  className="row col-12 mt-3 align-items-center"
                  style={{ marginLeft: "65%" }}
                >
                  {/* <div className="col-6">
                    <div className="row d-flex flex-column">
                      <label className="form-label mb-0">Status: {errors.status && <p className="errorMsg text-danger">Status is required</p>}
                      </label>
                      <Controller
                        name="status"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={[
                              { value: "Active", label: "Active" },
                              { value: "InActive", label: "InActive" },
                            ]}
                            value={
                              field.value
                                ? { value: field.value, label: field.value }
                                : null
                            }
                            onChange={(val) => field.onChange(val.value)}
                            isDisabled={!isSubmitEnabled()}
                            placeholder="Select Status"
                          />
                        )}
                      />
                    </div>
                  </div> */}
                  <div className="col-4 text-end">
                    <button
                      type="button"
                      onClick={clearForm}
                      className="btn btn-secondary me-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!isSubmitEnabled()}
                    >
                      Submit All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        {showModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fade modal show"
            tabIndex="-1"
            style={{ zIndex: "9999", display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <ModalHeader>
                  <ModalTitle className="modal-title">Add New Field</ModalTitle>
                  <button
                    type="button"
                    className="btn-close" // Bootstrap's close button class
                    aria-label="Close"
                    onClick={handleCloseNewFieldModal} // Function to close the modal
                  ></button>
                </ModalHeader>
                <ModalBody>
                  <form>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter New Field Name"
                            onInput={toInputTitleCase}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                            {...register("fieldName", {
                              required: "Field name is required",
                              pattern: {
                                value: /^[A-Za-z\s&-]+$/, // Only alphabetic characters and spaces allowed
                                message:
                                  "This field accepts only alphabetic characters",
                              },
                              minLength: {
                                value: 2,
                                message: "Minimum 2 characters required",
                              },
                              maxLength: {
                                value: 40,
                                message: "Maximum 40 characters required",
                              },
                              validate: {
                                // Custom validation for trailing spaces
                                noTrailingSpaces: (value) => {
                                  if (/\s$/.test(value)) {
                                    // Check for spaces at the end
                                    return "Spaces at the end are not allowed"; // Error message
                                  }
                                  return true; // Validation passes
                                },
                              },
                            })}
                          />
                          {(errors.fieldName || errorMessage) && (
                            <p className="errorMsg text-danger">
                              {errors.fieldName?.message || errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={async () => {
                          const isValid = await trigger("fieldName");

                          if (!isValid) {
                            return;
                          }

                          const fieldName = getValues("fieldName");
                          addField(fieldName);
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCloseNewFieldModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </ModalBody>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayOut>
  );
};

export default CompanySalaryStructure;
