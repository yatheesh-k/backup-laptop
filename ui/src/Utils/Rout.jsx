import React from 'react';
import { Route, Routes} from 'react-router';
import EmsLogin from '../Login/EmsLogin';
import CompanyLogin from '../Login/CompanyLogin';
import CompanyRegistration from '../EMSModule/Company/CompanyRegistration';
import AnonymousCmpRegistration from '../EMSModule/Company/AnonymousCmpRegistration';

import Body from '../LayOut/Body';
import CompanyView from '../EMSModule/Company/CompanyView';
import Department from '../CompanyModule/Department/Department';
import Designation from '../CompanyModule/Designation/Designation';
import EmployeeRegistration from '../CompanyModule/Employee/EmployeeRegistration';
import EmployeeView from '../CompanyModule/Employee/EmployeeView';
import ExistsEmpRegistration from '../CompanyModule/ExistingProcess/ExistsEmpRegistration';
import ExistsEmployesView from '../CompanyModule/ExistingProcess/ExistsEmployesView'
import EmployeeSalaryStructure from '../CompanyModule/PayRoll/EmployeeSalaryStructure';
import GeneratePaySlip from '../CompanyModule/PayRoll/GeneratePaySlips';
import ViewPaySlips from '../CompanyModule/PayRoll/ViewPaySlips';
import AddIncrement from '../CompanyModule/PayRoll/Hike/AddIncrement';
import ViewIncrement from '../CompanyModule/PayRoll/Hike/ViewIncrementList';
import ManageAttendance from '../CompanyModule/Attendance/ManageAttendance';
import AttendanceList from '../CompanyModule/Attendance/AttendanceList';
import AttendanceReport from '../CompanyModule/Attendance/AttendanceReport';
import EmployeePayslips from '../EmployeeModule/EmployeePayslips';
import OfferLetter from '../EmployeeModule/OfferLetter';
import PaySlipLetter from '../EmployeeModule/PaySlipLetter';
import HikeLetter from '../EmployeeModule/HikeLetter';
import ExistingLetter from '../EmployeeModule/ExistingLetter';
import CompanySalaryStructure from '../CompanyModule/Settings/CompanySalaryStructure';
import EmployeeSalaryList from '../CompanyModule/PayRoll/EmployeeSalaryList';
import Profile from '../LayOut/Profile';
import Message from '../LayOut/Message';
import PaySlipDoc from '../Login/PayslipDoc';
import EmployeeSalaryById from '../EmployeeModule/EmployeeSalaryById';
import Reset from '../LayOut/Reset';
import ForgotPassword from '../Login/ForgotPassword'
import EmployeeProfile from '../EmployeeModule/EmployeeProfile';
import EmployeeSalaryUpdate from '../CompanyModule/PayRoll/EmployeeSalaryUpdate';
import CompanySalaryView from '../CompanyModule/Settings/CompanySalaryView';
import ExperienceLetter from '../CompanyModule/Settings/Experience/ExperienceLetter';
import ExperienceForm from '../CompanyModule/Settings/Experience/ExperienceForm';
import ExperienceView from '../CompanyModule/Settings/Experience/ExperienceView';
import RelievingLetter from '../CompanyModule/Settings/Relieving/RelievingLetter';
import Preview from '../CompanyModule/Settings/Relieving/Preview';
import AppraisalTemplate from '../CompanyModule/Settings/Appraisal/AppraisalTemplate';
import InternShipTemplates from '../CompanyModule/Settings/Internship/InternShipTemplates';
import InternShipForm from '../CompanyModule/Settings/Internship/InternShipForm';
import PayslipUpdate1 from '../CompanyModule/PayRoll/PayslipUpdate/PayslipUpdate1';
import PayslipUpdate2 from '../CompanyModule/PayRoll/PayslipUpdate/PayslipUpdate2';
import PayslipUpdate3 from '../CompanyModule/PayRoll/PayslipUpdate/PayslipUpdate3';
import PayslipUpdate4 from '../CompanyModule/PayRoll/PayslipUpdate/PayslipUpdate4';
import PayslipTemplates from '../CompanyModule/Settings/PayslipTemplates';
import PayslipDoc1 from '../CompanyModule/PayRoll/Payslips/PayslipDoc1';
import PayslipDoc3 from '../CompanyModule/PayRoll/Payslips/PayslipDoc3';
import PayslipDoc2 from '../CompanyModule/PayRoll/Payslips/PayslipDoc2';
import PayslipDoc4 from '../CompanyModule/PayRoll/Payslips/PayslipDoc4';
import OfferLetters from '../CompanyModule/Settings/OfferLetter/OfferLetters';
import Template from '../CompanyModule/Settings/OfferLetter/Template';
import OfferLetterForm from '../CompanyModule/Settings/OfferLetter/OfferLetterForm';
import OfferLetterPreview from '../CompanyModule/Settings/OfferLetter/OfferLetterPreview';
import EmployeeSalaryView from '../EmployeeModule/EmployeeSalaryView';
import AccountRegistration from '../InvoiceModule/AccountDetails/AccountRegistration';
import AccountsView from '../InvoiceModule/AccountDetails/AccountsView';
import CustomersRegistration from '../InvoiceModule/Customers/CustomerRegistration';
import CustomersView from '../InvoiceModule/Customers/CustomersView'
import InvoiceRegistration from '../InvoiceModule/Invoice/InvoiceRegistration';
import InvoiceView from '../InvoiceModule/Invoice/InvoiceView';
import InvoicePdf from '../InvoiceModule/Invoice/InvoicePdf';
import ProductView from '../InvoiceModule/Products/ProductsView';
import ProductRegistration from '../InvoiceModule/Products/ProductRegistration'
import CreatePassword from '../Login/CreatePassword';
import EmployeeRegister from '../CompanyModule/Employee/EmployeeRegister';
import EmployeeSalaryStructureView from '../CompanyModule/PayRoll/EmployeeSalaryStructureView';
import InternOfferLetter from '../CompanyModule/Settings/Internship/InternOfferLetter/InternOfferLetter';
import InternOfferPrev from '../CompanyModule/Settings/Internship/InternOfferLetter/InternOfferPrev';
import InternOfferForm from '../CompanyModule/Settings/Internship/InternOfferLetter/InternOfferForm';
import ProtectedRoute from './ProtectedRoute';
import ForbiddenPage from './ForbiddenPage';
import GetCalendar from '../Calender/GetCalendar';
import EventForm from '../Calender/EventForm';
import GetTaxSlab from '../CompanyModule/TDS/GetTaxSlab';
import CompanyTdsView from '../CompanyModule/TDS/CompanyTdsView';
import TotalEmployees from '../EmployeeModule/TotalEmployees';
import EmployeeList from '../EmployeeModule/EmployeeList';
import UpdateUser from '../CompanyModule/UserModue/UpdateUser';
import AddUser from '../CompanyModule/UserModue/AddUser';
import ViewUser from '../CompanyModule/UserModue/ViewUser';
import AddTaxSlab from '../CompanyModule/TDS/AddTaxSlab';
import LandingPage from '../Website/LandingPage';
import CandidateRegistration from '../CompanyModule/Candidate/CandidateRegistration';
import CandidatesView from '../CompanyModule/Candidate/CandidatesView';
import CandidateDocumentUpload from '../CompanyModule/Candidate/CandidateDocumentUpload';
import UploadSuccess from '../CompanyModule/Candidate/UploadSuccess';
import CandidateLogin from '../Login/CandidateLogin';
import CandidateProfile from '../CompanyModule/Candidate/CandidateProfile';
import CandidateDocumentsView from '../CompanyModule/Candidate/CandidateDocumentsView';
import InvoiceTemplate1 from '../CompanyModule/Settings/InvoiceTemplates/InvoiceTemplate1';
import InvoiceTemplate2 from '../CompanyModule/Settings/InvoiceTemplates/InvoiceTemplate2';
import EmployeeDocumentUpload from '../CompanyModule/Employee/EmployeeDocumentUpload';
import EmployeeDocumentView from '../CompanyModule/Employee/EmployeeDocumentView';
import InvoiceTemplates from '../CompanyModule/Settings/InvoiceTemplates/InvoiceTemplates';
import CandidateToEmployee from '../CompanyModule/Candidate/CandidateToEmployee';
import CompanyPFSubmission from '../AccountantModule/PF/CompanyPFSubmission';
import PFProcessing from '../AccountantModule/PF/PFProcessing';
import PFResponsesView from '../AccountantModule/PF/PFResponsesView';
import PFReceiptsView from '../AccountantModule/PF/PFReceiptsView';
import CompanyPTSubmission from '../AccountantModule/ProfessionalTax/CompanyPTSubmission';
import PTProcessing from '../AccountantModule/ProfessionalTax/PTProcessing';
import PTResponsesView from '../AccountantModule/ProfessionalTax/PTResponsesView';
import PTReceiptsView from '../AccountantModule/ProfessionalTax/PTReceiptsView';
import CompanyTDSSubmission from '../AccountantModule/Tds/CompanyTDSSubmission';
import TDSProcessing from '../AccountantModule/Tds/TDSProcessing'
import TDSResponsesView from '../AccountantModule/Tds/TDSResponsesView';
import TDSReceiptsView from '../AccountantModule/Tds/TDSReceiptsView';



