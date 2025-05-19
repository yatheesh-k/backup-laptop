import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../Context/AuthContext";
import LayOut from "../../../LayOut/LayOut";
import {
  companyViewByIdApi,
  EmployeeGetApiById,
  EmployeePayslipResponse,
  EmployeePayslipUpdate,
} from "../../../Utils/Axios";
import Loader from "../../../Utils/Loader";

const PayslipUpdate4 = () => {
  const {
    register,
    getValues,
    trigger,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const [companyData, setCompanyData] = useState({});
  const [allowanceFields, setAllowanceFields] = useState([]);
  const [deductionFields, setDeductionFields] = useState([]);
  const [taxFields, setTaxFields] = useState([{ label: "New Tax", value: 0 }]);
  const [newFieldName, setNewFieldName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [payslipData, setPayslipData] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [netPayError, setNetPayError] = useState("");
  const [otherAllowanceError, setOtherAllowanceError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [totals, setTotals] = useState({
    totalEarnings: 0,
    totalDeductions: 0,
    totalTax: 0,
  });
  const [errorMessages, setErrorMessages] = useState({
    deductions: "",
    taxes: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const employeeId = queryParams.get("employeeId");
  const payslipId = queryParams.get("payslipId");
  const salaryId = queryParams.get("salaryId");
  const month = queryParams.get("month");
  const year = queryParams.get("year");
  const { user, logoFileName } = useAuth();

  const numberToWords = (num) => {
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const unitsPlaces = ["", "Lakh", "Thousand", "Hundred"];

    if (num === 0) return "Zero";

    const convertToWords = (n) => {
      if (n === 0) return "";

      let word = "";
      if (n >= 100) {
        word += units[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }
      if (n >= 20) {
        word += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      }
      if (n > 0) {
        word += units[n] + " ";
      }
      return word.trim();
    };

    let result = "";
    let integerPart = Math.floor(num);

    // Handle Lakhs and Thousands in the Indian numbering system
    if (integerPart >= 100000) {
      const lakhs = Math.floor(integerPart / 100000);
      result += convertToWords(lakhs) + " Lakh ";
      integerPart %= 100000;
    }

    if (integerPart >= 1000) {
      const thousands = Math.floor(integerPart / 1000);
      result += convertToWords(thousands) + " Thousand ";
      integerPart %= 1000;
    }

    if (integerPart >= 100) {
      const hundreds = Math.floor(integerPart / 100);
      result += convertToWords(hundreds) + " Hundred ";
      integerPart %= 100;
    }

    if (integerPart > 0) {
      result += convertToWords(integerPart);
    }

    // Handle decimal (cents)
    let decimalPart = Math.round((num % 1) * 100);
    if (decimalPart > 0) {
      result += " and " + convertToWords(decimalPart) + " Paise";
    }

    return result.trim();
  };

  const fetchCompanyData = async (companyId) => {
    try {
      const response = await companyViewByIdApi(companyId);
      setCompanyData(response.data);
    } catch (err) {
      console.error("Error fetching company data:", err);
      toast.error("Failed to fetch company data");
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await EmployeeGetApiById(employeeId);
      setEmployeeDetails(response.data);
      if (response.data.companyId) {
        await fetchCompanyData(response.data.companyId);
      }
    } catch (err) {
      console.error("Error fetching employee details:", err);
      toast.error("Failed to fetch employee details");
    }
  };
  const fetchPayslipData = async () => {
    if (!month || !year) return;
    try {
      const payload = {
        companyName: user.company,
        month,
        year,
      };
      console.log("data", payload);
      console.log("salaryId", salaryId);
      const response = await EmployeePayslipResponse(salaryId, payload);
      const generatedPayslips = response.data?.data?.generatePayslip || [];
      if (generatedPayslips.length) {
        // Find the specific payslip based on the salaryId or employeeId
        const selectedPayslip = generatedPayslips.find(
          (payslip) =>
            payslip.salaryId === salaryId || payslip.employeeId === employeeId
        );
        if (selectedPayslip) {
          setPayslipData(selectedPayslip);
        } else {
          toast.error("Payslip not found for the selected employee.");
        }
      } else {
        toast.error("No payslip data available");
      }
    } catch (err) {
      console.error("Error fetching payslip data:", err);
      toast.error("Failed to fetch payslip data");
    }
  };

  const handleUpdate = async () => {
    if (employeeId && payslipId) {
      try {
        console.log("Using latest totals:", totals);

        // Extract existing allowances
        const allowances =
          payslipData.salary.salaryConfigurationEntity.allowances || {};

        // Extract new allowances like Bonus
        const newAllowances = {};
        allowanceFields.forEach((field) => {
          if (field.label === "Bonus") {
            // Add Bonus to the existing allowances
            newAllowances[field.label] = Number(field.value);
          } else {
            // Handle updates to existing allowances
            allowances[field.label] = Number(field.value);
          }
        });

        // Add new allowances (like Bonus) to the existing allowances
        Object.assign(allowances, newAllowances);

        // Calculate total of other allowances (excluding "Other Allowances")
        const totalAllowances = Object.entries(allowances)
          .filter(([key]) => key !== "Other Allowances") // Do not include "Other Allowances" in total calculation
          .reduce((total, [, amount]) => total + (Number(amount) || 0), 0);

        const grossAmount = payslipData.salary.grossAmount || 0;

        // Recalculate "Other Allowances" if necessary
        let updatedOtherAllowance =
          allowances["Other Allowances"] || grossAmount / 12 - totalAllowances;

        // Prevent recalculation of "Other Allowances" when new fields like Bonus are added
        if (Object.keys(newAllowances).length > 0) {
          updatedOtherAllowance =
            allowances["Other Allowances"] ||
            grossAmount / 12 - totalAllowances;
        }

        // Prevent negative "Other Allowances"
        if (updatedOtherAllowance < 0) {
          setOtherAllowanceError("Other Allowance cannot be negative.");
          console.log(
            "Other Allowance cannot be negative.",
            updatedOtherAllowance
          );
          return; // Stop the update process if the value is negative
        } else {
          setOtherAllowanceError(""); // Clear the error if the allowance is valid
        }

        // Ensure the "Other Allowances" is always updated correctly
        allowances["Other Allowances"] = updatedOtherAllowance.toString();

        // Handle new deductions (from user input) and include them in the payload
        const updatedDeductions = deductionFields.reduce((acc, field) => {
          acc[field.label] = field.value;
          return acc;
        }, {});

        // Extract existing deductions from the current payslip data
        const existingDeductions =
          payslipData.salary.salaryConfigurationEntity.deductions || {};

        // Merge the updated deductions with the existing ones, making sure to avoid duplication
        const mergedDeductions = {
          ...existingDeductions, // Include the existing deductions
          ...updatedDeductions, // Add new deductions
        };

        // Create the payload to send to the server
        const payload = {
          companyName: user.company || "", // Default to empty string if undefined
          salary: {
            ...payslipData.salary,
            salaryId: payslipData.salary.salaryId ?? 0, // Default to 0 if missing
            salaryConfigurationEntity: {
              ...payslipData.salary.salaryConfigurationEntity,
              allowances: allowances ?? {}, // Default to empty object if missing
              newAllowances: newAllowances ?? {}, // Default to empty object
              deductions: mergedDeductions ?? {}, // Default to empty object
            },
            totalEarnings: Number(totals.totalEarnings) || 0, // Convert to number or default to 0
            totalDeductions: Number(totals.totalDeductions) || 0,
            totalTax: Number(totals.totalTax) || 0,
            netSalary: Number(totals.netPay) || 0,
            incomeTax: Number(payslipData.salary.incomeTax) || 0, // Convert empty string to 0
          },
          attendance: payslipData.attendance,
          month,
          year,
          updatedOtherAllowance, // Convert to number or default to 0
        };
        console.log("Payload being sent:", payload);

        // Call the API to update the payslip
        await EmployeePayslipUpdate(employeeId, payslipId, payload);
        toast.success("Payslip updated successfully");
        navigate("/payslipsList");
      } catch (err) {
        console.error("Error updating payslip:", err);
        toast.error("Failed to update payslip");
      }
    } else {
      console.error("Employee ID or Payslip ID is missing");
      toast.error("Missing Employee ID or Payslip ID");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (employeeId) {
        await fetchEmployeeDetails(employeeId);
      }
      if (month && year && user.company) {
        await fetchPayslipData();
      }
      setLoading(false);
    };
    fetchData();
  }, [employeeId, month, year, user.company]);

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (payslipData) {
      const allowances =
        payslipData.salary.salaryConfigurationEntity.allowances || {};
      const totalEarnings = Object.values(allowances).reduce(
        (total, amount) => total + Number(amount || 0),
        0
      );

      const additionalAllowancesTotal = allowanceFields.reduce(
        (total, field) => total + Number(field.value || 0),
        0
      );
      const totalEarningsIncludingAddedFields =
        totalEarnings + additionalAllowancesTotal;

      const deductions =
        payslipData.salary.salaryConfigurationEntity.deductions || {};
      const totalDeductions =
        Object.values(deductions).reduce(
          (total, amount) => total + Number(amount || 0),
          0
        ) +
        Number(payslipData.salary.lop || 0) +
        deductionFields.reduce(
          (total, field) => total + Number(field.value || 0),
          0
        );

      const pfTax = Number(payslipData.salary.pfTax || 0);
      const incomeTax = Number(payslipData.salary.incomeTax || 0);
      const additionalTaxTotal = taxFields.reduce(
        (total, field) => total + Number(field.value || 0),
        0
      );
      const totalTax = pfTax + incomeTax + additionalTaxTotal;
      const grossAmount = payslipData.salary.grossAmount || 0;
      const otherAllowances = payslipData.salary.otherAllowances || 0;

      let otherAllowance = 0;
      const updatedAllowances = {
        ...allowances,
        ...allowanceFields.reduce((acc, field) => {
          acc[field.label] = Number(field.value);
          return acc;
        }, {}),
      };

      const totalAllowances = Object.entries(updatedAllowances)
        .filter(([key]) => key !== "Other Allowances")
        .reduce((total, [, amount]) => total + (Number(amount) || 0), 0);

      // Recalculate "Other Allowances" only if existing allowances are modified
      let updatedOtherAllowance = grossAmount / 12 - totalAllowances;

      // Skip recalculating when adding new fields (e.g., "Bonus")
      if (allowanceFields.length === 0) {
        updatedOtherAllowance = grossAmount / 12 - totalAllowances;
      } else {
        // Use the old value of "Other Allowances" if it's not updated
        updatedOtherAllowance =
          allowances["Other Allowances"] || updatedOtherAllowance;
      }

      // Ensure the "Other Allowances" is updated correctly
      if (updatedOtherAllowance < 0) {
        setOtherAllowanceError("Other Allowance cannot be negative.");
        console.log(
          "Other Allowance cannot be negative.",
          updatedOtherAllowance
        );
      } else {
        setOtherAllowanceError(""); // Clear the error if the allowance is valid
      }

      const netPay =
        totalEarningsIncludingAddedFields - totalDeductions - totalTax;

      if (netPay < 0) {
        setNetPayError("Net Pay cannot be Negative.");
      } else {
        setNetPayError("");
      }

      setTotals({
        totalEarnings: totalEarningsIncludingAddedFields,
        totalDeductions,
        totalTax,
        netPay,
      });
    }
  }, [payslipData, allowanceFields, deductionFields, taxFields]);

  validationError && (
    <div style={{ color: "red", margin: "10px 0" }}>{validationError}</div>
  );
  const backForm = () => {
    reset();
    navigate("/payslipGeneration");
  };

  if (loading) {
    return (
      <Loader>
        <div className="text-center">
          <Loader />
        </div>
      </Loader>
    );
  }

  if (!payslipData) {
    return (
      <LayOut>
        <div className="text-center">No payslip data available</div>
      </LayOut>
    );
  }

  const formatFieldName = (fieldName) => {
    return fieldName
      .split(" ")
      .map((token) => {
        if (token === token.toUpperCase()) {
          return token;
        }
        return token
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
      })
      .join(" ");
  };

  const handleAllowanceChange = (key, newValue) => {
    setPayslipData((prevData) => {
      const oldAllowances =
        prevData.salary.salaryConfigurationEntity.allowances || {};
      const oldValue = oldAllowances[key] || 0;
      const newValueNumber = parseInt(newValue) || 0;

      // Calculate the difference
      const allowanceDifference = newValueNumber - oldValue;

      // Update the changed allowance
      const newAllowances = {
        ...oldAllowances,
        [key]: newValueNumber,
      };

      // Adjust "Other Allowances" based on the difference
      let otherAllowance = Number(newAllowances["Other Allowances"]);
      otherAllowance -= allowanceDifference; // Borrow or add the difference

      // Ensure "Other Allowances" doesn't go negative
      //   if (otherAllowance < 0) otherAllowance = 0;

      // Update the "Other Allowances" field
      newAllowances["Other Allowances"] = otherAllowance.toString();

      return {
        ...prevData,
        salary: {
          ...prevData.salary,
          salaryConfigurationEntity: {
            ...prevData.salary.salaryConfigurationEntity,
            allowances: newAllowances,
          },
        },
      };
    });
  };

  const handleDeductionChange = (key, value) => {
    setPayslipData((prevData) => {
      const newDeductions = {
        ...prevData.salary.salaryConfigurationEntity.deductions,
        [key]: value,
      };

      return {
        ...prevData,
        salary: {
          ...prevData.salary,
          salaryConfigurationEntity: {
            ...prevData.salary.salaryConfigurationEntity,
            deductions: newDeductions,
          },
        },
      };
    });
  };

  const handleLopChange = (value) => {
    setPayslipData((prevData) => ({
      ...prevData,
      salary: {
        ...prevData.salary,
        lop: value,
      },
    }));
  };

  const handlePfTaxChange = (value) => {
    setPayslipData((prevData) => ({
      ...prevData,
      salary: {
        ...prevData.salary,
        pfTax: value,
      },
    }));
  };

  const handleIncomeTaxChange = (value) => {
    setPayslipData((prevData) => ({
      ...prevData,
      salary: {
        ...prevData.salary,
        incomeTax: value,
      },
    }));
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
    const formattedValue = words
      .map((word) =>
        word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ""
      )
      .join(" ");
    // Trim multiple spaces after the first 3 characters
    let finalValue =
      formattedValue.length > 3
        ? formattedValue.slice(0, 3) +
          formattedValue.slice(3).replace(/\s+/g, " ")
        : formattedValue;
    input.value = finalValue;
    input.setSelectionRange(cursorPosition, cursorPosition);
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

  const handleCloseNewFieldModal = () => {
    setNewFieldName("");
    setShowModal(false);
    reset();
    setErrorMessage("");
  };

  const addField = (fieldName, initialValue) => {
    if (modalType === "allowances") {
      if (!allowanceFields.some((field) => field.label === fieldName)) {
        setAllowanceFields((prev) => [
          ...prev,
          { label: fieldName, value: initialValue },
        ]);
      }
    } else if (modalType === "deductions") {
      if (!deductionFields.some((field) => field.label === fieldName)) {
        setDeductionFields((prev) => [
          ...prev,
          { label: fieldName, value: initialValue },
        ]);
      }
    }
    setInputValue("");
    setShowModal(false);
  };

  const otherAllowanceKey = "otherAllowances";
  const isButtonDisabled = !!netPayError;

  return (
    <LayOut>
      <div className="container mt-4">
        <div className="card">
          <div
            className="card-header mt-4"
            style={{
              background: "none",
              paddingBottom: "0px",
              paddingLeft: "30px",
              paddingRight: "30px",
            }}
          >
            <div
              className="header-content mt-4"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                {logoFileName ? (
                  <img
                    className="align-middle"
                    src={logoFileName}
                    alt="Logo"
                    style={{ height: "80px", width: "180px" }}
                  />
                ) : (
                  <p>Logo</p>
                )}
              </div>
            </div>
          </div>
          <div className="card-body m-0 p-2">
            <div className="payslip-details">
              <div style={{ padding: "20px" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    border: "1px solid black",
                    width: "100%",
                  }}
                >
                  <tbody>
                    <tr>
                      <th
                        colSpan={4}
                        style={{
                          background: "#d3d3d3",
                          color: "black",
                          paddingLeft: "5px",
                          border: "1px solid black",
                        }}
                      >
                        <b>{companyData.companyName}</b>
                      </th>
                    </tr>
                    <tr>
                      <th
                        colSpan={4}
                        style={{
                          background: "#d3d3d3",
                          color: "black",
                          paddingLeft: "5px",
                          border: "1px solid black",
                        }}
                      >
                        <b>
                          Payslip for {payslipData.month} - {payslipData.year}
                        </b>
                      </th>
                    </tr>
                    <tr>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        Employee ID
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {employeeDetails.employeeId}
                      </td>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        Name
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {employeeDetails.firstName} {employeeDetails.lastName}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        Department
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {employeeDetails.departmentName}
                      </td>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        PAN
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {employeeDetails.panNo}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        Designation
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {employeeDetails.designationName}
                      </td>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        UAN
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {employeeDetails.uanNo}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        Bank ACC No
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {employeeDetails.accountNo}
                      </td>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        IFSC
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {employeeDetails.ifscCode}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        Bank Name
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {employeeDetails.bankName}
                      </td>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        Location
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {employeeDetails.location}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        Total Days
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {payslipData.attendance?.totalWorkingDays || 0}
                      </td>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        Worked Days
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {payslipData.attendance?.noOfWorkingDays || 0}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        LOP Days
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {(payslipData.attendance?.totalWorkingDays || 0) -
                          (payslipData.attendance?.noOfWorkingDays || 0)}
                      </td>
                      <th
                        style={{
                          padding: "4px",
                          width: "150px",
                          textAlign: "left",
                          background: "#d3d3d3",
                          color: "black",
                          border: "1px solid black",
                        }}
                      >
                        Date of Birth
                      </th>
                      <td
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          border: "1px solid black",
                        }}
                      >
                        {employeeDetails.dateOfBirth}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="salary-details" style={{ padding: "20px" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div
                    style={{
                      flex: 1,
                      border: "1px solid black",
                      borderRight: "none",
                      borderBottom: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 8px",
                        background: "#d3d3d3",
                        borderBottom: "1px solid black",
                      }}
                    >
                      <p
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "black",
                          margin: 0,
                        }}
                      >
                        Earnings
                      </p>
                      <p
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "black",
                          margin: 0,
                        }}
                      >
                        Amount
                      </p>
                    </div>
                    <ul
                      style={{
                        listStyleType: "none",
                        padding: 0,
                        marginBottom: "2px",
                      }}
                    >
                      {Object.entries(
                        payslipData.salary?.salaryConfigurationEntity
                          ?.allowances || {}
                      )
                        // Separate Basic Salary and HRA
                        .sort(([a], [b]) => {
                          // Custom sorting to ensure Basic Salary is first and HRA is second
                          if (a === "Basic Salary") return -1; // Basic Salary first
                          if (b === "Basic Salary") return 1; // Basic Salary first
                          if (a === "HRA") return -1; // HRA second
                          if (b === "HRA") return 1; // HRA second
                          return 0; // Keep the rest in original order
                        })
                        .map(([key, value]) => (
                          <li
                            key={key}
                            style={{
                              display: "flex",
                              padding: "4px 8px",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ flex: 1, color: "black" }}>
                              {formatFieldName(key)}
                            </span>
                            <input
                              type="text"
                              value={Math.floor(value)} // Display the value (round it if needed)
                              onChange={(e) => {
                                const newValue = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                if (newValue.length <= 6) {
                                  const oldValue = Math.floor(value);
                                  const adjustment =
                                    parseInt(newValue) - oldValue;

                                  // Handle change for the general allowance fields
                                  handleAllowanceChange(key, newValue);

                                  // If "Other Allowances" is modified, prevent further manual input
                                  if (key === "Other Allowances") {
                                    const updatedOtherAllowance = Math.max(
                                      0,
                                      parseInt(newValue)
                                    ); // Prevent negative values
                                    const updatedAllowances = {
                                      ...payslipData.salary
                                        .salaryConfigurationEntity.allowances,
                                      "Other Allowances":
                                        updatedOtherAllowance.toString(),
                                    };

                                    // Update "Other Allowances" in the state
                                    handleAllowanceChange(
                                      "Other Allowances",
                                      updatedAllowances
                                    );
                                  } else {
                                    // For other fields, handle normally
                                  }
                                }
                              }}
                              style={{
                                width: "100px",
                                border: "none",
                                textAlign: "right",
                              }}
                              readOnly={key === "Other Allowances"} // Make "Other Allowances" field read-only
                            />
                          </li>
                        ))}

                      {/* Display the additional allowances (like Bonus or others) */}
                      {allowanceFields.map((field, index) => (
                        <li
                          key={`new-allowance-${field.label}-${index}`}
                          style={{
                            display: "flex",
                            padding: "4px 8px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ flex: 1, color: "black" }}>
                            {field.label}
                          </span>
                          <span style={{ color: "black" }}>{field.value}</span>
                        </li>
                      ))}
                    </ul>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 8px",
                      }}
                    >
                      <span style={{ color: "black" }}>Total Earnings (A)</span>
                      <span style={{ color: "black" }}>
                        {Math.floor(totals.totalEarnings)}
                      </span>
                    </div>
                    {otherAllowanceError && (
                      <div
                        style={{
                          color: "red",
                          marginTop: "5px",
                          marginLeft: "10px",
                        }}
                      >
                        {otherAllowanceError}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setModalType("allowances");
                        setShowModal(true);
                      }}
                      className="btn btn-primary mt-2 mb-2"
                      style={{ marginLeft: "8px" }}
                    >
                      Add Allowance
                    </button>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      border: "1px solid black",
                      borderBottom: "none",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 8px",
                        background: "#d3d3d3",
                        borderBottom: "1px solid black",
                      }}
                    >
                      <p
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "black",
                          margin: 0,
                        }}
                      >
                        Deductions
                      </p>
                      <p
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "black",
                          margin: 0,
                        }}
                      >
                        Amount
                      </p>
                    </div>
                    <ul
                      style={{
                        listStyleType: "none",
                        padding: 0,
                        marginBottom: "2px",
                      }}
                    >
                      {Object.entries(
                        payslipData.salary?.salaryConfigurationEntity
                          ?.deductions || {}
                      ).map(([key, value]) => (
                        <li
                          key={key}
                          style={{
                            display: "flex",
                            padding: "4px 8px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ flex: 1, color: "black" }}>
                            {formatFieldName(key)}
                          </span>
                          <input
                            type="text"
                            value={Math.floor(value)}
                            onChange={(e) => {
                              const newValue = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              if (newValue.length <= 6) {
                                handleDeductionChange(key, newValue);
                              }
                            }}
                            style={{
                              width: "100px",
                              border: "none",
                              textAlign: "right",
                            }}
                          />
                        </li>
                      ))}
                      {deductionFields.map((field, index) => (
                        <li
                          key={`new-deduction-${field.label}-${index}`}
                          style={{
                            display: "flex",
                            padding: "4px 8px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ flex: 1, color: "black" }}>
                            {field.label}
                          </span>
                          <span style={{ color: "black" }}>{field.value}</span>
                        </li>
                      ))}
                    </ul>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0px 8px 4px 8px",
                      }}
                    >
                      <span style={{ color: "black" }}>LOP</span>
                      <input
                        type="text"
                        value={Math.floor(payslipData.salary.lop)}
                        onChange={(e) => {
                          const newValue = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                          if (newValue.length <= 6) {
                            handleLopChange(newValue);
                          }
                        }}
                        style={{
                          width: "100px",
                          border: "none",
                          textAlign: "right",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 8px",
                      }}
                    >
                      <span style={{ color: "black" }}>
                        Total Deductions (B)
                      </span>
                      <span style={{ color: "black" }}>
                        {Math.floor(totals.totalDeductions)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setModalType("deductions");
                        setShowModal(true);
                      }}
                      className="btn btn-primary mt-2 mb-2"
                      style={{ marginLeft: "8px" }}
                    >
                      Add Deduction
                    </button>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 8px",
                        borderTop: "1px solid black",
                        borderBottom: "1px solid black",
                        background: "#d3d3d3",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "15px",
                          fontWeight: "bold",
                          color: "black",
                          marginBottom: "0px",
                        }}
                      >
                        Taxes
                      </p>
                      <p
                        style={{
                          fontSize: "15px",
                          fontWeight: "bold",
                          color: "black",
                          marginBottom: "0px",
                        }}
                      >
                        Amount
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 8px",
                      }}
                    >
                      <span style={{ color: "black" }}>Income Tax</span>
                      <input
                        type="text"
                        value={Math.floor(payslipData.salary.incomeTax)}
                        onChange={(e) => {
                          const newValue = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                          if (newValue.length <= 6) {
                            handleIncomeTaxChange(newValue);
                          }
                        }}
                        style={{
                          width: "100px",
                          border: "none",
                          textAlign: "right",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 8px",
                      }}
                    >
                      <span style={{ color: "black" }}>Pf Tax</span>
                      <input
                        type="text"
                        value={Math.floor(payslipData.salary.pfTax)}
                        onChange={(e) => {
                          const newValue = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                          if (newValue.length <= 6) {
                            handlePfTaxChange(newValue);
                          }
                        }}
                        style={{
                          width: "100px",
                          border: "none",
                          textAlign: "right",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 8px",
                      }}
                    >
                      <span style={{ color: "black" }}>Total Tax (C)</span>
                      <span style={{ color: "black" }}>{totals.totalTax}</span>
                    </div>
                    {errorMessages.deductions && (
                      <div
                        className="error-message"
                        style={{
                          color: "red",
                          marginBottom: "10px",
                          textAlign: "center",
                        }}
                      >
                        <b>{errorMessages.deductions}</b>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td
                          className="earnings"
                          colSpan={1}
                          style={{
                            padding: "4px",
                            textAlign: "left",
                            background: "#d3d3d3",
                            color: "black",
                            border: "1px solid black",
                            width: "25%",
                          }}
                        >
                          <b>Net Pay (A-B-C)</b>
                        </td>
                        <td
                          className="earnings"
                          colSpan={3}
                          style={{
                            textAlign: "left",
                            border: "1px solid black",
                          }}
                        >
                          <b>{Math.floor(totals.netPay || 0)}</b>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="earnings"
                          colSpan={1}
                          style={{
                            padding: "4px",
                            textAlign: "left",
                            background: "#d3d3d3",
                            color: "black",
                            border: "1px solid black",
                            width: "25%",
                          }}
                        >
                          <b>Net Salary (in words)</b>
                        </td>
                        <td
                          className="earnings"
                          colSpan={3}
                          style={{
                            textAlign: "left",
                            border: "1px solid black",
                          }}
                        >
                          <b>{numberToWords(totals.netPay)}</b>
                        </td>
                      </tr>
                      {netPayError && (
                        <div className="error-message" style={{ color: "red" }}>
                          <b>{netPayError}</b>
                        </div>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* <span className="ms-4">
                <em>
                  This is a computer-generated payslip and does not require
                  authentication
                </em>
              </span> */}
              <div
                className="bottom"
                style={{
                  marginLeft: "50px",
                  marginRight: "50px",
                  marginTop: "1px",
                  paddingBottom: "30px",
                }}
              >
                &nbsp;&nbsp;
              </div>
              <div
                className="line"
                style={{
                  marginLeft: "20px",
                  marginRight: "20px",
                  color: "black ",
                }}
              >
                <hr />
              </div>
              <div
                className="bottom"
                style={{
                  marginLeft: "50px",
                  marginRight: "50px",
                  marginTop: "20px",
                  paddingBottom: "2px",
                }}
              >
                <div className="line"></div>
                <div
                  className="company-details text-center"
                  style={{ padding: "2px" }}
                >
                  <h6>Company Address: {companyData.companyAddress}.</h6>
                  <h6>Mobile No: {companyData.mobileNo}</h6>
                  <h6>Email ID: {companyData.emailId}</h6>
                </div>
              </div>
            </div>
          </div>
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
                  <ModalTitle className="modal-title">
                    Add New{" "}
                    {modalType === "allowances" ? "Allowance" : "Deduction"}{" "}
                    Field
                  </ModalTitle>
                </ModalHeader>
                <ModalBody>
                  <form>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12">
                          <input
                            type="text"
                            onInput={toInputTitleCase}
                            className="form-control"
                            placeholder={`Enter New ${
                              modalType === "allowances"
                                ? "Allowance"
                                : "Deduction"
                            } Name`}
                            autoComplete="off"
                            {...register("fieldName", {
                              required: "Field name is required",
                              pattern: {
                                value: /^[A-Za-z\s&-]+$/,
                                message:
                                  "This field accepts only alphabetic characters",
                              },
                              minLength: {
                                value: 2,
                                message: "Minimum 2 characters required",
                              },
                              maxLength: {
                                value: 40,
                                message: "Maximum 20 characters required",
                              },
                            })}
                          />
                          {errors.fieldName && (
                            <p className="errorMsg text-danger">
                              {errors.fieldName.message}
                            </p>
                          )}
                          {errorMessage && (
                            <p className="errorMsg text-danger">
                              {errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="row mt-3">
                        <div className="col-12">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Initial Value"
                            {...register("initialValue", {
                              required: "Initial value is required",
                              validate: {
                                positive: (value) =>
                                  value > 0 || "Value must be positive",
                                maxLength: (value) =>
                                  value.toString().length <= 6 ||
                                  "Maximum 6 digits allowed",
                              },
                            })}
                            onInput={(e) => {
                              const newValue = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              if (newValue.length <= 6) {
                                e.target.value = newValue;
                              }
                            }}
                          />
                          {errors.initialValue && (
                            <p className="errorMsg text-danger">
                              {errors.initialValue.message}
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
                          const isValidField = await trigger("fieldName");
                          const isValidValue = await trigger("initialValue");

                          if (!isValidField || !isValidValue) {
                            return;
                          }

                          const fieldName = getValues("fieldName");
                          const initialValue = getValues("initialValue");
                          addField(fieldName, initialValue);
                          handleCloseNewFieldModal();
                        }}
                      >
                        Add Field
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
      <div className="d-flex justify-content-end align-items-center me-4">
        <button
          className="btn btn-secondary me-2"
          type="button"
          onClick={backForm}
        >
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleUpdate}
          disabled={isButtonDisabled}
        >
          Generate Payslip
        </button>
      </div>
    </LayOut>
  );
};

export default PayslipUpdate4;
