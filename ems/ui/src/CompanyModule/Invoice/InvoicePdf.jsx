import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Slide, toast } from 'react-toastify';
import { CalendarFill } from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../Context/AuthContext';
import { companyViewByIdApi, InvoiceGetApiById } from '../../Utils/Axios';

const InvoicePdf = () => {
  const { setValue } = useForm();
  const [invoiceData, setInvoiceData] = useState({});
  const location = useLocation();
  const [companyDetails, setCompanyDetails] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    if (user.companyId) {
      const fetchCompanyDetails = async () => {
        try {
          const response = await companyViewByIdApi(user.companyId);
          console.log("Fetched company details for companyId:", user.companyId);
          setCompanyDetails(response.data);
          const companyData = response.data;
          setValue('userName', companyData.userName);
          setValue('companyEmail', companyData.companyEmail);
          setValue('phone', companyData.phone);
          setValue('companyName', companyData.companyName);
          setValue('serviceName', companyData.serviceName);
          setValue('pan', companyData.pan);
          setValue('gstNumber', companyData.gstNumber);
          setValue('gender', companyData.gender);
          setValue('accountNumber', companyData.accountNumber);
          setValue('bankName', companyData.bankName);
          setValue('branch', companyData.branch);
          setValue('ifscCode', companyData.ifscCode);
          setValue('address', companyData.address);
          setValue('state', companyData.state);
          setValue('password', companyData.password);
        } catch (error) {
          toast.error('Failed to load company details.', {
            position: 'top-right',
            theme: "colored",
            autoClose: 1000,
            transition: Slide,
          });
        }
      };

      fetchCompanyDetails();
    }
  }, [user.companyId, setValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (location?.state?.invoiceId) {
          const response = await InvoiceGetApiById(location.state.invoiceId);
          setInvoiceData(response.data.data);
        } else {
          console.error('Invoice ID not found in location state');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [location]);

//   const handleDownload = async () => {
//     if (location && location.state && location.state.invoiceId) {
//       try {
//         const success = await InvoiceDownloadApi(location.state.invoiceId);
//         if (success) {
//           toast.success("Invoice downloaded successfully");
//         } else {
//           toast.error("Failed to download invoice");
//         }
//       } catch (err) {
//         console.error("Error downloading invoice:", err);
//         toast.error("Failed to download invoice");
//       }
//     } else {
//       console.error("Invoice ID is missing");
//       toast.error("Invoice ID is missing");
//     }
//   };

  return (
    <div className="container-fluid" style={{ width: "900px" }}>
      <div className="row">
        <div className="col-md-12">
          <div className="card card-body printableArea bg-white">
            <p style={{ fontWeight: "bold", width: "150px", marginBottom: "0px" }}> PAN No: {invoiceData.pan}</p>
            <p style={{ fontWeight: "bold", width: "400px" }}>GST Number : {companyDetails.gstNumber}</p>
            <div style={{ textAlign: "right" }}>
              <img src={companyDetails.imageFile} style={{ height: "60px", width: "155px", marginTop: "0px" }} alt="logo" />
            </div>
            <h1>Invoice</h1>
            <div className="row">
              {/* Billing Information */}
              <div className="col-md-6">
                <div className="text-left">
                  <address>
                    <h6 className="font-small">Billed To,</h6>
                    <h6 className="font-small">{invoiceData.customerName}</h6>
                    <h6 className="font-small">{invoiceData.address}</h6>
                    <h6 className="m-l-30">Email Id: {invoiceData.email}</h6>
                    <h6 className="m-l-30">Contact No: {invoiceData.mobileNumber}</h6>
                    <h6 className="m-l-30">GST NO: {invoiceData.gstNo}</h6>
                    <h6 className="m-l-30">{invoiceData.Address}</h6>
                  </address>
                </div>
              </div>
              <div className="col-md-6 text-right">
                <h5><b style={{ fontSize: "smaller" }}>INVOICE </b>-<span>{invoiceData.invoiceId}</span></h5>
                <p><b>Invoice Date :</b> <CalendarFill /> <b>{invoiceData.invoiceDate}</b></p>
                <p><b>Due Date : </b><CalendarFill /> <b>{invoiceData.dueDate}</b></p>
              </div>
              {/* Bank Details in Two Columns */}
              <div className="col-md-12">
                <div className="table-responsive m-t-40">
                  <table className="table table-hover" style={{ marginBottom: "0px" }}>
                    <thead>
                      <tr>
                        <th className="text-center" style={{ background: "#efeded" }}>S.No</th>
                        <th className="text-left" style={{ background: "#efeded" }}>HSN-no</th>
                        <th className="text-left" style={{ background: "#efeded" }}>Details</th>
                        <th className="text-left" style={{ background: "#efeded" }}>Service</th>
                        <th className="text-left" style={{ background: "#efeded" }}>Quantity</th>
                        <th className="text-left" style={{ background: "#efeded" }}>Unit Cost (₹)</th>
                        <th className="text-left" style={{ background: "#efeded" }}>Total Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.orderRequests && invoiceData.orderRequests.map((item, index) => (
                        <tr key={index}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-left">{item.hsnNo}</td>
                          <td className="text-left">{item.productName}</td>
                          <td className="text-left">{item.productCompany}</td>
                          <td className="text-left">{item.quantity}</td>
                          <td className="text-left">{item.unitCost}</td>
                          <td className="text-left">{item.totalCost}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      {/* Total Cost, IGST, and Grand Total */}
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Amount</td>
                        <td>{invoiceData.totalAmount}</td>
                      </tr>
                      {/* <tr>
                        <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>IGST (18%)</td>
                        <td>{invoiceData.iGst}</td>
                      </tr> */}
                      {/* Conditional Rendering for Tax Rows */}
                      {/* {invoiceData.iGst > 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>IGST (18%)</td>
                          <td>{invoiceData.iGst}</td>
                        </tr>
                      ) : (
                        <>
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>SGST (9%)</td>
                            <td>{invoiceData.sGst}</td>
                          </tr>
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>CGST (9%)</td>
                            <td>{invoiceData.cGst}</td>
                          </tr>
                        </>
                      )} */}
                      {invoiceData.gstNo === 0 ||invoiceData.gstNo ===""? (
                        <>
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>SGST (9%)</td>
                            <td>0</td>
                          </tr>
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>CGST (9%)</td>
                            <td>0</td>
                          </tr>
                        </>
                      ) : invoiceData.iGst > 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>IGST (18%)</td>
                          <td>{invoiceData.iGst}</td>
                        </tr>
                      ) : (
                        <>
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>SGST (9%)</td>
                            <td>{invoiceData.sGst}</td>
                          </tr>
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>CGST (9%)</td>
                            <td>{invoiceData.cGst}</td>
                          </tr>
                        </>
                      )}
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total</td>
                        <td>{invoiceData.grandTotal}</td>
                      </tr>
                      <tr>
                        <td colSpan="12" style={{ textAlign: 'center', fontWeight: 'bold' }}>In Words : {invoiceData.grandTotalInWords} </td>
                      </tr>
                      <tr>
                        <td colSpan="12" style={{ textAlign: 'center', fontWeight: 'bold' }}>The payment should be made favouring {companyDetails.companyName} or Direct deposite information below</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="col-md-12">
                <div className="table-responsive">
                  <h3 style={{ margin: "40px 0 10px 10px" }}>Bank Details</h3>
                  <div className="col-md-12">
                    <div className="bank-details" style={{ marginBottom: "20px" }}>
                      <div style={{ display: "flex", marginBottom: "10px" }}>
                        <span style={{ fontWeight: "bold", width: "150px" }}>Bank Name:</span>
                        <span>{invoiceData.bankName}</span>
                      </div>
                      {/* <div style={{ display: "flex", marginBottom: "10px" }}>
                        <span style={{ fontWeight: "bold", width: "150px" }}>Account Type:</span>
                        <span>{invoiceData.accountType}</span>
                      </div> */}
                      <div style={{ display: "flex", marginBottom: "10px" }}>
                        <span style={{ fontWeight: "bold", width: "150px" }}>Account Number:</span>
                        <span>{invoiceData.accountNumber}</span>
                      </div>
                      <div style={{ display: "flex", marginBottom: "10px" }}>
                        <span style={{ fontWeight: "bold", width: "150px" }}>IFSC Code:</span>
                        <span>{invoiceData.ifscCode}</span>
                      </div>
                      <div style={{ display: "flex", marginBottom: "10px" }}>
                        <span style={{ fontWeight: "bold", width: "150px" }}>Branch:</span>
                        <span>{invoiceData.branch}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ marginTop: "50px" }}><b>{companyDetails.companyName}</b> </p>
                    <img
                      src={companyDetails.stampImage}
                      alt="Stamp"
                      style={{ width: '130px', height: '130px' }}
                    />
                    <h5>Authorized Signature</h5>
                  </div>

                  {/* <h6 style={{ textAlign: "center" }}>CIN : </h6> */}
                  <hr />
                  <div style={{ margin: "40px 0px" }}>
                    <h5 style={{ textAlign: "center" }}>{companyDetails.companyName}</h5>
                    <p style={{ marginBottom: "0px", textAlign: "center" }}>{companyDetails.address}</p>
                    <p style={{ marginBottom: "0px", textAlign: "center" }}>{companyDetails.mobileNo},{companyDetails.companyEmail} </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right" style={{ marginBottom: "30px", marginLeft:"82%" }}>
            <button className="btn btn-danger" >Download as PDF</button>
          </div>
        </div>
      </div>
    </div >
  );
};

export default InvoicePdf;