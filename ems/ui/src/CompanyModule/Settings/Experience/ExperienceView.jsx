import React, { useState, useEffect } from "react";
import { PencilSquare, XSquareFill } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { Link, useNavigate } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import { EmployeeGetApi, EmployeeGetApiById } from "../../../Utils/Axios";
import LayOut from "../../../LayOut/LayOut";


const ExperienceView = () => {
  const [view, setView] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const Navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null); // State to store the ID of the item to be deleted

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItemId(null); // Reset the selected item ID
  };

  const handleShowDeleteModal = (id) => {
    setSelectedItemId(id); // Set the ID of the item to be deleted
    setShowDeleteModal(true);
  };

  const getMonthNames = () => {
    return Array.from({ length: 12 }, (_, i) =>
      (i + 1).toLocaleString("en-US", { minimumIntegerDigits: 2 })
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

  const getUser = () => {
   EmployeeGetApi()
      .then((response) => {
        console.log(response.data);
        setView(response.data);
        setFilteredData(response.data);
      })
      .catch((errors) => {
        // Error handling
      });
  };

  useEffect(() => {
    getUser();
  }, []);

  const getData = (employeeId) => {
    console.log(employeeId);
    Navigate(`/relievingRegistration`, { state: { employeeId } });
  };

  const handleConfirmDelete = async (employeeId) => {
    if (selectedItemId) {
      try {
        await EmployeeGetApiById(employeeId);
        toast.success("Relieving Deleted Successfully", {
          position: "top-right",
          transition: Bounce,
          hideProgressBar: true,
          theme: "colored",
          autoClose: 3000,
        });
        getUser();
        handleCloseDeleteModal();
      } catch (error) {
        // Error handling
      }
    }
  };

  const paginationComponentOptions = {
    noRowsPerPage: true,
  };

  const columns = [
    {
      name: (
        <h5>
          <b>S No</b>
        </h5>
      ),
      selector: (row, index) => index + 1,
      width: "100px",
    },
    {
      name: (
        <h5>
          <b>Employee Id</b>
        </h5>
      ),
      selector: (row) => row.employeeId,
    },
    {
      name: (
        <h5>
          <b>Employee Name</b>
        </h5>
      ),
      selector: (row) => `${row.firstName}${row.lastName}`,
    },
    {
      name: (
        <h5>
          <b>Resignation Date</b>
        </h5>
      ),
      selector: (row) => row.resignationDate,
    },
    {
      name: (
        <h5>
          <b>Relieved Date</b>
        </h5>
      ),
      selector: (row) => row.lastWorkingDate,
    },
    {
      name: (
        <h5>
          <b>Action</b>
        </h5>
      ),
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "0",
              marginRight: "10px",
            }}
            onClick={() => getData(row.employeeId)}
          >
            <PencilSquare size={22} color="#2255a4" />
          </button>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "0",
              marginLeft: "5px",
            }}
            onClick={() => handleShowDeleteModal(row.employeeId)}
          >
            <XSquareFill size={22} color="#da542e" />
          </button>
        </div>
      ),
    },
  ];

  const getFilteredList = (searchData) => {
    setSearch(searchData);
    const result = view.filter((data) => {
      const searchTerm = searchData.toLowerCase();
      const resignDate = data.resignationDate.toLowerCase();
      const relievedDate = data.lastWorkingDate.toLowerCase();
      const employeeId = data.employeeId.toString().toLowerCase();
      const fullName = `${data.firstName} ${data.lastName}`.toLowerCase();
      const otherFieldsToSearch = [
        employeeId,
        fullName,
        resignDate,
        relievedDate,
      ];

      return otherFieldsToSearch.some((field) => field.includes(searchTerm));
    });
    setFilteredData(result);
  };

  const filterByMonthYear = (selectedMonth, selectedYear) => {
    setSelectedMonth(selectedMonth);
    setSelectedYear(selectedYear);
    const result = view.filter((data) => {
      const resignDate = new Date(data.resignationDate);
      const resignMonth = resignDate.getMonth() + 1;
      const resignYear = resignDate.getFullYear();

      return (
        (resignMonth === parseInt(selectedMonth) || !selectedMonth) &&
        (resignYear === parseInt(selectedYear) || !selectedYear)
      );
    });
    setFilteredData(result);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Experience Summary</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li class="breadcrumb-item acitve">Experience Summary</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12 col-lg-12 col-xxl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="row mt-1">
                  <div className="col-12 col-md-4 col-lg-4">
                    <Link to={"/experienceForm"}>
                      <button className="btn btn-primary">Generate Experience</button>
                    </Link>
                  </div>
                  <div className="row mb-2">
                    <div className="col-md-4 mt-2">
                      <input
                        type="search"
                        className="form-control"
                        placeholder="Search...."
                        value={search}
                        onChange={(e) => getFilteredList(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4 mt-2">
                      <select
                        className="form-select"
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
                    <div className="col-md-4 mt-2">
                      <select
                        className="form-select"
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
                  </div>
                  <div
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd" }}
                  />
                </div>
              </div>
              <DataTable
                columns={columns}
                data={filteredData}
                pagination
                paginationComponentOptions={paginationComponentOptions}
              />
            </div>
          </div>
         
        </div>
      </div>
    </LayOut>
  );
};

export default ExperienceView;
