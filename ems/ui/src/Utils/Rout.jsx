import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import EmsLogin from '../Login/EmsLogin';
import CompanyLogin from '../Login/CompanyLogin';
import CompanyRegistration from '../EMSModule/Company/CompanyRegistration';
import Body from '../LayOut/Body';
import CompanyView from '../EMSModule/Company/CompanyView';
import Department from '../CompanyModule/Department/Department';
import Designation from '../CompanyModule/Designation/Designation';
import EmployeeRegistration from '../CompanyModule/Employee/EmployeeRegistration';
import EmployeeView from '../CompanyModule/Employee/EmployeeView';
import ExistsEmpRegistration from '../CompanyModule/ExistingProcess/ExistsEmpRegistration';
import ExistsEmployeeView from '../CompanyModule/ExistingProcess/ExistsEmployesView';
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

const Rout = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPage = location.pathname + location.search;
    const token = sessionStorage.getItem('token');

    // Store currentPage in sessionStorage
    sessionStorage.setItem('currentPage', currentPage);

    // Optionally, if you want to store the token (e.g., on login)
    if (token) {
      sessionStorage.setItem('token', token);
    }
  }, [location]);

  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key === 'currentPage' || event.key === 'token') {
        const newPage = sessionStorage.getItem('currentPage');
        const token = sessionStorage.getItem('token');

        if (newPage && token) {
          const currentUrl = window.location.pathname + window.location.search;
          if (currentUrl !== newPage) {
            // Attach token to the URL or handle it as needed
            window.location.href = `${newPage}?token=${token}`;
          }
        }
      }
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const initialPage = sessionStorage.getItem('currentPage');
    const token = sessionStorage.getItem('token');

    if (initialPage && token) {
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== initialPage) {
        // Attach token to the URL or handle it as needed
        window.location.href = `${initialPage}?token=${token}`;
      }
    }
  }, []);


  return (
    <Routes>
      <Route path='/' element={<Message />}></Route>
      <Route path='/login' element={<EmsLogin />}></Route>
      <Route path='/:company/login' element={<CompanyLogin />}></Route>
      <Route path='/resetPassword' element={<Reset />}></Route>
      <Route path='/profile' element={<Profile />}></Route>
      <Route path='/main' element={<Body />}></Route>
      <Route path='/companyRegistration' element={<CompanyRegistration />}></Route>
      <Route path='/companyView' element={<CompanyView />}></Route>
      <Route path='/department' element={<Department />}></Route>
      <Route path='/designation' element={<Designation />}></Route>
      <Route path='/employeeRegistration' element={<EmployeeRegistration />}></Route>
      <Route path='/employeeView' element={<EmployeeView />}></Route>
      <Route path='/relievingProcess' element={<ExistsEmpRegistration />}></Route>
      <Route path='/relievingSummary' element={<ExistsEmployeeView />}></Route>
      <Route path='/employeeProfile' element={<EmployeeProfile />}></Route>
      <Route path='/companySalaryStructure' element={<CompanySalaryStructure />}></Route>
      <Route path='/companySalaryView' element={<CompanySalaryView />}></Route>
      <Route path='/offerLetters' element={<OfferLetters />}></Route>
      <Route path='/template' element={<Template />}></Route>
      <Route path='/payslipTemplates' element={<PayslipTemplates />}></Route>
      <Route path='/employeeSalaryStructure' element={<EmployeeSalaryStructure />}></Route>
      <Route path='/employeeSalaryUpdate' element={<EmployeeSalaryUpdate />}></Route>
      <Route path='/employeeSalaryList' element={<EmployeeSalaryList />}></Route>
      <Route path='/payslipGeneration' element={<GeneratePaySlip />}></Route>
      <Route path='/payslipsList' element={<ViewPaySlips />}></Route>
      <Route path='/appraisal' element={<AddIncrement />}></Route>
      <Route path='/incrementList' element={<ViewIncrement />}></Route>
      <Route path='/payslip' element={<PaySlipDoc />}></Route>
      <Route path='/addAttendance' element={<ManageAttendance />}></Route>
      <Route path='/attendanceList' element={<AttendanceList />}></Route>
      <Route path='/attendanceReport' element={<AttendanceReport />}></Route>
      <Route path='/employeePayslip' element={<EmployeePayslips />}></Route>
      <Route path='/employeeSalary' element={<EmployeeSalaryById />}></Route>
      <Route path='/employeeSalaryView' element={<EmployeeSalaryView/>}></Route>
      <Route path='/offerLetter' element={<OfferLetter />}></Route>
      <Route path='/payslipLetter' element={<PaySlipLetter />}></Route>
      <Route path='/hikeLetter' element={<HikeLetter />}></Route>
      <Route path='/experienceLetter' element={<ExperienceLetter />}></Route>
      <Route path='/existingEmployee' element={<ExistingLetter />}></Route>
      <Route path='/experienceSummary' element={<ExperienceView/>}></Route>
      <Route path='/experienceForm' element={<ExperienceForm/>}></Route>
      <Route path='/offerLetterForm' element={<OfferLetterForm/>}></Route>
      <Route path='/offerLetterPreview' element={<OfferLetterPreview/>}></Route>
      <Route path='/forgotPassword' element={<ForgotPassword />}></Route>
      <Route path='/relievingTemplates' element={<RelievingLetter/>}></Route>
      <Route path='/relivingReview' element={<Preview/>}></Route>
      <Route path='/internsLetter' element={<InternShipForm/>}></Route>
      <Route path='/internsTemplates' element={<InternShipTemplates/>}></Route>
      <Route path='/appraisalLetter' element={<AddIncrement/>}></Route>
      <Route path='/appraisalTemplates' element={<AppraisalTemplate/>}></Route>
      <Route path='/payslipUpdate1' element={<PayslipUpdate1 />}></Route>
      <Route path='/payslipUpdate2' element={<PayslipUpdate2 />}></Route>
      <Route path='/payslipUpdate3' element={<PayslipUpdate3 />}></Route>
      <Route path='/payslipUpdate4' element={<PayslipUpdate4 />}></Route>
      <Route path='/payslipDoc1' element={<PayslipDoc1 />}></Route>
      <Route path='/payslipDoc2' element={<PayslipDoc2/>}></Route>
      <Route path='/payslipDoc3' element={<PayslipDoc3 />}></Route>
      <Route path='/payslipDoc4' element={<PayslipDoc4/>}></Route>
      <Route path='/customerRegistration' element={<CustomersRegistration/>}></Route>
      <Route path='/customersView' element={<CustomersView/>}></Route>
      <Route path='/productRegistartion' element={<ProductRegistration/>}></Route>
      <Route path='/productsView' element={<ProductView/>}></Route>
      <Route path='/invoiceRegistartion' element={<InvoiceRegistration/>}></Route>
      <Route path='/invoiceView' element={<InvoiceView/>}></Route>
      <Route path='/invoicePdf' element={<InvoicePdf/>}></Route>
      <Route path='/accountRegistration' element={<AccountRegistration/>}></Route>
      <Route path='/accountsView' element={<AccountsView/>}></Route>
      <Route path='/:company/createPassword' element={<CreatePassword/>}></Route>
    </Routes>
  );
};

export default Rout;