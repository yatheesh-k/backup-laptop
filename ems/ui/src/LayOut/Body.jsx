import React, { useEffect, useState } from 'react';
import LayOut from './LayOut';
import { useAuth } from '../Context/AuthContext';
import { EmployeeGetApi } from '../Utils/Axios';
import { toast } from 'react-toastify';
import { PeopleFill, PersonFillCheck, PersonFillExclamation } from 'react-bootstrap-icons';

const Body = () => {
  const { user } = useAuth();
  const [employees, setEmployees]= useState([]);;

  const isAdmin = user?.userRole?.includes("ems_admin");
  const isCompanyAdmin = user?.userRole?.includes("company_admin");

  const [data, setData] = useState({
    totalEmployeesCount: 0,
    activeEmployeesCount: 0,
    inactiveEmployeesCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await EmployeeGetApi();
  
      console.log('Full API Response:', response);
  
      if (response && Array.isArray(response)) {
        const employees = response;
  
        console.log('Employees Data:', employees);
  
        const filteredData = employees
          .filter((employee) => employee.firstName && employee.firstName.trim() !== '')
          .map(({ id, firstName, lastName, employeeId, status }) => ({
            label: `${firstName} ${lastName} (${employeeId})`,
            value: id,
            status: status 
          }));
  
        setEmployees(filteredData);

        const totalEmployeesCount = filteredData.length;
        const activeEmployeesCount = filteredData.filter(emp => emp.status === 'Active').length;
        const inactiveEmployeesCount = filteredData.filter(emp => emp.status === 'InActive').length;
  
        setData({
          totalEmployeesCount,
          activeEmployeesCount,
          inactiveEmployeesCount
        });
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleApiErrors = (error) => {
    if (error.response?.data?.error?.message) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      // toast.error("Network Error !");
    }
    console.error('API Error:', error);
  };

  useEffect(() => {
    if (isCompanyAdmin) {
      fetchData();
    }
  }, [isCompanyAdmin]);

  return (
    <LayOut>
      <div className="container-fluid p-0 h-100" style={{ height: "100%" }}>
        <h1 className="h3 mb-3">
          <strong>Dashboard</strong>
        </h1>
        <div className="row h-100">
          {user && user.userRole && user.userRole.includes("ems_admin") ? (
           
                <div className='card'>
                  <iframe
                    src="https://122.175.43.71:2800/kibana/s/ems/app/dashboards#/view/deba4a73-baa2-4c62-aa78-089197311bcb?embed=true&fullscreen=true"height="1000" width="800"
                    title="EMS Dashboard"
                      style={{ border: 'none'}}
                  ></iframe>
          </div>
           
          ) : (
            <>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="row">
                  <div className="col-xl-4 col-12 mb-3">
                    <div className="card mt-3">
                      <div className="card-body mt-3">
                        <div className="d-flex align-items-center mb-2">
                          <PeopleFill color='blue' size={30} className="me-3" />
                          <div>
                            <h5 className="card-title" style={{color:"black"}}>Total Employees</h5>
                            <h1 className="mt-1">{data.totalEmployeesCount}</h1>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-12 mb-3">
                    <div className="card mt-3">
                      <div className="card-body mt-3">
                        <div className="d-flex align-items-center mb-2">
                          <PersonFillCheck color='green' size={30} className="me-3" />
                          <div>
                            <h5 className="card-title" style={{color:"black"}}>Active Employees</h5>
                            <h1 className="mt-1">{data.activeEmployeesCount}</h1>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-12 mb-3">
                    <div className="card mt-3">
                      <div className="card-body mt-3">
                        <div className="d-flex align-items-center mb-2">
                          <PersonFillExclamation color='red' size={30} className="me-3" />
                          <div>
                            <h5 className="card-title" style={{color:"black"}}>InActive Employees</h5>
                            <h1 className="mt-1">{data.inactiveEmployeesCount}</h1>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </LayOut>
  );
};

export default Body;
