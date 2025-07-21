import React, { useState, useEffect } from "react";
import { PencilSquare, XSquareFill } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { Bounce, toast } from "react-toastify";
import DeletePopup from "../../Utils/DeletePopup";
import LayOut from "../../LayOut/LayOut";
import {
  companyDeleteByIdApi,
  companyRolesPatchByIdAPI,
  companyViewApi,
  updateCompanyStatusApi,
} from "../../Utils/Axios";
import { useNavigate } from "react-router-dom";

const CompanyView = () => {
  const [view, setView] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showNoRecordsMessage, setShowNoRecordsMessage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    id: null,
    newStatus: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [updatedRoles, setUpdatedRoles] = useState("");
  const Navigate = useNavigate();

  const getUser = async () => {
    try {
      const response = await companyViewApi();
      setView(response.data.data);
    } catch (error) {
      handleApiErrors(error);
    }
  };

  const getData = (id) => {
    console.log(id);
    Navigate(`/companyRegistration`, { state: { id } });
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItemId(null);
  };

  const handleShowDeleteModal = (id) => {
    setSelectedItemId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItemId) {
      try {
        const response = await companyDeleteByIdApi(selectedItemId);
        if (response.status === 200) {
          setTimeout(() => {
            toast.success("Company Deleted Successfully", {
              position: "top-right",
              transition: Bounce,
              hideProgressBar: true,
              theme: "colored",
              autoClose: 3000,
            });
          });
          setTimeout(() => {
            getUser(); // Refresh the list after deletion
          }, 1000);
          handleCloseDeleteModal();
        } else {
          toast.error("Failed to delete company. Please try again.", {
            position: "top-right",
            transition: Bounce,
            hideProgressBar: true,
            theme: "colored",
            autoClose: 3000,
          });
        }
      } catch (error) {
        handleApiErrors(error);
      }
    }
  };
  const handleStatusChange = (id, newStatus) => {
    setStatusUpdateData({ id, newStatus });
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    const { id, newStatus } = statusUpdateData;
    try {
      const response = await updateCompanyStatusApi(id, newStatus);
      if (response.status === 200) {
        toast.success("Status updated successfully!");

        // Update local state immediately
        setView((prev) =>
          prev.map((user) =>
            user.id === id ? { ...user, status: newStatus } : user
          )
        );

        setTimeout(() => {
          getUser(); // Optional: refetch from server
          if (search) getFilteredList(search);
        }, 1000);
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setShowStatusModal(false);
      setStatusUpdateData({ id: null, newStatus: "" });
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [view, filteredData]);

  const handleApiErrors = (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error &&
      error.response.data.error.message
    ) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error !");
    }
    console.error(error.response);
  };

const openRoleModal = (companyId, currentRoles) => {
  setSelectedCompanyId(companyId);
  if (currentRoles && currentRoles.length > 0) {
    setUpdatedRoles(currentRoles[0]); // Only one role will be editable
  } else {
    setUpdatedRoles("");
  }
  setShowModal(true);
};

  const closeRoleModal = () => {
    setShowModal(false);
    setUpdatedRoles("");
    setSelectedCompanyId(null);
  };

