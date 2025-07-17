import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import LayOut from "../../../LayOut/LayOut";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../../../Redux/EmployeeSlice";
import { useNavigate } from "react-router-dom";


const EmployeeSummary = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: employees ,status,error} = useSelector((state) => state.employees);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

    useEffect(() => {
    if (status === 'failed' && error) {
      toast.error(`Error: ${error}`);
    }
  }, [status, error]);

  // Filter data based on search input
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredData(employees);
    } else {
      const lowerSearch = searchText.toLowerCase();
      const filtered = employees.filter((emp) =>
        Object.values(emp).some(
          (val) => val && val.toString().toLowerCase().includes(lowerSearch)
        )
      );
      setFilteredData(filtered);
    }
  }, [searchText, employees]);

  const columns = [
    {
      name: '#',
      selector: (row,index) => index+1,
      width: "70px",
    },
    {
      name: 'Name',
      selector: (row) => `${row.firstName} ${row.lastName}` || 'N/A',
      sortable: true,
    },
    {
      name: 'Email',
      selector: (row) => row.emailId || 'N/A',
    },
    {
      name: 'Mobile',
      selector: (row) => row.mobileNo || 'N/A',
    },
    {
      name: 'Pan Number',
      selector: (row) => {
    const pan = row.panNo || '';
    return pan ? `XXXXX${pan.slice(-4)}` : 'N/A';
    },
  },
    // {
    //   name: 'Status',
    //   selector: (row) => row.status || 'N/A',
    // },
  ];

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Employee Summary</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Employee </li>
                <li className="breadcrumb-item active">Employee Summary</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="row d-flex justify-content-between">
              <div className="col-md-3">
                <label>Search Customer</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search here..., "
                 value={searchText}
                 onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <div className="col-md-3 mt-3 d-flex justify-content-end">
                <button onClick={()=>navigate('/employeeMangement')} className="btn btn-primary">Add Employee </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <h5 className="card-title text-secondary">Employee Data</h5>
            <hr />
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              highlightOnHover
              pointerOnHover
              responsive
              noDataComponent="No records found."
            />
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default EmployeeSummary;
