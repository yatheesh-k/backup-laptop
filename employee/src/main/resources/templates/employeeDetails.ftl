<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Employee Details</title>
    <style>

      .logo {
            text-align: right;
      }

      .logo img {
            max-width: 60px;
            height: 100px;
            margin-right: 5px;
            margin-bottom: 20px;
            margin-top: -10px;
      }

      /* Table Styling */
      table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-family: Arial, sans-serif;
      }

      th, td {
            padding: 3px;
            text-align: left;
            border: 1px solid #ddd;
            word-wrap: break-word; /* Ensure content breaks properly */
            font-size: 10px;
            white-space: nowrap; /* Prevent text from wrapping */
      }

      th {
            background-color: #f2f2f2;
            font-weight: bold;
      }

      /* Watermark styling */
      .watermark {
            position: fixed;
            top: 40%;
            left: 20%;
            transform: translate(-50%, -50%) rotate(30deg);
            z-index: -1;
            width: 400px;
            height: auto;
            text-align: center;
      }

      .watermark img {
            width: 100%;
            height: auto;
            opacity: 0.05;
      }

      /* Improve table column width */
      th, td {
            overflow: hidden;
            text-overflow: ellipsis;
      }

    </style>
</head>
<body>
    <img src="${blurredImage}" alt="Company Logo" class="watermark" />

    <div class="logo">
        <img src="${company.imageFile}" alt="Company Logo" />
    </div>

    <h4>Company Employees</h4>

   <table>
           <thead>
               <tr>
                   <#list selectedFields as field>
                       <th>${field}</th>
                   </#list>
               </tr>
           </thead>
           <tbody>
               <#list data as person>
                   <tr>
                       <#list selectedFields as field>
                           <td>
                               <#if field == "Name">
                                   ${person.employeeEntity.firstName!} ${person.employeeEntity.lastName!}
                               <#elseif field == "EmployeeId">
                                   ${person.employeeEntity.employeeId!}
                               <#elseif field == "Pan No">
                                   ${person.employeeEntity.panNo!}
                               <#elseif field == "Aadhaar No">
                                   ${person.employeeEntity.aadhaarId!}
                               <#elseif field == "Bank Account No">
                                   ${person.employeeEntity.accountNo!}
                               <#elseif field == "Contact No">
                                   ${person.employeeEntity.mobileNo!}
                               <#elseif field == "Date Of Birth">
                                   ${person.employeeEntity.dateOfBirth!}
                               <#elseif field == "UAN No">
                                   ${person.employeeEntity.uanNo!}
                               <#elseif field == "Department And Designation">
                                   ${person.employeeEntity.departmentName!}, ${person.employeeEntity.designationName!}
                               <#elseif field == "Alternate No">
                                   ${person.employeeEntity.alternateNo!}
                               <#elseif field == "Email Id">
                                   ${person.employeeEntity.emailId!}
                               <#elseif field == "Date Of Hiring">
                                   ${person.employeeEntity.dateOfHiring!}
                               <#elseif field == "Marital Status">
                                   ${person.employeeEntity.maritalStatus!}
                               <#elseif field == "PF No">
                                   ${person.employeeEntity.pfNo!}
                               <#elseif field == "IFSC Code">
                                   ${person.employeeEntity.ifscCode!}
                               <#elseif field == "Bank Name">
                                   ${person.employeeEntity.bankName!}
                               <#elseif field == "Bank Branch">
                                   ${person.employeeEntity.bankBranch!}
                               <#elseif field == "Current Gross">
                                   ${person.employeeEntity.currentGross!}
                               <#elseif field == "Location">
                                   ${person.employeeEntity.location!}
                               <#elseif field == "Temporary Address">
                                   ${person.employeeEntity.tempAddress!}
                               <#elseif field == "Permanent Address">
                                   ${person.employeeEntity.permanentAddress!}
                               <#elseif field == "Fixed Amount">
                                   ${person.resPayload.fixedAmount!}
                                 <#elseif field == "Variable Amount">
                                      ${person.resPayload.variableAmount!}
                                 <#elseif field == "Gross Amount">
                                        ${person.resPayload.grossAmount!}
                                 <#elseif field == "Total Earnings">
                                      ${person.resPayload.totalEarnings!}
                                 <#elseif field == "Net Salary">
                                        ${person.resPayload.netSalary!}
                                 <#elseif field == "Loss Of Pay">
                                        ${person.resPayload.lop!}
                                 <#elseif field == "Total Deductions">
                                        ${person.resPayload.totalDeductions!}
                                 <#elseif field == "Pf Tax">
                                        ${person.resPayload.pfTax!}
                                    <#elseif field == "Income Tax">
                                        ${person.resPayload.incomeTax!}
                                    <#elseif field == "Total Tax">
                                        ${person.resPayload.totalTax!}
                               </#if>
                           </td>
                       </#list>
                   </tr>
               </#list>
           </tbody>
   </table>

</body>
</html>