export const allAvailableRoutes = [
  {path: '/main', allowedTypes: ['ems_admin', 'company_admin', 'Admin', 'HR', 'employee']},
  {path: '/companyRegistration', allowedTypes: ['ems_admin'] },
  {path: '/companyView', allowedTypes: ['ems_admin'] },
  {path: '/companylogin', allowedTypes: ['company_admin', 'Admin'] },
  {path: '/accountsView', allowedTypes: ['company_admin', 'Admin'] },
  {path: '/forgotPassword', allowedTypes: ['company_admin', 'Admin']},
  {path: '/employeeSalary', allowedTypes: ['employee'] },
  {path: '/employeeProfile', allowedTypes: ['employee'] },
  {path: '/employeeSalaryView', allowedTypes: ['employee'] },
  {path: '/employeeSalariesView', allowedTypes: ['employee'] },
  {path: '/companySalaryStructure', allowedTypes: ['company_admin', 'Admin'] },
  {path: '/accountRegistration', allowedTypes: ['company_admin', 'Admin'] },
  {path:'/addUser',allowedTypes:['company_admin', 'Admin']},
  {path:'/editUser',allowedTypes:['company_admin', 'Admin','HR', 'Accountant']},
  {path:'/viewUser',allowedTypes:['company_admin', 'Admin']},
  {path: '/department', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/designation', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/employeeRegistration', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/employeeRegister', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/employeeView', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/experienceForm', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/experienceSummary', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/relievingSummary', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/appraisalLetter', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/incrementList', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/internOfferForm', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/internsLetter', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/addAttendance', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/attendanceReport', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/attendanceList', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/employeeSalaryStructure', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/employeesSalaryView', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/payslipGeneration', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/payslipsList', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/companySalaryView', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/offerLetters', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/offerLetterForm', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/offerLetterPreview', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/offerLetter', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/appraisalTemplates', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/experienceLetter', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/relievingProcess', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/relievingTemplates', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/relivingReview', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/internOfferTemplate', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/internsTemplates', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/internPrev', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/payslipTemplates', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/template', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/payslipUpdate1', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/payslipUpdate2', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/payslipUpdate3', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/payslipUpdate4', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/AddEvent', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/employeeSalaryList', allowedTypes: ['company_admin', 'Admin', 'HR','employee'] },
  {path: '/getTaxSlab', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/addTaxSlab', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/companyTdsView', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/candidate-to-employee/:id', allowedTypes: ['company_admin', 'Admin', 'HR'] },
  {path: '/employeeSalaryUpdate', allowedTypes: ['company_admin', 'Admin', 'HR', 'employee'] },
  {path: '/customerRegistration', allowedTypes: ['company_admin', 'Admin', 'Accountant'] },
  {path: '/customersView', allowedTypes: ['company_admin', 'Admin', 'Accountant'] },
  {path: '/productRegistration', allowedTypes: ['company_admin', 'Admin', 'Accountant'] },
  {path: '/productView', allowedTypes: ['company_admin', 'Admin', 'Accountant'] },
  {path: '/invoiceRegistration', allowedTypes: ['company_admin', 'Admin', 'Accountant'] },
  {path: '/invoiceView', allowedTypes: ['company_admin', 'Admin', 'Accountant'] },
  {path: '/invoicePdf', allowedTypes: ['company_admin', 'Admin', 'Accountant'] },
  {path: '/invoiceTemplates', allowedTypes: ['company_admin', 'Admin', 'Accountant'] },
  {path: '/employeePayslip', allowedTypes: ['company_admin', 'Admin','HR','employee', 'Accountant'] },
  {path: '/payslipDoc1', allowedTypes: ['company_admin', 'Admin','HR','employee', 'Accountant'] },
  {path: '/payslipDoc2', allowedTypes: ['company_admin', 'Admin','HR','employee', 'Accountant'] },
  {path: '/payslipDoc3', allowedTypes: ['company_admin', 'Admin','HR','employee', 'Accountant'] },
  {path: '/payslipDoc4', allowedTypes: ['company_admin', 'Admin','HR','employee', 'Accountant'] },
  {path: '/calendar', allowedTypes: ['company_admin', 'Admin','HR','employee', 'Accountant'] },
  {path: '/getcalendar', allowedTypes: ['company_admin', 'Admin','HR','employee', 'Accountant'] },
  {path: '/tds', allowedTypes: ['company_admin', 'Admin','HR','employee', 'Accountant'] },
  {path: '/totalEmployees', allowedTypes: ['company_admin', 'Admin','HR','employee', 'Accountant'] },
  {path: '/employeeList/:status', allowedTypes: ['company_admin', 'Admin','HR','employee', 'Accountant'] },
  {path: '/candidateRegistration', allowedTypes: ['company_admin', 'Admin','HR'] },
  {path: '/candidatesView', allowedTypes: ['company_admin', 'Admin','HR'] },
  {path: '/documentUpload', allowedTypes: ['company_admin', 'Admin','HR','candidate'] },
  {path: '/uploadSuccess', allowedTypes: ['candidate'] },
  {path: '/candidateDashboard', allowedTypes: ['candidate'] },
  {path: '/candidateProfile', allowedTypes: ['candidate'] },
  {path: '/candidateDocumentsView', allowedTypes: ['company_admin', 'Admin','HR','candidate'] },
  {path: '/invoiceTemplate1', allowedTypes: ['company_admin', 'Admin' , 'Accountant'] },
  {path: '/invoiceTemplate2', allowedTypes: ['company_admin', 'Admin' , 'Accountant'] },
  {path: '/employeeDocumentUpload', allowedTypes: ['employee'] },
  {path: '/employeeDocumentView', allowedTypes: ['company_admin', 'Admin','HR','employee'] },
  {path: '/companyPFSubmission', allowedTypes: ['company_admin'] },
  {path: '/pfProcessing', allowedTypes: ['company_admin'] },
  {path: '/pfResponsesView', allowedTypes: ['company_admin'] },
  {path: '/pfReceiptsView', allowedTypes: ['company_admin'] },
  {path: '/companyPTSubmission', allowedTypes: ['company_admin'] },
  {path: '/ptProcessing', allowedTypes: ['company_admin'] },
  {path: '/ptResponsesView', allowedTypes: ['company_admin'] },
  {path: '/ptReceiptsView', allowedTypes: ['company_admin'] },
  {path: '/companyTDSSubmission', allowedTypes: ['company_admin'] },
  {path: '/tdsProcessing', allowedTypes: ['company_admin'] },
  {path: '/tdsResponsesView', allowedTypes: ['company_admin'] },
  {path: '/tdsReceiptsView', allowedTypes: ['company_admin'] },
];

const Routing = () => {
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path='/:company/candidateLogin' element={<CandidateLogin/>}/>
      <Route path='/login' element={<EmsLogin/>}/>
      <Route path='/:company/login' element={<CompanyLogin/>}/>
      <Route path='/resetPassword' element={<Reset />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/main' element={<Body />} />
      <Route path='/forgotPassword' element={<ForgotPassword/>}/>
      <Route path='/anonymouseCmpRegistration' element={<AnonymousCmpRegistration/>}/>
      <Route path='/forbidden' element={<ForbiddenPage/>}/>

      {/* EMS Admin-specific routes */}
      <Route
        path="/companyRegistration"
        element={<ProtectedRoute element={<CompanyRegistration/>} allowedTypes={['ems_admin']} />}
      />
      <Route
        path="/companyView"
        element={<ProtectedRoute element={<CompanyView/>} allowedTypes={['ems_admin']} />}
      />
      

      {/* Company Admin-specific routes */}
      <Route
        path="/accountRegistration"
        element={<ProtectedRoute element={<AccountRegistration/>} allowedTypes={['company_admin', 'Admin']} />}
      />
      <Route
        path="/accountsView"
        element={<ProtectedRoute element={<AccountsView/>} allowedTypes={['company_admin', 'Admin']} />}
      />
      <Route
        path="/companySalaryStructure"
        element={<ProtectedRoute element={<CompanySalaryStructure/>} allowedTypes={['company_admin', 'Admin']} />}
      />
      <Route
        path="/viewUser"
        element={<ProtectedRoute element={<ViewUser/>} allowedTypes={['company_admin', 'Admin']} />}
      />
       <Route
        path="/addUser"
        element={<ProtectedRoute element={<AddUser/>} allowedTypes={['company_admin', 'Admin']} />}
      />
       <Route
        path="/editUser/:id"
        element={<ProtectedRoute element={<UpdateUser/>} allowedTypes={['company_admin', 'Admin', 'HR', 'Accountant']} />}
      /> 

      {/* Employee-specific routes */}
      <Route
        path="/employeeSalaryView"
        element={<ProtectedRoute element={<EmployeeSalaryView/>} allowedTypes={['employee']} />}
      />
      <Route
        path="/employeeProfile"
        element={<ProtectedRoute element={<EmployeeProfile/>} allowedTypes={['employee']} />}
      />
      <Route
        path="/employeeSalariesView"
        element={<ProtectedRoute element={<EmployeeSalaryById/>} allowedTypes={['employee']} />}
      />
      {/* HR-specific routes */}
      <Route
        path="/candidateRegistration"
        element={<ProtectedRoute element={<CandidateRegistration/>} allowedTypes={['company_admin', 'Admin','HR']} />}
      />
      <Route
        path="/candidatesView"
        element={<ProtectedRoute element={<CandidatesView/>} allowedTypes={['company_admin', 'Admin','HR']} />}
      />
      <Route
        path="/documentUpload"
        element={<ProtectedRoute element={<CandidateDocumentUpload/>} allowedTypes={['company_admin', 'Admin','HR', 'candidate']} />}
      /> 
      <Route
        path="/uploadSuccess"
        element={<ProtectedRoute element={<UploadSuccess/>} allowedTypes={['candidate']} />}
      />    
      {/* Company Admin & HR shared routes */}
      <Route
        path="/department"
        element={<ProtectedRoute element={<Department/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/designation"
        element={<ProtectedRoute element={<Designation/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/employeeRegistration"
        element={<ProtectedRoute element={<EmployeeRegistration/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/employeeRegister"
        element={<ProtectedRoute element={<EmployeeRegister/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/candidate-to-employee/:id"
        element={<ProtectedRoute element={<CandidateToEmployee/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/employeeView"
        element={<ProtectedRoute element={<EmployeeView/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/offerLetterForm"
        element={<ProtectedRoute element={<OfferLetterForm/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/offerLetterPreview"
        element={<ProtectedRoute element={<OfferLetterPreview/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/offerLetter"
        element={<ProtectedRoute element={<OfferLetter/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/experienceForm"
        element={<ProtectedRoute element={<ExperienceForm/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/experienceSummary"
        element={<ProtectedRoute element={<ExperienceView/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/relievingSummary"
        element={<ProtectedRoute element={<ExistsEmployesView/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/appraisalLetter"
        element={<ProtectedRoute element={<AddIncrement/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/incrementList"
        element={<ProtectedRoute element={<ViewIncrement/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/internOfferForm"
        element={<ProtectedRoute element={<InternOfferForm/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/internOfferTemplate"
        element={<ProtectedRoute element={<InternOfferLetter/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/internsLetter"
        element={<ProtectedRoute element={<InternShipForm/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/internPrev"
        element={<ProtectedRoute element={<InternOfferPrev/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/addAttendance"
        element={<ProtectedRoute element={<ManageAttendance/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/attendanceReport"
        element={<ProtectedRoute element={<AttendanceReport/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/attendanceList"
        element={<ProtectedRoute element={<AttendanceList/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/employeeSalaryStructure"
        element={<ProtectedRoute element={<EmployeeSalaryStructure/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/employeesSalaryView"
        element={<ProtectedRoute element={<EmployeeSalaryStructureView/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/payslipGeneration"
        element={<ProtectedRoute element={<GeneratePaySlip/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/payslipsList"
        element={<ProtectedRoute element={<ViewPaySlips/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/companySalaryView"
        element={<ProtectedRoute element={<CompanySalaryView/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/offerLetters"
        element={<ProtectedRoute element={<OfferLetters/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/appraisalTemplates"
        element={<ProtectedRoute element={<AppraisalTemplate/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/experienceLetter"
        element={<ProtectedRoute element={<ExperienceLetter/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/relievingProcess"
        element={<ProtectedRoute element={<ExistsEmpRegistration/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/relievingTemplates"
        element={<ProtectedRoute element={<RelievingLetter/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/relivingReview"
        element={<ProtectedRoute element={<Preview/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/internsTemplates"
        element={<ProtectedRoute element={<InternShipTemplates/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/payslipTemplates"
        element={<ProtectedRoute element={<PayslipTemplates/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/template"
        element={<ProtectedRoute element={<Template/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/payslipUpdate1"
        element={<ProtectedRoute element={<PayslipUpdate1/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/payslipUpdate2"
        element={<ProtectedRoute element={<PayslipUpdate2/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/payslipUpdate3"
        element={<ProtectedRoute element={<PayslipUpdate3/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/payslipUpdate4"
        element={<ProtectedRoute element={<PayslipUpdate4/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
       <Route
        path="/AddEvent"
        element={<ProtectedRoute element={<EventForm/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/employeeSalaryUpdate"
        element={<ProtectedRoute element={<EmployeeSalaryUpdate/>} allowedTypes={['company_admin', 'Admin', 'HR', 'employee']} />}
      />

      <Route
        path="/getTaxSlab"
        element={<ProtectedRoute element={<GetTaxSlab/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/companyTdsView"
        element={<ProtectedRoute element={<CompanyTdsView/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/addTaxSlab"
        element={<ProtectedRoute element={<AddTaxSlab/>} allowedTypes={['company_admin', 'Admin', 'HR']} />}
      />
      <Route
        path="/employeeSalaryList"
        element={<ProtectedRoute element={<EmployeeSalaryList/>} allowedTypes={['company_admin', 'Admin', 'HR', 'employee']} />}
      />

      {/* Company Admin & Accountant shared routes */}
      <Route
        path="/customerRegistration"
        element={<ProtectedRoute element={<CustomersRegistration/>} allowedTypes={['company_admin', 'Admin' , 'Accountant']} />}
      />
      <Route
        path="/customersView"
        element={<ProtectedRoute element={<CustomersView/>} allowedTypes={['company_admin', 'Admin' , 'Accountant']} />}
      />
      <Route
        path="/productView"
        element={<ProtectedRoute element={<ProductView/>} allowedTypes={['company_admin', 'Admin' , 'Accountant']} />}
      />
      <Route
        path="/productRegistration"
        element={<ProtectedRoute element={<ProductRegistration/>} allowedTypes={['company_admin', 'Admin' , 'Accountant']} />}
      />
      <Route
        path="/invoiceRegistration"
        element={<ProtectedRoute element={<InvoiceRegistration/>} allowedTypes={['company_admin', 'Admin' , 'Accountant']} />}
      />
      <Route
        path="/invoiceTemplates"
        element={<ProtectedRoute element={<InvoiceTemplates/>} allowedTypes={['company_admin', 'Admin' , 'Accountant']} />}
      />
      <Route
        path="/invoiceView"
        element={<ProtectedRoute element={<InvoiceView/>} allowedTypes={['company_admin', 'Admin' , 'Accountant']} />}
      />
      <Route
        path="/invoicePdf"
        element={<ProtectedRoute element={<InvoicePdf/>} allowedTypes={['company_admin', 'Admin' , 'Accountant']} />}
      />
      <Route
        path="/invoiceTemplate1"
        element={<ProtectedRoute element={<InvoiceTemplate1/>} allowedTypes={['company_admin', 'Admin' , 'Accountant']} />}
      />
      <Route
        path="/invoiceTemplate2"
        element={<ProtectedRoute element={<InvoiceTemplate2/>} allowedTypes={['company_admin', 'Admin' , 'Accountant']} />}
      />
      {/* employee & Accountant shared routes */}
      <Route
        path="/employeePayslip"
        element={<ProtectedRoute element={<EmployeePayslips/>} allowedTypes={['employee' , 'Accountant']} />}
      />

      {/* company_admin, HR, employee & Accountant shared routes */}

      <Route
        path="/payslipDoc1"
        element={<ProtectedRoute element={<PayslipDoc1/>} allowedTypes={['company_admin', 'Admin','HR','employee', 'Accountant']} />}
      />
      <Route
        path="/payslipDoc2"
        element={<ProtectedRoute element={<PayslipDoc2/>} allowedTypes={['company_admin', 'Admin','HR','employee', 'Accountant']} />}
      />
      <Route
        path="/payslipDoc3"
        element={<ProtectedRoute element={<PayslipDoc3/>} allowedTypes={['company_admin', 'Admin','HR','employee', 'Accountant']} />}
      />
      <Route
        path="/payslipDoc4"
        element={<ProtectedRoute element={<PayslipDoc4/>} allowedTypes={['company_admin', 'Admin','HR','employee', 'Accountant']} />}
      />
       <Route
        path="/getcalendar"
        element={<ProtectedRoute element={<GetCalendar/>} allowedTypes={['company_admin', 'Admin', 'HR','employee', 'Accountant']} />}
      />
       <Route 
       path='/taxSlab'
       element={<ProtectedRoute element={<AddTaxSlab/>} allowedTypes={['company_admin', 'Admin','HR','employee', 'Accountant']}/> }
       />
      <Route
        path="/totalEmployees"
        element={<ProtectedRoute element={<TotalEmployees/>} allowedTypes={['company_admin', 'Admin','HR','employee', 'Accountant']} />}
      />
      <Route
        path="/employeeList/:status"
        element={<ProtectedRoute element={<EmployeeList/>} allowedTypes={['company_admin', 'Admin','HR','employee', 'Accountant']} />}
      />
      <Route
        path="/candidateProfile"
        element={<ProtectedRoute element={<CandidateProfile/>} allowedTypes={['candidate']} />}
      />
      <Route
        path="/candidateDocumentsView"
        element={<ProtectedRoute element={<CandidateDocumentsView/>} allowedTypes={['candidate']} />}
      />
      <Route
        path="/employeeDocumentUpload"
        element={<ProtectedRoute element={<EmployeeDocumentUpload/>} allowedTypes={['employee']} />}
      />
      <Route
        path="/employeeDocumentView"
        element={<ProtectedRoute element={<EmployeeDocumentView/>} allowedTypes={['employee']} />}
      />
      <Route
        path="/companyPFSubmission"
        element={<ProtectedRoute element={<CompanyPFSubmission/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/pfProcessing"
        element={<ProtectedRoute element={<PFProcessing/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/pfResponsesView"
        element={<ProtectedRoute element={<PFResponsesView/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/pfReceiptsView"
        element={<ProtectedRoute element={<PFReceiptsView/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/companyPTSubmission"
        element={<ProtectedRoute element={<CompanyPTSubmission/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/ptProcessing"
        element={<ProtectedRoute element={<PTProcessing/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/ptResponsesView"
        element={<ProtectedRoute element={<PTResponsesView/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/ptReceiptsView"
        element={<ProtectedRoute element={<PTReceiptsView/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/companyTDSSubmission"
        element={<ProtectedRoute element={<CompanyTDSSubmission/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/tdsProcessing"
        element={<ProtectedRoute element={<TDSProcessing/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/tdsResponsesView"
        element={<ProtectedRoute element={<TDSResponsesView/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/tdsReceiptsView"
        element={<ProtectedRoute element={<TDSReceiptsView/>} allowedTypes={['company_admin']} />}
      />
    </Routes>
  );
};

export default Routing;

