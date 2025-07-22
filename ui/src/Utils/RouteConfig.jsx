import EmsLogin from "../Login/EmsLogin";
import CompanyLogin from "../Login/CompanyLogin";
import CompanyRegistration from "../EMSModule/Company/CompanyRegistration";
import AnonymousCmpRegistration from "../EMSModule/Company/AnonymousCmpRegistration";
import Body from "../LayOut/Body";
import CompanyView from "../EMSModule/Company/CompanyView";
import Department from "../CompanyModule/Department/Department";
import EmployeeView from "../CompanyModule/Employee/EmployeeView";
import ExistsEmpRegistration from "../CompanyModule/ExistingProcess/ExistsEmpRegistration";
import ExistsEmployesView from "../CompanyModule/ExistingProcess/ExistsEmployesView";
import EmployeeSalaryStructure from "../CompanyModule/PayRoll/EmployeeSalaryStructure";
import GeneratePaySlip from "../CompanyModule/PayRoll/GeneratePaySlips";
import ViewPaySlips from "../CompanyModule/PayRoll/ViewPaySlips";
import AddIncrement from "../CompanyModule/PayRoll/Hike/AddIncrement";
import ViewIncrement from "../CompanyModule/PayRoll/Hike/ViewIncrementList";
import ManageAttendance from "../CompanyModule/Attendance/ManageAttendance";
import AttendanceList from "../CompanyModule/Attendance/AttendanceList";
import AttendanceReport from "../CompanyModule/Attendance/AttendanceReport";
import EmployeePayslips from "../EmployeeModule/EmployeePayslips";
import CompanySalaryStructure from "../CompanyModule/Settings/CompanySalaryStructure";
import EmployeeSalaryList from "../CompanyModule/PayRoll/EmployeeSalaryList";
import Profile from "../LayOut/Profile";
import Message from "../LayOut/Message";
import PaySlipDoc from "../Login/PayslipDoc";
import EmployeeSalaryById from "../EmployeeModule/EmployeeSalaryById";
import Reset from "../LayOut/Reset";
import ForgotPassword from "../Login/ForgotPassword";
import EmployeeProfile from "../EmployeeModule/EmployeeProfile";
import EmployeeSalaryUpdate from "../CompanyModule/PayRoll/EmployeeSalaryUpdate";
import CompanySalaryView from "../CompanyModule/Settings/CompanySalaryView";
import ExperienceLetter from "../CompanyModule/Settings/Experience/ExperienceLetter";
import ExperienceForm from "../CompanyModule/Settings/Experience/ExperienceForm";
import ExperienceView from "../CompanyModule/Settings/Experience/ExperienceView";
import RelievingLetter from "../CompanyModule/Settings/Relieving/RelievingLetter";
import Preview from "../CompanyModule/Settings/Relieving/Preview";
import AppraisalTemplate from "../CompanyModule/Settings/Appraisal/AppraisalTemplate";
import InternShipTemplates from "../CompanyModule/Settings/Internship/InternShipTemplates";
import InternShipForm from "../CompanyModule/Settings/Internship/InternShipForm";
import PayslipUpdate1 from "../CompanyModule/PayRoll/PayslipUpdate/PayslipUpdate1";
import PayslipUpdate2 from "../CompanyModule/PayRoll/PayslipUpdate/PayslipUpdate2";
import PayslipUpdate3 from "../CompanyModule/PayRoll/PayslipUpdate/PayslipUpdate3";
import PayslipUpdate4 from "../CompanyModule/PayRoll/PayslipUpdate/PayslipUpdate4";
import PayslipTemplates from "../CompanyModule/Settings/PayslipTemplates";
import PayslipDoc1 from "../CompanyModule/PayRoll/Payslips/PayslipDoc1";
import PayslipDoc3 from "../CompanyModule/PayRoll/Payslips/PayslipDoc3";
import PayslipDoc2 from "../CompanyModule/PayRoll/Payslips/PayslipDoc2";
import PayslipDoc4 from "../CompanyModule/PayRoll/Payslips/PayslipDoc4";
import OfferLetters from "../CompanyModule/Settings/OfferLetter/OfferLetters";
import Template from "../CompanyModule/Settings/OfferLetter/Template";
import OfferLetterForm from "../CompanyModule/Settings/OfferLetter/OfferLetterForm";
import OfferLetterPreview from "../CompanyModule/Settings/OfferLetter/OfferLetterPreview";
import EmployeeSalaryView from "../EmployeeModule/EmployeeSalaryView";
import AccountRegistration from "../InvoiceModule/AccountDetails/AccountRegistration";
import AccountsView from "../InvoiceModule/AccountDetails/AccountsView";
import CustomersRegistration from "../InvoiceModule/Customers/CustomerRegistration";
import CustomersView from "../InvoiceModule/Customers/CustomersView";
import InvoiceRegistration from "../InvoiceModule/Invoice/InvoiceRegistration";
import InvoiceView from "../InvoiceModule/Invoice/InvoiceView";
import InvoicePdf from "../InvoiceModule/Invoice/InvoicePdf";
import ProductView from "../InvoiceModule/Products/ProductsView";
import ProductRegistration from "../InvoiceModule/Products/ProductRegistration";
import CreatePassword from "../Login/CreatePassword";
import EmployeeRegister from "../CompanyModule/Employee/EmployeeRegister";
import EmployeeSalaryStructureView from "../CompanyModule/PayRoll/EmployeeSalaryStructureView";
import InternOfferLetter from "../CompanyModule/Settings/Internship/InternOfferLetter/InternOfferLetter";
import InternOfferPrev from "../CompanyModule/Settings/Internship/InternOfferLetter/InternOfferPrev";
import InternOfferForm from "../CompanyModule/Settings/Internship/InternOfferLetter/InternOfferForm";
import GetCalendar from "../Calender/GetCalendar";
import EventForm from "../Calender/EventForm";
import GetTaxSlab from "../CompanyModule/TDS/GetTaxSlab";
import CompanyTdsView from "../CompanyModule/TDS/CompanyTdsView";
import TotalEmployees from "../EmployeeModule/TotalEmployees";
import EmployeeList from "../EmployeeModule/EmployeeList";
import UpdateUser from "../CompanyModule/UserModue/UpdateUser";
import AddUser from "../CompanyModule/UserModue/AddUser";
import ViewUser from "../CompanyModule/UserModue/ViewUser";
import AddTaxSlab from "../CompanyModule/TDS/AddTaxSlab";
import CandidateRegistration from "../CompanyModule/Candidate/CandidateRegistration";
import CandidatesView from "../CompanyModule/Candidate/CandidatesView";
import CandidateDocumentUpload from "../CompanyModule/Candidate/CandidateDocumentUpload";
import UploadSuccess from "../CompanyModule/Candidate/UploadSuccess";
import CandidateProfile from "../CompanyModule/Candidate/CandidateProfile";
import CandidateDocumentsView from "../CompanyModule/Candidate/CandidateDocumentsView";
import InvoiceTemplate1 from "../CompanyModule/Settings/InvoiceTemplates/InvoiceTemplate1";
import InvoiceTemplate2 from "../CompanyModule/Settings/InvoiceTemplates/InvoiceTemplate2";
import EmployeeDocumentUpload from "../CompanyModule/Employee/EmployeeDocumentUpload";
import EmployeeDocumentView from "../CompanyModule/Employee/EmployeeDocumentView";
import InvoiceTemplates from "../CompanyModule/Settings/InvoiceTemplates/InvoiceTemplates";
import CandidateToEmployee from "../CompanyModule/Candidate/CandidateToEmployee";
import CompanyGSTSubmission from "../AccountantModule/GST/CompanyGSTSubmission";
import EmployeeManager from "../CompanyModule/Employee/EmployeeManager/EmployeeManager";
import EmployeeSummary from "../CompanyModule/Employee/EmployeeManager/EmployeeSummary";
import GSTCustomerRegistration from "../AccountantModule/GST/GSTCustomerRegistration";
import InvoiceAccountsSummary from "../AccountantModule/GST/InvoiceAccountsSummary";
import PasswordManagementSummary from "../CredentialsManagement/PasswordManagementSummary";
import TimelineForm from "../CompanyModule/Settings/TimeLine/TimeLineDates";
import GSTProcessing from "../AccountantModule/GST/GSTProcessing";
import GSTReceiptView from "../AccountantModule/GST/GSTReceiptsView";
import TDSProcessing from "../AccountantModule/Tds/TDSProcessing";
import TDSReceiptsView from "../AccountantModule/Tds/TDSReceiptsView";
import PTProcessing from "../AccountantModule/ProfessionalTax/PTProcessing";
import PTReceiptsView from "../AccountantModule/ProfessionalTax/PTReceiptsView";
import PFProcessing from "../AccountantModule/PF/PFProcessing";
import PFReceiptsView from "../AccountantModule/PF/PFReceiptsView";

