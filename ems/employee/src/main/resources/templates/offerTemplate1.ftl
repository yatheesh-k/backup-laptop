<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Offer Letter</title>
    <style>
     @page {
         size: A4;
         margin: 8mm;
        }
        .employee-details {
            text-align: left;
            font-size: 20px;
            margin-left: 20px;
        }

        .employee-details h6 {
            margin: 5px 0;
            font-size: 17px;
            font-family: 'Times New Roman', Times, serif
        }

        .logo {
            text-align: right;
            flex-basis: 50%;
            margin-top: -100px;
            /* Use negative margin to move the logo up */

        }

        .logo img {
            max-width: 60px;
            height: 100px;
            margin-right: 20px;
            margin-bottom: 20px;
        }

        .annexure-text {
            text-align: center;
            /* Center the text */
            font-weight: bold;
            /* Make the text bold */
            text-decoration: underline;
            /* Underline the text */
            font-size: 28px;
            margin-top: -20px;
        }

        .confidential-text {
            text-align: center;
            font-weight: bold;
            /* Make the text bold */
            text-decoration: underline;
            margin-top: -10px;
            font-size: 28px;
        }

        .subject-offer {
            margin-top: -20px;
            /* Adjust the value as necessary */
        }

        .subject-offer h6 {
            margin-bottom: 20px;
            font-size: medium;
            font-weight: lighter;
            margin-left: 20px;
        }

        .company-about {
            margin-top: -20px;
        }

        .company-about h6 {
            margin-bottom: 20px;
            font-size: medium;
            font-weight: lighter;
            margin-left: 20px;
        }

        .company-about p {
            margin-bottom: 20px;
            font-size: medium;
            font-weight: lighter;
            margin-left: 20px;
        }

        .with-arrow::before {
            content: ">>";
            font-weight: bold;
            /* Unicode for right arrow */
            margin-right: 8px;
            /* Space between the arrow and the text */
            font-size: 18px;
            /* Adjust the size of the arrow */
            color: black;
            /* Change the color if necessary */
        }

        .with-dot::before {
            content: "\2022";
            /* Unicode for bullet/dot symbol */
            font-weight: bold;
            /* Make the dot bold */
            margin-right: 8px;
            /* Space between the dot and the text */
        }

        .top-navbar {
            margin-left: 45px;
        }

        .date-info {
            margin-left: 20px;
            margin-right: 20px;
            overflow: hidden;
            /* Clear floats */
        }

        .date-info h6 {
            font-size: 17px;
            margin: 0;
        }

        .date {
            float: left;
            /* Float Date to the left */
        }

        .ref-no {
            float: right;
            /* Float Ref No to the right */
            padding-bottom: 40px;
        }

        .salary-table table {
            border-collapse: collapse;
            width: 100%;
        }

        .salary-table th,
        .salary-table td {
            border: 1px solid black;
            /* Adds the table borders */
            padding: 3px;
            /* Adds space inside the table cells */
            text-align: left;
            /* Aligns text to the left */
        }

        .no-bullets {
            list-style-type: none;
            /* Removes the bullets */
            padding-left: 0;
        }

        /* Make specific items bold */
        .no-bullets>li {
            font-weight: bold;
            /* Makes list items bold */
            margin-left: 15px;

        }

        /* Add bullets to nested lists */
        .no-bullets ul {
            list-style-type: disc;
            /* Adds bullets to sub-lists */
            margin-left: 20px;
        }

        .employee-table table {
            width: 100%;
            border-collapse: collapse;
        }

        .employee-table th,
        td {
            border: 1px solid black;
            padding: 3px;
            text-align: left;
        }

        .employee-table td:nth-child(2) {
            width: 50%;
            /* Change this value to adjust the space */
        }

        .note p {
            margin-left: 20px;
        }

        body {
            position: relative;
        }

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
    </style>
</head>

