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
import GSTResponsesView from "../AccountantModule/GST/GSTResponsesView";
import GSTReceiptsView from "../AccountantModule/GST/GSTReceiptsView";
import GSTProcessing from "../AccountantModule/GST/GSTProcessing";
import PTResponsesView from "../AccountantModule/ProfessionalTax/PTResponsesView";
import PTReceiptsView from "../AccountantModule/ProfessionalTax/PTReceiptsView";
import CompanyPFSubmission from "../AccountantModule/PF/CompanyPFSubmission";
import CompanyPTSubmission from "../AccountantModule/ProfessionalTax/CompanyPTSubmission"
import PTProcessing from "../AccountantModule/ProfessionalTax/PTProcessing"
import PFProcessing from "../AccountantModule/PF/PFProcessing";
import PFReceiptsView from "../AccountantModule/PF/PFReceiptsView";
import PFResponsesView from "../AccountantModule/PF/PFResponsesView";
import CompanyTDSSubmission from "../AccountantModule/Tds/CompanyTDSSubmission";
import TDSProcessing from "../AccountantModule/Tds/TDSProcessing";
import TDSResponsesView from "../AccountantModule/Tds/TDSResponsesView";
import TDSReceiptsView from "../AccountantModule/Tds/TDSReceiptsView";

