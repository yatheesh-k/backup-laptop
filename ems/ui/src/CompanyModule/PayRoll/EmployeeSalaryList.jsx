import React, { useEffect, useState } from 'react';
import { EmployeeSalaryGetApi,EmployeeSalaryPatchApiById } from '../../Utils/Axios';
import { useLocation, useNavigate } from 'react-router-dom';
import LayOut from '../../LayOut/LayOut';
import { PencilSquare } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

const EmployeeSalaryList = () => {
  const { handleSubmit, reset, register} = useForm({ mode: "onChange" });
  const [employeeSalaryView, setEmployeeSalaryView] = useState([]);
  const [expandedSalaryId, setExpandedSalaryId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");

  useEffect(() => {
    if (id) {
      EmployeeSalaryGetApi(id).then(response => {
        setEmployeeSalaryView(response.data.data);
        // Reset the expanded state to ensure no item is expanded by default
        setExpandedSalaryId(null);
      });
    }
  }, [id]);

  const companyName = localStorage.getItem("company");

  const onSubmit = async (data) => {
    try {
      if (!id || !editingData?.salaryId) {
        toast.error("Employee ID or Salary ID is missing.");
        return;
      }

      const formData = {
        companyName,
        fixedAmount: data.fixedAmount,
        variableAmount: data.variableAmount,
        grossAmount: data.grossAmount,
        allowances: {
          travelAllowance: data.allowances?.travelAllowance,
          hra: data.allowances?.hra,
          specialAllowance: data.allowances?.specialAllowance,
          otherAllowances: data.allowances?.otherAllowances
        },
        deductions: {
          pfEmployee: data.deductions?.pfEmployee,
          pfEmployer: data.deductions?.pfEmployer,
          pfTax: data.deductions?.pfTax,
          incomeTax: data.deductions?.incomeTax,
          totalTax: data.deductions?.totalTax
        },
        status: data.status,
        netSalary: data.netSalary
      };

      console.log("FormData:", formData);

      await EmployeeSalaryPatchApiById(id, editingData.salaryId, formData);

      toast.success('Salary Updated Successfully');
      reset();
      setEditingData(null);
      setEmployeeSalaryView(prev => prev.map(item =>
        item.salaryId === editingData.salaryId ? { ...item, ...formData } : item
      ));
    } catch (error) {
      handleApiErrors(error);
    }
  };

  const handleApiErrors = (error) => {
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error!");
    }
    console.error(error.response);
  };


  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        // Replace with your actual API call
        const response = await EmployeeSalaryGetApi(id);
        const salaries = response.data.data;
        setEmployeeSalaryView(salaries); // Set the salary data in state
      } catch (error) {
        console.error('Error fetching salary data:', error);
      }
    };

    fetchSalaryData();
  }, [id]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active':
        return { backgroundColor: 'green', color: 'white', padding: '2px 8px', borderRadius: '4px' };
      case 'InActive':
        return { backgroundColor: 'red', color: 'white', padding: '2px 8px', borderRadius: '4px' };
      default:
        return { backgroundColor: 'gray', color: 'white', padding: '2px 8px', borderRadius: '4px' };
    }
  };

  // const toggleExpand = (salaryId) => {
  //   if (expandedSalaryId === salaryId) {
  //     setExpandedSalaryId(null);
  //   } else {
  //     setExpandedSalaryId(salaryId);
  //     const selectedData = employeeSalaryView.find(item => item.salaryId === salaryId);
  //     setEditingData(selectedData);
  //     reset(selectedData); // Populate form fields with the selected salary data
  //   }
  // };

  // const collapseExpandedCard = () => {
  //   setExpandedSalaryId(null);
  // };

  const handleEditClick = (salaryId, event) => {
    event.stopPropagation(); // Prevent the card from toggling when editing
    navigate(`/employeeSalaryUpdate?salaryId=${salaryId}&employeeId=${id}`); // Navigate with both parameters
  };



  const handleNavigateToRegister = (id) => {
    navigate(`/employeeSalaryStructure?employeeId=${id}`);
  };

  return (
    <LayOut>
      <div className="container mt-4">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3"><strong>Employee Salary List</strong></h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="/employeeView">Employee View</a>
                </li>
                <li className="breadcrumb-item active">
                  Employee Salary List
                </li>
              </ol>
            </nav>
          </div>
        </div>
        {employeeSalaryView.length > 0 ? (
          employeeSalaryView.map((item, index) => (
            <div key={index} className="card mb-3">
              <div className="card-header bg-light d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }}>
                <h5 className="mb-0"> {index + 1}. Net Salary: {item.netSalary}</h5>
                <div className="d-flex align-items-center">
                  <span className="me-3" style={getStatusStyle(item.status)}>{item.status}</span>
                  <PencilSquare size={22} color='#2255a4' onClick={(e) => handleEditClick(item.salaryId, e)} />
                </div>
              </div>
              {expandedSalaryId === item.salaryId && (
                <div className="card-body">
                  <div style={{ marginBottom: '3%', marginRight: "10%" }} >
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <input type="hidden" name="id" value={id} ref={register()} />
                    <input type="hidden" name="salaryId" value={editingData?.salaryId} ref={register()} />
                    <div className="row">
                      <div className="col mb-3">
                        <div className="form-group">
                          <label>Fixed Amount:</label>
                          <input type="text" className="form-control" defaultValue={editingData?.fixedAmount || ''} {...register('fixedAmount')} />
                        </div>
                      </div>
                      <div className="col mb-3">
                        <div className="form-group">
                          <label style={{color:"white"}}>Variable Amount:</label>
                          <input type="text" className="form-control" defaultValue={editingData?.variableAmount || ''} {...register('variableAmount')} />
                        </div>
                      </div>
                      <div className="col-12 mb-3">
                        <div className="form-group">
                          <label>Gross Amount:</label>
                          <input type="text" className="form-control" defaultValue={editingData?.grossAmount || ''} readOnly />
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col mb-1">
                        <h3>Allowances</h3>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col mb-3">
                        <div className="form-group">
                          <label>Basic Salary:</label>
                          <input type="text" className="form-control" defaultValue={editingData?.allowances?.basicSalary || ''} readOnly />
                        </div>
                      </div>
                      <div className="col mb-3">
                        <div className="form-group">
                          <label>Travel Allowance:</label>
                          <input type="text" className="form-control" defaultValue={editingData?.allowances?.travelAllowance || ''} {...register('allowances.travelAllowance')} />
                        </div>
                      </div>
                      <div className="col mb-3">
                        <div className="form-group">
                          <label>HRA:</label>
                          <input type="text" className="form-control" defaultValue={editingData?.allowances?.hra || ''} {...register('allowances.hra')} />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col mb-3">
                        <div className="form-group">
                          <label>Special Allowance:</label>
                          <input type="text" className="form-control" defaultValue={editingData?.allowances?.specialAllowance || ''} {...register('allowances.specialAllowance')} />
                        </div>
                      </div>
                      <div className="col mb-3">
                        <div className="form-group">
                          <label>Other Allowances:</label>
                          <input type="text" className="form-control" defaultValue={editingData?.allowances?.otherAllowances || ''} {...register('allowances.otherAllowances')} />
                        </div>
                      </div>
                      <div className="col-12 mb-3">
                        <div className="form-group">
                          <label>Total Earnings:</label>
                          <input type="text" className="form-control" defaultValue={editingData?.totalEarnings || ''} readOnly />
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="row mt-4 mb-3">
                      <div className="col mb-1">
                        <h3>Deductions</h3>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col mb-3">
                        <div className="form-group">
                          <label>PF (Employee):</label>
                          <input type="text" className="form-control" defaultValue={editingData?.deductions?.pfEmployee || ''} {...register('deductions.pfEmployee')} />
                        </div>
                      </div>
                      <div className="col mb-3">
                        <div className="form-group">
                          <label>PF (Employer):</label>
                          <input type="text" className="form-control" defaultValue={editingData?.deductions?.pfEmployer || ''} {...register('deductions.pfEmployer')} />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col mb-3">
                        <div className="form-group">
                          <label>PF Tax:</label>
                          <input type="text" className="form-control" defaultValue={editingData?.deductions?.pfTax || ''} readOnly />
                        </div>
                      </div>
                      <div className="col mb-3">
                        <div className="form-group">
                          <label>Income Tax:</label>
                          <input type="text" className="form-control" defaultValue={editingData?.deductions?.incomeTax || ''} readOnly />
                        </div>
                      </div>
                      <div className="col mb-3">
                        <div className="form-group">
                          <label>Total Tax:</label>
                          <input type="text" className="form-control" defaultValue={editingData?.deductions?.totalTax || ''} readOnly />
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>Status:</label>
                        <input type="text" className="form-control" defaultValue={editingData?.status || ''} {...register('status')} readOnly />
                      </div>
                    </div>
                    <div className="row mt-4 mb-3">
                      <div className="col mb-1">
                        <h3>Net Amount</h3>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col mb-3">
                        <div className="form-group">
                          <input type="text" className="form-control" defaultValue={editingData?.netSalary || ''} readOnly />
                        </div>
                      </div>
                    </div>
                    <div className="col-12 text-end" style={{ marginTop: "60px" }}>
                      <button type="submit" className="btn btn-primary">
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className='text-center mt-5'>
            <button className="btn btn-primary" onClick={handleNavigateToRegister}>Go to Salary Register</button>
            <p className='mt-2 fw-bold'>No salary data available.</p>
          </div>
        )}
      </div>
    </LayOut>
  );
};

export default EmployeeSalaryList;
