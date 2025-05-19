<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Relieving Letter</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            position: relative;
            line-height: 1.6;
            color: #333;
        }

        .container {
            position: relative;
            padding: 20px;
            background-color: rgba(255, 255, 255, 0.8);
            z-index: 2;
        }

        .title {
            text-align: center;
            margin-top: 2rem;
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

        .footer {
            margin-top: 3rem;
        }

        .footer h5 {
            margin: 0;
        }
    </style>
</head>

<body>

    <!-- Company Logo -->
        <div class="logo">
                 <#if company[0].imageFile?has_content>
                 <img style="height: 70px; width: 160px;" src="${company[0].imageFile}" alt="Company Logo" />
                 </#if>
             </div>
    <!-- Letter Content -->
    <div class="container">
        <p><strong>Date: ${relieving.relievingDate}</strong></p>
        <h4 class="title">Relieving Letter</h4>

        <p>To,</p>
        <p><strong>Employee Name: ${employee.firstName} ${employee.lastName}</strong></p>
        <p><strong>Employee ID: ${employee.employeeId}</strong></p>

         <!-- Watermark Background Image -->
         <div class="watermark">
                 <img src="${blurredImage}" alt="Blurred Company Logo" />
          </div>

        <p>
            I am writing to acknowledge the resignation letter you submitted, dated <strong>${relieving.resignationDate}</strong>,
            in which you specified that <strong>${relieving.relievingDate}</strong> would be your last working day with
            <strong>${company[0].companyName}</strong>.
            I want to inform you that your resignation has been accepted, and you will be relieved from your position as
            <strong>${employee.designationName}</strong>
            with <strong>${company[0].companyName}</strong> on <strong>${relieving.noticePeriod}</strong>.
        </p>

        <p>We kindly request you to return your company ID and any other company-owned items that you have been using
            during your tenure with our firm.</p>

        <p>Your final settlement will be processed within the next 45 days.</p>

        <p>We deeply appreciate your valuable contributions to the company and wish you all the best in your future
            endeavors.</p>

        <div class="footer">
            <p>Best Regards,</p>
            <p>Authorized Signature,</p>
            <h5>${company[0].companyName}</h5>
            <p>${company[0].address}</p>
        </div>
    </div>

</body>

</html>