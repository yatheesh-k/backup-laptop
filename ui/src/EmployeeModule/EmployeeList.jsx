import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import LayOut from "../LayOut/LayOut";
import Loader from "../Utils/Loader";
import { fetchEmployees } from "../Redux/EmployeeSlice";

const EmployeeList = () => {
  const { status } = useParams(); // 'active' or 'Relieved'
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employees.data);
  const employeesStatus = useSelector((state) => state.employees.status);
  const error = useSelector((state) => state.employees.error);

  const [search, setSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const customStyles = {
    headCells: {
      style: {
        fontSize: "16px",
        fontWeight: "600",
      },
    },
    cells: {
      style: {
        fontSize: "15px",
      },
    },
  };

  // Fetch employees only once if status is idle
  useEffect(() => {
    if (employeesStatus === "idle") {
      dispatch(fetchEmployees());
    }
  }, [dispatch, employeesStatus]);

  // Filter employees on change
  useEffect(() => {
    if (employeesStatus === "succeeded") {
      const filtered = employees.filter(
        (emp) =>
          emp.status?.toLowerCase() === status.toLowerCase() &&
          `${emp.firstName || ""} ${emp.lastName || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [status, employees, search, employeesStatus]);

  const columns = [
    {
      name: <strong>S.No</strong>,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "70px",
    },
    {
      name: <strong>Name</strong>,
      selector: (row) => `${row.firstName} ${row.lastName || ""}`,
      width: "180px",
    },
    {
      name: <strong>Email</strong>,
      selector: (row) => row.emailId,
      width: "300px",
    },
    {
      name: <strong>Department</strong>,
      selector: (row) => row.departmentName,
      width: "230px",
    },
    {
      name: <strong>Designation</strong>,
      selector: (row) => row.designationName,
      width: "230px",
    },
  ];

  if (employeesStatus === "loading") return <Loader />;
  if (employeesStatus === "failed")
    return (
      <LayOut>
        <div className="alert alert-danger">Error: {error}</div>
      </LayOut>
    );

  return (
    <LayOut>
      <div className="container-fluid p-0">
        {/* Header with Title and Back Button */}
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col d-flex justify-content-between align-items-center">
            <h1 className="fs-3 mb-3 fw-bold text-dark m-0">
              {status} Employees : {filteredEmployees.length}
            </h1>
            <button
              className="btn btn-outline-secondary mb-3"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left-circle me-1"></i> Back
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="row mb-3">
          <div className="col-md-4 offset-md-8">
            <input
              type="search"
              className="form-control fs-5"
              placeholder="Search Employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-body">
            {filteredEmployees.length > 0 ? (
              <DataTable
                columns={columns}
                data={filteredEmployees}
                pagination
                paginationPerPage={rowsPerPage}
                onChangePage={(page) => setCurrentPage(page)}
                onChangeRowsPerPage={(perPage) => setRowsPerPage(perPage)}
                customStyles={customStyles}
              />
            ) : (
              <div className="text-center py-5">
                <h4>No {status.toLowerCase()} employees found</h4>
                {search && <p>Try adjusting your search term</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default EmployeeList;
