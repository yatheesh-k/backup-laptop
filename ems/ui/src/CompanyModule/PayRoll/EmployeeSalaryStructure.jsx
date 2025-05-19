import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import LayOut from "../../LayOut/LayOut";
import {
  EmployeeGetApi,
  EmployeeSalaryPostApi,
  EmployeeSalaryGetApiById,
  EmployeeSalaryPatchApiById,
  CompanySalaryStructureGetApi,
} from "../../Utils/Axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useAuth } from "../../Context/AuthContext";
import Loader from "../../Utils/Loader";
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalTitle,
} from "react-bootstrap";

const EmployeeSalaryStructure = () => {
  const {
    register,
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

  const [employes, setEmployes] = useState([]);
  const [basicSalary, setBasicSalary] = useState(0); // State for Basic Salary
  const [allowances, setAllowances] = useState({});
  const [deductions, setDeductions] = useState({});
  const [updatedDeductions, setUpdatedDeductions] = useState({});
  const [grossAmount, setGrossAmount] = useState(0);
  const [finalAllowances, setFinalAllowances] = useState(0);
  const [totalAllowances, setTotalAllowances] = useState(0);
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
  const [showPfModal, setShowPfModal] = useState(false); // Modal visibility
  const [selectedPF, setSelectedPF] = useState("calculated");
  const [basicAmount, setBasicAmount] = useState(0);
  const [calculatedPF, setCalculatedPF] = useState({
    pfEmployee: 0,
    pfEmployer: 0,
  });
  const [travelAllowance, setTravelAllowance] = useState(0);
  const [otherAllowances, setOtherAllowances] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Active");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [showCards, setShowCards] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculatedAllowances, setCalculatedAllowances] = useState({});
  const [calculatedDeductions, setCalculatedDeductions] = useState({});

  const navigate = useNavigate();
  const prevOtherAllowancesRef = useRef(0);
  useEffect(() => {
    if (id && salaryId) {
      setShowFields(true);
    } else {
      setShowFields(false);
    }
  }, [id, salaryId]);

  useEffect(() => {
    EmployeeGetApi().then((data) => {
      const filteredData = data
        .filter(
          (employee) =>
            employee.firstName !== null && employee.status !== "InActive"
        )
        .map(({ referenceId, ...rest }) => rest);
      setEmployes(
        filteredData.map((employee) => ({
          label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
          value: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId,
          designationName: employee.designationName,
          departmentName: employee.departmentName,
          dateOfHiring: employee.dateOfHiring,
        }))
      );
    });
  }, []);

  useEffect(() => {
    if (id && salaryId) {
      EmployeeSalaryGetApiById(id, salaryId)
        .then((response) => {
          const data = response.data.data;
          if (data) {
            setEmployeeId(data.employeeId);
            setFixedAmount(parseFloat(data.fixedAmount));
            setVariableAmount(parseFloat(data.variableAmount));
            setGrossAmount(parseFloat(data.grossAmount));
            setStatus(data.status || "");
            setValue("status", data.status || "");
            setShowFields(true);
            setShowCards(true);
            setIsUpdating(true);
            setIsReadOnly(data.status === "InActive");
            calculateAllowances();
          }
        })
        .catch((error) => {
          handleApiErrors(error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setShowCards(false);
    }
  }, [id, salaryId, setValue]);

  useEffect(() => {
    const fetchSalaryStructures = async () => {
      try {
        const response = await CompanySalaryStructureGetApi();
        const allSalaryStructures = response.data.data;
        if (allSalaryStructures.length === 0) {
          setErrorMessage("Company Salary Structure is not defined");
        } else {
          const activeSalaryStructures = allSalaryStructures.filter(
            (structure) => structure.status === "Active"
          );
          if (activeSalaryStructures.length > 0) {
            const firstStructure = activeSalaryStructures[0];
            setAllowances(firstStructure.allowances);
            setDeductions(firstStructure.deductions);
            setErrorMessage(""); // Clear error if salary structures are found
            console.log("deductions", firstStructure.deductions);
            console.log("allowances", firstStructure.allowances);
          } else {
            setErrorMessage("No active salary structure found");
          }
        }
      } catch (error) {
        setErrorMessage("Error fetching salary structures.");
        console.error("API fetch error:", error);
      }
    };
    fetchSalaryStructures();
  }, []);

  // useEffect to calculate total and other allowances
  const calculateTotalAllowances = () => {
    let totalAllowances = 0; // Initialize totalAllowances variable
    // Handle Basic Salary and HRA calculations
    const basicSalaryPercentage = parseFloat(allowances["Basic Salary"]) || 0; // Basic Salary percentage
    const hraPercentage = parseFloat(allowances["HRA"]) || 0; // HRA percentage
    const basicSalaryAmount = (basicSalaryPercentage / 100) * grossAmount; // Calculate basic salary amount
    const hraAmount = (hraPercentage / 100) * basicSalaryAmount; // Calculate HRA amount
    setBasicAmount(basicSalaryAmount); // Update state for basic amount

    // Adding Basic Salary and HRA to totalAllowances
    totalAllowances += basicSalaryAmount + hraAmount;
    // Loop through other allowances to calculate the total
    Object.entries(allowances).forEach(([key, value]) => {
      if (
        key !== "Basic Salary" &&
        key !== "HRA" &&
        key !== "Provident Fund Employer" &&
        key !== "Other Allowances"
      ) {
        // Skip Basic Salary and HRA since already calculated
        if (typeof value === "string" && value.includes("%")) {
          // If it's a percentage value, calculate the amount
          const percentageValue = parseFloat(value.replace("%", ""));
          if (!isNaN(percentageValue)) {
            let allowanceAmount;
            // Check if the allowance is related to HRA or gross amount
            if (key === "HRA" || key === "Provident Fund Employer") {
              allowanceAmount = (percentageValue / 100) * basicSalaryAmount; // HRA based on Basic Salary
            } else {
              allowanceAmount = (percentageValue / 100) * grossAmount; // For other allowances, use gross amount
            }
            totalAllowances += allowanceAmount;
          }
        } else if (
          key !== "Other Allowances" ||
          typeof value === "number" ||
          !isNaN(parseFloat(value))
        ) {
          const numericValue =
            typeof value === "number" ? value : parseFloat(value);
          // If it's a numeric fixed allowance, add it directly to total allowances
          totalAllowances += numericValue;
        }
      }
    });
    return totalAllowances;
  };

  // useEffect to update the total allowances whenever allowances or grossAmount changes
  useEffect(() => {
    const totalAllow = calculateTotalAllowances();
    setTotalAllowances(totalAllow);
  }, [allowances, grossAmount]); // Dependencies to trigger the effect

  useEffect(() => {
    const totalAllow = calculateTotalAllowances(); // Calculate total allowances
    const newOtherAllowances = grossAmount - totalAllow; // Subtract the sum of other allowances from gross amount
    // Ensure no negative values for other allowances
    const validOtherAllowances = Math.max(0, newOtherAllowances);

    // Check if other allowances need to be updated
    if (validOtherAllowances !== prevOtherAllowancesRef.current) {
      setAllowances((prevAllowances) => ({
        ...prevAllowances,
        "Other Allowances": validOtherAllowances.toFixed(2),
      }));
      prevOtherAllowancesRef.current = validOtherAllowances; // Update ref to new value
    }

    // Update total allowances state
    setTotalAllowances(totalAllow + validOtherAllowances); // Add Other Allowances to totalAllowances

    // Error checking: Disable submit if total allowances exceed gross amount
    if (newOtherAllowances < 0) {
      setErrorMessage(
        "Total allowances exceed gross amount. Please adjust allowances."
      );
      setIsSubmitDisabled(true);
    } else {
      setErrorMessage("");
      setIsSubmitDisabled(false);
    }
  }, [allowances, grossAmount]); // Recalculate whenever allowances or grossAmount change

  const calculatePFContributions = () => {
    const basicSalaryPercentage = parseFloat(allowances["Basic Salary"]) || 0; // Basic Salary percentage
    const pfEmployeePercentage =
      parseFloat(deductions["Provident Fund Employee"]) || 0; // Employee PF percentage
    const pfEmployerPercentage =
      parseFloat(deductions["Provident Fund Employer"]) || 0; // Employer PF percentage
    // Calculate Basic Salary Amount from the gross salary
    const basicSalaryAmount = (basicSalaryPercentage / 100) * grossAmount;
    // Calculate PF Contributions
    const pfEmployee = (pfEmployeePercentage / 100) * basicSalaryAmount;
    const pfEmployer = (pfEmployerPercentage / 100) * basicSalaryAmount;
    return {
      pfEmployee,
      pfEmployer,
    };
  };

  // Function to handle PF limit check and show the modal
  const handlePFLimitCheck = () => {
    const { pfEmployee, pfEmployer } = calculatePFContributions();
    const totalPF = pfEmployee + pfEmployer;

    setCalculatedPF({ pfEmployee, pfEmployer }); // Set calculated PF values

    // Case: If total PF exceeds ₹43,200 per year or is less than ₹43,200
    if (totalPF !== 43200) {
      updateDeductions(totalPF / 2, totalPF / 2);
    } else {
      // If total PF is exactly ₹43,200 per year, no confirmation needed
      updateDeductions(43200 / 2, 43200 / 2); // Use fixed PF values of ₹43,200 per year (monthly)
    }
  };

  // Update the deductions with PF values
  const updateDeductions = (pfEmployee, pfEmployer) => {
    const newDeductions = {
      ...deductions,
      "Provident Fund Employee": pfEmployee.toFixed(2),
      "Provident Fund Employer": pfEmployer.toFixed(2),
    };
    setUpdatedDeductions(newDeductions); // Save the updated deductions in state
  };

  // Function to calculate the total deductions including PF
  const calculateTotalDeductions = () => {
    let total = 0;

    // Loop through the updated deductions
    Object.entries(updatedDeductions).forEach(([key, value]) => {
      if (typeof value === "string" && value.endsWith("%")) {
        const percentageValue = parseFloat(value.slice(0, -1)); // Remove '%' and parse as number
        total += (percentageValue / 100) * grossAmount; // Apply percentage to gross amount
      } else {
        total += parseFloat(value) || 0; // Add fixed deduction amount
      }
    });

    return isNaN(total) ? 0 : total;
  };

  useEffect(() => {
    const totalDeductions = calculateTotalDeductions();
    setTotalDeductions(totalDeductions);
  }, [updatedDeductions]);

  useEffect(() => {
    handlePFLimitCheck(); // Trigger the PF limit check on initial load or relevant updates
  }, [grossAmount, allowances, deductions]);

  const handleAllowanceChange = (key, newValue, grossSalary, basicSalary) => {
    let validValue = newValue;
    const isPercentage = newValue.includes("%");
    let errorMessage = "";

    // Convert percentage values to decimal numbers
    if (isPercentage) {
      validValue = newValue.replace(/[^0-9%]/g, ""); // Allow only digits and %
      const percentageValue = parseFloat(validValue.replace("%", "")) / 100; // Convert percentage to decimal
      if (isNaN(percentageValue)) {
        errorMessage = "Invalid percentage value.";
      } else {
        // Calculate allowance based on either Gross Salary or Basic Salary
        validValue = percentageValue * grossSalary; // Use grossSalary or basicSalary depending on your requirement
        validValue = validValue.toFixed(4); // Ensure the value is in decimal format
      }
    } else {
      // Validate and convert non-percentage values to numbers
      if (/[^0-9.-]/.test(newValue)) {
        errorMessage = "Only numeric values are allowed.";
      } else {
        validValue = parseFloat(newValue);
        if (isNaN(validValue) || validValue < 0) {
          errorMessage = "Allowance value cannot be negative.";
        }
      }
    }

    // If no error, update the state with the numeric value
    if (!errorMessage) {
      setAllowances((prevAllowances) => ({
        ...prevAllowances,
        [key]: validValue,
      }));
    }

    setErrorMessage(errorMessage);
  };

  const handleDeductionChange = (key, value, grossSalary, basicSalary) => {
    if (/[a-zA-Z]/.test(value)) {
      setErrorMessage("Alphabetic characters are not allowed.");
      return;
    }

    let validValue = parseFloat(value.replace(/[^0-9.-]/g, "")); // Remove non-numeric characters
    let errorMessage = "";

    // Handle percentage-based deduction calculation
    if (value.includes("%")) {
      const percentageValue = validValue / 100;
      validValue = percentageValue * grossSalary; // Deduction as a percentage of gross salary (or basicSalary if required)
    }

    if (isNaN(validValue)) {
      errorMessage = "Invalid deduction value.";
    }

    if (validValue < 0) {
      errorMessage = "Deduction value cannot be negative.";
    }

    // Update the deductions state with valid numeric value
    if (!errorMessage) {
      setDeductions((prevDeductions) => ({
        ...prevDeductions,
        [key]: validValue,
      }));
    }

    setErrorMessage(errorMessage);
  };

  useEffect(() => {
    const totalDed = calculateTotalDeductions();

    // Ensure the result is a number before setting it
    if (typeof totalDed === "number") {
      setTotalDeductions(totalDed); // Store as a number
    } else {
      setTotalDeductions(0); // Default to 0 if totalDed is not a valid number
    }
  }, [deductions, grossAmount]);

  useEffect(() => {
    // Calculate total allowances and total deductions whenever the gross amount changes
    //const totalAllowances = calculateTotalAllowances();
    const totalDeductions = calculateTotalDeductions();
    // Update state
    setFinalAllowances(finalAllowances);
    setTotalDeductions(totalDeductions);
  }, [grossAmount, allowances, deductions]); // Ensure dependencies include `grossAmount`, `allowances`, and `deductions`

  const calculateAllowances = () => {
    // calculateTotalAllowances();
    calculateTotalDeductions();
    setShowCards(true);
  };

  const calculateNetSalary = () => {
    const net = totalAllowances - totalDeductions;
    setNetSalary(net);
  };

  useEffect(() => {
    calculateNetSalary();
  }, [finalAllowances, totalDeductions]);

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

  const handleGoClick = () => {
    // Reset both showCards and showPfModal to false when Go button is clicked
    setShowCards(false); // Hide cards
    setShowPfModal(false); // Hide PF Modal

    if (!employeeId) {
      setMessage("Please Select Employee Name");
      setShowFields(false); // Hide fields if no employee is selected
    } else {
      setShowFields(true); // Show fields if employee is selected
      setErrorMessage(""); // Reset error message
    }
  };

  const handleSubmitButtonClick = () => {
    // Calculate total allowances
    // const totalAllowances = calculateTotalAllowances();

    // Calculate total deductions
    const totalDeductions = calculateTotalDeductions();

    // Calculate net salary
    const netSalary = grossAmount + finalAllowances - totalDeductions;

    // Set the calculated values to state
    setFinalAllowances(finalAllowances);
    setTotalDeductions(totalDeductions);
    setNetSalary(netSalary);

    // Optionally, show any relevant messages
    if (netSalary < 0) {
      setErrorMessage("Net Salary cannot be negative");
    } else {
      setErrorMessage("");
    }

    // Check PF limit if necessary
    handlePFLimitCheck();
    setShowPfModal(true);
    setShowCards(true);
  };

  // Handle modal close and update PF values based on selection
  const handleModalClose = () => {
    const { pfEmployee, pfEmployer } = calculatedPF;

    // Check the selected PF option
    if (selectedPF === "calculated") {
      updateDeductions(pfEmployee, pfEmployer); // Use calculated PF
    } else {
      const fixedPF = 43200 / 2; // ₹43,200 per year split into ₹21,600 each for employee and employer
      updateDeductions(fixedPF, fixedPF); // Use ₹21,600 per year for both employee and employer
    }
    setShowPfModal(false); // Close the modal
  };

  const handleEmployeeChange = (selectedOption) => {
    setEmployeeId(selectedOption.value);
  };

  const handleVariableAmountChange = (e) => {
    setVariableAmount(parseFloat(e.target.value) || 0);
    setValue("variableAmount", e.target.value, { shouldValidate: true });
  };

  const handleFixedAmountChange = (e) => {
    setFixedAmount(parseFloat(e.target.value) || 0);
    setValue("fixedAmount", e.target.value, { shouldValidate: true });
  };

  useEffect(() => {
    const newGrossSalary = variableAmount + fixedAmount;
    setGrossAmount(newGrossSalary);
    console.log("grossAmount", grossAmount);
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
    console.log("data", data);

    // Check for any error related to salary structures
    if (error) {
      toast.error(error); // Display the error message using toast
      return; // Exit if there's an error
    }

    // Extract and validate necessary values
    const fixedAmount = parseFloat(data.fixedAmount) || 0;
    const variableAmount = parseFloat(data.variableAmount) || 0;
    const grossAmountValue = parseFloat(grossAmount) || 0;
    const netSalaryValue = parseFloat(netSalary) || 0;
    const totalDeductionsValue = parseFloat(totalDeductions) || 0;
    const pfTaxValue = parseFloat(pfTax) || 0;
    const incomeTax = data.incomeTax;
    const statusValue = data.status;

    // Ensure that variableAmount, fixedAmount, and grossAmount are not all zero
    if (variableAmount === 0 && fixedAmount === 0 && grossAmountValue === 0) {
      return; // Exit if all amounts are zero
    }

    // Construct allowances and deductions objects with calculated values
    const allowancesData = {};
    const deductionsData = {};

    // Add calculated allowances (same as before)
    Object.entries(allowances).forEach(([key, value]) => {
      let displayValue = value;

      // If the allowance is a percentage, calculate the actual value using grossAmount or basicAmount
      if (typeof value === "string" && value.includes("%")) {
        const percentage = parseFloat(value.replace("%", ""));
        if (!isNaN(percentage)) {
          if (key === "HRA") {
            displayValue = (percentage / 100) * basicAmount; // For HRA, use basicAmount
          } else {
            displayValue = (percentage / 100) * grossAmountValue; // For other allowances, use grossAmount
          }
        }
      } else if (typeof value === "number") {
        displayValue = value; // If it's a number (fixed value), just use that value
      }

      displayValue = isNaN(displayValue) ? 0 : displayValue; // Ensure displayValue is a valid number

      allowancesData[key] = displayValue; // Pass the value as a fixed number
    });

    // Add calculated deductions (important fix for PF)
    Object.entries(deductions).forEach(([key, value]) => {
      let displayValue = value;

      // Check the deduction type and calculate the PF values
      if (typeof value === "string" && value.includes("%")) {
        const percentage = parseFloat(value.replace("%", ""));
        if (!isNaN(percentage)) {
          if (
            key === "Provident Fund Employee" ||
            key === "Provident Fund Employer"
          ) {
            displayValue = (percentage / 100) * basicAmount; // Use basicAmount for PF calculation
          } else {
            displayValue = (percentage / 100) * grossAmountValue; // For other deductions, use grossAmount
          }
        }
      } else if (typeof value === "number") {
        displayValue = value; // If it's a fixed value, use it directly
      }

      // Ensure displayValue is a valid number
      displayValue = isNaN(displayValue) ? 0 : displayValue;

      // Ensure that when the fixed PF option is selected, we pass the fixed PF values
      if (selectedPF === "fixed") {
        if (
          key === "Provident Fund Employee" ||
          key === "Provident Fund Employer"
        ) {
          // Set the fixed PF value (₹43,200 split into ₹21,600 each)
          displayValue = 43200 / 2; // ₹21,600 each for employee and employer
        }
      }

      deductionsData[key] = displayValue; // Ensure we pass the value as a fixed number
    });

    // Prepare the final data object for submission
    const dataToSubmit = {
      companyName: companyName,
      fixedAmount: fixedAmount.toFixed(2),
      variableAmount: variableAmount.toFixed(2),
      grossAmount: grossAmountValue.toFixed(2),
      salaryConfigurationEntity: {
        allowances: {
          ...allowancesData, // Pass the calculated allowances data
        },
        deductions: {
          ...deductionsData, // Pass the calculated deductions data
        },
      },
      netSalary: netSalaryValue.toFixed(2),
      totalEarnings: grossAmountValue.toFixed(2),
      totalDeductions: totalDeductionsValue.toFixed(2),
      pfTax: pfTaxValue.toFixed(2),
      incomeTax: incomeTax,
      status: statusValue,
    };

    console.log("dataToSubmit", dataToSubmit);

    // API call based on whether salaryId is available (update or create)
    const apiCall = salaryId
      ? () => EmployeeSalaryPatchApiById(employeeId, salaryId, dataToSubmit)
      : () => EmployeeSalaryPostApi(employeeId, dataToSubmit);

    apiCall()
      .then((response) => {
        toast.success(
          salaryId
            ? "Employee Salary Updated Successfully"
            : "Employee Salary Added Successfully"
        );
        setError(""); // Clear error message on success
        setShowFields(false);
        navigate("/employeeview");
      })
      .catch((error) => {
        handleApiErrors(error);
      });
  };

  const clearForm = () => {
    reset();
    setShowFields(false);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
            <div className="col">
              <h1 className="h3 mb-3">
                <strong>Manage Salary</strong>
              </h1>
            </div>
            <div className="col-auto" style={{ paddingBottom: "20px" }}>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <a href="/main">Home</a>
                  </li>
                  <li className="breadcrumb-item active">Payroll</li>
                  <li className="breadcrumb-item active">Manage Salary</li>
                </ol>
              </nav>
            </div>
          </div>
          <div className="row">
            {showFields ? (
              <>
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5
                        className="card-title"
                        style={{ marginBottom: "0px" }}
                      >
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
                            readOnly={isReadOnly}
                            value={variableAmount}
                            onChange={handleVariableAmountChange}
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
                            readOnly={isReadOnly}
                            value={fixedAmount}
                            onChange={handleFixedAmountChange}
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
                        <div className="col-12 text-end mt-2">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmitButtonClick}
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {loading ? (
                  <Loader /> // Show loader while loading
                ) : (
                  showCards && (
                    <>
                      <div className="row col-lg-12 d-flex">
                        <div className="col-6 mb-4">
                          <div className="card">
                            <div className="card-header">
                              <h5
                                className="card-title"
                                style={{ marginBottom: "0px" }}
                              >
                                Allowances
                              </h5>
                            </div>
                            <div
                              className="card-body"
                              style={{ paddingLeft: "20px" }}
                            >
                              {Object.entries(allowances).map(
                                ([key, value]) => {
                                  let displayValue = value;

                                  // If the allowance is a percentage, calculate the actual value using grossAmount or basicAmount
                                  if (
                                    typeof value === "string" &&
                                    value.includes("%")
                                  ) {
                                    const percentage = parseFloat(
                                      value.replace("%", "")
                                    );
                                    if (!isNaN(percentage)) {
                                      // Calculate based on grossAmount or basicAmount
                                      if (
                                        key === "HRA" ||
                                        key === "Provident Fund Employer"
                                      ) {
                                        displayValue =
                                          (percentage / 100) * basicAmount; // For HRA, use basicAmount
                                      } else {
                                        displayValue =
                                          (percentage / 100) * grossAmount; // For other allowances, use grossAmount
                                      }
                                    }
                                  } else if (typeof value === "number") {
                                    // If it's a number (fixed value), just display that value
                                    displayValue = value;
                                  }

                                  // Update the state with the calculated value for allowance

                                  return (
                                    <div key={key} className="mb-3">
                                      <label>{key}</label>
                                      <input
                                        className="form-control"
                                        type="text"
                                        maxLength={7}
                                        value={Math.round(displayValue)} // Display the calculated value
                                        onChange={(e) =>
                                          handleAllowanceChange(
                                            key,
                                            e.target.value
                                          )
                                        } // Handle change
                                        readOnly={
                                          key === "Basic Salary" ||
                                          key === "HRA"
                                        }
                                      />
                                    </div>
                                  );
                                }
                              )}

                              <div className="mb-3">
                                <label>Total Allowances:</label>
                                <input
                                  className="form-control"
                                  type="text"
                                  name="totalAllowance"
                                  maxLength={7}
                                  value={Math.round(totalAllowances)}
                                  readOnly
                                  data-toggle="tooltip"
                                  title="This is the total of all allowances."
                                />
                                {errorMessage && (
                                  <p className="text-danger">{errorMessage}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="card">
                            <div className="card-header">
                              <div className="d-flex justify-content-start align-items-start">
                                <h5
                                  className="card-title me-2"
                                  style={{ marginBottom: "0px" }}
                                >
                                  Status
                                </h5>
                                <span className="text-danger">
                                  {errors.status && (
                                    <p className="mb-0">
                                      {errors.status.message}
                                    </p>
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-12 col-md-6 col-lg-5 mb-3">
                                  <label>
                                    <input
                                      type="radio"
                                      name="status"
                                      defaultChecked
                                      value="Active"
                                      style={{ marginRight: "10px" }}
                                      {...register("status", {
                                        required: "Please Select Status",
                                      })}
                                    />
                                    Active
                                  </label>
                                </div>
                                <div className="col-lg-1"></div>
                                <div className="col-12 col-md-6 col-lg-5 mb-3">
                                  <label>
                                    <input
                                      type="radio"
                                      name="status"
                                      value="InActive"
                                      style={{ marginRight: "10px" }}
                                      {...register("status", {
                                        required: "Please Select Status",
                                      })}
                                    />
                                    InActive
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Deductions Card */}
                        <div className="col-6 mb-4">
                          <div className="card">
                            <div className="card-header">
                              <h5
                                className="card-title"
                                style={{ marginBottom: "0px" }}
                              >
                                Deductions
                              </h5>
                            </div>
                            <div
                              className="card-body"
                              style={{ paddingLeft: "20px" }}
                            >
                              {Object.entries(updatedDeductions).map(
                                ([key, value]) => {
                                  let displayValue = value;
                                  // If the deduction is a percentage, apply it to the gross amount
                                  if (
                                    typeof value === "string" &&
                                    value.includes("%")
                                  ) {
                                    const percentage = parseFloat(
                                      value.replace("%", "")
                                    );
                                    if (!isNaN(percentage)) {
                                      // Calculate based on grossAmount or basicAmount
                                      if (
                                        key === "Provident Fund Employee" ||
                                        key === "Provident Fund Employer"
                                      ) {
                                        displayValue =
                                          (percentage / 100) * basicAmount; // For HRA, use basicAmount
                                      } else {
                                        displayValue =
                                          (percentage / 100) * grossAmount; // For other allowances, use grossAmount
                                      }
                                    }
                                  } else if (typeof value === "number") {
                                    // If it's a number (fixed value), just display that value
                                    displayValue = value;
                                  }

                                  return (
                                    <div key={key} className="mb-3">
                                      <label>{key}</label>
                                      <input
                                        className="form-control"
                                        type="text"
                                        readOnly={
                                          key === "Provident Fund Employee" ||
                                          key === "Provident Fund Employer"
                                        }
                                        value={Math.round(displayValue)} // Display the value (either percentage or calculated value)
                                        onChange={(e) =>
                                          handleDeductionChange(
                                            key,
                                            e.target.value
                                          )
                                        } // Handle change
                                      />
                                    </div>
                                  );
                                }
                              )}
                              <div className="mb-3">
                                <label>Total Deductions</label>
                                <input
                                  className="form-control"
                                  type="number"
                                  maxLength={7}
                                  value={Math.round(totalDeductions)} // Format as string here
                                  readOnly
                                  data-toggle="tooltip"
                                  title="This is the total of all deductions."
                                />
                                {errorMessage && (
                                  <p className="text-danger">{errorMessage}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="card">
                            <div className="card-header ">
                              <div className="d-flex justify-content-start align-items-start">
                                <h5
                                  className="card-title me-2"
                                  style={{ marginBottom: "0px" }}
                                >
                                  TDS
                                </h5>
                                <span className="text-danger">
                                  {errors.incomeTax && (
                                    <p className="mb-0">
                                      {errors.incomeTax.message}
                                    </p>
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-12 col-md-6 col-lg-5 mb-3">
                                  <label>
                                    <input
                                      type="radio"
                                      name="incomeTax"
                                      value="old"
                                      style={{ marginRight: "10px" }}
                                      {...register("incomeTax", {
                                        required: "Please Select Tax",
                                      })}
                                    />
                                    Old Regime
                                  </label>
                                </div>
                                <div className="col-lg-1"></div>
                                <div className="col-12 col-md-6 col-lg-5 mb-3">
                                  <label>
                                    <input
                                      type="radio"
                                      name="incomeTax"
                                      value="new"
                                      defaultChecked
                                      style={{ marginRight: "10px" }}
                                      {...register("incomeTax", {
                                        required: "Please Select Tax",
                                      })}
                                    />
                                    New Regime
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="card">
                            <div className="card-header">
                              <h5
                                className="card-title"
                                style={{ marginBottom: "0px" }}
                              >
                                Net Salary
                              </h5>
                            </div>
                            <div
                              className="card-body"
                              style={{ paddingLeft: "20px" }}
                            >
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
                            <button
                              className="btn btn-secondary me-2"
                              onClick={clearForm}
                            >
                              Close
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={!!errorMessage}
                            >
                              Submit
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
                    </>
                  )
                )}
              </>
            ) : (
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title" style={{ marginBottom: "0px" }}>
                      Employee Details
                    </h5>
                    <div
                      className="dropdown-divider"
                      style={{ borderTopColor: "#d7d9dd" }}
                    />
                  </div>
                  <div className="card-body" style={{ padding: "0 0 0 25%" }}>
                    <div className="mb-4">
                      <div className="row align-items-center">
                        <div className="col-12 d-flex align-items-center">
                          <div
                            className="mt-3"
                            style={{ flex: "1 1 auto", maxWidth: "400px" }}
                          >
                            <label className="form-label">
                              Select Employee Name
                            </label>
                            <Select
                              options={employes}
                              onChange={handleEmployeeChange}
                              placeholder="Select Employee Name"
                            />
                          </div>
                          <div style={{ marginTop: "27px" }}>
                            <div
                              className="mt-3 ml-3"
                              style={{ marginLeft: "20px" }}
                            >
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleGoClick}
                              >
                                Go
                              </button>
                            </div>
                          </div>
                        </div>
                        {message && (
                          <div
                            className="errorMsg mt-2"
                            style={{ marginLeft: "10px" }}
                          >
                            {message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
        <Modal
          show={showPfModal}
          onHide={() => setShowPfModal(false)}
          centered
          style={{ zIndex: "1050" }}
          className="custom-modal"
        >
          <ModalHeader closeButton>
            <ModalTitle className="text-center">
              Confirm Provident Fund Option
            </ModalTitle>
          </ModalHeader>
          <ModalBody className="text-center fs-bold">
            <p>
              The Total Provident Fund is ₹
              {calculatedPF.pfEmployee + calculatedPF.pfEmployer}. Please choose
              your preferred option:
            </p>
            <div className="d-flex align-items-center mb-3">
              <input
                className="form-check-input me-2"
                type="radio"
                name="pfOption"
                value="calculated"
                checked={selectedPF === "calculated"}
                onChange={() => setSelectedPF("calculated")}
              />
              <label className="mb-0">
                Calculated PF: ₹
                {calculatedPF.pfEmployee + calculatedPF.pfEmployer} per year
              </label>
            </div>

            <div className="d-flex align-items-center mb-3">
              <input
                className="form-check-input me-2"
                type="radio"
                name="pfOption"
                value="fixed"
                checked={selectedPF === "fixed"}
                onChange={() => setSelectedPF("fixed")}
              />
              <label className="mb-0 ml-2">
                Calculated PF: ₹43,200 per year
                <span
                  className="d-inline-block"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="₹43,200 is the standard PF for an employee (₹3,600 per month)"
                >
                  <i className="bi bi-info-circle text-primary"></i>{" "}
                  {/* Info icon from Bootstrap Icons */}
                </span>
              </label>
            </div>
          </ModalBody>
          <div style={{ marginLeft: "58%" }}>
            <Button
              variant="primary"
              className="ml-4"
              style={{ marginRight: "10px" }}
              onClick={handleModalClose}
            >
              Confirm
            </Button>
            <Button variant="secondary" onClick={() => setShowPfModal(false)}>
              Cancel
            </Button>
          </div>
        </Modal>
      </div>
    </LayOut>
  );
};

export default EmployeeSalaryStructure;
