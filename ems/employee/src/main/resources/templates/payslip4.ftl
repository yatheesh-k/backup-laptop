<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pay Slip Template</title>
<style>
    .logo {
        width: 250px;
        height: 90px;
        margin-top: 10px;
        margin-bottom: 10px;
    }

   .employee-table table,.employee-table th,
   .employee-table td {
        border: 1px solid black;
        border-collapse: collapse;
        padding:4px;
    }
    .salary-table, .salary-table th, .salary-table td {
            border: 1px solid black;
            border-collapse: collapse;
        }
     table
     {
     width : 100%;
     border-collapse: collapse;
     }
    th {
        background-color: #D3D3D3;
    }
    .center {
    text-align: center;
    }
    .salary-details {
      margin-top: 20px;
    }
    .text {
     margin: 20px 0;
     }
     .address {
     text-align: center;
     font-size: 12px;
    }
    .allowance-fields, .allowance-values {
         margin-bottom:40px;
         border: none; /* No border for allowance tables */
     }

     .allowance-fields td, .allowance-values td {
         padding: 4px;
          border: none;
     }
     .deduction-fields, .deduction-values {
              border: none; /* No border for allowance tables */
     }

     .deduction-fields td, .deduction-values td {
      padding: 4px;
      border: none;
     }

</style>

