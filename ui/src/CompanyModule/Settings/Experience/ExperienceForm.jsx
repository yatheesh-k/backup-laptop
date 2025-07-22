import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useLocation,Link } from "react-router-dom";
import Select from "react-select";
import { Bounce, toast } from "react-toastify";
import LayOut from "../../../LayOut/LayOut";
import {
  EmployeeGetApi,
  EmployeeGetApiById,
  ExperienceFormPostApi,
  TemplateGetAPI,
} from "../../../Utils/Axios";
import { useAuth } from "../../../Context/AuthContext";
import ExperiencePreview from "./ExperiencePreview";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../../../Redux/EmployeeSlice";

const ExperienceForm = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm({ mode: "onChange" });
  const { authUser, companyData } = useAuth();
  const [emp, setEmp] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [noticePeriod, setNoticePeriod] = useState(0);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // New state to store the selected employee
  const [templateAvailable, setTemplateAvailable] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  // Fetch employees from Redux store
  const { data: employees, status, error } = useSelector((state) => state.employees);

  // Fetch employees when the component mounts
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const validateExperienceDate = (value) => {
    const dateOfHiring = new Date(watch("dateOfHiring"));
    const experienceDate = new Date(value);
    const today = new Date();
    if (experienceDate > today) {
      return "Experience Date cannot be in the Future";
    }
    if (experienceDate < dateOfHiring) {
      return "Experience Date must be after Date of Hired.";
    }
    return true;
  };

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async (companyId) => {
    try {
      const res = await TemplateGetAPI(companyId);
      const templateNumber = res.data.data.experienceTemplateNo;
      setSelectedTemplate(templateNumber);
      setTemplateAvailable(!!templateNumber);
    } catch (error) {
      handleError(error);
      setTemplateAvailable(false);
    }
  };

  useEffect(() => {
    if (employees) {
      const activeEmployees = employees
        .filter((employee) => employee.status === "Active")
        .map((employee) => ({
          label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
          value: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId,
          designationName: employee.designationName,
          departmentName: employee.departmentName,
          dateOfHiring: employee.dateOfHiring,
        }));

      setEmp(activeEmployees);
    }
  }, [employees]);

  // Helper function to format date as dd-mm-yyyy
  const formatDate = (date) => {
    if (!date) return ""; // If the date is falsy, return an empty string

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0"); // Get the day, ensuring two digits
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Get the month (0-indexed)
    const year = d.getFullYear(); // Get the full year

    return `${day}-${month}-${year}`;
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

  const onSubmit = (data) => {
    console.log(data);
    const draftValue = data.draft === "true"; // Convert string to boolean
    const submissionData = {
      employeeId: data.employeeId,
      companyName: authUser.company,
      lastWorkingDate: data.experienceDate,
      date:data.generatedDate,
      aboutEmployee:data.aboutEmployee,
      draft:draftValue,

    };
    // Format the date fields to dd-mm-yyyy format
    const formattedLastWorkingDate = formatDate(data.relievingDate);
    const formattedExperinceDate = formatDate(data.experienceDate);
    const formattedHiringDate = formatDate(data.dateOfHiring);
    const preview = {
      employeeName: selectedEmployee
        ? selectedEmployee.employeeName
        : data.employeeName,
      employeeId: selectedEmployee
        ? selectedEmployee.employeeId
        : data.employeeId,
      designationName: data.designationName || "",
      departmentName: data.departmentName || "",
      joiningDate: formattedHiringDate || "",
      aboutEmployee:data.aboutEmployee || "",
      lastWorkingDate: formattedExperinceDate || "", // Resignation date formatted
      date: data.generatedDate || "",
      noticePeriod,
      companyName: authUser.company,
      companyData: companyData,
      draft: draftValue,

    };
    console.log("previewData", preview)
    setPreviewData(preview);
    setShowPreview(true);
    setSubmissionData(submissionData);
  };

  const handleConfirmSubmission = async () => {
    try {
      const success = await ExperienceFormPostApi(submissionData);
      if (success) {
        setShowPreview(true);
        reset();
      }
    } catch (error) {
      console.error("Error downloading the PDF:", error);
      handleError(error);
    }
  };

  const handleError = (errors) => {
    if (errors.response) {
      const status = errors.response.status;
      let errorMessage = "";

      switch (status) {
        case 403:
          errorMessage = "Session Timeout!";
          navigate("/");
          break;
        case 404:
          errorMessage = "Resource Not Found!";
          break;
        case 406:
          errorMessage = "Invalid Details!";
          break;
        case 500:
          errorMessage = "Server Error!";
          break;
        default:
          errorMessage = "An Error Occurred!";
          break;
      }

      toast.error(errorMessage, {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
    } else {
      // toast.error("Network Error!", {
      //   position: "top-right",
      //   transition: Bounce,
      //   hideProgressBar: true,
      //   theme: "colored",
      //   autoClose: 3000,
      // });
    }
  };

  const handleEmployeeChange = (selectedOption) => {
    // Update the selected employee in the state
    const selectedEmp = emp.find((emp) => emp.value === selectedOption?.value);

    if (selectedEmp) {
      setSelectedEmployee(selectedEmp);

      // Update form fields with selected employee data
      setValue("employeeId", selectedEmp.value); // set employeeId correctly
      setValue("designationName", selectedEmp.designationName);
      setValue("departmentName", selectedEmp.departmentName);
      setValue("dateOfHiring", selectedEmp.dateOfHiring);

      // Clear any previous errors
      clearErrors("employeeId");

      // Trigger validation for the employeeId field
      trigger("employeeId");
    } else {
      // If no employee is selected, reset other fields
      setValue("employeeId", "");
      setValue("designationName", "");
      setValue("departmentName", "");
      setValue("dateOfHiring", "");

      // Set error if needed, but it's likely you just want to reset
      // setError("employeeId", { message: "Employee selection is required" });

      // Clear any previous errors
      clearErrors("employeeId");
    }
  };

  const clearForm = () => {
    // Reset the entire form, including the employeeId (react-select) to null
    reset({
      employeeId: null, // Reset the Select field to null
      employeeName: "",
      designationName: "",
      departmentName: "",
      dateOfHiring: "",
      experienceDate: "",
      aboutEmployee: "",
      generatedDate: "",
      draft: "",
    });
  };

  useEffect(() => {
    if (location.state && location.state.employeeId) {
      EmployeeGetApiById(location.state.employeeId)
        .then((response) => {
          reset(response.data);
          setIsUpdating(true);
        })
        .catch((errors) => {
          handleError(errors);
        });
    }
  }, [location.state, reset]);

  const nextSixMonths = new Date();
  nextSixMonths.setMonth(nextSixMonths.getMonth() + 6);
  const sixMonthsFromNow = nextSixMonths.toISOString().split("T")[0];

  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Step 2: Display loading or error messages
  if (status === "loading") return <p>Loading employees...</p>;
  if (status === "failed") return <p>Error: {error}</p>;

  // Render loading message or template not available message
  if (!templateAvailable) {
    return (
      <LayOut>
        <div className="container-fluid p-0">
          <div className="row justify-content-center">
            <div className="col-8 text-center mt-5">
              <h2>No Experience Template Available</h2>
              <p>
                To set up the experience templates before proceeding, Please
                select the Template from Settings{" "}
                <Link to="/experienceLetter" className="custom-link text-primary bg-opacity-25">Expereince Templates </Link>
              </p>
              <p>
                Please contact the administrator to set up the experience
                templates before proceeding.
              </p>
            </div>
          </div>
        </div>
      </LayOut>
    );
  }

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1">
          <div className="col">
            <h1 className="h3">
              <strong>Experience Form</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Generate Experience</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">
                  {isUpdating
                    ? "Employee Experience Data"
                    : "Employee Experience Form"}
                </h5>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                      <label className="form-label">Select Employee Name</label>
                      <Controller
                        name="employeeId"
                        control={control}
                        rules={{ required: "Employee Name is required" }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={emp}
                            value={
                              emp.find(
                                (option) => option.value === field.value
                              ) || null
                            } // Handle clearing
                            onChange={handleEmployeeChange}
                            placeholder="Select Employee Name"
                          />
                        )}
                      />
                      {errors.employeeId && (
                        <p className="errorMsg">{errors.employeeId.message}</p>
                      )}
                    </div>
                    <input
                      type="hidden"
                      className="form-control"
                      placeholder="Designation"
                      name="employeeName"
                      readOnly
                      {...register("employeeName")}
                    />

                    <input
                      type="hidden"
                      className="form-control"
                      placeholder="Designation"
                      name="employeeId"
                      readOnly
                      {...register("employeeId")}
                    />
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Designation"
                        name="designationName"
                        readOnly
                        {...register("designationName", { required: true })}
                      />
                      {/* {errors.designationName && (
                        <p className="errorMsg">Designation Required</p>
                      )} */}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Department"
                        name="departmentName"
                        readOnly
                        {...register("departmentName", { required: true })}
                      />
                      {/* {errors.departmentName && (
                        <p className="errorMsg">Department Required</p>
                      )} */}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Date of Hired</label>
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Resignation Date"
                        name="dateOfHiring"
                        readOnly
                        {...register("dateOfHiring", { required: true })}
                      />
                      {/* {errors.dateOfHiring && (
                        <p className="errorMsg">Date of Hiring Required</p>
                      )} */}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Last Working Day</label>
                      <Controller
                        name="experienceDate"
                        control={control}
                        // max={sixMonthsFromNow}
                        rules={{
                          required: "Last Working Date is required",
                          validate: validateExperienceDate,
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="date"
                            className="form-control"
                            placeholder="Last Working Date"
                            max={getCurrentDate()}

                          />
                        )}
                      />
                      {errors.experienceDate && (
                        <p className="errorMsg">
                          {errors.experienceDate.message}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-6 mb-3">
                      <label className="form-label">About Employee</label>
                      <textarea
                        type="text"
                        className="form-control"
                        placeholder="Enter few lines about Employee"
                        autoComplete="off"
                        minLength={2}
                        onKeyDown={handleEmailChange}
                        onInput={toInputAddressCase}
                        {...register("aboutEmployee", {
                          required: "Few lines about Employee Required",
                          pattern: {
                            value:
                              /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,-_&*.()^\-/]*$/,
                            message: "Please enter a valid description",
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
                      {errors.aboutEmployee && (
                        <p className="errorMsg">
                          {errors.aboutEmployee.message}
                        </p>
                      )}
                    </div>
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Letter Generated Date</label>
                    <input
                       type="date"
                       name="generatedDate"
                       placeholder="Enter Generated Date"
                       className="form-control"
                       autoComplete="off"
                       onClick={(e) => e.target.showPicker()}
                        {...register("generatedDate", {
                       required: "Generated Date is required",
                        validate: {

                       notBeforeLastWorkingDate: (value) => {
                        const lastWorkingDate = watch("experienceDate");
                       if (!lastWorkingDate) return true; // Skip this check if lastWorkingDate isn't selected yet
                     return (
                      new Date(value) >= new Date(lastWorkingDate) ||
                      "Generated Date cannot be before Last Working Date"
                       );
                      },
                    },
                  })}
                 />
                      {errors.generatedDate && (
                     <p className="errorMsg">{errors.generatedDate.message}</p>
                         )}

                </div>
                <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label mb-2">Select Mode</label>
                      <div className="d-flex align-items-center gap-3"> {/* Flexbox for side-by-side alignment */}
                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            id="draft"
                            name="draft"
                            value={true}
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
                            value={false}
                            {...register("draft", { required: true })}
                          />
                          <label className="form-check-label" htmlFor="undraft">
                            Digital Copy
                          </label>
                        </div>
                      </div>
                      {errors.draft && (
                        <p className="errorMsg">Please select Draft Copy or Digital Copy</p>
                      )}
                    </div>

                    <div className="col-12 d-flex align-items-start mt-5">
                      {error && (
                        <div className="col-9 alert alert-danger text-center mt-4">
                          {error}
                        </div>
                      )}
                      <div
                        className={`col-${error ? "3" : "12"
                          } d-flex justify-content-end mt-4`}
                      >
                        <button
                          className="btn btn-secondary me-2"
                          type="button"
                          onClick={clearForm}
                        >
                          Clear
                        </button>
                        <button
                          className={
                            isUpdating
                              ? "btn btn-danger btn-lg"
                              : "btn btn-primary btn-lg"
                          }
                          type="submit"
                        >
                          {isUpdating ? "Update" : "Submit"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              {showPreview && (
                <div
                  className={`modal fade ${showPreview ? "show" : ""}`}
                  style={{ display: showPreview ? "block" : "none" }}
                  tabIndex="-1"
                  role="dialog"
                  aria-hidden={!showPreview}
                >
                  <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content mt-2 mb-3">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          Preview Experience Letter
                        </h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowPreview(false)}
                          aria-label="Close"
                        >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div className="modal-body">
                        <ExperiencePreview
                          previewData={previewData}
                          selectedTemplate={selectedTemplate}
                        />
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowPreview(false)}
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleConfirmSubmission}
                        >
                          Confirm Submission
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default ExperienceForm;
