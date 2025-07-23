import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import LayOut from "../LayOut/LayOut";
import { fetchEmployees } from "../Redux/EmployeeSlice";
import Loader from "../Utils/Loader";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const TotalEmployees = () => {
  const dispatch = useDispatch();
  const { employee } = useAuth();
  const companyId = employee?.companyId;

  const { data: employees, status } = useSelector((state) => state.employees);
  const navigate=useNavigate();
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const customStyles = {
    headCells: {
      style: {
        fontSize: '16px',
        fontWeight: '600',
      },
    },
    cells: {
      style: {
        fontSize: '15px',
      },
    },
  };
  

  useEffect(() => {
    if (companyId) {
      dispatch(fetchEmployees());
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    if (employees && Array.isArray(employees)) {
      const result = employees.filter((emp) => {
        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
      });
      setFilteredData(result);
    }
  }, [search, employees]);

  const columns = [
    {
      name: <strong>S.No</strong>,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "70px",
    },
    {
      name: <strong>Name</strong>,
      selector: (row) => `${row.firstName} ${row.lastName || ""}`,
      width: "200px",
    },
    {
      name: <strong>Email</strong>,
      selector: (row) => row.emailId,
      width: "250px",
    },
    {
      name: <strong>Department</strong>,
      selector: (row) => row.departmentName,
      width: "180px",
    },
    {
      name: <strong>Designation</strong>,
      selector: (row) => row.designationName,
      width: "180px",
    },
    {
      name: <strong>Status</strong>,
      selector: (row) => row.status,
      width: "120px",
    },
  ];
  

  if (status === "loading") return <Loader />;

  return (
    <LayOut>
      <div className="container-fluid p-0">
 <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col d-flex justify-content-between align-items-center">
            <h1 className="fs-3 mb-3 fw-bold text-dark m-0">
              <strong>Total Employees : {filteredData.length}</strong>
            </h1>
            <button
              className="btn btn-secondary mb-3"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left-circle me-1"></i> Back
            </button>
          </div>
        </div>
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

        <div className="card">
          <div className="card-body">
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={rowsPerPage}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(perPage) => setRowsPerPage(perPage)}
              customStyles={customStyles}
            />
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default TotalEmployees;
