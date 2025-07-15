import React, { useState, useEffect } from 'react';
import LayOut from '../../LayOut/LayOut';
import { useDispatch, useSelector } from 'react-redux';
import { BankNamesGetApi, DepartmentGetApi, DesignationGetApi, CandidateToEmployeePostApi, CandidateGetByIdApi } from '../../Utils/Axios';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { handleBranchInput, toInputAddressCase, toInputTitleCase, validateAadhar, validateCompanyName, validateEmail, validateFirstName, validateLastName, validateLocation, validateNumber, validatePAN, validatePFNumber, validatePhoneNumber, validateTempAddress, validateUAN } from '../../Utils/Validate';
import { fetchEmployees } from '../../Redux/EmployeeSlice';

export default function CandidateToEmployee() {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { errors },
        trigger,
        getValues
    } = useForm({
        mode: "onChange",
        defaultValues: {
            employeeType: "",
            employeeId: "",
            firstName: "",
            lastName: "",
            department: "",
            designation: "",
            manager: "",
            dateOfHiring: "",
            location: "",
            status: "Active",
            emailId: "",
            dateOfBirth: "",
            mobileNo: "",
            alternateNo: "",
            maritalStatus: "",
            panNo: "",
            uanNo: "",
            aadhaarId: "",
            accountNo: "",
            ifscCode: "",
            bankName: "",
            bankBranch: "",
            pfNo: "",
            tempAddress: "",
            permanentAddress: "",
            employeeEducation: [{ educationLevel: "", instituteName: "", boardOfStudy: "", branch: "", year: "", percentage: "" }],
            employeeExperience: [{ companyName: "", positionOrTitle: "", startDate: "", endDate: "", tenure: "" }]
        }
    });

    const { id: candidateId } = useParams();
    const { authUser } = useAuth();
    const [step, setStep] = useState(1);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [bank, setBank] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [candidate, setCandidate] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();
    const candidateDataFromState = state?.candidate
    const { data: employees, status, error } = useSelector((state) => state.employees);
    const [useCandidateEmail, setUseCandidateEmail] = useState(true);
    const [emailConfirmed, setEmailConfirmed] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const { employee } = useAuth();
    const companyId = employee?.companyId;

    // Field arrays
    const { fields: educationFields, append: addEducation, remove: removeEducation } = useFieldArray({
        control,
        name: "employeeEducation"
    });

    const { fields: experienceFields, append: addExperience, remove: removeExperience } = useFieldArray({
        control,
        name: "employeeExperience"
    });

    const watchDepartment = watch("department");

    // Fetch candidate data directly
    useEffect(() => {
        const fetchCandidateData = async () => {
            try {
                setLoading(true);
                let candidateData;

                if (candidateDataFromState) {
                    candidateData = candidateDataFromState;
                } else {
                    const response = await CandidateGetByIdApi(candidateId);
                    candidateData = response.data.data;
                }

                setCandidate(candidateData);

                // Pre-fill first name, last name, and mobile
                reset({
                    firstName: candidateData.firstName || "",
                    lastName: candidateData.lastName || "",
                    mobileNo: candidateData.mobileNo || "",
                    emailId: candidateData.emailId || "" // Will be cleared if user chooses
                });

                // Show email modal if email exists
                if (candidateData.emailId) {
                    setShowEmailModal(true);
                } else {
                    setEmailConfirmed(true); // No email to confirm
                }

            } catch (error) {
                console.error('Error fetching candidate:', error);
                toast.error('Failed to load candidate data');
                navigate('/candidatesView');
            } finally {
                setLoading(false);
            }
        };

        if (candidateId) {
            fetchCandidateData();
        }
    }, [candidateId, navigate, reset, setValue, candidateDataFromState]);


    // Navigation between steps
    const onNext = async (e) => {
        e.preventDefault();
        const isValid = await trigger();
        if (isValid) setStep(step + 1);
    };

    const onPrevious = () => setStep(step - 1);

    // Employment types
    const employmentTypes = [
        { value: "Permanent", label: "Permanent" },
        { value: "Contract", label: "Contract" },
        { value: "Trainee", label: "Trainee" },
        { value: "Support", label: "Support" },
        { value: "Associate", label: "Associate" },
    ];

    // Form submission
    const onSubmit = async (data) => {
        const payload = {
            companyName: authUser.company,
            employeeType: data.employeeType,
            employeeId: data.employeeId,
            firstName: data.firstName,
            lastName: data.lastName,
            emailId: data.emailId,
            designation: data.designation,
            dateOfHiring: data.dateOfHiring,
            dateOfBirth: data.dateOfBirth,
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
            pfNo: data.pfNo,
            personnelEntity: {
                employeeEducation: data.employeeEducation?.map(edu => ({
                    educationLevel: edu.educationLevel || "",
                    instituteName: edu.instituteName || "",
                    boardOfStudy: edu.boardOfStudy || "",
                    branch: edu.branch || "",
                    year: edu.year || "",
                    percentage: edu.percentage || ""
                })) || []
            }
        };

        // Add experience if present
        const validExperience = data.employeeExperience?.filter(exp =>
            exp.companyName.trim() || exp.positionOrTitle.trim() || exp.startDate.trim() || exp.endDate.trim()
        );
        if (validExperience?.length > 0) {
            payload.personnelEntity.employeeExperience = validExperience;
        }

        try {
            const response = await CandidateToEmployeePostApi(candidateId, payload);
            toast.success("Candidate successfully converted to employee");
            // Dispatch action to refresh employee list
            dispatch(fetchEmployees(authUser.companyId));
            navigate("/employeeView");
        } catch (error) {
            console.error("Error converting candidate:", error);

            const status = error.response?.status;
            const backendMessage = error.response?.data?.error?.message || error.response?.data?.message;

            let userFriendlyMessage = "An unexpected error occurred. Please try again.";

            if (status === 404 && backendMessage?.includes("not uploaded any documents")) {
                userFriendlyMessage = "Candidate has not uploaded any documents. Please ensure all required documents are submitted before conversion.";
            } else if (status === 400) {
                userFriendlyMessage = backendMessage || "Invalid request. Please check the form data.";
            } else if (status === 500) {
                userFriendlyMessage = "Server error occurred. Please contact support if the issue persists.";
            } else if (backendMessage) {
                userFriendlyMessage = backendMessage;
            }

            setErrorMessage(userFriendlyMessage);
            toast.error(userFriendlyMessage);
        }

    };

    // Fetch data functions
    const fetchDepartments = async () => {
        try {
            const data = await DepartmentGetApi();
            setDepartments(data.data.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchDesignations = async (departmentId) => {
        try {
            const data = await DesignationGetApi(departmentId);
            setDesignations(data);
        } catch (error) {
            console.error('Error fetching designations:', error);
            setDesignations([]);
        }
    };

    const fetchBankNames = async () => {
        try {
            const res = await BankNamesGetApi();
            setBank(res.data);
        } catch (error) {
            console.error('Error fetching banks:', error);
        }
    };


    // Fetch static data
    useEffect(() => {
        fetchDepartments();
        fetchBankNames();
    }, []);

    // Update designations when department changes
    useEffect(() => {
        if (watchDepartment) {
            fetchDesignations(watchDepartment);
        } else {
            setDesignations([]);
        }
    }, [watchDepartment]);

    // Validation functions
    const validateDOB = (value) => {
        if (!value) return "Date of Birth is required";
        const year = new Date(value).getFullYear();
        if (year.toString().length !== 4) return "Year must be exactly 4 digits";

        const dobDate = new Date(value);
        const minHiringDate = new Date(dobDate);
        minHiringDate.setFullYear(minHiringDate.getFullYear() + 16);

        if (watch("dateOfHiring") && new Date(watch("dateOfHiring")) < minHiringDate) {
            return "Employee must be at least 16 years old at hiring.";
        }
        return true;
    };

    const validateHiringDate = (value) => {
        if (!value) return "Date of Hiring is required";
        const year = new Date(value).getFullYear();
        if (year.toString().length !== 4) return "Year must be exactly 4 digits";

        const hiringDate = new Date(value);
        const dobDate = new Date(watch("dateOfBirth"));

        if (watch("dateOfBirth") && hiringDate < new Date(dobDate.setFullYear(dobDate.getFullYear() + 16))) {
            return "Hiring date must be at least 16 years after DOB.";
        }
        return true;
    };

    const validateDates = (value, index) => {
        const startDate = getValues(`employeeExperience.${index}.startDate`);
        if (!startDate || !value) return true;
        return new Date(value) >= new Date(startDate) || "End Date cannot be before Start Date";
    };

    const calculateTenure = (index, startDate, endDate) => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start < end) {
                let years = end.getFullYear() - start.getFullYear();
                let months = end.getMonth() - start.getMonth();
                let days = end.getDate() - start.getDate();
                const fractionalYears = years + (months / 12) + (days / 365);
                setValue(`employeeExperience.${index}.tenure`, `${fractionalYears.toFixed(2)} years`);
            } else {
                setValue(`employeeExperience.${index}.tenure`, "Invalid date range");
            }
        }
    };

    // Get manager options
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

    return (
        <LayOut>
            {/* Email Confirmation Modal */}
            {showEmailModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Email Confirmation</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowEmailModal(false);
                                        setUseCandidateEmail(true); // Default to keeping email
                                        setEmailConfirmed(true);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>The candidate has the following email address:</p>
                                <div className="alert alert-info">
                                    <strong>{candidate?.emailId}</strong>
                                </div>
                                <p>Would you like to use this email for the employee registration?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setUseCandidateEmail(true);
                                        setEmailConfirmed(true);
                                        setShowEmailModal(false);
                                    }}
                                >
                                    Yes, Use This Email
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        setUseCandidateEmail(false);
                                        setValue("emailId", "");
                                        setEmailConfirmed(true);
                                        setShowEmailModal(false);
                                        toast.info('Please enter a new email address');
                                    }}
                                >
                                    No, Enter Different Email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="row container d-flex justify-content-center align-items-center min-vh-100">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3">
                            <strong>Convert Candidate to Employee</strong>
                        </h1>
                    </div>
                    <div className="col-auto">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <a href="/main">Home</a>
                                </li>
                                <li className="breadcrumb-item">
                                    <a href="/candidatesView">Candidates</a>
                                </li>
                                <li className="breadcrumb-item active">Convert to Employee</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="card shadow-lg p-4 w-100">
                    <div className="card-body">
                        <h2 className="text-start text-dark">Candidate to Employee Conversion</h2>
                        <div className="alert alert-info mb-4">
                            <strong>Converting Candidate: {candidate?.firstName} {candidate?.lastName}</strong>
                            <p className="mb-0">Basic information has been pre-filled from the candidate record.</p>
                        </div>

                        <div className="d-flex justify-content-end my-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className={`mx-1 rounded-circle ${i === step ? 'bg-primary' : i < step ? 'bg-success' : 'bg-secondary'}`}
                                    style={{ width: '10px', height: '10px' }}
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
                                            <label>Employee First Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                onInput={toInputTitleCase}
                                                {...register("firstName", {
                                                    required: "First Name is required",
                                                    validate: validateFirstName
                                                })}
                                            />
                                            <small className="text-danger">{errors.firstName?.message}</small>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <label>Employee Last Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                onInput={toInputTitleCase}
                                                {...register("lastName", {
                                                    required: "Last Name is required",
                                                    validate: validateLastName
                                                })}
                                            />
                                            <small className="text-danger">{errors.lastName?.message}</small>
                                        </div>
                                        <div className="col-md-6 mb-2 mt-2">
                                            <label>Employee ID</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                {...register("employeeId", {
                                                    required: "Employee ID is required",
                                                    pattern: { value: /^[A-Za-z0-9_-]+$/, message: "Invalid Employee ID format" },
                                                })}
                                            />
                                            <small className="text-danger">{errors.employeeId?.message}</small>
                                        </div>
                                        <div className="col-md-6 mb-2 mt-2">
                                            <label>Employee Type</label>
                                            <select
                                                className="form-select"
                                                {...register("employeeType", { required: "Select Employee Type" })}
                                            >
                                                <option value="">Select Employment Type</option>
                                                {employmentTypes.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                            <small className="text-danger">{errors.employeeType?.message}</small>
                                        </div>
                                        <div className="col-md-6 mb-2 mt-2">
                                            <label>Department</label>
                                            <select
                                                className="form-select"
                                                {...register("department", {
                                                    required: "Select Department",
                                                    onChange: (e) => {
                                                        setValue("designation", "");
                                                        if (e.target.value) fetchDesignations(e.target.value);
                                                        else setDesignations([]);
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
                                            <label>Designation</label>
                                            <select
                                                className="form-select"
                                                disabled={!watch("department") || designations.length === 0}
                                                {...register("designation", {
                                                    required: {
                                                        value: true,
                                                        message: watch("department") ? "Select Designation" : "Please select a department first"
                                                    }
                                                })}
                                            >
                                                <option value="">Select Designation</option>
                                                {designations.map((des) => (
                                                    <option key={des.id} value={des.id}>{des.name}</option>
                                                ))}
                                            </select>
                                            <small className="text-danger">{errors.designation?.message}</small>
                                        </div>
                                        <div className="col-md-6 mb-2 mt-2">
                                            <label>Employee Mail ID {!useCandidateEmail && <span className="text-danger">*</span>}</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                {...register("emailId", {
                                                    required: !useCandidateEmail && "Email is required",
                                                    validate: validateEmail
                                                })}
                                                disabled={useCandidateEmail && emailConfirmed}
                                                readOnly={useCandidateEmail && emailConfirmed}
                                                 onKeyPress={(e) => {
                                                    if (e.key === ' ') e.preventDefault();
                                                }}
                                            />
                                            {useCandidateEmail && emailConfirmed && (
                                                <small className="text-success">
                                                    <i className="bi bi-check-circle-fill"></i> Using candidate's email address
                                                </small>
                                            )}
                                            <small className="text-danger">{errors.emailId?.message}</small>
                                        </div>
                                        <div className="col-md-6 mb-2 mt-2">
                                            <label>Manager</label>
                                            <select
                                                className="form-select"
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
                                            <label>Date of Hiring</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                onClick={(e) => e.target.showPicker()}
                                                {...register("dateOfHiring", {
                                                    required: "Date of Hiring is required",
                                                    validate: validateHiringDate
                                                })}
                                            />
                                            <small className="text-danger">{errors.dateOfHiring?.message}</small>
                                        </div>
                                        <div className="col-md-6 mb-2 mt-2">
                                            <label>Branch Location</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                onInput={toInputAddressCase}
                                                {...register("location", {
                                                    required: "Branch Location is required",
                                                    validate: validateLocation
                                                })}
                                            />
                                            <small className="text-danger">{errors.location?.message}</small>
                                        </div>
                                        <div className="col-md-6 mb-2 mt-2">
                                            <label>Status</label>
                                            <select
                                                className="form-select"
                                                {...register("status", { required: "Select Status" })}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="relieved">Relieved</option>
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
                                            <label htmlFor="dob" className="form-label">Date of Birth</label>
                                            <input type="date" className="form-control" id="dob"
                                                onClick={(e) => e.target.showPicker()}
                                                {...register("dateOfBirth", {
                                                    required: "Date of Birth is required",
                                                    validate: validateDOB
                                                })}
                                            />
                                            <small className="text-danger">{errors.dateOfBirth?.message}</small>
                                        </div>
                                        <div className="col-md-4">
                                            <label htmlFor="mobileNumber" className="form-label">Mobile Number</label>
                                            <input type="tel" className="form-control" id="mobileNumber" defaultValue="+91 "
                                                {...register("mobileNo", {
                                                    required: "Mobile Number is required",
                                                    validate: validatePhoneNumber
                                                })}
                                            />
                                            <small className="text-danger">{errors.mobileNo?.message}</small>
                                        </div>
                                        <div className="col-md-4">
                                            <label htmlFor="alternateNumber" className="form-label">Alternate Number</label>
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
                                            <label htmlFor="maritalStatus" className="form-label">Marital Status</label>
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
                                            <label htmlFor="aadharNumber" className="form-label">Aadhar Number</label>
                                            <input type="text" className="form-control" id="aadhaarId"
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
                                            <label htmlFor="panNumber" className="form-label">PAN Number</label>
                                            <input type="text" className="form-control" id="panNo"
                                                {...register("panNo", {
                                                    required: "PAN Number is required",
                                                    validate: validatePAN
                                                })}
                                            />
                                            <small className="text-danger">{errors.panNo?.message}</small>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="uanNumber" className="form-label">UAN Number (Optional)</label>
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
                                            <label htmlFor="pfNo" className="form-label">PF Number (Optional)</label>
                                            <input type="text" className="form-control" id="pfNo"
                                                {...register("pfNo", {
                                                    validate: validatePFNumber
                                                })}
                                            />
                                            <small className="text-danger">{errors.pfNo?.message}</small>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="permanentAddress" className="form-label">Permanent Address</label>
                                            <textarea type="text" className="form-control" onInput={toInputAddressCase}
                                                {...register("permanentAddress", {
                                                    required: "Permanent Address is required",
                                                    validate: validateLocation
                                                })}
                                            />
                                            <small className="text-danger">{errors.permanentAddress?.message}</small>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="tempAddress" className="form-label">Temporary Address</label>
                                            <textarea type="text" className="form-control" onInput={toInputAddressCase}
                                                {...register("tempAddress", {
                                                    validate: validateTempAddress
                                                })}
                                            />
                                            <small className="text-danger">{errors.tempAddress?.message}</small>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {step === 3 && (
                                <div>
                                    <h3 className="mb-3">Step 3: Educational Details<span className='text-danger'>*</span></h3>
                                    {educationFields.map((edu, index) => (
                                        <div key={edu.id} className="row mb-2">
                                            <div className="col-md-4">
                                                <label>Education Level</label>
                                                <input type="text" className="form-control" onInput={toInputTitleCase}
                                                    {...register(`employeeEducation.${index}.educationLevel`, {
                                                        required: "Education Level is required",
                                                        pattern: { value: /^[A-Za-z0-9\s]+$/, message: "Only letters allowed" }
                                                    })}
                                                />
                                                <small className="text-danger">{errors.employeeEducation?.[index]?.educationLevel?.message}</small>
                                            </div>

                                            <div className="col-md-4">
                                                <label>Name of Institution/University</label>
                                                <input type="text" className="form-control" onInput={toInputTitleCase}
                                                    {...register(`employeeEducation.${index}.instituteName`, {
                                                        required: "Institution is required",
                                                        pattern: { value: /^[A-Za-z\s,.()\[\]]+$/, message: "Only letters allowed" }
                                                    })}
                                                />
                                                <small className="text-danger">{errors.employeeEducation?.[index]?.instituteName?.message}</small>
                                            </div>

                                            <div className="col-md-4">
                                                <label>Board of Study</label>
                                                <input type="text" className="form-control" onInput={toInputTitleCase}
                                                    {...register(`employeeEducation.${index}.boardOfStudy`, {
                                                        required: "Board of Study is required",
                                                        pattern: { value: /^[A-Za-z\s,.()\[\]]+$/, message: "Only letters allowed" }
                                                    })}
                                                />
                                                <small className="text-danger">{errors.employeeEducation?.[index]?.boardOfStudy?.message}</small>
                                            </div>

                                            <div className="col-md-4">
                                                <label>Branch/Specialization</label>
                                                <input type="text" className="form-control" onInput={toInputAddressCase}
                                                    {...register(`employeeEducation.${index}.branch`, {
                                                        required: "Branch is required",
                                                        pattern: { value: /^[A-Za-z\s,.()\[\]]+$/, message: "Only letters allowed" }
                                                    })}
                                                />
                                                <small className="text-danger">{errors.employeeEducation?.[index]?.branch?.message}</small>
                                            </div>

                                            <div className="col-md-4">
                                                <label>Year of Pass Out</label>
                                                <input type="text" className="form-control"
                                                    {...register(`employeeEducation.${index}.year`, {
                                                        required: "Year is required",
                                                        pattern: { value: /^(19|20)\d{2}$/, message: "Enter a valid 4-digit year (1900-2099)" }
                                                    })}
                                                />
                                                <small className="text-danger">{errors.employeeEducation?.[index]?.year?.message}</small>
                                            </div>

                                            <div className="col-md-4">
                                                <label>Percentage</label>
                                                <input type="text" className="form-control"
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
                                                    <input type="text" className="form-control" onInput={toInputAddressCase}
                                                        {...register(`employeeExperience.${index}.companyName`, {
                                                            validate: validateCompanyName
                                                        })}
                                                    />
                                                    <small className="text-danger">{errors.employeeExperience?.[index]?.companyName?.message}</small>
                                                </div>

                                                <div className="col-md-3">
                                                    <label>Designation/Role</label>
                                                    <input type="text" className="form-control" onInput={toInputAddressCase}
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
                                            <label>Bank Name</label>
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
                                            <label>Account Number</label>
                                            <input type="text" className="form-control" name='accountNo'
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
                                            <label>IFSC Code</label>
                                            <input type="text" className="form-control"
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
                                            <label>Branch</label>
                                            <input type="text" className="form-control" onInput={toInputAddressCase}
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
                                <button
                                    type="button"
                                    className="btn btn-warning me-2"
                                    onClick={() => reset()}
                                >
                                    Clear Form
                                </button>
                                {step < 5 ? (
                                    <button type="button" className="btn btn-primary" onClick={onNext}>
                                        Next
                                    </button>
                                ) : (
                                    <button type="submit" className="btn btn-success">
                                        Convert to Employee
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