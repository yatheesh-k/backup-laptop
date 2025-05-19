import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate} from "react-router-dom";
import Select from "react-select";
import { Bounce, toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import Loader from "../../Utils/Loader";
import { EmployeeGetApi, RelievingFormPostApi, RelievingGetApiById, RelievingLetterDownload, RelievingPatchApiById, TemplateGetAPI } from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";
import Preview from "../Settings/Relieving/Preview";

const ExistsEmployesView = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,getValues,
    watch,
    formState: { errors },
    reset,
  } = useForm();
  const { user } = useAuth();
  const [emp, setEmp] = useState([]);
  const [noticePeriod, setNoticePeriod] = useState(0);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [selectedTemplate,setSelectedTemplate]=useState(null);
  const [error,setError]=useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // New state to store the selected employee
  const [templateAvailable,setTemplateAvailable]=useState(false);
  const [loading,setLoading]=useState(false);
  const navigate = useNavigate();


  const calculateNoticePeriod = (resignationDate, relievingDate,dateOfHiring) => {
    if (resignationDate && relievingDate) {
      const resignation = new Date(resignationDate);
      const lastWorking = new Date(relievingDate);
      const hiringDate = new Date(dateOfHiring);
  
      // Check if last working date is after resignation date
      if (lastWorking <= resignation) {
        setError("Last working date must be after the resignation date.");
        setNoticePeriod(0);
        return;
      }
      else if  (resignation <= hiringDate) {
        setError("Resignation date must be after the date of hiring.");
        setNoticePeriod(0);
        return;
      }
  
      const monthDiff = (lastWorking.getFullYear() - resignation.getFullYear()) * 12 + (lastWorking.getMonth() - resignation.getMonth());
      setNoticePeriod(monthDiff);
    } else {
      setNoticePeriod(0);
    }
  };

  useEffect(() => {
    const subscription = watch((value) => {
      calculateNoticePeriod(value.resignationDate, value.relievingDate, value.dateOfHiring);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    EmployeeGetApi().then((data) => {
      const filteredData = data
        .filter((employee) => employee.firstName !== null && employee.status !== "Active")  // Filter for non-active employees
        .map(({ referenceId, ...rest }) => rest);
  
      setEmp(
        filteredData.map((employee) => ({
          label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
          value: employee.id,
          id: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId,
          designationName: employee.designationName,
          departmentName: employee.departmentName,
          dateOfHiring: employee.dateOfHiring,
        }))
      );
    });
  }, []);
  

  const fetchRelievingData = async (employeeId) => {
    try {
      const response = await RelievingGetApiById(employeeId);
      if (response.data.data) {
        const { resignationDate, relievingDate, noticePeriod ,id} = response.data.data;
        // Log the data to check the response
        setValue("relievingId",id)
        // Set the form values with the fetched data
        setValue("resignationDate", resignationDate);
        setValue("relievingDate", relievingDate);
        setNoticePeriod(noticePeriod);
      }
    } catch (error) {
      handleError(error);
    }
  };
  

  const fetchTemplate = async (companyId) => {
    try {
      const res = await TemplateGetAPI(companyId);
      const templateNumber = res.data.data.relievingTemplateNo;
         setSelectedTemplate(templateNumber)
         setTemplateAvailable(true)
    } catch (error) {
      handleError(error);
      setTemplateAvailable(false);
    }
  };
  useEffect(() => {
    fetchTemplate()
}, []);

const onSubmit = (data) => {
  const submissionData = {
    resignationDate: data.resignationDate,
    relievingDate: data.relievingDate,
    noticePeriod: noticePeriod,
  };    
  const preview = {
    employeeName: selectedEmployee ? selectedEmployee.employeeName : data.employeeName,
    id: data.employeeId,
    employeeId: selectedEmployee ? selectedEmployee.employeeId : data.employeeId,
    designationName: data.designationName || "",
    departmentName: data.departmentName || "",
    resignationDate: data.resignationDate || "",
    lastWorkingDate: data.relievingDate || "",
    noticePeriod,
    companyName: user.company,
  };
  setPreviewData(preview);
  setShowPreview(true);
  console.log("preview" ,true)
  setSubmissionData(submissionData);
};

const handleConfirmSubmission = async () => {
  const employeeId =previewData.id;
  try {
    // Assuming submissionData contains the necessary data to be posted
    const response = await RelievingFormPostApi(employeeId,submissionData);

    const TIMEOUT_DURATION = 10000; // 2 seconds timeout

  // Create a timeout promise that rejects after the timeout duration
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Relieving letter download timed out')), TIMEOUT_DURATION)
  );

  // Race between the download API call and the timeout
  const downloadResponse = await Promise.race([
    RelievingLetterDownload(employeeId),
    timeoutPromise
  ]);      // Handle the response (you can adjust this based on your needs)

    toast.success(response.data.message);
    toast.success(downloadResponse.data.message);
    setShowPreview(true);
    // Optionally, reset submissionData or navigate to another page
    // resetSubmissionData();
     navigate('/relievingSummary');

  } catch (error) {
    console.error('Error submitting experience letter:', error);
    handleError(error);
  }
};

  const handleError = (errors) => {
    let errorMessage = "An Error Occurred!"; // Default error message
  
    if (errors.response) {
      const status = errors.response.data.error ? errors.response.data.error.message : null;
      if (status) {
        errorMessage = status;
      } else {
        // If no custom error message, handle based on status codes
        switch (errors.response.status) {
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
      }
    } else {
      // errorMessage = "Network Error!";
    }
    // toast.error(errorMessage, {
    //   position: "top-right",
    //   transition: Bounce,
    //   hideProgressBar: true,
    //   theme: "colored",
    //   autoClose: 3000,
    // });
  };
  

  const clearForm = () => {
    reset();
  };
  if (error) {
    return <div>Error: {error.message}</div>;  // Display error if any API call fails
  }

   if (loading) return  <Loader/>;
  

  const nextSixMonths = new Date();
  nextSixMonths.setMonth(nextSixMonths.getMonth() + 6);
  const sixMonthsFromNow = nextSixMonths.toISOString().split("T")[0];

    // Render loading message or template not available message
    if (!templateAvailable) {
      return (
        <LayOut>
          <div className="container-fluid p-0">
            <div className="row justify-content-center">
              <div className="col-8 text-center mt-5">
                <h2>No Relieving Template Available</h2>
                <p>To set up the Relieving templates before proceeding, Please select the Template from Settings <a href="/relievingTemplates">Relieving Templates </a></p>
                <p>Please contact the administrator to set up the experience templates before proceeding.</p>
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
              <strong>Employee Relieving Form</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="/existingSummary">Relieved Employees Summary</a>
                </li>
                <li className="breadcrumb-item active">Relieving Employee</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
            <div className="card-header">
              <div className="row d-flex justify-content-between mb-2">
                <div className="col-auto">
                  <h5 className="card-title mt-1">Relieved Employee Details</h5>
                </div>
                <div className="col-auto text-end me-2">
                  <button
                    onClick={() => navigate("/relievingProcess")}
                    className="btn btn-primary"
                    type="button"
                  >
                    Relieve Employee
                  </button>
                </div>
              </div>
            </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card-body">
                  <div className="row">
                      <div className="col-12 col-md-6 col-lg-5 mb-2">
                        <label className="form-label me-2">Select Relieved Employee</label>
                        <Controller
                          name="employeeId"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={emp}
                              value={emp.find((option) => option.value === field.value)}
                              onChange={(selectedOption) => {
                                field.onChange(selectedOption.value);  // Update the form with the selected value

                                // Find the selected employee by their ID
                                const selectedEmp = emp.find(emp => emp.value === selectedOption.value);
                                if (selectedEmp) {
                                  console.log("selectedEmp",selectedEmp)
                                  setSelectedEmployee(selectedEmp);  // Update the selected employee state
                                  
                                  // Call the fetchRelievingData with only the employeeId
                                  fetchRelievingData(selectedEmp.id);  // Pass only the employeeId
                                  // Set form fields with the selected employee data
                                  setValue("designationName", selectedEmp.designationName);
                                  setValue("departmentName", selectedEmp.departmentName);
                                  setValue("dateOfHiring", selectedEmp.dateOfHiring);
                                }
                              }}
                              placeholder="Select Employee Name"
                            />
                          )}
                        />
                        {errors.employeeId && (
                          <p className="errorMsg">Employee Name Required</p>
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
                      {errors.designationName && (
                        <p className="errorMsg">Designation Required</p>
                      )}
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
                      {errors.departmentName && (
                        <p className="errorMsg">Department Required</p>
                      )}
                    </div>
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
                      {errors.dateOfHiring && (
                        <p className="errorMsg">Date of Hiring Required</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Date of Resignation</label>
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Resignation Date"
                        name="resignationDate"
                        readOnly
                        {...register("resignationDate", { required: true })}
                      />
                      {errors.resignationDate && (
                        <p className="errorMsg">Resignation Date Required</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Date of Last Working Day</label>
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Last Working Date"
                        name="relievingData"
                        max={sixMonthsFromNow}
                        readOnly
                        {...register("relievingDate", { required: true })}
                      />
                      {errors.relievingData && (
                        <p className="errorMsg">Last Working Date Required</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Notice Period (Months)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={noticePeriod}
                        readOnly
                      />
                    </div>
                    <div className="col-12 d-flex align-items-start mt-5">
                        {error && (
                          <div className="col-9 alert alert-danger text-center mt-4">
                            {error}
                          </div>
                        )}
                        {/* <div className={`col-${error ? '3' : '12'} d-flex justify-content-end mt-4`}>
                          <button className="btn btn-secondary me-2" type="button" onClick={clearForm}>
                            Close
                          </button>
                          <button
                            className="btn btn-primary btn-lg"
                            type="submit"
                          >
                          Submit
                          </button>
                        </div> */}
                    </div>
                  </div>
                </div>
              </form>
              {showPreview && (
            <div className={`modal fade ${showPreview ? 'show' : ''}`} style={{ display: showPreview ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-hidden={!showPreview}>
                <div className="modal-dialog modal-lg" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Preview Experience Letter</h5>
                      <button type="button" className="close" onClick={() => setShowPreview(false)} aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <Preview previewData={previewData} selectedTemplate={selectedTemplate} />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowPreview(false)}>Close</button>
                      <button type="button" className="btn btn-primary" onClick={handleConfirmSubmission}>Confirm Submission</button>
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

export default ExistsEmployesView;
