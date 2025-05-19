import React, { useState, useEffect } from "react";
import { PencilSquare, XSquareFill } from "react-bootstrap-icons";
import { useNavigate, Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Slide, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import LayOut from "../../LayOut/LayOut";
import { CustomerDeleteApiById } from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";
import {
  fetchCustomers,
  removeCustomerFromState,
} from "../../Redux/CustomerSlice";
import DeletePopup from "../../Utils/DeletePopup";
import Loader from "../../Utils/Loader";

const CustomersView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customers, loading, error } = useSelector((state) => state.customers);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isFetching, setIsFetching] = useState(true); // Local loading state
  const { user } = useAuth();
  const companyId = user.companyId;

  // Fetch all customers on component mount
  useEffect(() => {
    if (companyId) {
      setIsFetching(true);
      const timer = setTimeout(() => {
        dispatch(fetchCustomers(companyId)).finally(()=>setIsFetching(false));
      }, 1000); // Delay of 1000ms
  
      return () => clearTimeout(timer);
    }
  }, [dispatch, companyId]);
  
  useEffect(() => {
    console.log("Customers from Redux store:", customers);
  }, [customers]);

  // Filter customers based on search term
  useEffect(() => {
    if (customers && Array.isArray(customers)) {
      const result = customers.filter((customer) =>
        customer.customerName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredData(result);
    } else {
      setFilteredData([]);
      toast.error(error)
    }
  }, [search, customers,error]);

  const handleEdit = (customerId) => {
    navigate(`/customerRegistration`, { state: { customerId } });
    console.log("customerId from CustomerView", customerId);
  };

  // Function to open delete confirmation modal
const handleOpenDeleteModal = (customerId) => {
  setSelectedItemId(customerId);
  setShowDeleteModal(true);
};

// Function to close delete confirmation modal
const handleCloseDeleteModal = () => {
  setShowDeleteModal(false);
  setSelectedItemId(null);
};

  const handleDelete = async (customerId) => {
    if (!selectedItemId) return;
    try {
      // Make a DELETE request to the API with the given ID
      const response = await CustomerDeleteApiById(companyId, customerId);
      console.log("Delete response:", response);
      dispatch(removeCustomerFromState(customerId)); // Refetch customers from the Redux store
      toast.error("Customer deleted successfully", {
        position: "top-right",
        transition: Slide,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 1000, // Close the toast after 1 second
      });
      // console.log(response);
      // console.log(response.data.data);
    } catch (error) {
      console.error("Error in handleDelete:", error.response || error);
      if (error.response && error.response.data) {
        console.error("Server Error Message:", error.response.data);
      }
    }finally {
      handleCloseDeleteModal();
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
      width: "50px",
    },
    {
      name: (
        <h6>
          <b>Client Name</b>
        </h6>
      ),
      selector: (row) => row.customerName,
      width: "200px",
    },
    {
      name: (
        <h6>
          <b>Mobile Number</b>
        </h6>
      ),
      selector: (row) => row.mobileNumber,
      width: "200px",
    },
    {
      name: (
        <h6>
          <b>Email</b>
        </h6>
      ),
      selector: (row) => row.email,
      width: "230px",
    },
    {
      name: (
        <h6>
          <b>State</b>
        </h6>
      ),
      selector: (row) => row.state,
      width: "170px",
    },
    {
      name: (
        <h6>
          <b>Actions</b>
        </h6>
      ),
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent",border:"none" }}
            onClick={() => handleEdit(row.customerId)}
            title="Edit"
          >
            <PencilSquare size={22} color="#2255a4" />
          </button>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent" }}
            onClick={() => handleOpenDeleteModal(row.customerId)}
            title="Delete"
          >
            <XSquareFill size={22} color="#da542e" />
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  const getFilteredList = (searchTerm) => {
    setSearch(searchTerm);
  };

    if (isFetching||loading) return  <Loader/>;
  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Client View</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Clients</li>
                <li className="breadcrumb-item active">Client View</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Search and Filter Form */}
        <div className="row">
          <div className="col-12 col-lg-12 col-xxl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="row">
                  <div className="col-md-4">
                    <Link to={"/customerRegistration"}>
                      <button className="btn btn-primary">Add Client</button>
                    </Link>
                  </div>
                  <div className="col-md-4 offset-md-4 d-flex justify-content-end">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => getFilteredList(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DataTable
                columns={columns}
                data={filteredData}
                pagination
                paginationPerPage={rowsPerPage}
                onChangePage={(page) => setCurrentPage(page)}
                onChangeRowsPerPage={(perPage) => setRowsPerPage(perPage)}
              />
            </div>
            <DeletePopup
              show={showDeleteModal}
              handleClose={handleCloseDeleteModal}
              handleConfirm={handleDelete}
              id={selectedItemId}
              pageName="Client Details"
            />

          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default CustomersView;
