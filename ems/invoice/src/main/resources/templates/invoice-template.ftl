<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <title>Invoice</title>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            margin: 0;
            padding: 0;
            font-size: 15px;
            /* Reduced font size */
        }
        h6 {
            font-size: 12px; /* Adjusted for subheadings */
            font-weight: bold;
        }

        .container-fluid {
            margin-top: 20px;
            padding: 10px;
        }

        .row {
            margin-bottom: 10px;
        }

        .card {
            padding: 20px;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        .font-medium {
            font-weight: 500;
        }

        .m-l-30 {
            margin-left: 30px;
        }

        .font-size-small {
            font-size: small;
        }

        .logo img {
            width: 80%;
            height: auto;
            object-fit: contain;
        }

        .table,
        .table th,
        .table td {
            border: 1px solid #ddd;
            border-collapse: collapse;
            padding: 6px;
            font-size: 11px;
            /* Reduced font size */
        }

        .table th {
            background-color: #f2f2f2;
        }

        .table td {
            text-align: right;
        }

        .company-details {
            text-align: right;
        }

        .customer-details {
            text-align: left;
        }

        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }

        .footer h6 {
            margin-top: 20px;
            text-align: left;
        }

        .footer .seal {
            width: 100px;
            height: auto;
            margin-left: 20px;
        }

        .payment-info {
            font-style: italic;
        }

        .company-bank-table td {
            text-align: left;
        }

        .table-responsive {
            margin-top: 20px;
        }

        .col-md-6 {
            width: 20%;
        }

        .col-md-12 {
            width: 100%;
        }

        .invoice-info {
            display: flex;
            justify-content: space-between;
        }
    </style>
</head>