<body>

    <img src="${blurredImage}" alt="Company Logo" class="watermark" />
    <div class="logo">
            <img src="${company.imageFile}" alt="Company Logo" />
    </div>
    <div class="salary-table" style="page-break-after: always;">

        <h5 class="confidential-text">Private & Confidential</h5>
        <div class="date-info">
            <h6 class="date">Date: ${offerLetter.offerDate}</h6>
            <h6 class="ref-no">Ref No: ${offerLetter.referenceNo}</h6>
        </div>

        <div class="employee-details">
            <h6>To</h6>
            <h6>Name: ${offerLetter.employeeName}</h6>
            <h6>S/o,D/o: ${offerLetter.employeeFatherName}</h6>
            <h6>Address: ${offerLetter.employeeAddress}</h6>
            <h6>Contact No: ${offerLetter.employeeContactNo}</h6>
        </div>
        <div class="subject-offer">
            <h6>Subject: Offer Of Employment</h6>
        </div>
        <div class="company-about">
            <h6>Dear ${offerLetter.employeeName}</h6>
            <p>We welcome you to our pursuit of excellence and we feel proud to have a professional of your stature as a
                member of the ${company.companyName} family and wish you a long, rewarding, and satisfying career with
                us. On behalf of ${company.companyName}., here in after referred to as 'the Company', we are pleased to
                extend an offer for the Designation of '${offerLetter.employeePosition}' in the Department '${offerLetter.department}' of our organization with the
                following
                mentioned details:
            </p>
            <div class="top-navbar">
                <p class="with-arrow">You would join us on or before '${offerLetter.joiningDate}' or else this offer
                    would be null and
                    void.</p>
                <p class="with-arrow">You will be deployed at our office site and your job location would be at
                    '${offerLetter.jobLocation}'.
                </p>
                <p class="with-arrow">Your Salary Package per annum is '${offerLetter.grossCompensation}'</p>
                <p class="with-dot"><b>The proposed compensation details are attached as Annexure '1' , And details of
                        required
                        documents at the time of joining are attached as Annexure '2'.</b></p>
            </div>
            <p>You will also be governed by all other instructions/rules/policies of the company, which are not
                specifically
                mentioned in this letter. For clarification, if any, regarding these instructions/rules/policies please
                get
                in touch with HR Department.</p>
            <p>
                <b>Probation Period:</b> Probation period will be six months. Your service will get
                confirmed/extended/terminated
                depending upon your performance shown in the probation period and feedback received through the
                confirmation
                appraisal process.
            </p>
        </div>
        <h5 style="text-align: center; margin-top: 10px;">
            <#if company.cinNo?has_content>
                CIN: ${company.cinNo}
                <#elseif company.companyRegNo?has_content>
                    Registration No: ${company.companyRegNo}
                    <#else>
                        <!-- Optionally, you can add a default text if both are null -->
                        Company Information Not Available
            </#if>
        </h5>
        <hr style="color: rgb(10, 53, 248);" />
        <div style="text-align: center; font-size: 14px;">
            <p>
                ${company.companyName}<br />
                ${company.companyAddress}<br />
                PH: ${company.mobileNo}, Email: ${company.emailId} | Web: https://${company.shortName}.com
            </p>
        </div>
    </div>
    <div class="logo">
        <img src="${company.imageFile}" alt="Company Logo" />
    </div>
    <div class="salary-table" style="page-break-after: always;">
        <div style="margin-top: -50px;">
            <p>
                <b>Attendance:</b> Attendance cycle will be from 26th to 25th of every month. Any employee joining after
                20th of
                the month, their salary will be processed along with next month payroll. Any employee working as an RPO
                or
                Outdoor duty for continuous period needs to submit their approved attendance/timesheet on 25th of every
                month to their respective HR Team. Delay inreceiving the approved attendance/timesheet will result in
                delay
                in payment of your salary.
            </p>
            <p><b>Statutory benefits:</b> You will be governed as per the respective acts of ESIC, PF, and Bonus,
                Gratuity
                etc as per the rules in
                force from time to time.
            </p>
            <p><b>Background Check:</b> The Company reserves the right to verify the information furnished by you in
                your
                application for employment
                and through other documents. If it is found that you have misinterpreted any information in your
                application
                or have furnished any false information or have concealed / suppressed any relevant material facts, your
                services are liable to terminate any time, without any notice or compensation in lieu thereof. You will
                also
                not be eligible for any relieving or experience letter for your tenure with the Company.
            </p>
            <p>
                <b>Place of Employment and Transfer:</b>
                You acknowledge and agree that you may be assigned or liable to be transferred or deputed from one place
                to
                another
                and / or from one department / business unit to another or any other subsidiary / associate
                establishment /
                or their
                contractors and clients either existing or to be set up in future anywhere in India or abroad purely at
                the
                discretion of the management depending upon the needs and requirement of the Company. On such
                assignment,
                transfer
                or deputation you will be governed by the Rules and Regulations and other working / service conditions
                as
                applicable
                at the place of deployment including to consent to add / or agree to certain other agreements. The
                Company
                will seek
                to give you reasonable notice of extensive travel requirements, and to take into account your personal
                circumstances
                where appropriate.
            </p>
            <p><b>Leave and Holidays:</b>
                Public/festival holidays would be divided into fixed holidays and an optional holiday (floater) for per
                Calendar
                year, Total Number of holidays may vary as per work location and / or operation.
                You would be eligible for the annual leaves of 21 days (on pro rata basis) i.e. you would be eligible
                for
                the
                leaves of 1.75 days per month for every calendar (January to December) year. However, you can utilize
                the
                same
                only after completion of probation period with ${company.companyName}. These leaves of six months will
                get
                credited
                to your
                leave
                balance account.
            </p>
            <p>
                <b>Un-availed Leave cannot be encashed at the end of your service.</b> Leaves can be accumulated till
                the
                end of
                calendar year only.
            </p>
            <p><b>Change in Contact details:</b>
                Any change of residential / communication address or change of primary contact details like email ID,
                contact
                number should be intimated to the HR department officially within 3 days from the date of such change.
                Your
                communication details as indicated shall be the correct address for sending all communication to you
                unless
                otherwise intimated in writing by you. Communication addressed to you at the above address shall deem to
                have
                been duly served.
            </p>
        </div>
        <h5 style="text-align: center; margin-top: 80px;">
            <#if company.cinNo?has_content>
                CIN: ${company.cinNo}
                <#elseif company.companyRegNo?has_content>
                    Registration No: ${company.companyRegNo}
                    <#else>
                        <!-- Optionally, you can add a default text if both are null -->
                        Company Information Not Available
            </#if>
        </h5>
        <hr style="color: rgb(10, 53, 248);" />
        <div style="text-align: center; font-size: 14px;">
            <p>
                ${company.companyName}<br />
                ${company.companyAddress}<br />
                PH: ${company.mobileNo}, Email: ${company.emailId} | Web: https://${company.shortName}.com
            </p>
        </div>
    </div>
    <div class="logo">
        <img src="${company.imageFile}" alt="Company Logo" />
    </div>
    <div class="salary-table" style="page-break-after: always;">
        <div style="margin-top: -27px;">
            <p><b>Cessation of Services and Notice Period:</b>
                If you wish to leave the services of the Company you may do so under the following conditions:
                You need to share formal resignation email during working hours to ${company.companyName} HR Team
                after formal discussion with
                your reporting manager. Resignation sent on weekly / public holidays, after working hours will be
                considered
                with effect from next business day. Resignation will not be considered if you have tendered the same
                while
                being
                on leave. You need to serve 30 days' notice period from the date of resignation based on designation.
            </p>
            <p>
                <b>Notice Period without Cause:</b>
                In the event that the employment is ceased without cause, you will be provided 30 days' notice prior to
                such
                cessation or paid severance pay in lieu of thereof equivalent to the consolidated compensation package
                for
                period of 60 days calculated on the basis of last gross salary.
                • A letter of appointment shall be issued to you within 15 days of joining, subjecting the completion of
                all
                joining formalities and submission of all documents required.
            </p>
            <p>You are requested to keep the compensation information highly confidential.
                We look forward to your joining ${company.companyName} IT soon.
            </p>
            <p>Would appreciate you acknowledging the receipt of this offer and kindly <b>send us your acceptance of
                    this
                    offer
                    by a written mail and signed copy within the next 24 hours.</b>
            </p>
            <p>Please do not hesitate to contact us in case you have any queries.</p>
            <h5 style="text-align: center; margin-top: 420px;">
                <#if company.cinNo?has_content>
                    CIN: ${company.cinNo}
                    <#elseif company.companyRegNo?has_content>
                        Registration No: ${company.companyRegNo}
                        <#else>
                            <!-- Optionally, you can add a default text if both are null -->
                            Company Information Not Available
                </#if>
            </h5>
            <hr style="color: rgb(10, 53, 248);" />
            <div style="text-align: center; font-size: 14px;">
                <p>
                    ${company.companyName}<br />
                    ${company.companyAddress}<br />
                    PH: ${company.mobileNo}, Email: ${company.emailId} | Web: https://${company.shortName}.com
                </p>
            </div>
        </div>
    </div>
    <div class="logo">
        <img src="${company.imageFile}" alt="Company Logo" />
    </div>
    <div class="salary-table" style="page-break-after: always;">
        <h5 class="annexure-text">Annexure -1 </h5>
        <p style="text-align: left; font-size: 15px; ">Fixed Salary breakup</p>
        <table>
            <tr>
                <th>Particulars</th>
                <th>Per Month (INR)</th>
                <th>Per Annum (INR)</th>
            </tr>
            <#list salary?keys as key>
                <tr>
                    <td>${key}</td>
                    <td>${salary[key].month}</td>
                    <td>${salary[key].annually}</td>
                </tr>
            </#list>
        </table>
        <p>Net Salary (Pretaxation) may vary due to change in applicable statutory deductions such as
            P. Tax, PF, ESIC, LWF etc.</p>
        <p>*Income Tax, Professional Tax and other applicable taxes shall be deducted from the
            salary on a monthly basis as per Government Policy.</p>
        <p>*Income Tax deduction is subjected to timely submission of the investment details.</p>
        <p>*Pan Card submission is mandatory for the disbursement of the salary.</p>

            <h5 style="text-align: center; margin-top: 100px;">
                <#if company.cinNo?has_content>
                    CIN: ${company.cinNo}
                    <#elseif company.companyRegNo?has_content>
                        Registration No: ${company.companyRegNo}
                        <#else>
                            <!-- Optionally, you can add a default text if both are null -->
                            Company Information Not Available
                </#if>
            </h5>
            <hr style="color: rgb(10, 53, 248);" />
            <div style="text-align: center; font-size: 14px;">
                <p>
                    ${company.companyName}<br />
                    ${company.companyAddress}<br />
                    PH: ${company.mobileNo}, Email: ${company.emailId} | Web: https://${company.shortName}.com
                </p>
            </div>
    </div>

    <div class="logo">
        <img src="${company.imageFile}" alt="Company Logo" />
    </div>
    <div class="salary-table" style="page-break-after: always;">

        <div>
            <h5 class="annexure-text">Annexure -2 </h5>
            <h4 style="font-weight: normal;">List of Joining Documents (Original Copies of all certificates are required
                for
                verification)</h4>

            <ul class="no-bullets">
                <li>Educational Certificates</li>
                <ul>
                    <li>10" & 12" Certificate</li>
                    <li>Diploma / Graduation Level / Post Graduation Certifications</li>
                    <li>Any Other Certification / Diploma</li>
                </ul>
                <li>Work Experience Related Details</li>
                <ul>
                    <li>Accepted designation letter of the last organization</li>
                    <li>Relieving letter from previous employer</li>
                    <li>Experience / Appointment letter of the last organization</li>
                </ul>
                <li>Photographs Required</li>
                <ul>
                    <li>3 Passport Size Photograph</li>
                    <li>2 Postcard Size Photograph (Need to produce if ESI is Applicable)</li>
                </ul>
                <li>Address Proof (Any one of the following can be taken as an address proof)</li>
                <ul>
                    <li>Ration Card / Voter ID Card</li>
                    <li>AADHAR Card</li>
                </ul>
            </ul>
        </div>
        <div class="employee-table">
            <table>

                <tr>
                    <th colspan="2"> Fill the following information and Submit on your Date of Joining along with your
                        other
                        documents:</th>
                </tr>
                <tr>
                    <td>Emergency Contact No.</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Blood Group (Self)</td>
                    <td></td>
                </tr>
                <tr>
                    <td>PAN Card No (Mandatory)</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Marital Status (Single / Married)</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Husband's / Wife's Full Name</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Husband's / Wife's Date of Birth, Age</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Husband's / Wife's Blood Group</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Father's Full Name</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Father's Date of Birth, Age</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Mother's Full Name</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Mother's Date of Birth, Age</td>
                    <td></td>
                </tr>
            </table>
        </div>
        <h5 style="text-align: center; margin-top: 80px;">
            <#if company.cinNo?has_content>
                CIN: ${company.cinNo}
                <#elseif company.companyRegNo?has_content>
                    Registration No: ${company.companyRegNo}
                    <#else>
                        <!-- Optionally, you can add a default text if both are null -->
                        Company Information Not Available
            </#if>
        </h5>
        <hr style="color: rgb(10, 53, 248);" />
        <div style="text-align: center; font-size: 14px;">
            <p>
                ${company.companyName}<br />
                ${company.companyAddress}<br />
                PH: ${company.mobileNo}, Email: ${company.emailId} | Web: https://${company.shortName}.com
            </p>
        </div>
    </div>
    <!-- Company Logo Section -->
   <div class="logo">
           <img src="${company.imageFile}" alt="Company Logo" />
       </div>
       <h5 style="text-align: left; font-size: medium; ">Please Note: </h5>
       <div class="note">
           <p>
               Completion and submission of all the above-mentioned documents/forms, which would be given to you along with
               the joining kit, is mandatory.
           </p>
           <p>
               Noncompliance with this would entail your joining kit being declared as incomplete for which you as
               the employee would be solely responsible. Consequently, this would delay/impact on joining process.
           </p>
           <p>
               Your present and permanent addresses/ contact details, as mentioned in your application form, are put on
               company's record. You would be expected to inform the company about any change in your address and telephone
               numbers.
           </p>
     </div>
       <h5 style="text-align: center; margin-top: 540px;">
           <#if company.cinNo?has_content>
               CIN: ${company.cinNo}
               <#elseif company.companyRegNo?has_content>
                   Registration No: ${company.companyRegNo}
                   <#else>
                       <!-- Optionally, you can add a default text if both are null -->
                       Company Information Not Available
           </#if>
       </h5>
       <hr style="color: rgb(10, 53, 248);" />
       <div style="text-align: center; font-size: 14px;">
           <p>
               ${company.companyName}<br />
               ${company.companyAddress}<br />
               PH: ${company.mobileNo}, Email: ${company.emailId} | Web: https://${company.shortName}.com
           </p>
       </div>
</body>

</html>