const routeConfig = [
{
    path: "/main",
    element: <Body/>,
    allowedRoles: ["all"],
    allowedResourceTypes: ["all"],
    label: "Dashboard",
    icon: "speedometer2",
  },
  {
    label: "Company",
    icon: "building",
    children: [
      {
        path: "/companyRegistration",
        element: <CompanyRegistration />,
        allowedRoles: ["system_admin"],
        allowedResourceTypes: ["ems_admin"],
        label: "Register Company",
      },
      {
        path: "/companyView",
        element: <CompanyView />,
        allowedRoles: ["system_admin"],
        allowedResourceTypes: ["ems_admin"],
        label: "View Companies",
      },
    ],
  },
  // Company Admin-specific

  {
    path: "/companySalaryStructure",
    element: <CompanySalaryStructure />,
    allowedRoles: ["HRM", "Admin"],
    allowedResourceTypes: ["company_admin"],
  },

  {
    path: "/editUser/:id",
    element: <UpdateUser />,
    allowedRoles: ["HRM", "tax_consultant"],
    allowedResourceTypes: ["company_admin"],
  },
  {
    path: "/profile",
    element: <Profile />,
    allowedRoles: ["HRM", "tax_consultant"],
    allowedResourceTypes: ["company_admin"],
  },
  // Employee-specific
 {
  path: "/employeeSalaryView",
  element: <EmployeeSalaryView />,
  allowedRoles: ["employee"],
  allowedResourceTypes: ["employee"],
  label: "My Salary Summary",
  icon: "currency-rupee", // Bootstrap icon suggestion: bi-currency-rupee
},
{
  path: "/employeeProfile",
  element: <EmployeeProfile />,
  allowedRoles: ["employee"],
  allowedResourceTypes: ["employee"],
  label: "My Profile",
  icon: "person-badge", // Bootstrap icon suggestion: bi-person-badge
},
{
  path: "/employeeSalariesView",
  element: <EmployeeSalaryById />,
  allowedRoles: ["employee"],
  allowedResourceTypes: ["employee"],
  label: "Salary Details",
  icon: "file-earmark-text", // Bootstrap icon suggestion: bi-file-earmark-text
},
  // HR-specific
 {
  label: "Candidate",
  icon: "person-vcard", // Bootstrap icon suggestion: bi-person-vcard
  children: [
    {
      path: "/candidateRegistration",
      element: <CandidateRegistration />,
      allowedRoles: ["HRM", "Admin"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Register Candidate",
      icon: "person-plus", // bi-person-plus
    },
    {
      path: "/candidatesView",
      element: <CandidatesView />,
      allowedRoles: ["HRM", "Admin", "candidate"],
      allowedResourceTypes: ["company_admin", "HR", "candidate"],
      label: "View Candidates",
      icon: "people", // bi-people
    }
  ]
},
 {
  path: "/documentUpload",
  element: <CandidateDocumentUpload />,
  allowedRoles: ["candidate"],
  allowedResourceTypes: ["candidate"],
  label: "Document Upload",
  icon: "file-earmark-arrow-up", // Suggested Bootstrap icon
},
  {
    path: "/uploadSuccess",
    element: <UploadSuccess />,
    allowedRoles: ["candidate"],
    allowedResourceTypes: ["candidate"],
  },

  // Company Admin & HR Shared
{
  path: "/department",
  element: <Department />,
  allowedRoles: ["HRM"],
  allowedResourceTypes: ["company_admin", "HR", "Admin"],
  label: "Department",
  icon: "diagram-3", // Bootstrap icon
},
 {
  label: "Employees",
  icon: "people", // Bootstrap Icon (bi-people)
  children: [
    {
      path: "/employeeRegister",
      element: <EmployeeRegister />,
      allowedRoles: ["company_admin", "Admin", "HR"],
      label: "Register Employee",
      icon: "person-plus", // bi-person-plus
    },
    {
      path: "/employeeView",
      element: <EmployeeView />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "View Employees",
      icon: "person-lines-fill", // bi-person-lines-fill
    },
  ],
},
  {
    path: "/candidate-to-employee/:id",
    element: <CandidateToEmployee />,
    allowedRoles: ["HRM"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },

 {
  path: "/offerLetterForm",
  element: <OfferLetterForm />,
  allowedRoles: ["HRM"],
  allowedResourceTypes: ["company_admin", "HR", "Admin"],
  label: "Offer Letter",
  icon: "file-earmark-text", // Bootstrap icon (bi-file-earmark-text)
},
  {
    path: "/offerLetterPreview",
    element: <OfferLetterPreview />,
    allowedRoles: ["HRM"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },

{
  label: "Experience",
  icon: "file-earmark-person", // Bootstrap icon: bi-file-earmark-person
  children: [
    {
      path: "/experienceForm",
      element: <ExperienceForm />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Experience Form",
      icon: "journal-text", // bi-journal-text
    },
    {
      path: "/experienceSummary",
      element: <ExperienceView />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Experience Summary",
      icon: "file-earmark-text", // bi-file-earmark-text
    }
  ]
},
 {
  label: "Relieving",
  icon: "person-vcard", // Bootstrap icon suggestion: bi-person-vcard
  children: [
 {
  path: "/relievingSummary",
  element: <ExistsEmployesView />,
  allowedRoles: ["HRM"],
  allowedResourceTypes: ["company_admin", "HR", "Admin"],
  label: "Relieving Summary",
  icon: "card-list", // Bootstrap icon: bi-card-list
},
{
  path: "/relievingProcess",
  element: <ExistsEmpRegistration />,
  allowedRoles: ["HRM"],
  allowedResourceTypes: ["company_admin", "HR", "Admin"],
  label: "Relieving Process",
  icon: "box-arrow-right", // Bootstrap icon: bi-box-arrow-right
},
  ]
},
  {
    path: "/relivingReview",
    element: <Preview />,
    allowedRoles: ["HRM"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
   {
  label: "Appraisal Mangement",
  icon: "person-vcard", // Bootstrap icon suggestion: bi-person-vcard
  children: [
  {
  path: "/appraisalLetter",
  element: <AddIncrement />,
  allowedRoles: ["HRM"],
  allowedResourceTypes: ["company_admin", "HR", "Admin"],
  label: "Appraisal Letter",
  icon: "graph-up-arrow", // Bootstrap icon: bi-graph-up-arrow
},
{
  path: "/incrementList",
  element: <ViewIncrement />,
  allowedRoles: ["HRM"],
  allowedResourceTypes: ["company_admin", "HR", "Admin"],
  label: "Increment List",
  icon: "graph-up-arrow", // Bootstrap icon: bi-graph-up-arrow
},
  ]
},
 {
  label: "Internship",
  icon: "mortarboard", // Bootstrap icon: bi-mortarboard
  children: [
    {
      path: "/internOfferForm",
      element: <InternOfferForm />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Intern Offer Form",
      icon: "file-earmark-plus", // bi-file-earmark-plus
    },
    {
      path: "/internsLetter",
      element: <InternShipForm />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Internship Letter",
      icon: "journal-richtext", // bi-journal-richtext
    }
  ]
},
  {
    path: "/internPrev",
    element: <InternOfferPrev />,
    allowedRoles: ["HRM"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
 {
  label: "Attendance",
  icon: "calendar-check", // Bootstrap icon: bi-calendar-check
  children: [
    {
      path: "/addAttendance",
      element: <ManageAttendance />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Add Attendance",
      icon: "clipboard-plus", // bi-clipboard-plus
    },
    {
      path: "/attendanceReport",
      element: <AttendanceReport />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Attendance Report",
      icon: "bar-chart-line", // bi-bar-chart-line
    },
    {
      path: "/attendanceList",
      element: <AttendanceList />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Attendance List",
      icon: "card-checklist", // bi-card-checklist
    }
  ]
},
 {
  label: "Salary Management",
  icon: "currency-rupee", // Bootstrap icon: bi-currency-rupee
  children: [
    {
      path: "/employeeSalaryStructure",
      element: <EmployeeSalaryStructure />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Add Salary Structure",
      icon: "file-earmark-plus", // bi-file-earmark-plus
    },
    {
  path: "/employeeSalaryList",
  element: <EmployeeSalaryList />,
  allowedRoles: ["HRM"],
  allowedResourceTypes: ["company_admin", "HR", "Admin"],
  label: "Employee Salary List",
  icon: "file-earmark-spreadsheet" // Bootstrap icon: bi-file-earmark-spreadsheet
},
    {
      path: "/payslipGeneration",
      element: <GeneratePaySlip />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Generate Payslip",
      icon: "file-earmark-ruled", // bi-file-earmark-ruled
    },
    {
      path: "/payslipsList",
      element: <ViewPaySlips />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Payslip List",
      icon: "file-earmark-spreadsheet", // bi-file-earmark-spreadsheet
    }
  ]
},
{
  path: "/employeeSalaryList",
  element: <EmployeeSalaryList />,
  allowedRoles: ["HRM"],
  allowedResourceTypes: ["company_admin", "HR", "Admin"],
},
  {
    path: "/payslipUpdate1",
    element: <PayslipUpdate1 />,
    allowedRoles: ["HRM"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
  {
    path: "/payslipUpdate2",
    element: <PayslipUpdate2 />,
    allowedRoles: ["HRM"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
  {
    path: "/payslipUpdate3",
    element: <PayslipUpdate3 />,
    allowedRoles: ["HRM"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
  {
    path: "/payslipUpdate4",
    element: <PayslipUpdate4 />,
    allowedRoles: ["HRM"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
{
    label: "Employees Data",
    icon: "people",
    children: [
      {
        path: "/employeeMangement",
        element:<EmployeeManager/>,
        label: "Employee Management",
        icon: "people-fill",
        allowedRoles: ["tax_consultant","invoice_management"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      },
      {
        path: "/employeeSummary",
        element:<EmployeeSummary/>,
        label: "Employee Summary",
        icon: "clipboard-data",
        allowedRoles: ["tax_consultant","invoice_management"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      },
    ]
  },
{
  label: "GST Management",
  icon: "receipt",
  children: [
{
  path: "/invoicesAccountsManagment",
  element: <GSTCustomerRegistration />,
  allowedRoles: ["HRM", "tax_consultant","invoice_management"],
  allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  label: "Gst Submission",
  icon: "file-text" // Invoice-like icon
},
{
  path: "/invoiceAccountsSummary",
  element: <InvoiceAccountsSummary />,
  allowedRoles: ["HRM", "tax_consultant"],
  allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  label: "GST Data",
  icon: "file-bar-graph" // Summary-style financial icon
}, 
  ],
},
  {
    path: "/employeeSalaryUpdate",
    element: <EmployeeSalaryUpdate />,
    allowedRoles: ["HRM"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
  {
    path: "/getTaxSlab",
    element: <GetTaxSlab />,
    allowedRoles: ["HRM", "tax_consultant"],
    allowedResourceTypes: [
      "company_admin",
      "HR",
      "Admin",
      "Accountant",
      "employee",
    ],
  },
  {
    path: "/companyTdsView",
    element: <CompanyTdsView />,
    allowedRoles: ["HRM", "tax_consultant"],
    allowedResourceTypes: [
      "company_admin",
      "HR",
      "Admin",
      "Accountant",
      "employee",
    ],
  },
  {
    path: "/addTaxSlab",
    element: <AddTaxSlab />,
    allowedRoles: ["HRM", "tax_consultant"],
    allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  },
  {
    path: "/employeeSalaryList",
    element: <EmployeeSalaryList />,
    allowedRoles: ["HRM"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },


  // Company Admin & Accountant & HRM
 {
  label: "Customer Management",
  icon: "people", // Parent icon (Bootstrap icon)
  children: [
    {
      path: "/customerRegistration",
      element: <CustomersRegistration />,
      allowedRoles: ["HRM", "tax_consulatant"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      label: "Customer Registration",
      icon: "person-plus" // bi-person-plus
    },
    {
      path: "/customersView",
      element: <CustomersView />,
      allowedRoles: ["HRM", "tax_consulatant"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      label: "View Customers",
      icon: "people" // bi-people
    }
  ]
},
{
  label: "Product Management",
  icon: "box-seam", // Bootstrap icon for products
  children: [
    {
      path: "/productRegistration",
      element: <ProductRegistration />,
      allowedRoles: ["HRM", "tax_consulatant"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      label: "Product Registration",
      icon: "file-earmark-plus" // bi-file-earmark-plus
    },
    {
      path: "/productView",
      element: <ProductView />,
      allowedRoles: ["HRM", "tax_consulatant"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      label: "View Products",
      icon: "boxes" // bi-boxes
    }
  ]
},
 {
  label: "Invoice Management",
  icon: "file-text", // Bootstrap icon for invoice
  children: [
    {
      path: "/invoiceRegistration",
      element: <InvoiceRegistration />,
      allowedRoles: ["HRM", "tax_consulatant"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      label: "Register Invoice",
      icon: "file-earmark-plus" // bi-file-earmark-plus
    },
  
    {
      path: "/invoiceView",
      element: <InvoiceView />,
      allowedRoles: ["HRM", "tax_consulatant"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      label: "View Invoices",
      icon: "file-earmark-ruled" // bi-file-earmark-ruled
    }
  ]
},
  {
    path: "/invoicePdf",
    element: <InvoicePdf />,
    allowedRoles: ["HRM", "tax_consulatant"],
    allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  },
  {
    path: "/invoiceTemplate1",
    element: <InvoiceTemplate1 />,
    allowedRoles: ["HRM", "tax_consulatant"],
    allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  },
  {
    path: "/invoiceTemplate2",
    element: <InvoiceTemplate2 />,
    allowedRoles: ["HRM", "tax_consulatant"],
    allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  },

  // Employee & Accountant
{
  path: "/employeePayslip",
  element: <EmployeePayslips />,
  allowedRoles: ["employee"],
  allowedResourceTypes: ["employee"],
  label: "My Payslips",
  icon: "file-earmark-person" // Bootstrap Icons: https://icons.getbootstrap.com/icons/file-earmark-person/
},
  // Shared: company_admin, HR, employee & Accountant
  {
    path: "/payslipDoc1",
    element: <PayslipDoc1 />,
    allowedRoles: ["HRM", "tax_consulatant"],
    allowedResourceTypes: ["company_admin", "Admin", "HR", "employee"],
  },
  {
    path: "/payslipDoc2",
    element: <PayslipDoc2 />,
    allowedRoles: ["HRM", "tax_consulatant"],
    allowedResourceTypes: ["company_admin", "Admin", "HR", "employee"],
  },
  {
    path: "/payslipDoc3",
    element: <PayslipDoc3 />,
    allowedRoles: ["HRM", "tax_consulatant"],
    allowedResourceTypes: ["company_admin", "Admin", "HR", "employee"],
  },
  {
    path: "/payslipDoc4",
    element: <PayslipDoc4 />,
    allowedRoles: ["HRM", "tax_consulatant"],
    allowedResourceTypes: ["company_admin", "Admin", "HR", "employee"],
  },
{
  path: "/getcalendar",
  element: <GetCalendar />,
  allowedRoles: ["HRM", "tax_consulatant", "employee"],
  allowedResourceTypes: [
    "company_admin",
    "Admin",
    "HR",
    "employee",
    "Accountant",
  ],
  label: "Calendar",
  icon: "calendar3" // Bootstrap Icons: https://icons.getbootstrap.com/icons/calendar3/
},
{
  path: "/taxSlab",
  element: <AddTaxSlab />,
  allowedRoles: ["HRM", "tax_consulatant"],
  allowedResourceTypes: ["company_admin", "Admin"],
  label: "Tax Slabs",
  icon: "percent" // Bootstrap Icons: https://icons.getbootstrap.com/icons/percent/
},
{
  path: "/totalEmployees",
  element: <TotalEmployees />,
  allowedRoles: ["HRM", "tax_consulatant","hr_management","invoice_management"],
  allowedResourceTypes: ["company_admin", "Admin", "HR", "Accountant"],
  label: "Total Employees",
  icon: "people" // Bootstrap Icon: https://icons.getbootstrap.com/icons/people/
},
  {
    path: "/employeeList/:status",
    element: <EmployeeList />,
    allowedRoles: ["HRM", "tax_consulatant"],
    allowedResourceTypes: ["company_admin", "Admin", "HR", "Accountant"],
  },

  // Candidate-specific
  {
    path: "/candidateProfile",
    element: <CandidateProfile />,
    allowedRoles: ["candiadte"],
    allowedResourceTypes: ["candidate"],
  },
  {
    path: "/candidateDocumentsView",
    element: <CandidateDocumentsView />,
    allowedRoles: ["HRM", "candidate"],
    allowedResourceTypes: ["company_admin", "Admin", "HR", "candidate"],
  },
  // Employee document access
{
  label: "Documents",
  icon: "folder2", // Bootstrap icon: https://icons.getbootstrap.com/icons/folder2/
  children: [
    {
      path: "/employeeDocumentUpload",
      element: <EmployeeDocumentUpload />,
      allowedRoles: ["HRM", "employee"],
      allowedResourceTypes: ["company_admin", "Admin", "HR", "employee"],
      label: "Upload Document",
      icon: "file-earmark-arrow-up", // https://icons.getbootstrap.com/icons/file-earmark-arrow-up/
    },
    {
      path: "/employeeDocumentView",
      element: <EmployeeDocumentView />,
      allowedRoles: ["HRM", "employee"],
      allowedResourceTypes: ["company_admin", "Admin", "HR", "employee"],
      label: "View Document",
      icon: "file-earmark-text", // https://icons.getbootstrap.com/icons/file-earmark-text/
    }
  ]
},

  // Company Admin Only
{
  label: "Professional Tax",
  icon: "receipt-cutoff", // Section icon
  children: [
    {
      path: "/companyPTSubmission",
      label: "PT Submission",
      icon: "file-earmark-arrow-down",
       allowedRoles: ["HRM", "tax_consultant"],
  allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
    },
    {
      path: "/ptProcessing",
      label: "PT Processing",
      icon: "gear",
       allowedRoles: ["HRM", "tax_consultant"],
  allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
    }
  ]
},

 {
    label: "GST Filing",
    icon: "receipt",
    children: [
      {
        path: "/gstProcessing",
        label: "GST Processing",
        element: <GSTProcessing />,
        allowedRoles: ["HRM", "tax_consultant"],
        allowedResourceTypes: ["company_admin","Accountant", "ca"],
      },
      {
        path: "/gstReceiptsView",
        label: "GST Receipts",
        element: <GSTReceiptView />,
        allowedRoles: ["HRM", "tax_consultant"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant", "ca"],
      },
    ],
  },
  {
    label: "TDS Filings",
    icon: "file-earmark-font",
    children: [
      {
        path: "/tdsProcessing",
        label: "TDS Processing",
        element: <TDSProcessing />,
        allowedRoles: ["HRM", "tax_consultant"],
        allowedResourceTypes: ["company_admin", "Accountant", "ca"],
      },
      {
        path: "/tdsReceiptsView",
        label: "TDS Receipts",
        element: <TDSReceiptsView />,
        allowedRoles: ["HRM", "tax_consultant"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant", "ca"],
      },
    ],
  },
  {
    label: "PT Filings",
    icon: "receipt-cutoff",
    children: [
      {
        path: "/ptProcessing",
        label: "PT Processing",
        element: <PTProcessing />,
        allowedRoles: ["HRM", "tax_consultant"],
        allowedResourceTypes: ["company_admin","Accountant", "ca"],
      },
      {
        path: "/ptReceiptsView",
        label: "PT Receipts",
        element: <PTReceiptsView />,
        allowedRoles: ["HRM", "tax_consultant"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant", "ca"],
      },
    ],
  },
  {
    label: "PF Filings",
    icon: "file-earmark-ppt",
    children: [
      {
        path: "/pfProcessing",
        label: "PF Processing",
        element: <PFProcessing />,
        allowedRoles: ["HRM", "tax_consultant"],
        allowedResourceTypes: ["company_admin","Accountant", "ca"],
      },
      {
        path: "/pfReceiptsView",
        label: "PF Receipts",
        element: <PFReceiptsView />,
        allowedRoles: ["HRM", "tax_consultant"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant", "ca"],
      },
    ],
  },
{
  label: "Users",
  icon: "person", // Bootstrap Icon (bi-person); use "people" for multiple users
  children: [
    {
      path: "/viewUser",
      element: <ViewUser />,
      allowedRoles: ["HRM", "tax_consultant", "Admin"],
      allowedResourceTypes: ["company_admin", "Admin"],
      label: "View Users",
    },
    {
      path: "/addUser",
      element: <AddUser />,
      allowedRoles: ["HRM", "tax_consultant", "Admin"],
      allowedResourceTypes: ["company_admin"],
      label: "Add User",
    },
  ],
},
{
  label: "Settings",
  icon: "gear",
  children: [
    {
      label: "Accounts",
      icon: "wallet", // or "file-invoice-dollar" if using FontAwesome
      children: [
        {
          path: "/accountRegistration",
          element: <AccountRegistration />,
          allowedRoles: ["HRM", "tax_consultant", "Admin"],
          allowedResourceTypes: ["company_admin"],
          label: "Register Account",
        },
        {
          path: "/accountsView",
          element: <AccountsView />,
          allowedRoles: ["HRM", "tax_consultant", "Admin"],
          allowedResourceTypes: ["company_admin", "Accountant"],
          label: "View Accounts",
        },
      ],
    },
    {
  path: "/companySalaryView",
  element: <CompanySalaryView />,
  allowedRoles: ["HRM"],
  allowedResourceTypes: ["company_admin", "HR", "Admin"],
  label: "Company Salary View",
  icon: "currency-dollar", // Suggested Bootstrap icon: bi-currency-dollar
},
{
  path: "/AddEvent",
  element: <EventForm />,
  allowedRoles: ["HRM", "tax_consultant"],
  allowedResourceTypes: ["company_admin","Admin"],
  label: "Add Event",
  icon: "calendar-plus" // Bootstrap icon: bi-calendar-plus
},
{
  path: "/AddTimeLine",
  element: <TimelineForm />,
  allowedRoles: ["HRM", "tax_consultant"],
  allowedResourceTypes: ["company_admin","Admin"],
  label: "Add Time Lines",
  icon: "calendar4-range" // Bootstrap icon: bi-calendar-plus
},
 {
  path: "/offerLetterTemplate",
  element: <OfferLetters />,
  allowedRoles: ["HRM"],
  allowedResourceTypes: ["company_admin", "HR", "Admin"],
  label: "Offer Templates",
  icon: "file-earmark-richtext", // Bootstrap icon (bi-file-earmark-richtext)
},
{
  path: "/experieceTemplates",
  element: <ExperienceLetter />,
  allowedRoles: ["HRM"],
  allowedResourceTypes: ["company_admin", "HR", "Admin"],
  label: "Experience Templates",
  icon: "file-earmark-richtext", // Bootstrap icon: bi-file-earmark-richtext
},
{
  path: "/relievingTemplates",
  element: <RelievingLetter />,
  allowedRoles: ["HRM"],
  allowedResourceTypes: ["company_admin", "HR", "Admin"],
  label: "Relieving Templates",
  icon: "file-earmark-text", // Bootstrap icon: bi-file-earmark-text
},
 {
      path: "/internOfferTemplate",
      element: <InternOfferLetter />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Intern Offer Template",
      icon: "file-earmark-text", // bi-file-earmark-text
    },
      {
      path: "/appraisalTemplates",
      element: <AppraisalTemplate />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Appraisal Templates",
      icon: "award", // bi-award
    },
    {
      path: "/experienceLetter",
      element: <ExperienceLetter />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Experience Letter",
      icon: "briefcase", // bi-briefcase
    },
    {
      path: "/internsTemplates",
      element: <InternShipTemplates />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Internship Templates",
      icon: "mortarboard", // bi-mortarboard
    },
    {
      path: "/payslipTemplates",
      element: <PayslipTemplates />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Payslip Templates",
      icon: "file-earmark-ruled", // bi-file-earmark-ruled
    },
    {
      path: "/template",
      element: <Template />,
      allowedRoles: ["HRM"],
      allowedResourceTypes: ["company_admin", "HR", "Admin"],
      label: "Offer Letter Template",
      icon: "file-text", // bi-file-text
    },
      {
      path: "/invoiceTemplates",
      element: <InvoiceTemplates />,
      allowedRoles: ["HRM", "tax_consulatant"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      label: "Invoice Templates",
      icon: "file-earmark-text" // bi-file-earmark-text
    },
    {
  path: "/passwordManager",
  element: <PasswordManagementSummary />,
  allowedRoles: ["HRM", "tax_consultant"],
  allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  label: "Password Manager",
  icon: "key" // Bootstrap Icon: https://icons.getbootstrap.com/icons/key/
}
  ],
},
];

export default routeConfig;