<body>
    <div class="container-fluid">
        <!-- Company Logo - Top Right -->
         <div class="company-details" style="position:absolute ; top: -15px; right: 15px;">
            <#if invoice.company.imageFile?? && invoice.company.imageFile?has_content>
                 <img src="${invoice.company.imageFile}" alt="Company Logo" width="150" height="80" />
            <#else>
                   <img src="Image" alt="Company Logo" />
            </#if>
        </div>
        <!-- Invoice Heading Section -->
        <div style="position: relative; top: 10px; left: 0%; text-align: center;">
            <h3 style="margin: 0;">Invoice</h3> <!-- Removed margin for precise top positioning -->
        </div>

        <div style="position: absolute; top: 0; width: 100%; text-align: left; margin-left: 20px;">
            <h6 style="margin: 0;"><b>Pan Number:</b>${invoice.company.panNo}</h6>
            <h6 style="margin: 0;"><b>GST Number:</b>${invoice.company.gstNo}</h6>
        </div>
        <!-- Customer and Invoice Details Section -->
        <div
            style="position: relative; top: 20px; left: 20px; text-align: left; font-size: 20px; width: 40%;
                   word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;">
            <!-- Customer Details (Left Side) -->
            <div style="text-align: left;">
                <h6 style="margin: 5px 0;"><b>To,</b></h6>
                <h6 style="margin: 0; max-width: 100%; word-wrap: break-word;" class="font-medium">
                    ${invoice.customer.customerName}
                </h6>

                <h6 style="margin: 0;"><b>Email:</b> ${invoice.customer.email}</h6>
                <h6 style="margin: 0;"><b>Contact No:</b> ${invoice.customer.mobileNumber}</h6>
                <h6 style="margin: 0;"><b>Address:</b> ${invoice.customer.address}, ${invoice.customer.state}</h6>
                <#if invoice.customer.customerGstNo?? && invoice.customer.customerGstNo?has_content>
                    <h6 style="margin: 5px 0 0; padding-top: 5px; ">
                        <b>GST:</b> ${invoice.customer.customerGstNo}
                    </h6>
                </#if>
            </div>
        </div>
        <div style="position: relative; top: -70px; right: 0; margin-left: auto; text-align: right; font-size: 20px;">
            <div>
                <h6 style="margin: 0;"><b>Invoice Number:</b> ${invoice.invoiceNo!''}</h6>
                <h6 style="margin: 0;"><b>Invoice Date:</b> ${invoice.invoiceDate}</h6>
                <h6 style="margin: 0;"><b>Due Date:</b> ${invoice.dueDate}</h6>
            </div>
        </div>
        <!-- Product Details Table -->
        <div class="table-responsive" style="margin-left: 10px; position: relative; top: -10px;">
            <table class="table" style="width: 100%;">
                <thead>
                 <#assign columnCount = (invoice.productColumns?size + 1)!1>
                 <tr>
                     <th class="text-center">S.NO</th>

                     <#if invoice.productColumns?? && invoice.productColumns?size gt 0>
                         <#list invoice.productColumns as column>
                             <th class="text-center">${column.title}</th>  <!-- Extract only 'title' -->
                         </#list>
                     </#if>
                 </tr>
                </thead>
                <tbody>
                    <#if invoice.productData?? && invoice.productData?size gt 0>
                           <#list invoice.productData as product>
                               <tr>
                                   <td class="text-center">${product_index + 1}</td>  <!-- Serial Number -->

                                  <#if invoice.productColumns??>
                                    <#list invoice.productColumns as column>
                                        <#if product[column.key]??>
                                            <#if column.key == "totalCost">
                                                <td style="text-align: right;">${product[column.key]!'-'}</td>  <!-- Right-aligned for total cost -->
                                            <#elseif column.key == "service">
                                                <td style="text-align: left;">${product[column.key]!'-'}</td>  <!-- Left-aligned for service -->
                                            <#else>
                                                <td style="text-align: center;">${product[column.key]!'-'}</td>  <!-- Center-aligned for other values -->
                                            </#if>
                                        </#if>
                                    </#list>
                                </#if>

                               </tr>
                           </#list>
                       <#else>
                           <tr>
                               <td colspan="${columnCount}" style="font-size: 13px;">No orders available.</td>
                           </tr>
                       </#if>
                    <tr style="text-align: right;">
                        <td colspan="${columnCount-1}" style="text-align: right; font-size: 13px;"><strong>Total Amount</strong></td>
                        <td style="text-align: right; font-size: 13px;">${invoice.subTotal}</td>
                    </tr>

                 <#assign iGstValue = (invoice.iGst?has_content && invoice.iGst?matches("^[0-9.]+$"))?then(invoice.iGst?number, 0) />
                 <#assign cGstValue = (invoice.cGst?has_content && invoice.cGst?matches("^[0-9.]+$"))?then(invoice.cGst?number, 0) />
                 <#assign sGstValue = (invoice.sGst?has_content && invoice.sGst?matches("^[0-9.]+$"))?then(invoice.sGst?number, 0) />

                 <#if iGstValue gt 0>
                     <tr>
                         <td colspan="${columnCount-1}" style="text-align: right; font-size: 13px;"><strong>IGST</strong> (18%)</td>
                         <td>${iGstValue}</td>
                     </tr>
                 <#elseif cGstValue gt 0 && sGstValue gt 0>
                     <tr>
                         <td colspan="${columnCount-1}" style="text-align: right; font-size: 13px;"><strong>CGST</strong> (9%)</td>
                         <td>${cGstValue}</td>
                     </tr>
                     <tr>
                         <td colspan="${columnCount-1}" style="text-align: right; font-size: 13px;"><strong>SGST</strong> (9%)</td>
                         <td>${sGstValue}</td>
                     </tr>
                 </#if>
               <#assign iGstValue = (iGst??)?then(iGst?number, 0) />
               <#assign cGstValue = (cGst??)?then(cGst?number, 0) />
               <#assign sGstValue = (sGst??)?then(sGst?number, 0) />

               <#if iGstValue gt 0>
                   <tr>
                       <td colspan="${columnCount-1}" style="text-align: right; font-size: 13px;"><strong>IGST</strong> (18%)</td>
                       <td>${iGstValue}</td>
                   </tr>
               <#elseif cGstValue gt 0 && sGstValue gt 0>
                   <tr>
                       <td colspan="${columnCount-1}" style="text-align: right; font-size: 13px;"><strong>CGST</strong> (9%)</td>
                       <td>${cGstValue}</td>
                   </tr>
                   <tr>
                       <td colspan="${columnCount-1}" style="text-align: right; font-size: 13px;"><strong>SGST</strong> (9%)</td>
                       <td>${sGstValue}</td>
                   </tr>
               <#else>
                   <tr>
                       <td colspan="${columnCount-1}" style="text-align: right; font-size: 13px;"><strong>CGST</strong> (9%)</td>
                       <td>${cGstValue}</td>
                   </tr>
                   <tr>
                       <td colspan="${columnCount-1}" style="text-align: right; font-size: 13px;"><strong>SGST</strong> (9%)</td>
                       <td>${sGstValue}</td>
                   </tr>
               </#if>

                    <tr style="background-color:#f5f5f5;">
                        <th class="text-right" colspan="${columnCount-1}" style="font-size: 13px;"><b>Grand Total</b></th>
                        <th class="text-right" style="font-size: 13px;"><b>${invoice.grandTotal}</b></th>
                    </tr>
                    <tr>
                        <th colspan="${columnCount}" class="text-center" style="font-size: 13px;">Amount In Words : <b>${invoice.grandTotalInWords}</b></th>
                    </tr>
                    <tr>
                        <th colspan="${columnCount}" class="text-center" style="font-size: 13px;">The Payment should be made
                            favouring <b>${invoice.company.companyName}</b> or Direct deposit information given above.</th>
                    </tr>
                </tbody>
            </table>
        </div>
        <div style="position: relative; bottom: -20px; left: 10px; text-align: left; font-size: 15px;">
            <!-- Bank Details -->
            <div style="width: 50%;">
                <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Bank Details</h3>

                <#if invoice.bank??>
                    <div style="display: flex; justify-content: space-between; max-width: 400px;">
                        <strong style="color: #333;">Bank Name :</strong>
                        <span style="color: #555;">${invoice.bank.bankName!''}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; max-width: 400px;">
                        <strong style="color: #333;">Account Number :</strong>
                        <span style="color: #555;">${invoice.bank.accountNumber!''}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; max-width: 400px;">
                        <strong style="color: #333;">Account Type :</strong>
                        <span style="color: #555;">${invoice.bank.accountType!''}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; max-width: 400px;">
                        <strong style="color: #333;">IFSC Code :</strong>
                        <span style="color: #555;">${invoice.bank.ifscCode!''}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; max-width: 400px;">
                        <strong style="color: #333;">Bank Address :</strong>
                        <span style="color: #555;">${invoice.bank.address!''}</span>
                    </div>
                <#else>
                    <div style="font-size: 13px; color: gray;">No bank details available.</div>
                </#if>
            </div>
        </div>
        <!-- Authorized Signature and Seal -->
        <div style="position: fixed; bottom: 180px; right: 0; text-align: center;">
            <div class="footer-content" style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
                <h6 style="margin: 2px 0; font-weight: bold;">${invoice.company.companyName}</h6>
                <#if invoice.company.stampImage?? && invoice.company.stampImage?has_content>
                    <img style="width: 100px; height: 100px; margin: 3px 0;" src="${invoice.company.stampImage}" alt="Seal" />
                </#if>
                <h6 style="margin: 2px 0; font-weight: bold;">Authorized Signature:</h6>
            </div>
        </div>
        <div style="position: fixed; bottom: 0px; width: 100%; text-align: center;">
            <b style="display: block; margin-bottom: 2px;">CIN : ${invoice.company.cinNo!''}</b>
            <div style="border-top: 1px solid #ccc; padding-top: 3px;">
                <h6 style="margin: 2px 0; word-wrap: break-word; word-break: break-word; white-space: normal;">
                    <b>${invoice.company.companyName}</b>
                </h6>
                <h6 style="margin: 1px 0; word-wrap: break-word; word-break: break-word; white-space: normal; text-align: center;">
                    <b>${invoice.company.companyAddress},${invoice.company.mobileNo},${invoice.company.emailId}</b><br/>
                </h6>
            </div>
        </div>

</div>
</body>
</html>