const handleSaveRoles = async () => {
  if (!updatedRoles) {
    toast.error("Please select a valid role.");
    return;
  }

  const rolesArray = [updatedRoles];

  try {
    const payload = { roles: rolesArray };
    await companyRolesPatchByIdAPI(payload);
    toast.success("Role updated successfully!");
    closeRoleModal();
    getUser(); // Refresh company list
  } catch (error) {
    toast.error("Failed to update role.");
    console.error("Error updating role:", error);
  }
};


  const columns = [
    {
      name: (
        <h6>
          <b>#</b>
        </h6>
      ),
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "70px",
    },
    {
      name: (
        <h6>
          <b>Company Name</b>
        </h6>
      ),
      selector: (row) => (
        <div title={row.companyName}>
          {row.companyName.length > 20
            ? `${row.companyName.slice(0, 20)}...`
            : row.companyName}
        </div>
      ),
      width: "200px",
      wrap: true,
    },
    {
      name: (
        <h6>
          <b>Service Name</b>
        </h6>
      ),
      selector: (row) => (
        <div title={row.shortName}>
          {row.shortName.length > 20
            ? `${row.shortName.slice(0, 20)}...`
            : row.shortName}
        </div>
      ),
      width: "100px",
      wrap: true,
    },
    {
      name: (
        <h6>
          <b>Email Id</b>
        </h6>
      ),
      selector: (row) => (
        <div title={row.emailId}>
          {row.emailId.length > 20
            ? `${row.emailId.slice(0, 20)}...`
            : row.emailId}
        </div>
      ),
      width: "180px",
    },
    {
      name: <h6><b>Roles</b></h6>,
      selector: row => (
        <button
            className="btn btn-link btn-sm p-0 text-decoration-underline"
            onClick={() => openRoleModal(row.id, row.roles)}
          >
            Update Roles
          </button>
      ),
      width: "150px",
      wrap: true,
    },
    {
      name: (
        <h6>
          <b>Type</b>
        </h6>
      ),
      selector: (row) => row.companyType,
      width: "130px",
      wrap: true,
    },
    {
      name: (
        <h6>
          <b>Actions</b>
        </h6>
      ),
      width: "130px",
      cell: (row) => (
        <div className="text-end">
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "0",
              marginRight: "10px",
            }}
            onClick={() => getData(row.id)}
            title="Edit"
          >
            <PencilSquare size={22} color="#2255A4" />
          </button>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "0",
              marginLeft: "5px",
            }}
            onClick={() => handleShowDeleteModal(row.id)}
            title="Delete"
          >
            <XSquareFill size={22} color="#DA542E" />
          </button>
        </div>
      ),
    },
    {
      name: (
        <h6>
          <b>Status</b>
        </h6>
      ),
      selector: (row) => row.status,
      cell: (row) => (
        <select
          className="form-select form-select-sm"
          value={row.status || ""}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          style={{ width: "120px" }}
        >
          <option value="" disabled hidden>
            Status
          </option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      ),
      width: "150px",
    },
  ];

  const getFilteredList = (searchTerm) => {
    setSearch(searchTerm);
    const filtered = view.filter((item) => {
      const lowerCasedSearchTerm = searchTerm.toLowerCase();
      return item.companyName.toLowerCase().includes(lowerCasedSearchTerm);
      // item.name.toLowerCase().includes(lowerCasedSearchTerm)
    });
    setFilteredData(filtered);
    setShowNoRecordsMessage(filtered.length === 0);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Summary</strong>{" "}
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Summary</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-lg-12 col-xxl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="row">
                  <div className="col-12 col-md-6 col-lg-4"></div>
                  <div className="col-12 col-md-6 col-lg-4"></div>
                  <div className="col-12 col-md-6 col-lg-4">
                    <input
                      type="search"
                      className="form-control mb-1"
                      placeholder="Search by Company Name"
                      value={search}
                      onChange={(e) => getFilteredList(e.target.value)}
                    />
                  </div>
                </div>
                <div
                  className="dropdown-divider"
                  style={{ borderTopColor: "#D7D9DD" }}
                />
              </div>
              {filteredData.length === 0 && showNoRecordsMessage ? (
                <div className="p-4 text-center">No records found.</div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredData.length > 0 ? filteredData : view}
                  pagination
                  onChangePage={(page) => setCurrentPage(page)}
                  onChangeRowsPerPage={(perPage) => setRowsPerPage(perPage)}
                />
              )}
            </div>
          </div>
          <DeletePopup
            show={showDeleteModal}
            handleClose={handleCloseDeleteModal}
            handleConfirm={() => handleConfirmDelete(selectedItemId)}
            id={selectedItemId}
            pageName="Company"
          />
        </div>
      </div>
{showModal && (
  <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Update Role</h5>
          <button type="button" className="close btn" onClick={closeRoleModal}>
            <span>&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <label htmlFor="roleSelect">Select Role:</label>
          <select
            id="roleSelect"
            className="form-select"
            value={updatedRoles}
            onChange={(e) => setUpdatedRoles(e.target.value)}
          >
            <option value="">-- Select Role --</option>
            <option value="hrm">HRM</option>
            <option value="tax_consultant">Tax_Consultant</option>
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={closeRoleModal}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSaveRoles}>
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {showStatusModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Status Change</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStatusModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to change the status to{" "}
                  <strong>{statusUpdateData.newStatus}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={confirmStatusChange}
                >
                  Yes, Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayOut>
  );
};

export default CompanyView;
