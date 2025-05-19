import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import { CalendarFill } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { useAuth } from "../../Context/AuthContext";
import {
  companyViewByIdApi,
  InvoiceDownloadById,
  InvoiceGetApiById,
} from "../../Utils/Axios";
import LayOut from "../../LayOut/LayOut";

const InvoicePdf = () => {
  const { setValue } = useForm();
  const [invoiceData, setInvoiceData] = useState({});
  const location = useLocation();
  const [companyDetails, setCompanyDetails] = useState({});
  const { customerId, invoiceId } = location.state || {};
  const { user } = useAuth();
  const companyId = user.companyId;
  console.log("companyId", companyId);

  // Fetch company details
  useEffect(() => {
    if (user.companyId) {
      const fetchCompanyDetails = async () => {
        try {
          const response = await companyViewByIdApi(user.companyId);
          console.log("Fetched company details for companyId:", user.companyId);
          console.log("Company Details:", response.data);
          setCompanyDetails(response.data);
          const companyData = response.data;
          setValue("userName", companyData.userName);
          setValue("companyEmail", companyData.companyEmail);
          setValue("phone", companyData.phone);
          setValue("companyName", companyData.companyName);
          setValue("serviceName", companyData.serviceName);
          setValue("pan", companyData.panNo); // using panNo from company details
          setValue("gstNumber", companyData.gstNo);
          setValue("gender", companyData.gender);
          setValue("accountNumber", companyData.accountNumber);
          setValue("bankName", companyData.bankName);
          setValue("branch", companyData.branch);
          setValue("ifscCode", companyData.ifscCode);
          setValue("address", companyData.companyAddress);
          setValue("state", companyData.state);
          setValue("password", companyData.password);
        } catch (error) {
          toast.error("Failed to load company details.", {
            position: "top-right",
            theme: "colored",
            autoClose: 1000,
            transition: Slide,
          });
        }
      };

      fetchCompanyDetails();
    }
  }, [user.companyId, setValue]);

  // Fetch invoice details
  useEffect(() => {
    if (!companyId) {
      console.error("Company ID is missing");
      return;
    }

    const fetchData = async () => {
      try {
        const { invoiceId, customerId } = location?.state || {};
        console.log("Invoice ID:", invoiceId);
        console.log("Customer ID:", customerId);
        console.log("Company ID:", companyId);

        if (invoiceId && customerId) {
          const response = await InvoiceGetApiById(
            companyId,
            customerId,
            invoiceId
          );
          console.log("API Response Data:", response);
          // Set the invoice data
          setInvoiceData(response.data);
          // Add console log for each product column title
          if (response.data && response.data.productColumns) {
            response.data.productColumns.forEach((col, index) => {
              console.log(`Product Column ${index} Title:`, col.title);
            });
          }
        } else {
          console.error(
            "Invoice ID and/or Customer ID not found in location state"
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [companyId, location]);

  useEffect(() => {
    if (invoiceData && Object.keys(invoiceData).length > 0) {
      console.log("Updated invoiceData:", invoiceData);
    }
  }, [invoiceData]);

  // Handle PDF download
  const handleDownload = async () => {
    if (location && location.state && location.state.invoiceId) {
      const { invoiceId, customerId } = location.state;
      const companyId = user.companyId;

      if (companyId && customerId && invoiceId) {
        try {
          const success = await InvoiceDownloadById(
            companyId,
            customerId,
            invoiceId
          );
          if (success) {
            toast.success("Invoice downloaded successfully");
          } else {
            toast.error("Failed to download invoice");
          }
        } catch (err) {
          console.error("Error downloading invoice:", err);
          toast.error("Failed to download invoice");
        }
      } else {
        console.error("Company ID, Customer ID, or Invoice ID is missing");
        toast.error("Company ID, Customer ID, or Invoice ID is missing");
      }
    } else {
      console.error("Invoice ID is missing");
      toast.error("Invoice ID is missing");
    }
  };

  return (
    <LayOut>
      <div className="container-fluid" style={{ width: "900px" }}>
        <div className="row">
          <div className="col-md-12">
            <div
              className="card card-body bg-white mt-5"
              style={{ paddingTop: "50px", paddingRight: "60px" }}
            >
              {/* Header with PAN, GST & Logo */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "bold", marginBottom: "0px" }}>
                    PAN Number: {companyDetails.panNo || "N/A"}
                  </p>
                  <p style={{ fontWeight: "bold" }}>
                    GST Number: {companyDetails.gstNo || "N/A"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  {companyDetails.imageFile && (
                    <img
                      src={companyDetails.imageFile}
                      style={{ height: "60px", width: "155px" }}
                      alt="logo"
                    />
                  )}
                </div>
              </div>

              <h1 style={{ textAlign: "center" }}>Invoice</h1>
              <div className="row">
                {/* Billing Information */}
                <div className="col-md-6">
                  <div className="text-left">
                    <address>
                      <p style={{ marginBottom: "10px" }}>Billed To,</p>
                      <p style={{ marginBottom: "10px" }}>
                        <b>{invoiceData.customer?.customerName || "N/A"},</b>
                      </p>
                      <p style={{ marginBottom: "10px" }}>
                        <b>Email: {invoiceData.customer?.email || "N/A"},</b>
                      </p>
                      <p style={{ marginBottom: "10px" }}>
                        <b>
                          Contact No:{" "}
                          {invoiceData.customer?.mobileNumber || "N/A"},
                        </b>
                      </p>
                      
                      <p style={{ marginBottom: "10px" }}>
                        <b>
                          Address: {invoiceData.customer?.address || "N/A"}.
                        </b>
                      </p>
                      {invoiceData.customer?.customerGstNo && (
                        <p style={{ marginBottom: "10px" }}>
                          <b>GST: {invoiceData.customer.customerGstNo},</b>
                        </p>
                      )}
                    </address>
                  </div>
                </div>
                {/* Invoice Meta Data */}
                <div className="col-md-6 text-end">
                  <p>
                    <b>Invoice ID: {invoiceData.invoiceNo || "N/A"}</b>
                  </p>
                  <p>
                    <b>Invoice Date: </b> <CalendarFill />{" "}
                    <b>
                      {invoiceData.invoiceDate
                        ? new Date(invoiceData.invoiceDate).getFullYear()
                        : "N/A"}
                      -
                      {invoiceData.invoiceDate
                        ? new Date(invoiceData.invoiceDate).toLocaleString(
                            "en-US",
                            { month: "short" }
                          )
                        : "N/A"}
                      -
                      {invoiceData.invoiceDate
                        ? new Date(invoiceData.invoiceDate).getDate()
                        : "N/A"}
                    </b>
                  </p>
                  <p>
                    <b>Due Date: </b> <CalendarFill />{" "}
                    <b>
                      {invoiceData.dueDate
                        ? new Date(invoiceData.dueDate).getFullYear()
                        : "N/A"}
                      -
                      {invoiceData.dueDate
                        ? new Date(invoiceData.dueDate).toLocaleString(
                            "en-US",
                            { month: "short" }
                          )
                        : "N/A"}
                      -
                      {invoiceData.dueDate
                        ? new Date(invoiceData.dueDate).getDate()
                        : "N/A"}
                    </b>
                  </p>
                </div>

                {/* Dynamic Invoice Table */}
                <div className="col-md-12">
                  <div className="table-responsive m-t-40">
                    <table className="table" style={{ marginBottom: "0px" }}>
                      <thead>
                        <tr>
                          <th
                            className="text-center"
                            style={{ background: "#efeded" }}
                          >
                            S.No
                          </th>
                          {invoiceData &&
                            invoiceData.productColumns &&
                            invoiceData.productColumns.map((col, index) => (
                              <th
                                key={index}
                                className="text-left"
                                style={{ background: "#efeded" }}
                              >
                                {col.title}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData &&
                          invoiceData.productData &&
                          invoiceData.productData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              <td className="text-center">{rowIndex + 1}</td>
                              {invoiceData.productColumns &&
                                invoiceData.productColumns.map(
                                  (col, colIndex) => (
                                    <td key={colIndex} className="text-left">
                                      {row[col.key]}
                                    </td>
                                  )
                                )}
                            </tr>
                          ))}
                      </tbody>
                      <tfoot>
                        {(() => {
                          const totalColumns =
                            invoiceData && invoiceData.productColumns
                              ? invoiceData.productColumns.length + 1
                              : 1;
                          return (
                            <>
                              <tr>
                                <td
                                  colSpan={totalColumns - 1}
                                  style={{
                                    textAlign: "right",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Total Amount
                                </td>
                                <td>
                                  {(
                                    parseFloat(invoiceData.subTotal) || 0
                                  ).toFixed(2)}
                                </td>
                              </tr>
                              {!invoiceData.igst || parseFloat(invoiceData.igst) === 0 ? (
                                  <>
                                  <tr>
                                    <td
                                      colSpan={totalColumns - 1}
                                      style={{
                                        textAlign: "right",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      SGST (9%)
                                    </td>
                                    <td>
                                      {(
                                        parseFloat(invoiceData.sgst) || 0
                                      ).toFixed(2)}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      colSpan={totalColumns - 1}
                                      style={{
                                        textAlign: "right",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      CGST (9%)
                                    </td>
                                    <td>
                                      {(
                                        parseFloat(invoiceData.cgst) || 0
                                      ).toFixed(2)}
                                    </td>
                                  </tr>
                                </>
                              ) : (
                                <tr>
                                <td
                                  colSpan={totalColumns - 1}
                                  style={{
                                    textAlign: "right",
                                    fontWeight: "bold",
                                  }}
                                >
                                  IGST (18%)
                                </td>
                                <td>
                                  {(
                                    parseFloat(invoiceData.igst) || 0
                                  ).toFixed(2)}
                                </td>
                              </tr>
                            
                              )}
                              <tr>
                                <td
                                  colSpan={totalColumns - 1}
                                  style={{
                                    textAlign: "right",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Grand Total
                                </td>
                                <td>
                                  {(
                                    parseFloat(invoiceData.grandTotal) || 0
                                  ).toFixed(2)}
                                </td>
                              </tr>
                              <tr>
                                <td
                                  colSpan={totalColumns}
                                  style={{
                                    textAlign: "center",
                                    fontWeight: "bold",
                                  }}
                                >
                                  In Words: {invoiceData.grandTotalInWords}
                                </td>
                              </tr>
                              <tr>
                                <td
                                  colSpan={totalColumns}
                                  style={{ textAlign: "center" }}
                                >
                                  <span className="text-sm">
                                    The payment should be made favouring{" "}
                                    <strong>
                                      {companyDetails.companyName}
                                    </strong>{" "}
                                    or direct deposit as per the information
                                    above.
                                  </span>
                                </td>
                              </tr>
                            </>
                          );
                        })()}
                      </tfoot>
                    </table>
                  </div>
                </div>
                {/* Bank Details */}
                <div className="col-md-12 mt-3">              
                <div className="row">
  {/* Left Section - Bank Details */}
  <div className="col-md-6">
    {/* Title and Bank Address aligned in the same row */}
    <div className="d-flex align-items-start mb-2">
      <h5 className="fw-bold me-3">Bank Details</h5>
    </div>

    {/* Bank Details List */}
    <div className="d-flex">
      <div className="fw-bold" style={{ width: "150px" }}>Bank Name :</div>
      <div>{invoiceData.bank?.bankName || "N/A"}</div>
    </div>

    <div className="d-flex">
      <div className="fw-bold" style={{ width: "150px" }}>Account Number :</div>
      <div>{invoiceData.bank?.accountNumber || "N/A"}</div>
    </div>

    <div className="d-flex">
      <div className="fw-bold" style={{ width: "150px" }}>Account Type :</div>
      <div>{invoiceData.bank?.accountType || "N/A"}</div>
    </div>

    <div className="d-flex">
      <div className="fw-bold" style={{ width: "150px" }}>IFSC Code :</div>
      <div>{invoiceData.bank?.ifscCode || "N/A"}</div>
    </div>

    <div className="d-flex">
      <div className="fw-bold" style={{ width: "150px" }}>Branch :</div>
      <div>{invoiceData.bank?.branch || "N/A"}</div>
    </div>

    <div className="d-flex">
      <div className="fw-bold" style={{ width: "250px" }}>Bank Address :</div>
      <div><span className="text-break" style={{ maxWidth: "300px" }}>{invoiceData.bank?.address || "N/A"}</span></div>
    </div>
  </div>

  {/* Right Section - Stamp & Authorized Signature (Both at Bottom) */}
  <div className="col-md-6 d-flex flex-column align-items-end justify-content-end">
    {companyDetails.stampImage && (
      <img
        src={companyDetails.stampImage}
        className="mb-0"
        style={{ height: "60px", width: "155px" }}
        alt="Company Stamp"
      />
    )}
    
    <div className="text-end">
      <p className="mb-1"><b>{companyDetails.companyName}</b></p>
      <h5 className="mb-0">Authorized Signature</h5>
    </div>
  </div>
</div>

                    <hr />
                    <div className="table-responsive">
                    <div style={{ margin: "40px 0px" }}>
                      <p style={{ textAlign: "center", marginBottom: "0px" }}>
                        {companyDetails.companyName},
                      </p>
                      <p style={{ marginBottom: "0px", textAlign: "center" }}>
                        {companyDetails.companyAddress},
                      </p>
                      <p style={{ marginBottom: "0px", textAlign: "center" }}>
                        {companyDetails.mobileNo}, {companyDetails.emailId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="text-right"
              style={{ marginBottom: "30px", marginLeft: "82%" }}
              onClick={handleDownload}
            >
              <button className="btn btn-danger">Download as PDF</button>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default InvoicePdf;
