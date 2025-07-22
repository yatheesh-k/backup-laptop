import React, { useEffect, useState } from 'react';
import LayOut from './LayOut';
import { useAuth } from '../Context/AuthContext';
import { PeopleFill, PersonFillCheck, PersonFillExclamation } from 'react-bootstrap-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../Redux/EmployeeSlice';
import Loader from '../Utils/Loader';
import { useNavigate } from 'react-router-dom';
import DashboardCalendar from '../Calender/DashboardCalendar';
import TaxSlab from '../CompanyModule/TDS/TaxSlab';
import TimeLineNotification from '../CompanyModule/Settings/TimeLine/TimeLineNotification';

const Body = () => {
  const [data, setData] = useState({
    totalEmployeesCount: 0,
    activeEmployeesCount: 0,
    RelievedEmployeesCount: 0
  });
  const [loading, setLoading] = useState(true);

  const { authUser, isInitialized } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: employees = [] } = useSelector(state => state.employees);

  useEffect(() => {
    if (authUser) {
      dispatch(fetchEmployees()).finally(() => setLoading(false));
    }
  }, [dispatch, authUser]);

  useEffect(() => {
    const activeEmployeesCount = employees.filter(emp => emp.status === 'Active').length;
    const RelievedEmployeesCount = employees.filter(emp => emp.status === 'relieved').length;

    setData({
      totalEmployeesCount: employees.length,
      activeEmployeesCount,
      RelievedEmployeesCount
    });
  }, [employees]);

  if (!isInitialized || !authUser || loading) return <Loader />;

  const { resourceType, roles = [] } = authUser;

  // Identify user types
  const isEMSAdmin = roles.includes("ems_admin") || resourceType === "Admin";
  const isCompanyAdmin = resourceType === "company_admin";
  const isHR = resourceType === "HR" || roles.includes("hrm");
  const isTaxConsultant = roles.includes("tax_consultant");
  const isAccountant = resourceType === "Accountant";
  const isEmployee = resourceType === "employee";
  const isCandidate = resourceType === "candidate";

  const showCompanyDashboard = isCompanyAdmin || isHR || isTaxConsultant || isAccountant;
  const showEmployeeDashboard = isEmployee;
  const showCandidateDashboard = isCandidate;

  const handleTotalEmployeesClick = () => navigate('/totalEmployees');
  const handleActiveEmployeesClick = () => navigate('/employeeList/Active');
  const handleRelievedEmployeesClick = () => navigate('/employeeList/Relieved');

  return (
    <LayOut>
      <div className="container-fluid p-0 h-100">
        <h1 className="h3 mb-3"><strong>Dashboard</strong></h1>
        <div className="row h-100">

          {/* EMS Admin or Admin */}
          {isEMSAdmin && (
            <div className='card' style={{ height: '100vh' }}>
              <iframe
                src="https://cubhrm.com:5601/kibana/s/ems/app/dashboards#/view/274b991a-5aa5-4c53-8d7d-b9412e71609d?&embed=true"
                height="100%"
                width="100%"
                title="EMS Dashboard"
                style={{ border: 'none', height: '100%', width: '100%' }}
              />
            </div>
          )}

          {/* Company Admin / HR / Accountant / Tax Consultant */}
          {showCompanyDashboard && (
            <>
              <div className="row">
                {[
                  {
                    label: "Total Employees",
                    count: data.totalEmployeesCount,
                    icon: <PeopleFill color="blue" size={30} />,
                    handler: handleTotalEmployeesClick
                  },
                  {
                    label: "Active Employees",
                    count: data.activeEmployeesCount,
                    icon: <PersonFillCheck color="green" size={30} />,
                    handler: handleActiveEmployeesClick
                  },
                  {
                    label: "Relieved Employees",
                    count: data.RelievedEmployeesCount,
                    icon: <PersonFillExclamation color="red" size={30} />,
                    handler: handleRelievedEmployeesClick
                  }
                ].map((card, i) => (
                  <div className="col-xl-4 col-12 mb-3" key={i}>
                    <div className="card mt-3" style={{ cursor: 'pointer' }} onClick={card.handler}>
                      <div className="card-body mt-3">
                        <div className="d-flex align-items-center mb-2">
                          {card.icon}
                          <div className="ms-3">
                            <h5 className="fw-bold" style={{ color: "black" }}>{card.label}</h5>
                            <h1 className="mt-1">{card.count}</h1>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="card h-100 p-4"><DashboardCalendar /></div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100 p-4"><TaxSlab /></div>
                </div>
              </div>
            </>
          )}

          {/* Employee Dashboard */}
          {showEmployeeDashboard && (
            <div className="row">
              <div className="col-md-6"><div className="card h-100 p-4"><DashboardCalendar /></div></div>
              <div className="col-md-6"><div className="card h-100 p-4"><TaxSlab /></div></div>
            </div>
          )}

          {/* Candidate Dashboard (can be customized further) */}
          {showCandidateDashboard && (
            <div className="row">
              <div className="col-md-12"><div className="card h-100 p-4"><TimeLineNotification /></div></div>
            </div>
          )}

          {/* Show TimelineNotification for all except Admin iframe */}
          {!isEMSAdmin && (
            <div className="col-md-6 mt-3">
              <div className="card h-100 p-4">
                <TimeLineNotification />
              </div>
            </div>
          )}
        </div>
      </div>
    </LayOut>
  );
};


export default Body;