</head>
<body>
    <div>
        <img class="logo" src="${company.imageFile}" alt="Company Logo" />
    </div>
    <div class="employee-details">
        <table class = "employee-table">
            <tr>
                <th colspan="4" class= "center">${company.companyName}</th>
            </tr>
            <tr>
                <th colspan="4" class= "center">Payslip for ${payslipEntity.month}-${payslipEntity.year}</th>
            </tr>
            <tr>
                <th>EmployeeId</th>
                <td>${employee.employeeId}</td>
                <th>Name</th>
                <td>${employee.firstName} ${employee.lastName}</td>
            </tr>
            <tr>
                <th>Department</th>
                <td>${employee.departmentName}</td>
                <th>PAN</th>
                <td>${employee.panNo}</td>
            </tr>
            <tr>
                <th>Designation</th>
                <td>${employee.designationName}</td>
                <th>UAN</th>
                <td>${employee.uanNo}</td>
            </tr>
            <tr>
                <th>Bank ACC No</th>
                <td>${employee.accountNo}</td>
                <th>IFSC</th>
                <td>${employee.ifscCode}</td>
            </tr>
            <tr>
                <th>Bank Name</th>
                <td>${employee.bankName}</td>
                <th>Location</th>
                       <td>
                         <#if employee.location??>
                           <#assign parts = employee.location?trim?split(",")>
                           <#if (parts?size >= 2)>
                             <#assign state = parts[parts?size - 1]?trim>
                             <#assign city = parts[parts?size - 2]?trim>
                             ${city}, ${state}
                           <#else>
                             ${employee.location} <!-- If there are fewer than 2 parts, show the entire location -->
                           </#if>
                         </#if>
                       </td>
            </tr>
            <tr>
                <th>Total Days</th>
                <td>${payslipEntity.attendance.totalWorkingDays}</td>
                <th>Worked Days</th>
                <td>${payslipEntity.attendance.noOfWorkingDays}</td>
            </tr>
            <tr>
                <th>LOP Days</th>
                <td>
                    <#assign totalWorkingDays=payslipEntity.attendance.totalWorkingDays?number>
                        <#assign noOfWorkingDays=payslipEntity.attendance.noOfWorkingDays?number>
                            <#if (totalWorkingDays - noOfWorkingDays) < 0>
                                N/A
                                <#else>
                                    ${totalWorkingDays - noOfWorkingDays}
                            </#if>
                </td>
                <th>Date of Birth</th>
                <td>${employee.dateOfBirth}</td>
            </tr>
        </table>
    </div>
     <div class="salary-details">
                <table class = "salary-table">
                    <tr>
                        <th style="width:30%;">Earnings (A)</th>
                        <th>Amount (A)</th>
                        <th>Deductions (B)</th>
                        <th>Amount (B)</th>
                    </tr>
                   <tr>
                                           <!-- Column for Allowances and Amounts -->
                                           <td>
                                               <table class="allowance-fields">
                                                   <!-- Loop through Allowances -->

                                                   <#list allowanceList as allowance>
                                                       <#list allowance?keys as key>
                                                           <tr>
                                                               <td>${key}</td>
                                                           </tr>
                                                       </#list>
                                                   </#list>
                                                   <tr>
                                                       <td>Total Earnings (A)</td>
                                                   </tr>

                                               </table>
                                           </td>


                                           <td>
                                               <table class="allowance-values">
                                                   <!-- Loop through Allowances to Get Amounts -->

                                                   <#list allowanceList as allowance>
                                                       <#list allowance?keys as key>
                                                        <tr>
                                                            <td>${allowance[key]?number?int?string("0")}</td> <!-- Convert to number, truncate decimal, and remove commas -->
                                                        </tr>


                                                       </#list>
                                                   </#list>
                                                   <tr>
                                                       <td>${payslipEntity.salary.totalEarnings?number?int?string("0")}</td> <!-- Total Earnings Amount -->
                                                   </tr>
                                               </table>
                                           </td>

                                           <!-- Column for Deductions and Amounts -->
                                           <td>
                                               <table class="deduction-fields">
                                                   <!-- Loop through Deductions -->
                                                   <#list deductionList as deduction>
                                                       <#list deduction?keys as key>
                                                           <tr>
                                                               <td>${key}</td>
                                                           </tr>
                                                       </#list>
                                                   </#list>
                                                   <tr>
                                                       <td>LOP</td> <!-- Add LOP -->
                                                   </tr>
                                                   <tr>
                                                       <td>Total Deductions (B)</td> <!-- Add LOP -->
                                                   </tr>
                                                   <tr>
                                                       <th style="border-left: 900px ; border-right: 900px;">Taxes (C)</th> <!-- Add LOP -->
                                                   </tr>
                                                   <tr>
                                                       <td>Income Tax</td> <!-- Add Income Tax -->
                                                   </tr>
                                                   <tr>
                                                       <td>Pf Tax</td> <!-- Add Pf Tax -->
                                                   </tr>
                                                   <tr>
                                                       <td>Total Tax (C)</td> <!-- Add Total Deductions -->
                                                   </tr>

                                               </table>
                                           </td>

                                           <td>
                                               <table class="deduction-values">
                                                   <!-- Loop through Deductions to Get Amounts -->
                                                   <#list deductionList as deduction>
                                                       <#list deduction?keys as key>
                                                           <tr>
                                                               <td>${deduction[key]?number?int?string("0")}</td> <!-- Display deduction amount -->
                                                           </tr>
                                                       </#list>
                                                   </#list>

                                                 <tr>
                                                     <td>${payslipEntity.salary.lop!0?number?int?string("0")}</td>
                                                 </tr>

                                                   <tr>
                                                       <td>${payslipEntity.salary.totalDeductions?number?int?string("0")}</td>
                                                   </tr> <!-- Display LOP amount -->
                                                   <tr>
                                                       <th style="border-left: 900px ; border-right: 900px;">Amount (C)</th>
                                                   </tr> <!-- Display Income Tax amount -->
                                                   <tr>
                                                       <td>${payslipEntity.salary.incomeTax?number?int?string("0")}</td>
                                                   </tr> <!-- Display Income Tax amount -->
                                                   <tr>
                                                       <td>${payslipEntity.salary.pfTax?number?int?string("0")}</td>
                                                   </tr> <!-- Display Income Tax amount -->
                                                   <tr>
                                                       <td>${payslipEntity.salary.totalTax?number?int?string("0")}</td>
                                                   </tr> <!-- Display Total Deductions -->


                                               </table>
                                           </td>
                   </tr>
                   <!-- Net Pay Row -->
                <tr>
                    <th>Net Pay (A-B-C)</th>
                    <td colspan="3"><strong>${payslipEntity.salary.netSalary?number?int?string("0")}</strong></td>
                </tr>
                <tr>
                    <th>Net Salary (In Words)</th>
                    <td colspan="3"><strong>${payslipEntity.inWords}</strong></td>
                </tr>
                </table>


        </div>
           <div class="text">
               <p><em>This is a computer-generated payslip and does not require authentication.</em></p>
           </div>

            <div class="address">
              <hr />
              <p>
              Company Address: ${company.companyAddress}<br />
              <!-- Mobile No: ${company.mobileNo}<br />
              Email ID: ${company.emailId} -->
              </p>
            </div>
</body>
</html>