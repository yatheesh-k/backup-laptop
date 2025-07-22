import React, { useState, useEffect } from 'react';
import LayOut from '../../LayOut/LayOut';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../../Redux/EmployeeSlice';
import { BankNamesGetApi, DepartmentGetApi, DesignationGetApi, EmployeeGetApiById, EmployeePatchApiById, EmployeePostApi } from '../../Utils/Axios';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { handleBranchInput, toInputAddressCase, toInputTitleCase, validateAadhar, validateCompanyName, validateEmail, validateFirstName, validateLastName, validateLocation, validateNumber, validatePAN, validatePFNumber, validatePhoneNumber, validateTempAddress, validateUAN } from '../../Utils/Validate';

export default function EmployeeRegister() {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch, reset,
    formState: { errors },
    trigger, getValues
  } = useForm({
    mode: "onChange",
    defaultValues: {
      // Step 1: Employee Details
      employeeType: "",
      employeeId: "",
      firstName: "",
      lastName: "",
      department: "",
      designation: "",
      manager: "",
      hiringDate: "",
      location: "",
      status: "",
      mailId: "",
      // Step 2: Personal Details
      dob: "",
      contactNumber: "",
      alternateNumber: "",
      personalEmail: "",
      aadhaarId: "",
      uanNo: "",
      panNo: "",
      permanentAddress: "",
      tempAddress: "",

      // Step 3: Education Details
      employeeEducation: [{ educationLevel: "", instituteName: "", boardOfStudy: "", branch: "", year: "", percentage: "" }],

      // Step 4: Experience Details
      employeeExperience: [{ companyName: "", positionOrTitle: "", startDate: "", endDate: "", tenure: "" }],

      // Step 5: Bank Details
      bankName: "",
      accountNumber: "",
      ifsc: "",
      bankBranch: "",

    },
  });
  const { authUser } = useAuth();
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [bank, setBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // State to track if updating or creating
  const [showNoticePeriodOption, setShowNoticePeriodOption] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  // Step 2: Access employee data from the Redux store
  const { data: employees, status, error } = useSelector((state) => state.employees);
  // Step 3: Fetch employees on component mount
  const watchDepartment = watch("department");

  // Manage dynamic fields for education
  const { fields:
    educationFields, append: addEducation, remove: removeEducation } = useFieldArray({
      control, name: "employeeEducation"
    });

  // Manage dynamic fields for experience
  const { fields: experienceFields, append: addExperience, remove: removeExperience } = useFieldArray({
    control, name: "employeeExperience"
  });

  const onNext = async (e) => {
    e.preventDefault();
    const isValid = await trigger(); // Validate current step fields

    if (isValid) {
      if (step < 5) {
        setStep(step + 1); // Move to the next step, but DO NOT submit
      }
    }
  };

  const onPrevious = () => {
    setStep(step - 1);
  };
  const Employement = [
    { value: "Permanent", label: "Permanent" },
    { value: "Contract", label: "Contract" },
    { value: "Trainee", label: "Trainee" },
    { value: "Support", label: "Support" },
    { value: "Associate", label: "Associate" },
  ];

  const onSubmit = async (data) => {
    console.log("data", data)

    // Constructing the payload with all required fields
    let payload = {
      companyName: authUser.company,
      employeeType: data.employeeType,
      employeeId: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      emailId: data.emailId,
      designation: data.designation,
      dateOfHiring: data.dateOfHiring, // Format: yyyy-mm-dd
      dateOfBirth: data.dateOfBirth,   // Format: yyyy-mm-dd
      department: data.department,
      location: data.location,
      tempAddress: data.tempAddress,
      permanentAddress: data.permanentAddress,
      manager: data.manager,
      mobileNo: data.mobileNo,
      alternateNo: data.alternateNo,
      maritalStatus: data.maritalStatus,
      status: data.status,
      panNo: data.panNo,
      uanNo: data.uanNo,
      aadhaarId: data.aadhaarId,
      accountNo: data.accountNo,
      ifscCode: data.ifscCode,
      bankName: data.bankName,
      bankBranch: data.bankBranch,
      pfNo: data.pfNo, // Default value if empty

      // Constructing personnelEntity
      personnelEntity: {
        employeeEducation: data.employeeEducation?.map((edu) => ({
          educationLevel: edu.educationLevel || "",
          instituteName: edu.instituteName || "",
          boardOfStudy: edu.boardOfStudy || "",
          branch: edu.branch || "",
          year: edu.year || "",
          percentage: edu.percentage || ""
        })) || []
      }
    };

    // Check if `employeeExperience` has any valid entries
    const validExperience = data.employeeExperience?.filter(exp =>
      exp.companyName.trim() ||
      exp.positionOrTitle.trim() ||
      exp.startDate.trim() ||
      exp.endDate.trim()
    );

    // Only add `employeeExperience` if it contains valid values
    if (validExperience?.length > 0) {
      payload.personnelEntity.employeeExperience = validExperience;
    }

    try {
      if (location.state && location.state.id) {
        // Update existing employee
        const response = await EmployeePatchApiById(location.state.id, payload);
        console.log("Update successful", response.data);
        toast.success("Employee Updated Successfully");
      } else {
        // Create new employee
        const response = await EmployeePostApi(payload);
        console.log("Employee created", response.data);
        toast.success("Employee Created Successfully");
      }

      setTimeout(() => {
        navigate("/employeeView");
      }, 1000); // Adjust delay time if needed

    } catch (error) {
      console.error("Error submitting data:", error);

      const message = error.response?.data?.message || "Error submitting employee details";
      const duplicateFields = error.response?.data?.data;

      // Create a readable string from the duplicate fields
      let fieldDetails = "";
      if (duplicateFields && typeof duplicateFields === "object") {
        fieldDetails = Object.entries(duplicateFields)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
      }

      const fullMessage = fieldDetails
        ? `${message} - Duplicate Fields: ${fieldDetails}`
        : message;

      setErrorMessage(fullMessage);     // 👈 set full message
      toast.error(message);         // Optional: show in toast
      handleApiErrors(error);           // Existing error handler
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

  // eslint-disable-next-line no-undef
  useEffect(() => {
    if (status === "loading") {
      dispatch(fetchEmployees());
    }
  }, [dispatch, status]);


  // Filter employees whose designation starts or ends with "Manager"
  const managerEmployees = employees.filter(
    (emp) =>
      emp.designationName &&
      (emp.designationName.trim().toLowerCase().startsWith("manager") ||
        emp.designationName.trim().toLowerCase().endsWith("manager"))
  );

  // Map manager employees to dropdown format
  const managerOptions = managerEmployees.map((emp) => ({
    id: `${emp.firstName || ""} ${emp.lastName || ""}`,
    name: `${emp.firstName || ""} ${emp.lastName || ""} (${emp.designationName})`.trim(),
  }));

  // Always include "CompanyAdmin" as an option
  const dropdownOptions = [
    ...managerOptions,
    { id: "Company Admin", name: "Company Admin" }
  ];
  // Get the last employeeId in the list
  const lastEmployeeId = employees.length > 0 ? employees[employees.length - 1].employeeId : "N/A";

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
      const data = await DesignationGetApi(departmentId); // Pass departmentId to API
      setDesignations(data);
    } catch (error) {
      console.error('Error fetching designations:', error);
      setDesignations([]); // Reset on error
    }
  };

  const fetchBankNames = async () => {
    try {
      const res = await BankNamesGetApi();
      setBank(res.data);
      console.log("bank", res.data);
    } catch (error) {
      // handleApiErrors(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchBankNames();
  }, []);

  useEffect(() => {
    if (watchDepartment) {
      fetchDesignations(watchDepartment);
    } else {
      setDesignations([]); // Clear designations when no department selected
    }
  }, [watchDepartment]);

  useEffect(() => {
    if (location && location.state && location.state.id) {
      const fetchData = async () => {
        try {
          const response = await EmployeeGetApiById(location.state.id);
          const employeeData = response.data.data;

          // First reset the form with all data except department/designation
          reset({
            ...employeeData,
            department: '', // Clear these initially
            designation: ''
          });

          // Set status manually
          const status = employeeData.status;
          setValue("status", status.toString());
          setLoading(true);

          // Set department first
          const departmentId = employeeData.department;
          if (departmentId) {
            setValue("department", departmentId);
            // Fetch designations for this department
            const designations = await DesignationGetApi(departmentId);
            setDesignations(designations);

            // Now set the designation after designations are loaded
            if (employeeData.designation) {
              setTimeout(() => {
                setValue("designation", employeeData.designation);
              }, 100); // Small delay to ensure select is populated
            }
          }

          // Set employeeEducation data
          if (employeeData.personnelEntity?.employeeEducation?.length) {
            reset((prev) => ({
              ...prev,
              employeeEducation: employeeData.personnelEntity.employeeEducation
            }));
          }

          // Set employeeExperience data
          if (employeeData.personnelEntity?.employeeExperience?.length) {
            reset((prev) => ({
              ...prev,
              employeeExperience: employeeData.personnelEntity.employeeExperience
            }));
          }

        } catch (error) {
          handleApiErrors(error);
        }
      };

      fetchData();
    } else {
      reset();
      setValue("employeeId", "");
      setDesignations([]); // Clear designations when creating new employee
    }
  }, [location, location.state, reset, setValue]);

  const validateDates = (value, index) => {
    const startDate = getValues(`employeeExperience.${index}.startDate`);
    if (!startDate || !value) return true; // Allow empty values (if optional)
    return new Date(value) >= new Date(startDate) || "End Date cannot be before Start Date";
  };

  const validateYear = (dateString) => {
    if (!dateString) return true; // Skip validation if empty

    const year = new Date(dateString).getFullYear();
    return year.toString().length === 4 || "Year must be exactly 4 digits";
  };

  const calculateTenure = (index, startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start < end) {
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        // Convert months and days to fractional years
        const fractionalYears = years + (months / 12) + (days / 365);

        // Set the tenure value in years with decimal precision
        setValue(`employeeExperience.${index}.tenure`, `${fractionalYears.toFixed(2)} years`)

      } else {
        setValue(`employeeExperience.${index}.tenure`, "Invalid date range");
      }
    }
  };

  // Watch DOB & Hiring Date to validate them dynamically
  const dob = watch("dateOfBirth");
  const hiringDate = watch("dateOfHiring");


  // Custom Validation Function
  const validateDOB = (value) => {
    if (!value) return "Date of Birth is required";

    // Validate year format (must be 4 digits)
    const year = new Date(value).getFullYear();
    if (year.toString().length !== 4) {
      return "Year must be exactly 4 digits";
    }

    const dobDate = new Date(value);
    const minHiringDate = new Date(dobDate);
    minHiringDate.setFullYear(minHiringDate.getFullYear() + 16); // Add 16 years

    if (hiringDate && new Date(hiringDate) < minHiringDate) {
      return "Employee must be at least 16 years old at hiring.";
    }

    return true;
  };

  const validateHiringDate = (value) => {
    if (!value) return "Date of Hiring is required";

    // Validate year format (must be 4-digit)
    const year = new Date(value).getFullYear();
    if (year.toString().length !== 4) {
      return "Year must be exactly 4 digits";
    }

    // Validate hiring date is at least 16 years after DOB
    const hiringDate = new Date(value);
    const dobDate = new Date(dob);

    if (
      dob &&
      hiringDate < new Date(dobDate.setFullYear(dobDate.getFullYear() + 16))
    ) {
      return "Hiring date must be at least 16 years after DOB.";
    }

    return true;
  };

  const handleClear = () => {
    reset(); // Reset form fields
    setStep(1); // Move to Step 1
  };

  const handleClearNewEmployee = () => {
    reset({
      employeeId: "",
      employeeType: "",
      firstName: "",
      lastName: "",
      emailId: "",
      designation: "",
      dateOfHiring: "",
      dateOfBirth: "",
      department: "",
      location: "",
      tempAddress: "",
      permanentAddress: "",
      manager: "",
      mobileNo: "",
      alternateNo: "",
      maritalStatus: "",
      status: "",
      panNo: "",
      uanNo: "",
      aadhaarId: "",
      accountNo: "",
      ifscCode: "",
      bankName: "",
      bankBranch: "",
      pfNo: "",
      personnelEntity: {
        employeeEducation: [],
        employeeExperience: [],
      },
    });

    setStep(1); // Move back to Step 1
    navigate(".", { replace: true, state: {} });
  };


  return (
    <LayOut>
      <div className=" row container d-flex justify-content-center align-items-center min-vh-100">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Employee Registration</strong>{" "}
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
        <div className="card shadow-lg p-4 w-100">
          <div className="card-body">
            <h2 className="text-start text-dark">
              {isUpdating ? "Employee Data" : "Employee Registration"}
            </h2>
            <div className="d-flex justify-content-end my-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`mx-1 rounded-circle ${i === step ? 'bg-primary' : i < step ? 'bg-success' : 'bg-secondary'
                    }`} style={{ width: '10px', height: '10px' }}
                />
              ))}
            </div>
            <p className="text-end">Step {step} of 5</p>

            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 && (
                <div>
                  <h3 className="mb-3">Step 1: Employee Details <span className='text-danger'>*</span></h3>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label>Employee First Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder='Enter Employee First Name' name='firstName' onInput={toInputTitleCase}
                        readOnly={!!location.state?.id} // Set readOnly if employee ID exists
                        {...register("firstName", {
                          required: "First Name is required",
                          validate: validateFirstName
                        })}
                      />
                      <small className="text-danger">{errors.firstName?.message}</small>
                    </div>
                    <div className="col-md-6 mb-2">
                      <label>Employee Last Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder='Enter Employee Last Name' name='lastName' onInput={toInputTitleCase}
                        readOnly={!!location.state?.id} // Set readOnly if employee ID exists
                        {...register("lastName", {
                          required: "Last Name is required",
                          validate: validateLastName
                        })}
                      />
                      <small className="text-danger">{errors.lastName?.message}</small>
                    </div>
                    <div className="col-md-6 mb-2 mt-2">
                      <label>Employee ID <span className="text-danger">*</span></label> {!location.state?.id && `Last ID: ${lastEmployeeId}`}
                      <input type="text" className="form-control" placeholder='Enter Employee ID' name='employeeId'
                        readOnly={!!location.state?.id} // Set readOnly if employee ID exists
                        {...register("employeeId", {
                          required: "Employee ID is required",
                          pattern: { value: /^[A-Za-z0-9_-]+$/, message: "Invalid Employee ID format" },
                        })}
                      />
                      <small className="text-danger">{errors.employeeId?.message}</small>
                    </div>
                    <div className="col-md-6 mb-2 mt-2">
                      <label>Employee Type <span className="text-danger">*</span></label>
                      <select className="form-select" id='employeeType' name='employeeType'
                        {...register("employeeType", { required: "Select Employee Type" })}
                      >
                        <option value="">Select Employment Type</option>
                        {Employement.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <small className="text-danger">{errors.employeeType?.message}</small>
                    </div>
                    <div className="col-md-6 mb-2 mt-2">
                      <label>Department <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id='department'
                        name='department'
                        {...register("department", {
                          required: "Select Department",
                          onChange: (e) => {
                            // Reset designation when department changes
                            setValue("designation", "");
                            // Fetch designations for selected department
                            if (e.target.value) {
                              fetchDesignations(e.target.value);
                            } else {
                              setDesignations([]);
                            }
                          }
                        })}
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                      <small className="text-danger">{errors.department?.message}</small>
                    </div>

                    <div className="col-md-6 mb-2 mt-2">
                      <label>Designation <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id='designation'
                        name='designation'
                        disabled={!watch("department") || designations.length === 0}
                        {...register("designation", {
                          required: {
                            value: true,
                            message: watch("department")
                              ? "Select Designation"
                              : "Please select a department first"
                          }
                        })}
                      >
                        <option value="">Select Designation</option>
                        {designations.map((des) => (
                          <option key={des.id} value={des.id}>{des.name}</option>
                        ))}
                      </select>
                      <small className="text-danger">
                        {errors.designation?.message}
                      </small>
                    </div>
                    <div className="col-md-6 mb-2 mt-2">
                      <label>Employee Mail ID <span className="text-danger">*</span></label>
                      <input type="email" className="form-control" placeholder='Enter Employee Mail ID'
                        readOnly={!!location.state?.id} // Set readOnly if employee ID exists
                        {...register("emailId", {
                          required: "Email is required",
                          validate: validateEmail
                        })}
                        onKeyPress={(e) => {
                          if (e.key === ' ') e.preventDefault();
                        }}
                      />
                      <small className="text-danger">{errors.emailId?.message}</small>
                    </div>
                    <div className="col-md-6 mb-2 mt-2">
                      <label>Manager <span className="text-danger">*</span></label>
                      <select className="form-select" id='manager' name='manager'
                        {...register("manager", { required: "Select Manager" })}
                      >
                        <option value="">Select Manager</option>
                        {dropdownOptions.map((mgr) => (
                          <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                        ))}
                      </select>
                      <small className="text-danger">{errors.manager?.message}</small>
                    </div>
                    <div className="col-md-6 mb-2 mt-2">
                      <label>Date of Hiring <span className="text-danger">*</span></label>
                      <input type="date" className="form-control"
                        readOnly={!!location.state?.id} // Set readOnly if employee ID exists
                        onClick={(e) => e.target.showPicker()}
                        {...register("dateOfHiring", {
                          required: "Date of Hiring is required",
                          validate: validateHiringDate
                        })}
                      />
                      <small className="text-danger">{errors.dateOfHiring?.message}</small>
                    </div>
                    <div className="col-md-6 mb-2 mt-2">
                      <label>Branch Location <span className="text-danger">*</span></label>
                      <input type="text" placeholder='Enter Branch Location' className="form-control" onInput={toInputAddressCase}
                        {...register("location", {
                          required: "Branch Location is required",
                          validate: validateLocation
                        })}
                      />
                      <small className="text-danger">{errors.location?.message}</small>
                    </div>
                    <div className="col-md-6 mb-2 mt-2">
                      <label>Status <span className="text-danger">*</span></label>
                      <select className="form-select" id='status' name='status'
                        {...register("status", { required: "Select Status" })}
                      >
                        <option value="">Select Status</option>
                        <option value='Active'>Active</option>
                        <option value='relieved'>Relieved</option>
                        {/* <option value='OnBoard'>OnBoard</option> */}
                        {/* {showNoticePeriodOption && <option value='NoticePeriod'>Notice Period</option>} */}
                      </select>
                      <small className="text-danger">{errors.status?.message}</small>
                    </div>

                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <h3 className="mb-3">Step 2: Personal Details<span className='text-danger'>*</span></h3>
                  <h5>Personal Details</h5>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label htmlFor="dob" className="form-label">Date of Birth <span className="text-danger">*</span></label>
                      <input type="date" className="form-control" id="dob"
                        readOnly={!!location.state?.id} // Set readOnly if employee ID exists
                        onClick={(e) => e.target.showPicker()}
                        {...register("dateOfBirth", {
                          required: "Date of Birth is required",
                          validate: validateDOB
                        })}
                      />
                      <small className="text-danger">{errors.dateOfBirth?.message}</small>
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="mobileNumber" className="form-label">Mobile Number <span className="text-danger">*</span></label>
                      <input type="tel" placeholder='Enter Mobile Number' className="form-control" id="mobileNumber" defaultValue="+91 "
                        {...register("mobileNo", {
                          required: "Mobile Number is required",
                          validate: validatePhoneNumber
                        })}
                      />
                      <small className="text-danger">{errors.mobileNo?.message}</small>
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="alternateNumber" placeholder='Enter Alternate Number' className="form-label">Alternate Number <span className="text-danger">*</span></label>
                      <input type="tel" className="form-control" defaultValue="+91 "
                        {...register("alternateNo", {
                          required: "Alternate Number is required",
                          validate: validatePhoneNumber,
                        })}
                      />
                      <small className="text-danger">{errors.alternateNo?.message}</small>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="maritalStatus" className="form-label">Marital Status <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="maritalStatus"
                        {...register("maritalStatus", { required: "Please select your Marital Status" })}
                      >
                        <option value="">Select Marital Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                      <small className="text-danger">{errors.maritalStatus?.message}</small>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="aadharNumber" className="form-label">Aadhar Number <span className="text-danger">*</span></label>
                      <input type="text" placeholder='Enter Aadhar Number' className="form-control" id="aadhaarId"
                        readOnly={!!location.state?.id} // Set readOnly if employee ID exists
                        {...register("aadhaarId", {
                          required: "Aadhar Number is required",
                          validate: validateAadhar
                        })}
                      />
                      <small className="text-danger">{errors.aadhaarId?.message}</small>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="panNumber" className="form-label">PAN Number <span className="text-danger">*</span></label>
                      <input type="text" placeholder='Enter PAN Number' className="form-control" id="panNo"
                        readOnly={!!location.state?.id} // Set readOnly if employee ID exists
                        {...register("panNo", {
                          required: "PAN Number is required",
                          validate: validatePAN
                        })}
                      />
                      <small className="text-danger">{errors.panNo?.message}</small>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="uanNumber" placeholder='Enter UAN Number' className="form-label">UAN Number (Optional)</label>
                      <input type="text" className="form-control" id="uanNumber"
                        {...register("uanNo", {
                          validate: validateUAN
                        })}
                      />
                      <small className="text-danger">{errors.uanNo?.message}</small>
                    </div>

                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="pfNo" placeholder='Enter PF Number' className="form-label">PF Number (Optional)</label>
                      <input type="text" className="form-control" id="pfNo"
                        {...register("pfNo", {
                          validate: validatePFNumber
                        })}
                      />
                      <small className="text-danger">{errors.pfNo?.message}</small>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="permanentAddress" placeholder='Enter Permanent Address' className="form-label">Permanent Address <span className="text-danger">*</span></label>
                      <textarea type="text" className="form-control" onInput={toInputAddressCase}
                        {...register("permanentAddress", {
                          required: "Permanent Address is required",
                          validate: validateLocation
                        })}
                      />
                      <small className="text-danger">{errors.permanentAddress?.message}</small>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="tempAddress" placeholder='Enter Temporary Address' className="form-label">Temporary Address <span className="text-danger">*</span></label>
                      <textarea type="text" className="form-control" onInput={toInputAddressCase}
                        {...register("tempAddress", {
                          validate: validateTempAddress
                        })}
                      />
                      <small className="text-danger">{errors.tempAddress?.message}</small>
                    </div>
                  </div>
                  {/* <h5 className="mt-4 mb-3">Permanent Address</h5>
              <div className="col-md-6">
                  <textarea type="text" className="form-control"/>
                </div> */}
                  {/* <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="pStreet" className="form-label">Street</label>
                  <input type="text" className="form-control" id="pStreet" value={formData.pStreet} onChange={(e) => updateFormData('pStreet', e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="pVillage" className="form-label">Village</label>
                  <input type="text" className="form-control" id="pVillage" value={formData.pVillage} onChange={(e) => updateFormData('pVillage', e.target.value)} required />
                </div>
              </div>
          
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="pCity" className="form-label">City</label>
                  <input type="text" className="form-control" id="pCity" value={formData.pCity} onChange={(e) => updateFormData('pCity', e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="pPincode" className="form-label">Pincode</label>
                  <input type="text" className="form-control" id="pPincode" value={formData.pPincode} onChange={(e) => updateFormData('pPincode', e.target.value)} required />
                </div>
              </div>
          
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="pState" className="form-label">State</label>
                  <input type="text" className="form-control" id="pState" value={formData.pState} onChange={(e) => updateFormData('pState', e.target.value)} required />
                </div>
              </div> */}

                  {/* <h5 className="mt-4 mb-3">Temporary Address</h5>
                <div className="col-md-6">
                  <textarea type="text" className="form-control"/>
                </div> */}
                </div>
              )}
              {step === 3 && (
                <div>
                  <h3 className="mb-3">Step 3: Educational Details<span className='text-danger'>*</span></h3>
                  {educationFields.map((edu, index) => (
                    <div key={edu.id} className="row mb-2">
                      <div className="col-md-4">
                        <label>Education Level <span className="text-danger">*</span></label>
                        <input type="text" placeholder='Enter Education Level' className="form-control" onInput={toInputTitleCase}
                          {...register(`employeeEducation.${index}.educationLevel`, {
                            required: "Education Level is required",
                            pattern: { value: /^[A-Za-z0-9\s]+$/, message: "Only letters allowed" }
                          })}
                        />
                        <small className="text-danger">{errors.employeeEducation?.[index]?.educationLevel?.message}</small>
                      </div>

                      <div className="col-md-4">
                        <label>Name of Institution/University <span className="text-danger">*</span></label>
                        <input type="text" placeholder='Enter Name of Institution/University' className="form-control" onInput={toInputTitleCase}
                          {...register(`employeeEducation.${index}.instituteName`, {
                            required: "Institution is required",
                            pattern: { value: /^[A-Za-z\s,.()\[\]]+$/, message: "Only letters allowed" }
                          })}
                        />
                        <small className="text-danger">{errors.employeeEducation?.[index]?.instituteName?.message}</small>
                      </div>

                      <div className="col-md-4">
                        <label>Board of Study <span className="text-danger">*</span></label>
                        <input type="text" placeholder='Enter Board of Study' className="form-control" onInput={toInputTitleCase}
                          {...register(`employeeEducation.${index}.boardOfStudy`, {
                            required: "Board of Study is required",
                            pattern: { value: /^[A-Za-z\s,.()\[\]]+$/, message: "Only letters allowed" }
                          })}
                        />
                        <small className="text-danger">{errors.employeeEducation?.[index]?.boardOfStudy?.message}</small>
                      </div>

                      <div className="col-md-4">
                        <label>Branch/Specialization <span className="text-danger">*</span></label>
                        <input type="text" placeholder='Enter Branch/Specialization' className="form-control" onInput={toInputAddressCase}
                          {...register(`employeeEducation.${index}.branch`, {
                            required: "Branch is required",
                            pattern: { value: /^[A-Za-z\s,.()\[\]]+$/, message: "Only letters allowed" }
                          })}
                        />
                        <small className="text-danger">{errors.employeeEducation?.[index]?.branch?.message}</small>
                      </div>

                      <div className="col-md-4">
                        <label>Year of Pass Out <span className="text-danger">*</span></label>
                        <input type="text" placeholder='Enter Year of Pass Out' className="form-control"
                          {...register(`employeeEducation.${index}.year`, {
                            required: "Year is required",
                            pattern: { value: /^(19|20)\d{2}$/, message: "Enter a valid 4-digit year (1900-2099)" }
                          })}
                        />
                        <small className="text-danger">{errors.employeeEducation?.[index]?.year?.message}</small>
                      </div>

                      <div className="col-md-4">
                        <label>Percentage <span className="text-danger">*</span></label>
                        <input type="text" placeholder='Enter Percentage' className="form-control"
                          {...register(`employeeEducation.${index}.percentage`, {
                            required: "Percentage is required",
                            pattern: { value: /^(100|[0-9]{1,2}(\.\d{1,2})?)$/, message: "Enter a valid percentage (0-100)" }
                          })}
                        />
                        <small className="text-danger">{errors.employeeEducation?.[index]?.percentage?.message}</small>
                      </div>

                      <div className="col-md-1">
                        <button type="button" className="btn btn-danger mt-4" onClick={() => removeEducation(index)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-primary mt-2" onClick={() => addEducation({ educationLevel: "", instituteName: "", boardOfStudy: "", branch: "", year: "", percentage: "" })}>
                    Add More
                  </button>
                </div>
              )}
              {/* Step 4: Experience Details */}
              {step === 4 && (
                <div>
                  <h3 className="mb-3">Step 4: Experience Details(<span className='text-small'>Optional</span>)</h3>
                  {experienceFields.map((exp, index) => {
                    return (
                      <div key={exp.id} className="row mb-2">
                        <div className="col-md-3">
                          <label>Company Name</label>
                          <input type="text" placeholder='Enter Company Name' className="form-control" onInput={toInputAddressCase}
                            {...register(`employeeExperience.${index}.companyName`, {
                              validate: validateCompanyName
                            })}
                          />
                          <small className="text-danger">{errors.employeeExperience?.[index]?.companyName?.message}</small>
                        </div>

                        <div className="col-md-3">
                          <label>Designation/Role</label>
                          <input type="text" placeholder='Enter Designation/Role' className="form-control" onInput={toInputAddressCase}
                            {...register(`employeeExperience.${index}.positionOrTitle`, {
                              validate: validateCompanyName
                            })}
                          />
                          <small className="text-danger">{errors.employeeExperience?.[index]?.positionOrTitle?.message}</small>
                        </div>

                        <div className="col-md-2">
                          <label>Start Date</label>
                          <input type="date" className="form-control"
                            onClick={(e) => e.target.showPicker()}
                            {...register(`employeeExperience.${index}.startDate`, {
                            })}
                            onChange={(e) => calculateTenure(0, e.target.value, getValues(`employeeExperience.0.endDate`))}
                          />
                          <small className="text-danger">{errors.employeeExperience?.[0]?.startDate?.message}</small>
                        </div>

                        <div className="col-md-2">
                          <label>End Date</label>
                          <input type="date" className="form-control"
                            onClick={(e) => e.target.showPicker()}
                            {...register(`employeeExperience.${index}.endDate`, {
                              validate: (value) => validateDates(value, index), // Custom validation
                            })}
                            onChange={(e) => calculateTenure(0, getValues(`employeeExperience.0.startDate`), e.target.value)}
                          />
                          <small className="text-danger">{errors.employeeExperience?.[0]?.endDate?.message}</small>
                        </div>

                        <div className="col-md-2">
                          <label>Tenure</label>
                          <input type="text" className="form-control"
                            {...register(`employeeExperience.0.tenure`)}
                            readOnly />
                        </div>

                        <div className="col-md-1">
                          <button type="button" className="btn btn-danger mt-4" onClick={() => removeExperience(index)}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                  <button type="button" className="btn btn-primary mt-2" onClick={() => addExperience({ companyName: "", positionOrTitle: "", startDate: "", endDate: "", tenure: "" })}>
                    Add More
                  </button>
                </div>
              )}
              {step === 5 && (
                <div>
                  <h3 className="mb-3">Step 5: Personal & Bank Details <span className='text-danger'>*</span></h3>
                  <div className="row">
                    <div className="col-md-6">
                      <label>Bank Name <span className="text-danger">*</span></label>
                      <select className="form-select"  {...register("bankName", { required: "Bank Name is required" })}>
                        <option value="">Select Bank</option>
                        {bank.map((bank, index) => (
                          <option key={index} value={bank.bankName}>
                            {bank.bankName}
                          </option>
                        ))}
                      </select>
                      <small className="text-danger">{errors.bankName?.message}</small>
                    </div>
                    <div className="col-md-6">
                      <label>Account Number <span className="text-danger">*</span></label>
                      <input type="text" placeholder='Enter Account Number' className="form-control" name='accountNo'
                        {...register("accountNo", {
                          required: "Account Number is required",
                          pattern: {
                            value: /^\d{9,18}$/,
                            message: "Enter a valid Account Number (8-18 digits only)",
                          },
                        })}
                      />
                      <small className="text-danger">{errors.accountNo?.message}</small>
                    </div>
                    <div className="col-md-6 mt-2">
                      <label>IFSC Code <span className="text-danger">*</span></label>
                      <input type="text" placeholder='Enter IFSC Code' className="form-control"
                        {...register("ifscCode", {
                          required: "IFSC Code is required",
                          pattern: {
                            value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                            message: "Invalid IFSC Code format (e.g., HDFC0123456)",
                          },
                        })}
                      />
                      <small className="text-danger">{errors.ifscCode?.message}</small>
                    </div>
                    <div className="col-md-6 mt-2">
                      <label>Branch <span className="text-danger">*</span></label>
                      <input type="text" placeholder='Enter Branch' className="form-control" onInput={toInputAddressCase}
                        {...register("bankBranch", {
                          required: "Branch Name is required",
                          validate: validateLocation
                        })}
                      />
                      <small className="text-danger">{errors.bankBranch?.message}</small>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-3 d-flex justify-content-between">
                {step > 1 && (
                  <button type="button" className="btn btn-secondary me-2" onClick={onPrevious}>
                    Previous
                  </button>
                )}
                <button type="button" className="btn btn-warning me-2" onClick={handleClear}>
                  Clear
                </button>
                {step < 5 ? (
                  <button type="button" className="btn btn-primary" onClick={onNext}>
                    Next
                  </button>
                ) : (
                  <button type="submit" className="btn btn-success">
                    Submit
                  </button>
                )}
              </div>
            </form>
            {errorMessage && (
              <div className="alert alert-danger mt-4 text-center">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </LayOut>

  );
}