import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import Select from "react-select";
import { useForm } from "react-hook-form";
import { Bounce, toast } from "react-toastify";
import {
  EmployeeGetApi,
  AttendanceReportApi,
  AttendancePatchById,
  GetGstAccountByMonthYear,
} from "../../Utils/Axios";
import { PencilSquare } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { ModalTitle, ModalHeader, ModalBody } from "react-bootstrap";

const invoiceAccountsData=[
  {
    "id": 1,
    "customerName": "ABC Traders",
    "customerGstNo": "29ABCDE1234F1Z5",
    "month": "June",
    "year": "2024",
    "invoiceNumber": "INV001",
    "invoiceDate": "2024-06-15",
    "totalAmount": "50000",
    "subTotal": "45000",
    "comment": "Payment received in full",
    "cgst": "2250",
    "sgst": "2250",
    "igst": "0"
  },
  {
    "id": 2,
    "customerName": "XYZ Enterprises",
    "customerGstNo": "07XYZPQ5678G1Z6",
    "month": "June",
    "year": "2024",
    "invoiceNumber": "INV002",
    "invoiceDate": "2024-06-18",
    "totalAmount": "88500",
    "subTotal": "75000",
    "comment": "IGST applicable",
    "cgst": "0",
    "sgst": "0",
    "igst": "13500"
  },
  {
    "id": 3,
    "customerName": "LMN Supplies",
    "customerGstNo": "27LMNAB1234C1Z9",
    "month": "June",
    "year": "2024",
    "invoiceNumber": "INV003",
    "invoiceDate": "2024-06-20",
    "totalAmount": "118000",
    "subTotal": "100000",
    "comment": "Partial payment received",
    "cgst": "9000",
    "sgst": "9000",
    "igst": "0"
  },
  {
    "id": 4,
    "customerName": "PQR Co.",
    "customerGstNo": "33PQRCD6789H1Z3",
    "month": "June",
    "year": "2024",
    "invoiceNumber": "INV004",
    "invoiceDate": "2024-06-22",
    "totalAmount": "236000",
    "subTotal": "200000",
    "comment": "Advance invoice",
    "cgst": "18000",
    "sgst": "18000",
    "igst": "0"
  }
]


const InvoiceAccountsSummary = () => {
  const [month, setMonth] = useState("June");
  const [year, setYear] = useState("2024");
//   const [invoiceAccountsData, setInvoiceAccountsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState("");

  const getMonthNames = () => {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("en-US", { month: "long" })
    );
  };

  const getRecentYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => (currentYear - i).toString());
  };

    // Month & year filter + customer search
  useEffect(() => {
    const result = invoiceAccountsData
      .filter(
        (invoice) =>
          invoice.month === month && invoice.year === year
      )
      .filter((invoice) =>
        invoice.customerName.toLowerCase().includes(searchCustomer.toLowerCase())
      );
    setFilteredData(result);
  }, [month, year, searchCustomer]);

//   const fetchGstAccountData = async () => {
//     try {
//       const response = await GetGstAccountByMonthYear(month, year);
//       const data = response?.data || [];
//       setInvoiceAccountsData(data);
//       setFilteredData(data);
//       if (data.length === 0) {
//         toast.warn("No GST data found for selected month and year.");
//       }
//     } catch (error) {
//       toast.error("Failed to fetch GST data");
//       console.error(error);
//     }
//   };

const maskGstNUmber=(gstNo)=>{
    if(!gstNo || gstNo<15)
        return gstNo;
    const prefix=gstNo.slice(0,2);
    const suffix=gstNo.slice(-3);
    const maskMiddle="*".repeat(gstNo.length-9);
    return `${prefix}${maskMiddle}${suffix}`
}

  useEffect(() => {
    const result = invoiceAccountsData.filter((item) =>
      item.customerName?.toLowerCase().includes(searchCustomer.toLowerCase())
    );
    setFilteredData(result);
  }, [searchCustomer, invoiceAccountsData]);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Invoice No",
      selector: (row) => row.invoiceNumber,
      sortable: true,
    },
    {
      name: "Invoice Date",
      selector: (row) => row.invoiceDate,
      sortable: true,
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName,
      sortable: true,
    },
    {
      name: "Customer GST No",
      selector: (row) => maskGstNUmber(row.customerGstNo),
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          className="btn btn-sm"
          style={{
            backgroundColor: "transparent",
            border: "none",
            padding: "10px",
          }}
          title="Edit"
        >
          <PencilSquare size={22} color="#2255a4" />
        </button>
      ),
    },
  ];

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Invoice Account Summary</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">GST</li>
                <li className="breadcrumb-item active">Invoice Summary</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-md-3">
                <label>Select Month</label>
                <select
                  className="form-select"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  {getMonthNames().map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label>Select Year</label>
                <select
                  className="form-select"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  {getRecentYears().map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              {/* <div className="col-md-3 d-flex align-items-end">
                <button className="btn btn-primary" onClick={fetchGstAccountData}>
                  Go
                </button>
              </div> */}
              <div className="col-md-3">
                <label>Search Customer</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter customer name"
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                />
              </div>
              <div className="col-md-3 mt-3 d-flex justify-content-end">
                <button onClick={('/invoicesAccountsManagment')} className="btn btn-primary">Add Invocie Datas</button>
              </div>
            </div>
          </div>

          <div className="card-body">
            <h5 className="card-title text-secondary">Invoice Accounts Data</h5>
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

export default InvoiceAccountsSummary;
