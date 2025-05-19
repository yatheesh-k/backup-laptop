import React, { useState, useEffect } from "react";
import { PencilSquare, Wallet} from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import { EmployeeGetApi } from "../../Utils/Axios";

const EmployeeView = () => {
  const [view, setView] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const Navigate = useNavigate();

  const getMonthNames = () => {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("en-US", { month: "long" })
    );
  };

  const getRecentYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
      years.push(i.toString());
    }
    return years;
  };

  const fetchData = async () => {
    try {
      const data = await EmployeeGetApi(); // Assuming EmployeeGetApi is a function returning a Promise
      const filteredData = data
        .filter(employee => employee.firstName !== null)
        .map(({ referenceId, ...rest }) => rest);
      // Set state only if data is valid
      if (Array.isArray(filteredData)) {
        setEmployees(filteredData);
        setFilteredData(filteredData);
      } else {
        console.error('Employee data is not an array:', data);
      }
    } catch (error) {
      handleApiErrors(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []); // Ensure the dependency array is empty to run once on mount

  const handleApiErrors = (error) => {
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error !");
    }
    console.error(error.response);
  };


  const handleSalary = (id) => {
    Navigate(`/employeeSalaryList?id=${id}`);
  };


  const handleEdit = (id) => {
    Navigate(`/employeeRegistration`, { state: { id } });
  };

  const statusMappings = {
    Active: {
      label: (
        <b
          style={{
            borderRadius: "5px",
            padding: "3px 6px",
            color: "#fff",
            background: "green"
          }}
          // className="bg-primary"
        >
          Active
        </b>
      ),
    },
    NoticePeriod: {
      label: (
        <b
          style={{
            borderRadius: "5px",
            padding: "3px 6px",
            color: "#fff",
          }}
          className="bg-warning"
        >
          Notice Period
        </b>
      ),
    },
    InActive: {
      label: (
        <b
          style={{
            borderRadius: "5px",
            padding: "3px 6px",
            color: "#fff",
            background:"red",
          }}
          // className="bg-danger"
        >
          InActive
        </b>
      ),
    },
  };

  const columns = [
    {
      name: <h6><b>#</b></h6>,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "50px",
    },
    {
      name: <h6><b>ID</b></h6>,
      selector: row => row.employeeId,
      width: "100px",
    },
    {
      name: <h6><b>Name</b></h6>,
      selector: row => (
        <div title={`${row.firstName} ${row.lastName}`}>
           {`${row.firstName.length > 18 ? row.firstName.slice(0, 10) + '...' : row.firstName} ${row.lastName.length > 10 ? row.lastName.slice(0, 10) + '...' : row.lastName}`}
        </div>      
      ),
      width: "190px",
    },
    {
      name: <h6><b>Email Id</b></h6>,
      selector: row => (
        <div title={row.emailId}>
          {row.emailId.length > 20 ? `${row.emailId.slice(0, 20)}...` : row.emailId}
        </div>
      ),
      width: "210px",
    },
    {
      name: <h6><b>Department</b></h6>,
      selector: row => (
        <div title={row.departmentName}>
        {row.departmentName.length > 10 ? `${row.departmentName.slice(0, 10)}...` : row.departmentName}
      </div>
      ),
      width: "140px",
    },
    {
      name: <h6><b>Date Of Hiring</b></h6>,
      selector: row => row.dateOfHiring,
      format: row => {
        const date = new Date(row.dateOfHiring);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },
      width: '150px'
    },

    {
      name: <h6><b>Status</b></h6>,
      selector: row => row.status,
      cell: (row) => statusMappings[row.status]?.label || "Unknown",
      width: "110px"
    },
    {
      name: <h5><b>Actions</b></h5>,
      cell: (row) => (
        <div>
          <button className="btn btn-sm " style={{ backgroundColor: "transparent", border: "none", padding: "0", marginRight: "10px" }} onClick={() => handleSalary(row.id)} title="View Salary">
            <Wallet size={22} color='#d116dd' />
          </button>
          <button className="btn btn-sm " style={{ backgroundColor: "transparent", border: "none", padding: "0", marginRight: "10px" }} onClick={() => handleEdit(row.id)} title="Edit">
            <PencilSquare size={22} color='#2255a4' />
          </button>
        </div>
      )
    }
  ];



  const getFilteredList = (searchTerm) => {
    setSearch(searchTerm);
    const filtered = employees.filter((item) => {
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
      const email = item.emailId.toLowerCase();
      const departmentName = item.departmentName.toLowerCase();
      const dateOfHiring = new Date(item.dateOfHiring)
        .toLocaleDateString()
        .toLowerCase();
      const employeeId = item.employeeId.toString().toLowerCase();
      const status = item.status.toLowerCase();

      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        departmentName.includes(searchTerm.toLowerCase()) ||
        dateOfHiring.includes(searchTerm.toLowerCase()) ||
        employeeId.includes(searchTerm.toLowerCase()) ||
        status.includes(searchTerm.toLowerCase())
      );
    });
    setFilteredData(filtered);
  };

  console.log(filteredData)

  const filterByMonthYear = (selectedMonth, selectedYear) => {
    setSelectedMonth(selectedMonth);
    setSelectedYear(selectedYear);
    const result = employees.filter((data) => {
      const resignDate = new Date(data.dateOfHiring);
      const resignMonth = resignDate.getMonth() + 1;
      const resignYear = resignDate.getFullYear();
      return (
        (resignMonth === parseInt(selectedMonth) || !selectedMonth) &&
        (resignYear === parseInt(selectedYear) || !selectedYear)
      );
    });
    setFilteredData(result);
  };

  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position
    // Remove leading spaces
    value = value.replace(/^\s+/g, '');
    // Ensure only alphabets and spaces are allowed
    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
    value = value.split('').filter(char => allowedCharsRegex.test(char)).join('');
    // Capitalize the first letter of each word
    const words = value.split(' ');
    // Capitalize the first letter of each word and lowercase the rest
    const capitalizedWords = words.map(word => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return '';
    });
    // Join the words back into a string
    let formattedValue = capitalizedWords.join(' ');
    // Remove spaces not allowed (before the first two characters)
    if (formattedValue.length > 2) {
      formattedValue = formattedValue.slice(0, 2) + formattedValue.slice(2).replace(/\s+/g, ' ');
    }
    // Update input value
    input.value = formattedValue;
    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3"><strong>Employees</strong> </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>

                <li className="breadcrumb-item active">
                  Employees
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/**Department View TableForm */}
        <div className="row">
          <div className="col-12 col-lg-12 col-xxl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="row">
                  <div className="col-12 col-md-6 col-lg-4">
                    <Link to={"/employeeRegistration"}>
                      {" "}
                      <button className="btn btn-primary">Add Employee</button>
                    </Link>
                  </div>
                  <div className="row col-12 mb-2">

                    <div className="col-md-4 mt-2 ">
                      <input
                        type="search"
                        className="form-control"
                        placeholder="Search...."
                        value={search}
                        onInput={toInputTitleCase}
                        onChange={(e) => getFilteredList(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4 mt-2">
                      <select
                        className="form-select"
                        style={{ paddingBottom: '6px' }}
                        value={selectedYear}
                        onChange={(e) =>
                          filterByMonthYear(selectedMonth, e.target.value)
                        }
                      >
                        <option value="">Select Year</option>
                        {getRecentYears().map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mt-2">
                      <select
                        className="form-select"
                        style={{ paddingBottom: '6px' }}
                        value={selectedMonth}
                        onChange={(e) =>
                          filterByMonthYear(e.target.value, selectedYear)
                        }
                      >
                        <option value="">Select Month</option>
                        {getMonthNames().map((month, index) => (
                          <option key={index} value={(index + 1).toString()}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd" }}
                  />
                </div>
              </div>
              <DataTable
                columns={columns}
                data={filteredData.length > 0 ? filteredData : view}
                pagination
                onChangePage={page => setCurrentPage(page)}
                onChangeRowsPerPage={perPage => setRowsPerPage(perPage)}
              />
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default EmployeeView;
