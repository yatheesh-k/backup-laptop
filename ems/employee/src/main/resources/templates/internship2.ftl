<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Internship Certificate</title>
    <style>
        .logo {
            text-align: left;
        }

        .logo img {
            max-width: 60px;
            height: 100px;
            margin-right: 5px;
            margin-bottom: 20px;
            margin-top: -10px;
        }

        .internship-text {
            text-align: center;
            /* Center the text */
            font-weight: bold;
            /* Make the text bold */
            font-size: 30px;
            margin-top: 70px;
            /* Adjust the font size if needed */
        }

        .date-info h5 {
            text-align: left;
            font-size: 15px;
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
        .details {
            font-size: 19px; /* Set your desired font size */
        }
    </style>
</head>

<body>
    <img src="${blurredImage}" alt="Company Logo" class="watermark" />
    <div class="logo">
        <img src="${company.imageFile}" alt="Company Logo" />
    </div>

    <h5 class="internship-text">Internship Experience Certificate</h5>
    <div class="date-info">
        <h5>Date: ${internship.date}</h5>
    </div>
    <h5 style="text-align:center; font-size: 15px;">TO WHOMSOEVER IT MAY CONCERN</h5>

    <div class = "details">
           <p>We are pleased to inform that <strong>${internship.employeeName}</strong> has successfully completed an
           internship program with our company <strong>${company.companyName}</strong> as a <strong>${internship.designation}</strong>
           in the <strong>${internship.department}</strong> department from <strong>${internship.startDate}</strong>
           to <strong>${internship.endDate}</strong>.</p>
            <p>
               Throughout the internship, <b>${internship.employeeName}</b> demonstrated professionalism and dedication. We believe that
                <b>${internship.employeeName}</b> has gained valuable experience that will aid in future professional endeavors.
            </p>
            <p>
               We wish ${internship.employeeName} the best of luck in all future endeavors and are confident that ${internship.employeeName} will continue to excel in their career path.
            </p>
            <p style="margin-top: 50px;">For <span style="font-weight: bold; text-transform: uppercase;">${company.companyName}</span></p>
            <p style="margin-top: 110px;">Authorized Signature</p>


         <h4>${company.companyName},</h4>
         <p>${company.mobileNo} ,${company.emailId}</p>
         <p>${company.companyAddress}.</p>
         </div>

</body>

</html>