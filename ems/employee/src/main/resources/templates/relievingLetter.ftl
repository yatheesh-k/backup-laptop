<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Relieving Letter</title>
    <style>

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
         .logo {
                   text-align: right;
                   background-size: contain;
                   margin-bottom: 100px:
               }

         .header {
                    text-align: center;
                    text-align: top;
                }
       .title {
                  margin-top: 30px;
                  text-align: center;
              }
        .para p {
               font-size: 15px; /* Adjust the font size as needed */
           }
        .date{
        text-align: left;
        }
    </style>
</head>
<body>

    <div class="header">
      <h4>Relieving Letter</h4>
      <h5 class= "date"><strong>${relieving.relievingDate}</strong></h5>
     <div class="logo">
         <#if company[0].imageFile?has_content>
         <img style="height: 70px; width: 160px; margin-top: -200px;" src="${company[0].imageFile}" alt="Company Logo" />
         </#if>
     </div>
     </div>



    <h5 class= "title">TO WHOMSOEVER IT MAY CONCERN</h5>



    <div class="content mt-3">

        <div class="para">
          <div class="watermark">
                        <img src="${blurredImage}" alt="Blurred Company Logo" />
             </div>
            <p><strong>${employee.firstName} ${employee.lastName}</strong></p>
            <p>
                I am writing in response to your resignation letter dated ${relieving.resignationDate}, in which you requested to resign from your position as ${employee.designationName}, serving a notice period of ${relieving.noticePeriod}. Your services with our organization will be concluded on ${relieving.relievingDate}.
            </p>
            <p>We kindly request you to return your company ID and any other company-owned items that you have been using during your tenure with our firm.</p>
            <p>We want to officially confirm the acceptance of your resignation. Effective as of the office closing hours on ${relieving.relievingDate}, you will be relieved from your duties.</p>
            <p>
                We also wish to confirm that your final settlement with the organization has been successfully processed. We genuinely appreciate your contributions to the company and your achievements during your tenure. We extend our best wishes for your future endeavors.
            </p>
        </div>
        <div class="pt-4">
            <p class="mb-5">Yours Sincerely,</p>
            <div style="margin-top: 140px;">Authorized Signature</div>
            <h5>${company[0].companyName}</h5>
            <p>${company[0].companyAddress}</p>
        </div>
    </div>

</body>
</html>
