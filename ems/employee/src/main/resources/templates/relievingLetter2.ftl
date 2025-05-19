<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Relieving Letter</title>
    <style>
        .watermarked {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
         .watermark {
            position: fixed;
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
        .content {
            position: relative;
            z-index: 2;
            padding: 20px;
            background-color: rgba(255, 255, 255, 0.8);
        }
        .header {
            text-align: center;

        }
       .para p {
                      font-size: 15px; /* Adjust the font size as needed */
              }
    </style>
</head>
<body>
    <div class="watermarked">
        <!-- Company Logo -->
        <div class="logo">
                 <#if company[0].imageFile?has_content>
                 <img style="height: 70px; width: 160px;" src="${company[0].imageFile}" alt="Company Logo" />
                 </#if>
             </div>


        <h4 class="header">RELIEVING LETTER</h4>
        <!-- Content -->
        <div class="content">
            <div class="row d-flex align-items-center p-1">
                <div>
                    <p class="mb-2">${relieving.relievingDate}</p>
                    <p style= "font-size: 15px;"><h4>${employee.firstName} ${employee.lastName},</h4></p>
                    <h5>${employee.employeeId}.</h5>
                </div>
            </div>
             <div class="watermark">
                                    <img src="${blurredImage}" alt="Blurred Company Logo" />
                         </div>
            <p>

                This is in reference to your resignation dated <strong>${relieving.resignationDate}</strong>, where you requested to be relieved from your services on <strong>${employee.dateOfHiring}</strong>. We wish to inform you that your resignation has been accepted, and you shall be relieved from your duties as <strong>${employee.designationName}</strong>, post serving notice period, with effect from <strong>${relieving.relievingDate}</strong>.
            </p>
            <p>We kindly request you to return your company ID and any other company-owned items that you have been using during your tenure with our firm.</p>
            <div class="para">
                <p>Sincerely,</p>
                <h4>${company[0].companyName}</h4>
                 <div style="margin-top: 140px;">Authorized Signature</div>
                <p>${company[0].companyAddress}</p>

            </div>
        </div>
    </div>
</body>
</html>
