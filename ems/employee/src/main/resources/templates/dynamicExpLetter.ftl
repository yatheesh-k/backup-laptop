<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
        .header {
            text-align: center;
            margin-top: 20px;
        }
         .logo {
                   height: 200px;
                   padding-bottom: 30px;
                   text-align: left;
               }

               .logo img {
                   width: 250px;
                   height: 150px;
                   text-align: left;
               }
        .date {
            margin: 30px 0px 0px 20px;
        }
        .title {
            margin-top: 30px;
            text-align: center;
        }
    </style>
</head>
<body>
   <div class="logo">
        <img src="${image}" alt="Company Logo" />
    </div>
    <div class="header"><b>${title}</b></div>
    <div class="date">Date: <b>${date}</b></div>
    <div class="title"><b>${heading}</b></div>
    <div class="content">

            <#list content as lines>
             <p> ${lines}</p>
            </#list>

        <div>For company</div>
    </div>
</body>
</html>