const routeConfig = [
  {
    path: "/main",
    element: <Body />,
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
    path: "/editUser/:id",
    element: <UpdateUser />,
    allowedRoles: ["hrm", "tax_consultant","hr_management","invoice_management","ca"],
    allowedResourceTypes: ["company_admin","Accountant","HR","Admin"],
  },
  {
    path: "/profile",
    element: <Profile />,
    allowedRoles: ["hrm", "tax_consultant"],
    allowedResourceTypes: ["company_admin"],
  },
  // Employee-specific
  {
    path: "/employeeProfile",
    element: <EmployeeProfile />,
    allowedRoles: ["employee"],
    allowedResourceTypes: ["employee"],
  },
  {
  path: "/employeeSalariesView",
  element: <EmployeeSalaryById />,
  allowedRoles: ["employee"],
  allowedResourceTypes: ["employee"],
  label: "Salary Summary",
  icon: "wallet2", // bi-wallet2 - better represents salary or financial data
},
{
  path: "/employeePayslip",
  element: <EmployeePayslips />,
  allowedRoles: ["employee"],
  allowedResourceTypes: ["employee"],
  label: "Payslips",
  icon: "receipt", // bi-receipt - ideal for payslip documents
},
{
  path: "/employeeDocumentUpload",
  element: <EmployeeDocumentUpload />,
  allowedRoles: ["employee"],
  allowedResourceTypes: ["employee"],
  label: "Documents Upload",
  icon: "cloud-arrow-up", // bi-cloud-arrow-up - represents uploading
},
{
  path: "/employeeDocumentView",
  element: <EmployeeDocumentView />,
  allowedRoles: ["employee"],
  allowedResourceTypes: ["employee"],
  label: "Documents View",
  icon: "file-earmark-text", // bi-file-earmark-text - for viewing files
},


  // Company Admin & HR Shared
  {
    path: "/department",
    element: <Department />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
    label: "Department",
    icon: "diagram-3", // Bootstrap icon
  },
    {
    label: "Candidate",
    icon: "person-badge", // Bootstrap icon suggestion: bi-person-vcard
    children: [
      {
        path: "/candidateRegistration",
        element: <CandidateRegistration />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Register Candidate",
        icon: "person-plus", // bi-person-plus
      },
      {
        path: "/candidatesView",
        element: <CandidatesView />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR"],
        label: "View Candidates",
        icon: "people", // bi-people
      }
    ]
  },
  {
    label: "Employees",
    icon: "people", // Bootstrap Icon (bi-people)
    children: [
      {
        path: "/employeeRegister",
        element: <EmployeeRegister />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Register Employee",
        icon: "person-plus", // bi-person-plus
      },
      {
        path: "/employeeView",
        element: <EmployeeView />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "View Employees",
        icon: "person-lines-fill", // bi-person-lines-fill
      },
    ],
  },
  {
    label: "Attendance",
    icon: "calendar-check", // Bootstrap icon: bi-calendar-check
    children: [
      {
        path: "/addAttendance",
        element: <ManageAttendance />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Add Attendance",
        icon: "clipboard-plus", // bi-clipboard-plus
      },
      {
        path: "/attendanceReport",
        element: <AttendanceReport />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Attendance Report",
        icon: "bar-chart-line", // bi-bar-chart-line
      },
    ]
  },
  {
    path: "/candidate-to-employee/:id",
    element: <CandidateToEmployee />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },

  {
    path: "/offerLetterForm",
    element: <OfferLetterForm />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
    label: "Offer Letter Form",
    icon: "file-earmark-text", // Bootstrap icon (bi-file-earmark-text)
  },
  {
    path: "/offerLetterPreview",
    element: <OfferLetterPreview />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },

  {
    label: "Experience",
    icon: "file-earmark-person", // Bootstrap icon: bi-file-earmark-person
    children: [
      {
        path: "/experienceForm",
        element: <ExperienceForm />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Experience Form",
        icon: "journal-text", // bi-journal-text
      },
    ]
  },
  {
    label: "Relieving",
    icon: "person-dash", // Bootstrap icon suggestion: bi-person-vcard
    children: [
      {
        path: "/relievingSummary",
        element: <ExistsEmployesView />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Relieving Summary",
        icon: "card-list", // Bootstrap icon: bi-card-list
      },
      {
        path: "/relievingProcess",
        element: <ExistsEmpRegistration />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Relieving Process",
        icon: "box-arrow-right", // Bootstrap icon: bi-box-arrow-right
      },
    ]
  },
  {
    path: "/relivingReview",
    element: <Preview />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },

  {
    label: "Internship",
    icon: "award", // Bootstrap icon: bi-mortarboard
    children: [
      {
        path: "/internOfferForm",
        element: <InternOfferForm />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Intern Offer Form",
        icon: "file-earmark-plus", // bi-file-earmark-plus
      },
      {
        path: "/internsLetter",
        element: <InternShipForm />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Internship Certificate",
        icon: "journal-richtext", // bi-journal-richtext
      }
    ]
  },
  {
    path: "/internPrev",
    element: <InternOfferPrev />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
  {
    label: "Salary Management",
    icon: "wallet", // Bootstrap icon: bi-currency-rupee
    children: [
      {
        path: "/employeeSalaryStructure",
        element: <EmployeeSalaryStructure />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Add Salary Structure",
        icon: "file-earmark-plus", // bi-file-earmark-plus
      },
      {
        path: "/employeeSalaryList",
        element: <EmployeeSalaryStructureView/>,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Employee Salary List",
        icon: "file-earmark-spreadsheet" // Bootstrap icon: bi-file-earmark-spreadsheet
      },
       {
        path: "/appraisalLetter",
        element: <AddIncrement />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Appraisal Form",
        icon: "file-earmark-text", // Bootstrap icon: bi-graph-up-arrow
      },
      {
        path: "/payslipGeneration",
        element: <GeneratePaySlip />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Generate Payslip",
        icon: "file-earmark-ruled", // bi-file-earmark-ruled
      },
      {
        path: "/payslipsList",
        element: <ViewPaySlips />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Payslip List",
        icon: "file-earmark-spreadsheet", // bi-file-earmark-spreadsheet
      }
    ]
  },
  {
    path: "/employeeSalaryList",
    element: <EmployeeSalaryList />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
  {
    path: "/payslipUpdate1",
    element: <PayslipUpdate1 />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
  {
    path: "/payslipUpdate2",
    element: <PayslipUpdate2 />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
  {
    path: "/payslipUpdate3",
    element: <PayslipUpdate3 />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
  {
    path: "/payslipUpdate4",
    element: <PayslipUpdate4 />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
  {
    label: "Employees Data",
    icon: "people",
    children: [
      {
        path: "/employeeMangement",
        label: "Employee Management",
        icon: "people-fill",
        allowedRoles: ["tax_consultant"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      },
      {
        path: "/employeeSummary",
        label: "Employee Summary",
        icon: "clipboard-data",
        allowedRoles: ["tax_consultant"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      },
    ]
  },


  {
    path: "/employeeSalaryUpdate",
    element: <EmployeeSalaryUpdate />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },
  {
    path: "/getTaxSlab",
    element: <GetTaxSlab />,
    allowedRoles: ["hrm", "tax_consultant","hr_management","invoice_management","ca","employee"],
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
    allowedRoles: ["hrm", "tax_consultant","hr_management","invoice_management","ca"],
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
    allowedRoles: ["hrm", "tax_consultant","invoice_management"],
    allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  },
  {
    path: "/employeeSalaryList",
    element: <EmployeeSalaryList />,
    allowedRoles: ["hrm","hr_management"],
    allowedResourceTypes: ["company_admin", "HR", "Admin"],
  },


  // Company Admin & Accountant & hrm
  {
    label: "Clients Management",
    icon: "people", // Parent icon (Bootstrap icon)
    children: [
      {
        path: "/customerRegistration",
        element: <CustomersRegistration />,
        allowedRoles: ["hrm", "tax_consulatant","invoice_management"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
        label: "Client Registration",
        icon: "person-plus" // bi-person-plus
      },
      {
        path: "/customersView",
        element: <CustomersView />,
        allowedRoles: ["hrm", "tax_consulatant","invoice_management"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
        label: "View Clients",
        icon: "people" // bi-people
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
        allowedRoles: ["hrm", "tax_consulatant","invoice_management"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
        label: "Generate Invoice",
        icon: "file-earmark-plus" // bi-file-earmark-plus
      },

      {
        path: "/invoiceView",
        element: <InvoiceView />,
        allowedRoles: ["hrm", "tax_consulatant","invoice_management"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
        label: "View Invoices",
        icon: "file-earmark-ruled" // bi-file-earmark-ruled
      }
    ]
  },
  {
  label: "Provident Fund",
  icon: "building", // Section icon for savings/funds
  children: [
    {
      path: "/companyPFSubmission",
      element: <CompanyPFSubmission />,
      label: "PF Submission",
      icon: "file-earmark-arrow-down", // For document submission
      allowedRoles: ["hrm", "tax_consultant","invoice_management"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
    },
    {
      path: "/pfProcessing",
      element: <PFProcessing />,
      label: "PF Processing",
      icon: "funnel", // Processing/filtering icon
      allowedRoles: ["hrm", "tax_consultant","ca"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
    },
    {
      path: "/pfResponsesView",
      element: <PFResponsesView />,
      label: "PF Response View",
      icon: "chat-left-text", // Message/response icon
      allowedRoles: ["hrm", "tax_consultant","invoice_management"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
    },
    {
      path: "/pfReceiptsView",
      element: <PFReceiptsView />,
      label: "PF Receipts View",
      icon: "file-earmark", // General document/receipt icon
      allowedRoles: ["hrm", "tax_consultant","invoice_management","ca"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
    }
  ]
},
  {
    label: "Professional Tax",
    icon: "receipt-cutoff", // Section icon
    children: [
      {
        path: "/companyPTSubmission",
        element: <CompanyPTSubmission/>,
        label: "PT Submission",
        icon: "file-earmark-arrow-down",
        allowedRoles: ["hrm", "tax_consultant","invoice_management"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      },
      {
        path: "/ptProcessing",
        element: <PTProcessing/>,
        label: "PT Processing",
        icon: "funnel",
        allowedRoles: ["hrm", "tax_consultant","ca"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      },
      {
        path: "/ptResponsesView",
        element: <PTResponsesView/>,
        label: "PT Response View",
        icon: "chat-left-text",
        allowedRoles: ["hrm", "tax_consultant","invoice_management"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      },
      {
        path: "/ptReceiptsView",
        element: <PTReceiptsView/>,
        label: "PT Receipts View",
        icon: "file-earmark",
        allowedRoles: ["hrm", "tax_consultant","ca","invoice_management"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
      }
    ]
  },
  {
  label: "TDS Management",
  icon: "wallet", // Represents tax/deductions
  children: [
    {
      path: "/companyTDSSubmission",
      element: <CompanyTDSSubmission />,
      label: "TDS Submission",
      icon: "file-earmark-arrow-down", // Document upload
      allowedRoles: ["hrm", "tax_consultant","invoice_management"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
    },
    {
      path: "/tdsProcessing",
      element: <TDSProcessing />,
      label: "TDS Processing",
      icon: "funnel", // Processing/filtering
      allowedRoles: ["hrm", "tax_consultant","ca"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
    },
    {
      path: "/tdsResponsesView",
      element: <TDSResponsesView />,
      label: "TDS Response View",
      icon: "chat-left-text", // Feedback/responses
      allowedRoles: ["hrm", "tax_consultant","invoice_management"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
    },
    {
      path: "/tdsReceiptsView",
      element: <TDSReceiptsView />,
      label: "TDS Receipts View",
      icon: "file-earmark", // Generic receipt/document
      allowedRoles: ["hrm", "tax_consultant","invoice_management","ca"],
      allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
    }
  ]
},
    {
    label: "GST Management",
    icon: "receipt",
    children: [
      {
        path: "/companyGSTSubmission",
        element: <CompanyGSTSubmission/>,
        allowedRoles: ["hrm", "tax_consultant","invoice_management"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
        label: "GST Submission",
        icon: "file-earmark-text" // Invoice-like icon
      },
      {
        path:"/gstProcessing",
        element: <GSTProcessing />,
        allowedRoles: ["hrm", "tax_consultant","ca"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
        label: "GST Processing",
        icon: "funnel" // Summary-style financial icon
      },
      {
        path: "/gstResponsesView",
        element: <GSTResponsesView />,
        allowedRoles: ["hrm", "tax_consultant","invoice_management"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
        label: "GST Response View",
        icon: "chat-left-text" // Summary-style financial icon
      },
      {
        path: "/gstReceiptsView",
        element: <GSTReceiptsView/>,
        allowedRoles: ["hrm", "tax_consultant","invoice_management","ca"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant","ca"],
        label: "GST Receipts View",
        icon: "file-earmark" // Summary-style financial icon
      },
    ],
  },
  // Product Management
  // {
  //   label: "Product Management",
  //   icon: "box-seam", // Bootstrap icon for products
  //   children: [
  //     {
  //       path: "/productRegistration",
  //       element: <ProductRegistration />,
  //       allowedRoles: ["hrm", "tax_consulatant"],
  //       allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  //       label: "Product Registration",
  //       icon: "file-earmark-plus" // bi-file-earmark-plus
  //     },
  //     {
  //       path: "/productView",
  //       element: <ProductView />,
  //       allowedRoles: ["hrm", "tax_consulatant"],
  //       allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  //       label: "View Products",
  //       icon: "boxes" // bi-boxes
  //     }
  //   ]
  // },

  {
    path: "/invoicePdf",
    element: <InvoicePdf />,
    allowedRoles: ["hrm", "tax_consulatant","invoice_management"],
    allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  },
  {
    path: "/invoiceTemplate1",
    element: <InvoiceTemplate1 />,
    allowedRoles: ["hrm", "tax_consulatant","invoice_management"],
    allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  },
  {
    path: "/invoiceTemplate2",
    element: <InvoiceTemplate2 />,
    allowedRoles: ["hrm", "tax_consulatant","invoice_management"],
    allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
  },

  // Employee & Accountant
  // Shared: company_admin, HR, employee & Accountant
  {
    path: "/payslipDoc1",
    element: <PayslipDoc1 />,
    allowedRoles: ["hrm", "tax_consulatant","hr_management",],
    allowedResourceTypes: ["company_admin", "Admin", "HR", "employee"],
  },
  {
    path: "/payslipDoc2",
    element: <PayslipDoc2 />,
    allowedRoles: ["hrm", "tax_consulatant"],
    allowedResourceTypes: ["company_admin", "Admin", "HR", "employee"],
  },
  {
    path: "/payslipDoc3",
    element: <PayslipDoc3 />,
    allowedRoles: ["hrm", "tax_consulatant","hr_management"],
    allowedResourceTypes: ["company_admin", "Admin", "HR", "employee"],
  },
  {
    path: "/payslipDoc4",
    element: <PayslipDoc4 />,
    allowedRoles: ["hrm", "tax_consulatant","hr_management"],
    allowedResourceTypes: ["company_admin", "Admin", "HR", "employee"],
  },
  // {
  //   path: "/getcalendar",
  //   element: <GetCalendar />,
  //   allowedRoles: ["hrm", "tax_consulatant", "employee"],
  //   allowedResourceTypes: [
  //     "company_admin",
  //     "Admin",
  //     "HR",
  //     "employee",
  //     "Accountant",
  //   ],
  //   label: "Calendar",
  //   icon: "calendar3" // Bootstrap Icons: https://icons.getbootstrap.com/icons/calendar3/
  // },
  // {
  //   path: "/taxSlab",
  //   element: <AddTaxSlab />,
  //   allowedRoles: ["hrm", "tax_consulatant"],
  //   allowedResourceTypes: ["company_admin", "Admin"],
  //   label: "Tax Slabs",
  //   icon: "percent" // Bootstrap Icons: https://icons.getbootstrap.com/icons/percent/
  // },
  {
    path: "/totalEmployees",
    element: <TotalEmployees />,
    allowedRoles: ["hrm", "tax_consulatant","hr_management"],
    allowedResourceTypes: ["company_admin", "Admin", "HR", "Accountant"],
  },
  {
    path: "/employeeList/:status",
    element: <EmployeeList />,
    allowedRoles: ["hrm", "tax_consulatant","hr_management"],
    allowedResourceTypes: ["company_admin", "Admin", "HR", "Accountant"],
  },

  // Candidate-specific
  {
    path: "/candidateProfile",
    element: <CandidateProfile />,
    allowedRoles: ["candidate"],
    allowedResourceTypes: ["candidate"],
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
    path: "/candidateDocumentsView",
    element: <CandidateDocumentsView />,
    allowedRoles: ["candidate"],
    allowedResourceTypes: ["candidate"],
    label:"Documents View",
    icon: "file-earmark-check",
  },
  
  // Company Admin Only
  {
    label: "Users",
    icon: "people", // Bootstrap Icon (bi-person); use "people" for multiple users
    children: [
      {
        path: "/viewUser",
        element: <ViewUser />,
        allowedRoles: ["hrm", "tax_consultant", "hr_management","invoice_management"],
        allowedResourceTypes: ["company_admin", "Admin"],
        label: "View Users",
        icon: "person-lines-fill",
      },
      {
        path: "/addUser",
        element: <AddUser />,
        allowedRoles: ["hrm", "tax_consultant"],
        allowedResourceTypes: ["company_admin"],
        label: "Add User",
        icon: "person-plus",
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
            allowedRoles: ["hrm", "tax_consultant", "Admin"],
            allowedResourceTypes: ["company_admin"],
            label: "Register Account",
            icon: "person-plus",
          },
          {
            path: "/accountsView",
            element: <AccountsView />,
            allowedRoles: ["hrm", "tax_consultant", "Admin"],
            allowedResourceTypes: ["company_admin"],
            label: "View Accounts",
            icon: "person-lines-fill",
          },
        ],
      },
      {
        path: "/AddEvent",
        element: <EventForm />,
        allowedRoles: ["hrm", "tax_consultant","hr_management","invoice_management","ca"],
        allowedResourceTypes: ["company_admin", "Admin"],
        label: "Add Event",
        icon: "calendar-plus" // Bootstrap icon: bi-calendar-plus
      },
      {
      path: "/companyTdsView",
      element: <CompanyTdsView />, // Replace with your actual component
      allowedRoles: ["hrm", "tax_consultant","hr_management"],
      allowedResourceTypes: ["company_admin", "Accountant","Admin"],
      label: "Add TDS",
      icon: "file-earmark-spreadsheet", // Suggested: bi-file-earmark-spreadsheet
    },
    {
        label: "Company Salary Structure",
        icon: "wallet", // or "file-invoice-dollar" if using FontAwesome
        children: [
      {
        path: "/companySalaryView",
        element: <CompanySalaryView />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Company Salary View",
        icon: "cash", // Suggested Bootstrap icon: bi-currency-dollar
      },
  {
    path: "/companySalaryStructure",
    element: <CompanySalaryStructure />,
    allowedRoles: ["hrm"],
    allowedResourceTypes: ["company_admin"],
    label:"Add Company Salary Structure",
    icon:"cash"
  },
]
    },
      {
        path: "/internOfferTemplate",
        element: <InternOfferLetter />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Intern Offer Template",
        icon: "file-earmark-text", // bi-file-earmark-text
      },
      {
        path: "/offerLetterTemplate",
        element: <OfferLetters />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Offer Templates",
        icon: "file-earmark-richtext", // Bootstrap icon (bi-file-earmark-richtext)
      },
      {
        path: "/payslipTemplates",
        element: <PayslipTemplates />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Payslip Templates",
        icon: "file-earmark-ruled", // bi-file-earmark-ruled
      },
      {
        path: "/internsTemplates",
        element: <InternShipTemplates />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Internship Templates",
        icon: "person-badge", // bi-mortarboard
      },
      {
        path: "/appraisalTemplates",
        element: <AppraisalTemplate />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Appraisal Templates",
        icon: "award", // bi-award
      },
      {
        path: "/relievingTemplates",
        element: <RelievingLetter />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Relieving Templates",
        icon: "file-earmark-text", // Bootstrap icon: bi-file-earmark-text
      },
      {
        path: "/experienceLetter",
        element: <ExperienceLetter />,
        allowedRoles: ["hrm","hr_management"],
        allowedResourceTypes: ["company_admin", "HR", "Admin"],
        label: "Experience Letter",
        icon: "briefcase", // bi-briefcase
      },
      {
        path: "/invoiceTemplates",
        element: <InvoiceTemplates />,
        allowedRoles: ["hrm", "tax_consulatant"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
        label: "Invoice Templates",
        icon: "file-earmark-text" // bi-file-earmark-text
      },
      {
        path: "/passwordManager",
        element: <PasswordManagementSummary />,
        allowedRoles: ["hrm", "tax_consultant","ca"],
        allowedResourceTypes: ["company_admin", "Admin", "Accountant"],
        label: "Password Manager",
        icon: "key" // Bootstrap Icon: https://icons.getbootstrap.com/icons/key/
      }
    ],
  },
];

export default routeConfig;
