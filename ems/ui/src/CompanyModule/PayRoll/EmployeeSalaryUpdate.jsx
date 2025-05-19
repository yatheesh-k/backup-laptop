import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import LayOut from "../../LayOut/LayOut";
import {
  EmployeeSalaryGetApiById,
  EmployeeSalaryPatchApiById,
} from "../../Utils/Axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "../../Context/AuthContext";

const EmployeeSalaryUpdate = () => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const salaryId = queryParams.get("salaryId");
  const id = queryParams.get("employeeId");
  const [totalTax, setTotalTax] = useState("");
  const [salaryStructure, setSalaryStructure] = useState(0);
  const [allowances, setAllowances] = useState({});
  const [incomeTax, setIncomeTax] = useState(0);
  const [deductions, setDeductions] = useState({});
  const [grossAmount, setGrossAmount] = useState(0);
  const [totalAllowances, setTotalAllowances] = useState({});
  const [totalDeductions, setTotalDeductions] = useState({});
  const [netSalary, setNetSalary] = useState(0);
  const [hra, setHra] = useState(0);
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [lossOfPayPerDay, setLossOfPayPerDay] = useState(0);
  const [showFields, setShowFields] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [variableAmount, setVariableAmount] = useState(0);
  const [fixedAmount, setFixedAmount] = useState(0);
  const [pfTax, setPfTax] = useState(0);
  const [pfEmployee, setPfEmployee] = useState(0);
  const [pfEmployer, setPfEmployer] = useState(0);
  const [travelAllowance, setTravelAllowance] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Active");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [showCards, setShowCards] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const debounceTimerRef = useRef(null);

  const backForm = () => {
    reset();
    navigate(`/employeeSalaryList?id=${id}`);
  };

  useEffect(() => {
    if (id && salaryId) {
      setShowFields(true);
    } else {
      setShowFields(false);
    }
  }, [id, salaryId]);

  useEffect(() => {
    if (id && salaryId) {
      // Fetch employee salary data first
      EmployeeSalaryGetApiById(id, salaryId)
        .then((response) => {
          const data = response.data.data;

          // Handle the employee salary details
          if (data) {
            setEmployeeId(data.employeeId);
            setFixedAmount(parseFloat(data.fixedAmount));
            setVariableAmount(parseFloat(data.variableAmount));
            setGrossAmount(parseFloat(data.grossAmount));
            setPfTax(parseFloat(data.pfTax));
            setIncomeTax(parseFloat(data.incomeTax));
            setStatus(data.status || "");
            setValue("status", data.status || "");
            setShowFields(true);
            setShowCards(true);
            setIsUpdating(true);
            setIsReadOnly(data.status === "InActive"); // Disable fields if salary status is InActive
            calculateAllowances(); // Custom function to calculate allowances, if needed
          }

          // Now, fetch salary structures using the salaryId
          return EmployeeSalaryGetApiById(id, salaryId); // Reuse the same API or make a new call as needed
        })
        .then((response) => {
          const salaryData = response?.data?.data;

          // Log the API response structure for debugging
          console.log("API Response for Salary Structure:", response);

          // Ensure that the salary data exists and has the necessary structure
          if (
            !salaryData ||
            typeof salaryData !== "object" ||
            Object.keys(salaryData).length === 0
          ) {
            setError("Employee Salary Structure is not defined");
            setSalaryStructure([]); // Clear salary structure if data is invalid
            return; // Exit early to avoid further errors
          }

          // Extract allowances and deductions from the response
          const { salaryConfigurationEntity, status } = salaryData;
          const { allowances, deductions } = salaryConfigurationEntity;

          // Ensure that the status is "Active" before processing
          if (status === "Active" || status === "InActive") {
            setSalaryStructure([salaryData]); // Set the salary structure
            setAllowances(allowances); // Set the allowances
            setDeductions(deductions); // Set the deductions
            setError(""); // Clear error if everything is valid
          } else {
            setError("Employee Salary Structure is not active");
          }
        })
        .catch((error) => {
          setError("Error fetching employee salary data.");
          console.error("API fetch error:", error); // Log the error for debugging
        })
        .finally(() => {
          setLoading(false); // Set loading to false after the fetch is complete
        });
    } else {
      setShowCards(false); // If id or salaryId is not present, hide the cards
    }
  }, [id, salaryId, setValue]); // Dependencies: re-run effect when `id` or `salaryId` changes

  const calculateTotalDeductions = () => {
    let total = 0;
    Object.entries(deductions).forEach(([key, value]) => {
      if (value.endsWith("%")) {
        const parsedValue = parseFloat(value.slice(0, -1));
        const percentageValue = (parsedValue / 100) * (grossAmount || 0);
        total += percentageValue;
      } else {
        total += parseFloat(value) || 0;
      }
    });
    return total;
  };

  const calculateTotalAllowances = () => {
    let total = 0;
    Object.entries(allowances).forEach(([key, value]) => {
      if (key !== "Other Allowances") {
        if (value.endsWith("%")) {
          const parsedValue = parseFloat(value.slice(0, -1));
          const percentageValue = (parsedValue / 100) * (grossAmount || 0);
          total += percentageValue;
        } else {
          total += parseFloat(value) || 0;
        }
      }
    });
    return total;
  };

  const handleAllowanceChange = (key, newValue) => {
    let validValue = newValue;
    const isPercentage = newValue.includes("%");
    let errorMessage = "";

    // Check for non-numeric characters (excluding the '%' symbol)
    if (!isPercentage && /[^0-9.-]/.test(newValue)) {
      errorMessage = "Only numeric values are allowed.";
    }

    // Handle percentage-specific validation
    if (isPercentage) {
      validValue = newValue.replace(/[^0-9%]/g, "");
      if (validValue.includes("%")) {
        const digitsBeforePercentage = validValue.split("%")[0].slice(0, 2);
        validValue = digitsBeforePercentage + "%";
      }
      if (validValue.length > 4) {
        errorMessage =
          "Percentage value should have up to 2 digits before '%'.";
      }
    } else {
      if (validValue.length > 10) {
        errorMessage = "Numeric value cannot exceed 10 digits.";
      }
      if (parseFloat(validValue) < 0) {
        errorMessage = "Allowance value cannot be negative.";
      }
    }

    // Update the allowances state only if there's no error
    if (!errorMessage) {
      setAllowances((prevAllowances) => ({
        ...prevAllowances,
        [key]: validValue,
      }));
    }

    // Only update the error message if there's an error
    setErrorMessage(errorMessage);
  };

  // For useRef debouncing and preventing the blinking:
  const inputValueRef = useRef("");

  const handleChangeWithDebounce = (key, newValue) => {
    // Cancel the previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      handleAllowanceChange(key, newValue);
    }, 500); // Debounce delay in milliseconds
  };

  useEffect(() => {
    const totalAllow = calculateTotalAllowances();
    const newOtherAllowances = grossAmount - totalAllow;
    // Check for errors
    if (newOtherAllowances < 0) {
      setErrorMessage(
        "Total allowances exceed gross amount. Please adjust allowances."
      );
      setIsSubmitDisabled(true); // Disable the button
    } else {
      setErrorMessage(""); // Clear error message if valid
      setIsSubmitDisabled(false); // Enable the button
    }

    // Update total allowances
    const validOtherAllowances = Math.max(0, newOtherAllowances);
    setTotalAllowances(totalAllow + validOtherAllowances);

    setAllowances((prevAllowances) => ({
      ...prevAllowances,
      "Other Allowances": validOtherAllowances.toFixed(2),
    }));
  }, [allowances, grossAmount]);

  const handleDeductionChange = (key, value) => {
    // Block alphabetic characters
    if (/[a-zA-Z]/.test(value)) {
      setErrorMessage("Alphabetic characters are not allowed.");
      return; // Prevent the change if any alphabet is detected
    }
    // Ensure '%' is only allowed at the end and no characters are added after it
    if (value.includes("%")) {
      // Check if there are any characters after the '%' symbol
      if (value.indexOf("%") !== value.length - 1) {
        setErrorMessage("No values are allowed after '%'.");
        return; // Prevent input if there's anything after '%'
      }
    }
    // If there's a percentage symbol at the end, validate the percentage logic
    if (value.endsWith("%")) {
      const numericValue = value.slice(0, -1); // Remove '%' symbol to check the number part
      if (numericValue && parseFloat(numericValue) > 100) {
        setErrorMessage("Percentage value cannot exceed 100%.");
        return; // Prevent the change if the value exceeds 100%
      }
      if (value.length > 4) {
        setErrorMessage(
          "Percentage value cannot exceed 4 characters (including '%')."
        );
        return; // Prevent the change if the length exceeds 4 characters (like 100%)
      }
      // Check for negative percentage values
      if (numericValue.startsWith("-")) {
        setErrorMessage("Percentage value cannot be negative.");
        return; // Prevent the change if the value is negative
      }
    }
    // Validation for numeric values (without '%')
    if (!value.endsWith("%")) {
      const numericValue = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
      if (numericValue.length > 10) {
        setErrorMessage("Numeric value cannot exceed 10 digits.");
        return; // Prevent further input if the length exceeds 10 digits
      }
      if (parseFloat(value) < 0) {
        setErrorMessage("Deduction value cannot be negative.");
        return; // Prevent deduction if value is negative
      }
    }
    // Clear error message if no issues
    setErrorMessage("");
    // Update the deductions state
    const newDeductions = { ...deductions, [key]: value };
    setDeductions(newDeductions);
  };

  useEffect(() => {
    const totalDed = calculateTotalDeductions();
    setTotalDeductions(totalDed);
  }, [deductions, grossAmount]);

  //Calculate total allowances when allowances or grossAmount change
  useEffect(() => {
    const totalAllow = calculateTotalAllowances();
    const newOtherAllowances = grossAmount - totalAllow;

    // Check for errors and set the error message accordingly
    if (newOtherAllowances < 0) {
      setErrorMessage(
        "Total allowances exceed gross amount. Please adjust allowances."
      );
    } else {
      setErrorMessage(""); // Clear error message if valid
    }

    // Update total allowances only if valid
    const validOtherAllowances = Math.max(0, newOtherAllowances);
    setTotalAllowances(totalAllow + validOtherAllowances);

    // Update//// other allowances
    setAllowances((prevAllowances) => ({
      ...prevAllowances,
      "Other Allowances": validOtherAllowances.toFixed(2),
    }));
  }, [allowances, grossAmount]);

  const calculateAllowances = () => {
    calculateTotalAllowances();
    calculateTotalDeductions();
    setShowCards(true);
  };

  const calculateNetSalary = () => {
    const net = totalAllowances - (totalDeductions + totalTax);
    setNetSalary(net);
  };

  useEffect(() => {
    calculateNetSalary();
  }, [totalAllowances, totalDeductions, totalTax]);

  useEffect(() => {
    if (salaryId && id) {
      setValue("variableAmount", variableAmount);
      setValue("fixedAmount", fixedAmount);
      setValue("hra", hra);
      setValue("travelAllowance", travelAllowance);
      setValue("pfEmployee", pfEmployee);
      setValue("pfEmployer", pfEmployer);
      // Update other values as necessary
    }
  }, [
    variableAmount,
    fixedAmount,
    hra,
    travelAllowance,
    pfEmployee,
    pfEmployer,
    salaryId,
    id,
    setValue,
  ]);

  const handleApiErrors = (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error &&
      error.response.data.error.message
    ) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error !");
    }
    console.error(error.response);
  };

  useEffect(() => {
    const newGrossSalary = variableAmount + fixedAmount;
    setGrossAmount(newGrossSalary);
  }, [variableAmount, fixedAmount]);

  useEffect(() => {
    const monthlySalaryValue = parseFloat(grossAmount || 0) / 12;
    setMonthlySalary(monthlySalaryValue.toFixed(2));

    const workingDaysPerMonth = 30;
    const lopPerDayValue = monthlySalaryValue / workingDaysPerMonth;
    setLossOfPayPerDay(lopPerDayValue.toFixed(2));
  }, [grossAmount]);

  const companyName = user.company;
  const onSubmit = (data) => {
    // Check if there's an error related to salary structures
    if (error) {
      toast.error(error); // Display the error message using toast
      return; // Exit if there's an error
    }

    // If no error, proceed with the form submission logic
    const fixedAmount = parseFloat(data.fixedAmount) || 0;
    const variableAmount = parseFloat(data.variableAmount) || 0;
    const grossAmountValue = parseFloat(grossAmount) || 0;
    const totalEarningsValue = parseFloat(totalAllowances) || 0;
    const netSalaryValue = parseFloat(netSalary) || 0;
    const totalDeductionsValue = parseFloat(totalDeductions) || 0;
    const pfTaxValue = parseFloat(pfTax) || 0;
    const incomeTax = data.incomeTax;
    const statusValue = data.status;

    // Check if variableAmount, fixedAmount, and grossAmount are all 0
    if (variableAmount === 0 && fixedAmount === 0 && grossAmountValue === 0) {
      return; // Exit if all amounts are zero
    }

    // Construct the allowances and deductions objects
    const allowancesData = {};
    const deductionsData = {};

    Object.entries(allowances).forEach(([key, value]) => {
      allowancesData[key] = value;
    });

    Object.entries(deductions).forEach(([key, value]) => {
      deductionsData[key] = value;
    });

    const dataToSubmit = {
      companyName: companyName,
      fixedAmount: fixedAmount.toFixed(2),
      variableAmount: variableAmount.toFixed(2),
      grossAmount: grossAmountValue.toFixed(2),
      salaryConfigurationRequest: {
        allowances: allowancesData,
        deductions: deductionsData,
      },
      totalEarnings: totalEarningsValue.toFixed(2),
      netSalary: netSalaryValue.toFixed(2),
      totalDeductions: totalDeductionsValue.toFixed(2),
      pfTax: pfTaxValue.toFixed(2),
      incomeTax: incomeTax,
      status: statusValue,
    };
    const apiCall = () =>
      EmployeeSalaryPatchApiById(employeeId, salaryId, dataToSubmit);

    apiCall()
      .then((response) => {
        toast.success("Employee Salary Updated Successfully");
        setError(""); // Clear error message on success
        setShowFields(false);
        navigate("/employeeview");
      })
      .catch((error) => {
        handleApiErrors(error);
      });
  };

  const handlePfTaxChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setPfTax(value);
  };

  // Handle changes for Income tax
  const handleIncomeTaxChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setIncomeTax(value);
  };

  useEffect(() => {
    calculateTotalTax();
  }, [pfTax, incomeTax]);

  const calculateTotalTax = () => {
    const newTotalTax = pfTax + incomeTax;
    setTotalTax(newTotalTax);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
            <div className="col">
              <h1 className="h3 mb-3">
                <strong>Salary View</strong>
              </h1>
            </div>
            <div className="col-auto" style={{ paddingBottom: "20px" }}>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <a href="/main">Home</a>
                  </li>
                  <li className="breadcrumb-item active">Payroll</li>
                  <li className="breadcrumb-item active">Salary View</li>
                </ol>
              </nav>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title" style={{ marginBottom: "0px" }}>
                    {" "}
                    Salary Details{" "}
                  </h5>
                </div>
                <div className="card-body" style={{ marginLeft: "20px" }}>
                  <div className="row">
                    <div className="col-md-5 mb-3">
                      <label className="form-label">Variable Amount</label>
                      <input
                        id="variableAmount"
                        type="text"
                        className="form-control"
                        autoComplete="off"
                        maxLength={10}
                        readOnly
                        {...register("variableAmount", {
                          required: "Variable amount is required",
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "These filed accepcts only Integers",
                          },
                          maxLength: {
                            value: 10,
                            message: "Maximum 10 Numbers Allowed",
                          },
                        })}
                        value={variableAmount}
                      />
                      {errors.variableAmount && (
                        <div className="errorMsg">
                          {errors.variableAmount.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-1 mb-3"></div>
                    <div className="col-md-5 mb-3">
                      <label className="form-label">
                        Fixed Amount<span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        autoComplete="off"
                        readOnly
                        maxLength={10}
                        {...register("fixedAmount", {
                          required: "Fixed amount is required",
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "These filed accepcts only Integers",
                          },
                          minLength: {
                            value: 5,
                            message: "Minimum 5 Numbers Required",
                          },
                          maxLength: {
                            value: 10,
                            message: "Maximum 10 Numbers Allowed",
                          },
                          validate: {
                            notZero: (value) =>
                              value !== "0" || "Value cannot be 0",
                          },
                        })}
                        value={fixedAmount}
                      />
                      {errors.fixedAmount && (
                        <div className="errorMsg">
                          {errors.fixedAmount.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-5 mb-3">
                      <label className="form-label">
                        Gross Amount<span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        autoComplete="off"
                        value={grossAmount}
                        onChange={(e) =>
                          setGrossAmount(parseFloat(e.target.value))
                        }
                        readOnly
                      />
                    </div>
                    <div className="col-md-1 mb-3"></div>
                    <div className="col-md-5 mb-3">
                      <label className="form-label">
                        Monthly Salary
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={monthlySalary}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row col-lg-12 d-flex">
              <div className="col-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title" style={{ marginBottom: "0px" }}>
                      Allowances
                    </h5>
                  </div>
                  <div className="card-body" style={{ paddingLeft: "20px" }}>
                    {errorMessage && (
                      <span className="text-danger m-2 text-center">
                        {errorMessage}
                      </span>
                    )}
                    {Object.keys(allowances)
                      .sort((a, b) => {
                        // Custom sorting to ensure Basic Salary is first and HRA is second
                        if (a === "Basic Salary") return -1; // Basic Salary first
                        if (b === "Basic Salary") return 1; // Basic Salary first
                        if (a === "HRA") return -1; // HRA second
                        if (b === "HRA") return 1; // HRA second
                        return 0; // Keep the rest in original order
                      })
                      .map((key) => {
                        const allowanceValue = allowances[key];
                        const isPercentage = allowanceValue.includes("%");
                        const isOtherAllowanceReadOnly =
                          key === "Other Allowances";

                        return (
                          <div key={key} className="mb-2">
                            <label className="form-label">
                              {key}:
                              <span className="text-danger me-1">
                                ({allowanceValue})
                              </span>
                              {isPercentage && (
                                <span
                                  className="m-1"
                                  data-toggle="tooltip"
                                  title="Percentage values are calculated based on Gross Amount."
                                >
                                  <span className="text-primary">
                                    <i className="bi bi-info-circle"></i>
                                  </span>
                                </span>
                              )}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              readOnly={isOtherAllowanceReadOnly}
                              value={Math.round(allowanceValue)}
                              onChange={(e) => {
                                // Allow only numbers and '%' characters
                                const newValue = e.target.value.replace(
                                  /[^0-9%]/g,
                                  ""
                                );
                                handleAllowanceChange(key, newValue);
                              }}
                              maxLength={isPercentage ? 4 : 10}
                            />
                          </div>
                        );
                      })}
                    <div className="mb-3">
                      <label>Total Allowances:</label>
                      <input
                        className="form-control"
                        type="text"
                        name="totalAllowance"
                        value={totalAllowances}
                        readOnly
                        data-toggle="tooltip"
                        title="This is the total of all allowances."
                      />
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title">Status</h5>
                  </div>
                  <div
                    className="card-body col-12"
                    style={{ paddingLeft: "20px" }}
                  >
                    <label className="form-label">
                      Status<span style={{ color: "red" }}>*</span>
                    </label>
                    <Controller
                      name="status"
                      control={control}
                      defaultValue={status}
                      disabled={status === "InActive"}
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
                              ? {
                                  value: field.value,
                                  label: ["Active", "InActive"].find(
                                    (option) => option === field.value
                                  ),
                                }
                              : null
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
                </div>
              </div>

              {/* Deductions Card */}
              <div className="col-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title" style={{ marginBottom: "0px" }}>
                      Deductions
                    </h5>
                  </div>
                  <div className="card-body" style={{ paddingLeft: "20px" }}>
                    {Object.keys(deductions).map((key) => {
                      const deductionValue = deductions[key];
                      const isPercentage = deductionValue.includes("%");
                      let displayValue = deductionValue;

                      // For numeric fields, we display them as whole numbers
                      if (!isPercentage) {
                        displayValue = Math.floor(deductionValue);
                      }

                      return (
                        <div key={key} className="mb-2">
                          <label className="form-label">
                            {key}:
                            <span className="text-danger me-1">
                              ({deductionValue})
                            </span>
                            {isPercentage && (
                              <span
                                className="m-1"
                                data-toggle="tooltip"
                                title="Percentage values are calculated based on Gross Amount."
                              >
                                <span className="text-primary">
                                  <i className="bi bi-info-circle"></i>
                                </span>
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={deductions[key]}
                            onChange={(e) => {
                              // Allow only numbers and '%' characters
                              const newValue = e.target.value.replace(
                                /[^0-9%]/g,
                                ""
                              );
                              handleDeductionChange(key, newValue);
                            }}
                            maxLength={isPercentage ? 4 : 10}
                          />
                          {/* {errorMessage && <p className="text-danger">{errorMessage}</p>} */}
                        </div>
                      );
                    })}

                    {/* Total Deductions Section */}
                    <div className="mb-3">
                      <label>Total Deductions</label>
                      <input
                        className="form-control"
                        type="number"
                        value={totalDeductions}
                        readOnly
                        data-toggle="tooltip"
                        title="This is the total of all deductions."
                      />
                    </div>

                    {/* PF Tax Section */}
                    <div className="col-12" style={{ marginTop: "10px" }}>
                      <label className="form-label">PF Tax</label>
                      <input
                        type="text"
                        className="form-control"
                        value={pfTax}
                        maxLength={10}
                        onChange={handlePfTaxChange}
                      />
                    </div>

                    {/* Income Tax Section */}
                    <div className="col-12" style={{ marginTop: "10px" }}>
                      <label className="form-label">Income Tax</label>
                      <input
                        type="text"
                        className="form-control"
                        value={incomeTax}
                        maxLength={10}
                        onChange={handleIncomeTaxChange}
                      />
                    </div>

                    {/* Total Tax Section */}
                    <div className="col-12" style={{ marginTop: "10px" }}>
                      <label className="form-label">
                        Total Tax
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={totalTax}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title" style={{ marginBottom: "0px" }}>
                      Net Salary
                    </h5>
                  </div>
                  <div className="card-body" style={{ paddingLeft: "20px" }}>
                    <div className="mb-3">
                      <label>Net Salary</label>
                      <input
                        className="form-control"
                        type="text"
                        name="netSalary"
                        value={Math.round(netSalary.toFixed(2))}
                        readOnly
                        data-toggle="tooltip"
                        title="This is the final salary after all deductions and allowances."
                      />
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  {showFields && (
                    <button
                      className="btn btn-secondary me-2"
                      type="button"
                      onClick={backForm}
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-danger ms-2"
                    disabled={!!errorMessage}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <div
                className="error-message"
                style={{
                  color: "red",
                  marginBottom: "10px",
                  textAlign: "center",
                }}
              >
                <b>{error}</b>
              </div>
            )}
          </div>
        </form>
      </div>
    </LayOut>
  );
};

export default EmployeeSalaryUpdate;
