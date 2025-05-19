<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PaySlip Template 1</title>
    <style>
        @page {
            size: A4;
            margin: 6mm;
        }

        body {
            border: 1px solid black;
        }

        .logo {
            background-color: #9fc7df;
            height: 200px;
            padding-bottom: 30px;
            width: 350px
        }

        .logo img {
            width: 250px;
            height: 150px;
            margin-left: 30px;
            justify-content: center;
        }

        .company {
            text-align: center;
            font-size: 15px;
            margin-top: 0px;
        }

        .title {
            text-align: center;
            color: #161718;
            margin: 0px;
        }

        .space {
            margin-left: 50px;
        }

        .space-right {
            margin-right: 30px;
        }

        .employee-table th {
            margin-left: 40px;
        }

        .heading {
            background-color: rgb(204, 202, 202);
            width: 100%;
            height: 20px;
        }

        .horizontal {
            width: 100%;
            height: 20px;
            border-top: 1px solid black;
        }

        .emp-netpay {
            background-color: #9fc7df;
            width: 100%;
            display: flex;
            justify-content: space-between;
            /* Flexbox to push content left & right */
            align-items: center;
            height: 40px;
            border-bottom: 1px solid #161718;
        }

        .employee {
            text-align: left;
            font-size: 24px;
            margin: 0;
        }

        .net {
            text-align: right;
            font-size: 24px;
        }

        .employee-table table,
        .employee-table th,
        .employee-table td {
            border: 0px;
            padding: 4px;
        }

        .salary-table,
        .salary-table th,
        .salary-table td {
            border: 1px solid black;
            border-collapse: collapse;
        }
       .allowance-fields,
       .allowance-values {
          margin-bottom: 50px;
       }

        .allowance-fields,
        .allowance-values {
            border: none;
            /* No border for allowance tables */
        }

        .allowance-fields td,
        .allowance-values td {
            padding: 4px;
            border: none;
        }

        .deduction-fields,
        .deduction-values {
            border: none;
        }

        .deduction-fields td,
        .deduction-values td {
            padding: 4px;
            border: none;
        }
         table {
          width: 100%;
          border-collapse: collapse;
          }
         .emp-heading {
             background-color: #9fc7df;
             padding-top: 500px;
         }
        .text {
           margin: 20px 0;
        }
        .date-info{
        text-align: center;
        margin-left: 200px;
        }

    </style>
</head>

<body>
<tr>
<td>
    <div class="logo">
        <img src="${company.imageFile}" alt="Company Logo" />
        <p class="company">
            ${company.companyAddress}<br />
             <!-- ${company.mobileNo}<br />
                  ${company.emailId} -->
        </p>
    </div>
    </td>
    <td>

    </td>
    </tr>
     <h3 ><div style=" position: relative; left: 450px; bottom:40px; margin-bottom:-50px;">SALARY SLIP</div></h3>
    <div class="heading"></div>
    <div class="emp-netpay">
        <table style="width: 100%;">
            <tr>
                <td style="text-align: left; font-size: 18px; padding-top: 10px; padding-left:10px;"><b>Employee Details</b></td>
                <td style="text-align: right; font-size: 18px;padding-top: 10px; padding-right:10px;">
                    <b>Month-Year: ${payslipEntity.month}-${payslipEntity.year}</b>
                </td>
            </tr>
        </table>
    </div>
    <div>
        <table class="employee-table">
            <tr>
                <th>EmployeeId</th>
                <div class="space-right"></div>
                <td>${employee.employeeId}</td>
                <div class="space"></div>
                <th>Name</th>
                <div class="space-right"></div>
                <td>${employee.firstName} ${employee.lastName}</td>
            </tr>
            <tr>
                <th>Department</th>
                <div class="space-right"></div>
                <td>${employee.departmentName}</td>
                <div class="space"></div>
                <th>PAN</th>
                <div class="space-right"></div>
                <td>${employee.panNo}</td>
            </tr>
            <tr>
                <th>Designation</th>
                <div class="space-right"></div>
                <td>${employee.designationName}</td>
                <div class="space"></div>
                <th>UAN</th>
                <div class="space-right"></div>
                <td>${employee.uanNo}</td>
            </tr>
            <tr>
                <th>Bank ACC No</th>
                <div class="space-right"></div>
                <td>${employee.accountNo}</td>
                <div class="space"></div>
                <th>IFSC</th>
                <div class="space-right"></div>
                <td>${employee.ifscCode}</td>
            </tr>
            <tr>
                <th>Bank Name</th>
                <div class="space-right"></div>
                <td>${employee.bankName}</td>
                <div class="space"></div>
                <th>Location</th>
                <div class="space-right"></div>
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
                <div class="space-right"></div>
                <td>${payslipEntity.attendance.totalWorkingDays}</td>
                <div class="space"></div>
                <th>Worked Days</th>
                <div class="space-right"></div>
                <td>${payslipEntity.attendance.noOfWorkingDays}</td>
            </tr>
            <tr>
                <th>LOP Days</th>
                <div class="space-right"></div>
                <td>
                    <#assign totalWorkingDays=payslipEntity.attendance.totalWorkingDays?number>
                        <#assign noOfWorkingDays=payslipEntity.attendance.noOfWorkingDays?number>
                            <#if (totalWorkingDays - noOfWorkingDays) < 0>
                                N/A
                                <#else>
                                    ${totalWorkingDays - noOfWorkingDays}
                            </#if>
                </td>
                <div class="space"></div>
                <th>Date of Birth</th>
                <div class="space-right"></div>
                <td>${employee.dateOfBirth}</td>
            </tr>
        </table>
    </div>
    <div class="horizontal">

    </div>
    <div class="salary-details">
        <table class="salary-table">
            <tr>
                <th class="emp-heading" style= "padding: 10px;width:30%;">Earnings (A)</th>
                <th class="emp-heading" style= "padding: 10px;">Amount (A)</th>
                <th class="emp-heading" style= "padding: 10px;">Deductions (B)</th>
                <th class="emp-heading" style= "padding: 10px;">Amount (B)</th>
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
                                            <td>${allowance[key]?number?int?string("0")}</td> <!-- Display allowance amount -->
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
                                    <th style="border-left: 900px ; border-right: 900px; background-color: #9fc7df;">Taxes (C)</th> <!-- Add LOP -->
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
                                </tr> <!-- Display LOP amount, default to 0 if null or empty -->
                                <tr>
                                    <td>${payslipEntity.salary.totalDeductions?number?int?string("0")}</td>
                                </tr> <!-- Display LOP amount -->
                                <tr>
                                    <th style="border-left: 900px ; border-right: 900px; background-color: #9fc7df;">Amount (C)</th>
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
                <th style= "padding: 10px; background-color: rgb(204, 202, 202); ">Net Pay (A-B-C)</th>
                <td colspan="3"><strong>${payslipEntity.salary.netSalary?number?int?string("0")}</strong></td>
            </tr>
            <tr>
                <th style= "padding: 10px; background-color: rgb(204, 202, 202);">Net Salary (In Words)</th>
                <td colspan="3"><strong>${payslipEntity.inWords}</strong></td>
            </tr>
        </table>
    </div>

</body>
 <div class="text">
        <p><em>This is computer-generated payslip and does not require authentication</em></p>
     </div>

</html>