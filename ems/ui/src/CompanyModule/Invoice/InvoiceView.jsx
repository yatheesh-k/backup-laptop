import React, { useState, useEffect } from "react";
import { Eye } from "react-bootstrap-icons";
import { useNavigate, Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import LayOut from "../../LayOut/LayOut";
import { useAuth } from "../../Context/AuthContext";
import { fetchInvoices } from "../Redux/InvoiceSlice";

const InvoiceView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { invoices, loading, error } = useSelector((state) => state.invoices);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useAuth();
  const companyId = user.companyId;

  // Fetch invoices on component mount
  useEffect(() => {
    if (companyId) {
      dispatch(fetchInvoices(companyId));
    }
  }, [dispatch, companyId]);

    useEffect(() => {
      console.log("products from Redux store:", invoices);
    }, [invoices]);

  // Filter invoices based on search
  useEffect(() => {
        if (invoices && Array.isArray(invoices)) {
            const result = invoices.filter((invoice) =>
                invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredData(result);
        } else {
            setFilteredData([]);
        }
    }, [search, invoices]);

  const handleView = (invoiceId) => {
    navigate(`/invoicePdf`, { state: { invoiceId } });
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
      name: <h6><b>Customer Name</b></h6>,
      selector: (row) => row.customerName,
      width: "190px",
    },
    {
      name:<h6><b>Mobile Number</b></h6>,
      selector: (row) => row.contactNumber,
      width: "170px",
    },
    // {
    //   name: "Email",
    //   selector: (row) => row.customerEmail,
    //   width: "200px",
    // },
    {
      name: <h6><b>State</b></h6>,
      selector: (row) => row.customerState,
      width: "150px",
    },
    // {
    //   name: "City",
    //   selector: (row) => row.customerCity,
    //   width: "150px",
    // },
    {
      name: <h6><b>Invoice Number</b></h6>,
      selector: (row) => row.invoiceNumber,
      width: "180px",
    },
    {
        name: <h6><b>Invoice Date</b></h6>,
        selector: (row) => row.invoiceDate,
        width: "160px",
      },
    // {
    //   name: "Total Amount",
    //   selector: (row) => row.totalAmount,
    //   width: "150px",
    // },
    {
      name:<h6><b>Actions</b></h6>,
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent" }}
            onClick={() => handleView(row.invoiceNumber)}
            title="View Invoice"
          >
            <Eye size={22} color="green" />
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  const getFilteredList = (searchTerm) => {
    setSearch(searchTerm);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Invoices</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={"/"}>Home</Link>
                </li>
                <li className="breadcrumb-item active">Invoices</li>
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
                    <Link to={"/invoiceRegistration"}>
                      <button className="btn btn-primary">Add Invoice</button>
                    </Link>
                  </div>
                  <div className="col-md-4 offset-md-4 d-flex justify-content-end">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by Invoice Number"
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
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default InvoiceView;
