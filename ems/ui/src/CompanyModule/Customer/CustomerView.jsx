import React, { useState, useEffect } from 'react';
import { PencilSquare, XSquareFill } from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Slide, toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import LayOut from "../../LayOut/LayOut"; 
import { CustomerDeleteApiById } from '../../Utils/Axios';
import { useAuth } from '../../Context/AuthContext';
import { fetchCustomers, removeCustomerFromState } from '../Redux/CustomerSlice';

const CustomersView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { customers, loading, error } = useSelector(state => state.customers); 
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { user } = useAuth();
    const companyId = user.companyId;

    // Fetch all customers on component mount
    useEffect(() => {
        if (companyId) {
            dispatch(fetchCustomers(companyId));
        }
    }, [dispatch, companyId]);

    useEffect(() => {
        console.log('Customers from Redux store:', customers);
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
        }
    }, [search, customers]);

    const handleEdit = (customerId) => {
        navigate(`/customerRegistration`, { state: { customerId } });
        console.log("customerId from CustomerView", customerId);
    };

    const handleDelete = async (customerId) => {
        try {
            console.log('Deleting customer with companyId:', companyId, 'and customerId:', customerId);
            // Make a DELETE request to the API with the given ID
            const response = await CustomerDeleteApiById(companyId, customerId);
            console.log('Delete response:', response);
            dispatch(removeCustomerFromState(customerId)) // Refetch customers from the Redux store
            toast.error('Customer deleted successfully', {
                position: 'top-right',
                transition: Slide,
                hideProgressBar: true,
                theme: "colored",
                autoClose: 1000, // Close the toast after 1 second
            });
            // console.log(response);
            // console.log(response.data.data);
        } catch (error) {
            console.error('Error in handleDelete:', error.response || error);
            if (error.response && error.response.data) {
                console.error('Server Error Message:', error.response.data);
            }
        }
    };

    const columns = [
        {
            name: <h6><b>#</b></h6>,
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            width: "50px",
          },
        {
            name: <h6><b>Customer Name</b></h6>,
            selector: (row) => row.customerName,
            width: "170px"
        },
        {
            name: <h6><b>Mobile Number</b></h6>,
            selector: (row) => row.mobileNumber,
            width: "170px"
        },
        {
            name: <h6><b>Email</b></h6>,
            selector: (row) => row.email,
            width: "200px"
        },
        {
            name: <h6><b>State</b></h6>,
            selector: (row) => row.state,
            width: "150px"
        },
        {
            name: <h6><b>City</b></h6>,
            selector: (row) => row.city,
            width: "150px"
        },
        {
            name: <h6><b>Actions</b></h6>,
            cell: (row) => (
                <div>
                    <button
                        className="btn btn-sm"
                        style={{ backgroundColor: "transparent" }}
                        onClick={() => handleEdit(row.customerId)}
                        title="Edit"
                    >
                        <PencilSquare size={22} color='#2255a4' />
                    </button>
                    <button
                        className="btn btn-sm"
                        style={{ backgroundColor: "transparent" }}
                        onClick={() => handleDelete(row.customerId)}
                        title="Delete"
                    >
                        <XSquareFill size={22} color='#da542e' />
                    </button>
                </div>
            ),
            width: "150px"
        }
    ];

    const getFilteredList = (searchTerm) => {
        setSearch(searchTerm);
    };

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3"><strong>Customers</strong></h1>
                    </div>
                    <div className="col-auto">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to={"/"}>Home</Link>
                                </li>
                                <li className="breadcrumb-item active">Customers</li>
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
                                            <button className="btn btn-primary">Add Customer</button>
                                        </Link>
                                    </div>
                                    <div className="col-md-4 offset-md-4 d-flex justify-content-end">
                                        <input
                                            type="text"
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

export default CustomersView;
