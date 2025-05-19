import axios from "axios";
import { companyId, employeeId } from "./Auth";
import { json } from "react-router-dom";

const protocol = window.location.protocol;
const hostname = window.location.hostname;


const BASE_URL = `${protocol}//${hostname}:8092/ems`;
const Login_URL = `${protocol}//${hostname}:9090/ems`;

const token = localStorage.getItem("token");
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

export const loginApi = (data) => {
  return axios
    .post(`${Login_URL}/emsadmin/login`, data)
    .then((response) => {
      const { token, refreshToken } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        const {
          path,
          error: { message },
        } = error.response.data;
        console.log(`Error at ${path}: ${message}`);
        return Promise.reject(message);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
      console.log(error);
    });
};
export const CompanyloginApi = (data) => {
  return axios.post(`${Login_URL}/company/login`, data)
    .then(response => {
      const { token, refreshToken } = response.data?.data || {};
      if (token && refreshToken) {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
      }
      return response.data; // Return the full response
    })
    .catch(error => {
      const errorMessage = error.response?.data?.error?.message || "An unknown error occurred.";
      console.error(errorMessage); // Log the error for debugging
      throw new Error(errorMessage); // Throw an error with the message
    });
};


export const ValidateOtp = (data) => {
  return axiosInstance.post(`${Login_URL}/validate`, data);
}

export const forgotPasswordStep1 = (data) => {
  return axios.post(`${Login_URL}/forgot/password`, data);
}

export const forgotPasswordStep2 = (data) => {
  return axios.post(`${Login_URL}/update/password`, data);
}

export const resetPassword = (data, employeeId) => {
  return axiosInstance.patch(`/company/employee/${employeeId}/password`, data);
}


export const CompanyRegistrationApi = (data) => {
  return axiosInstance.post("/company", data);
};

export const companyViewApi = async () => {
  return axiosInstance.get("/company");
};

export const companyViewByIdApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
};

export const companyDetailsByIdApi = async (companyId) => {
  return axiosInstance.get(`/company/${companyId}`);
}

export const companyDeleteByIdApi = async (companyId) => {
  return axiosInstance.delete(`/company/${companyId}`);
};

export const companyUpdateByIdApi = async (companyId, data) => {
  try {
    const response = await axiosInstance.patch(`/company/${companyId}`, data);
    return response.data;  // Return the response data for further handling in the calling function
  } catch (error) {
    // Ensure errors are propagated properly by rethrowing the error
    console.error('Error during company update:', error);  // Optional logging
    throw error;  // Rethrow the error so it can be caught in onSubmit's catch block
  }
};

export const companyPasswordUpdateById = async (companyId) => {
  axiosInstance.patch(`/company/password/${companyId}`);
}

export const DepartmentGetApi = () => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`${company}/department`);
}

export const DepartmentPostApi = (data) => {
  return axiosInstance.post("/department", data);
}
export const DepartmentGetApiById = (departmentId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`${company}/department/${departmentId}`)
}

export const DepartmentDeleteApiById = (departmentId) => {
  const company = localStorage.getItem("companyName")
    return axiosInstance.delete(`${company}/department/${departmentId}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
}

export const DepartmentPutApiById = (departmentId, data) => {
  const company = localStorage.getItem("companyName")
    return axiosInstance.patch(`${company}/department/${departmentId}`, data)
};

export const DesignationGetApi = () => {
  const company = localStorage.getItem("companyName")
    return axiosInstance.get(`${company}/designations`)
    .then(response => {
      return response.data.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
}

export const DesignationPostApi = (data) => {
  return axiosInstance.post('/designation', data);
}

export const DesignationGetApiById = (designationId) => {
  const company = localStorage.getItem("companyName")
    return axiosInstance.get(`${company}/designation/${designationId}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
}

export const DesignationDeleteApiById = (designationId) => {
  const company = localStorage.getItem("companyName")
    return axiosInstance.delete(`${company}/designation/${designationId}`)
}

export const DesignationPutApiById = (designationId, data) => {
   const company = localStorage.getItem("companyName")
  return axiosInstance.patch(`${company}/designation/${designationId}`, data)
};


export const EmployeeGetApi = () => {
   const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee`)
    .then(response => response.data.data) // Assuming response.data.data contains your employee data
    .catch(error => {
      console.error('Error fetching employee data:', error);
      return []; // Return empty array or handle error as needed
    });
}

export const EmployeePostApi = (data) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.post('/employee', data);
}

export const EmployeeGetApiById = (employeeId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/${employeeId}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
}

export const EmployeeDeleteApiById = (employeeId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.delete(`/${company}/employee/${employeeId}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
}

export const EmployeePatchApiById = (employeeId, data) => {
  return axiosInstance.patch(`/employee/${employeeId}`, data)
};

export const roleApi = () => {
  return axiosInstance.get("/role/all");
}


export const EmployeeSalaryPostApi = (employeeId, data) => {
  return axiosInstance.post(`/${employeeId}/salary`, data, {
    headers: {
      'Content-Type': 'application/json', // Ensure content type is JSON
    }
  });
}

export const EmployeeSalaryGetApi = (employeeId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/${employeeId}/salaries`);
}

export const EmployeeSalaryGetApiById = (employeeId, salaryId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/${employeeId}/salary/${salaryId}`);
}

export const EmployeeSalaryPatchApiById = (employeeId, salaryId, data) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.patch(`/employee/${employeeId}/salary/${salaryId}`, data);
}

export const EmployeeSalaryDeleteApiById = (employeeId, salaryId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.delete(`/${company}/employee/${employeeId}/salary/${salaryId}`);
}

  export const EmployeePayslipGenerationPostById = (employeeId, salaryId, data) => {
    return axiosInstance.post(`/${employeeId}/salary/${salaryId}`, data);
  }

export const EmployeePayslipResponse = (salaryId, data) => {
  // Build the query string manually if salaryId is present
  const url = salaryId ? `/payslip?salaryId=${salaryId}` : '/payslip';

  // Make the axios request
  return axiosInstance.post(url, data);
};

export const EmployeePayslipGeneration = (data) => {
  return axiosInstance.post("/salary", data);
}

export const EmployeePayslipUpdate = (employeeId, payslipId, payload) => {
  return axiosInstance.post(`/employee/${employeeId}/payslip/${payslipId}`, payload);
}

export const EmployeePayslipGetById = (employeeId, payslipId, month, year) => {
   const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/${employeeId}/payslip/${payslipId}`, {
    params: {
      month: month,
      year: year
    }
  });
};


export const EmployeePayslipsGet = (employeeId, month, year) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/${employeeId}/payslips`, {
    params: {
      month, year
    }
  });
}

export const AllEmployeePayslipsGet = (month, year) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/all/payslip`, {
    params: {
      month, year
    }
  });
}

export const EmployeePaySlipDownloadById = async (employeeId, payslipId) => {
  const company = localStorage.getItem("companyName");
  try {
    // Make the API request with specific headers for this request
    const response = await axiosInstance.get(`/${company}/employee/${employeeId}/download/${payslipId}`, {
      responseType: 'blob', // Handle the response as a binary blob
      headers: {
        'Accept': 'application/pdf', // Accept PDF format
      }
    });

    // Create a URL for the blob and trigger the download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${employeeId}.pdf`; // Customize file name as needed
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return true; // Indicate success

  } catch (error) {
    console.error('Download error:', error);
    throw error; // Rethrow error for handling in the calling function
  }
};

export const EmployeePayslipDeleteById = (employeeId, payslipId) => {
  const company = localStorage.getItem("comapnyName")
  return axiosInstance.delete(`/${company}/employee/${employeeId}/payslip/${payslipId}`);
}

export const AttendanceManagementApi = (formData) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.post(`/${company}/employee/attendance`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export const AttendanceReportApi = (employeeId, month, year) => {

  const companyName = localStorage.getItem("companyName")
  return axiosInstance.get(`/${companyName}/attendance`, {
    params: { employeeId, month, year }
  });
}

export const AttendancePatchById = (employeeId, attendanceId, data) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.patch(`/${company}/employee/${employeeId}/attendance/${attendanceId}`, data);
}

export const AttendanceDeleteById = (employeeId, attendanceId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.delete(`/${company}/employee/${employeeId}/attendance/${attendanceId}`);
}

export const CompanyImagePatchApi = (companyId, formData) => {
  return axiosInstance.patch(`/company/image/${companyId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const CompanyStampPatchApi = (companyId, formData) => {
  return axiosInstance.patch(`/company/stampImage/${companyId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const CompanyImageGetApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}/image`);
}

export const AllowancesGetApi = () => {
  return axiosInstance.get(`/allowances`);
}

export const DeductionsGetApi = () => {
  return axiosInstance.get(`/deductions`);
}

export const CompanySalaryStructurePostApi = (data) => {
  return axiosInstance.post(`/salary/Structure`, data);
};

export const CompanySalaryStructureGetApi = () => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`${company}/salary`);
}

export const PayslipTemplate = (data) => {
  return axiosInstance.patch(`/template`, data);
};

export const TemplateSelectionPatchAPI = (data) => {
  return axiosInstance.patch(`/template`, data);
};

export const TemplateGetAPI = (data) => {
  const companyName = localStorage.getItem("companyName")
  return axiosInstance.get(`/${companyName}/template`, data);
};

export const RelievingDownloadPostApi = (employeeId,data) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.post(`/${company}/employee/${employeeId}/download`, data);
}
export const RelievingFormPostApi = (employeeId, data) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.post(`/company/${company}/employee/${employeeId}/relieving`, data);
}

export const RelievingGetApiById = (employeeId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/relieving/${employeeId}`);
}

export const RelievingGetAllApi=()=>{
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/relieving`);
}

export const RelievingDeleteApiById = (employeeId,id) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.delete(`/${company}/employee/${employeeId}/relieve/${id}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
}

export const RelievingPatchApiById = (employeeId,relieveId, data) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.patch(`/${company}/employee/${employeeId}/relieve/${relieveId}`, data)
};

export const RelievingLetterDownload = async (employeeId,payload) => {
  const company = localStorage.getItem("companyName")
  try {
    const response = await axiosInstance.post(`/${company}/employee/${employeeId}/download`,payload, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
      }
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `RelievingLetter.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export const ExperienceFormPostApi = async (payload) => {
  try {
    const response = await axiosInstance.post(`/experienceletter/upload`, JSON.stringify(payload), // Ensure JSON format
      {
        responseType: 'blob', // Handle binary response for file download
        headers: {
          'Content-Type': 'application/json', // Correct content type
          'Accept': 'application/pdf',        // Expected response format
        },
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExperienceLetter.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export const OfferLetterDownload = async (payload) => {
  try {
    const response = await axiosInstance.post(`/offerletter/upload`,payload, {
      responseType: 'blob', 
      headers: {
        'Accept': 'application/pdf', 
      }
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `offer_letter.pdf`; 
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return true; 

  } catch (error) {
    console.error('Download error:', error);
    throw error; 
  }
};

export const InternshipCertificateDownload= async (payload) => {
  try {
    const response = await axiosInstance.post(`/internship/upload`,payload, {
      responseType: 'blob', // Handle binary response for file download
      headers: {
        'Content-Type': 'application/json', // Correct content type
        'Accept': 'application/pdf',        // Expected response format
      },
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `internship_letter.pdf`; 
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true; 
  } catch (error) {
    console.error('Download error:', error);
    throw error; 
  }
};

export const AppraisalLetterDownload = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `/appraisal/upload`,
      JSON.stringify(payload), // Ensure JSON format
      {
        responseType: 'blob', // Handle binary response for file download
        headers: {
          'Content-Type': 'application/json', // Correct content type
          'Accept': 'application/pdf',        // Expected response format
        },
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Appraisal.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Download error:', error.response || error.message);
    throw error; // Re-throw for handling by calling code
  }
};

export const CustomerGetAllApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}/customer/all`);
};

export const CustomerPostApi = (companyId,data) => {
  return axiosInstance.post(`/company/${companyId}/customer`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Error creating customer:', error);
      throw error;
    });
};

export const CustomerGetApiById = (companyId,customerId) => {
  return axiosInstance.get(`/company/${companyId}/customer/${customerId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching customer by ID:', error);
      throw error;
    });
};

export const CustomerDeleteApiById = (companyId,customerId) => {
  return axiosInstance.delete(`/company/${companyId}/customer/${customerId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting customer by ID:', error);
      throw error;
    });
};

export const CustomerPutApiById = (companyId, customerId, data) => {
  return axiosInstance.patch(`/company/${companyId}/customer/${customerId}`, data,{
    headers:{
      "Content-Type":'application/json'
    }
  })
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating customer by ID:', error);
      throw error;
    });
};

export const ProductGetAllApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}/product/all`);
};

export const ProductPostApi = (companyId, data) => {
  return axiosInstance.post(`/company/${companyId}/product`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Error creating product:', error);
      throw error;
    });
};

export const ProductGetApiById = (companyId, productId) => {
  return axiosInstance.get(`/company/${companyId}/product/${productId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching product by ID:', error);
      throw error;
    });
};

export const ProductDeleteApiById = (companyId, productId) => {
  return axiosInstance.delete(`/company/${companyId}/product/${productId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting product by ID:', error);
      throw error;
    });
};

export const ProductPutApiById = (companyId, productId, data) => {
  return axiosInstance.patch(`/company/${companyId}/product/${productId}`, data, {
    headers: {
      "Content-Type": 'application/json'
    }
  })
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating product by ID:', error);
      throw error;
    });
};


// Bank Get All API
export const BankGetAllApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}/bank`)
    // .then(response => response.data)
    // .catch(error => {
    //   console.error('Error fetching all banks:', error);
    //   throw error;
    // });
};

// Bank Post API (Create a new bank)
export const BankPostApi = (companyId, data) => {
  return axiosInstance.post(`/company/${companyId}/bank`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Error creating bank:', error);
      throw error;
    });
};

// Bank Get API by ID
export const BankGetApiById = (companyId, bankId) => {
  return axiosInstance.get(`/company/${companyId}/bank/${bankId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching bank by ID:', error);
      throw error;
    });
};

// Bank Delete API by ID
export const BankDeleteApiById = (companyId, bankId) => {
  return axiosInstance.delete(`/company/${companyId}/bank/${bankId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting bank by ID:', error);
      throw error;
    });
};

// Bank Patch API by ID (Update a bank)
export const BankPutApiById = (companyId, bankId, data) => {
  return axiosInstance.patch(`/company/${companyId}/bank/${bankId}`, data, {
    headers: {
      "Content-Type": 'application/json'
    }
  })
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating bank by ID:', error);
      throw error;
    });
};

export const InvoicePostApi = (companyId, customerId, data) => {
  return axiosInstance.post(`/company/${companyId}/customer/${customerId}/invoice`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Error creating product:', error);
      throw error;
    });
};

export const InvoiceGetAllApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}/invoice`);
};

export const InvoiceGetByCustomerIdApi = (companyId, customerId) => {
  return axiosInstance.get(`/company/${companyId}/customer/${customerId}/invoice`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching product by ID:', error);
      throw error;
    });
};

export const InvoiceGetApiById = (companyId, customerId, invoiceId) => {
  return axiosInstance.get(`/company/${companyId}/customer/${customerId}/invoice/${invoiceId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching product by ID:', error);
      throw error;
    });
};

export const InvoiceDownloadById = async (companyId, customerId, invoiceId) => {
  try {
    // Make the API request with specific headers for this request
    const response = await axiosInstance.get(`/company/${companyId}/customer/${customerId}/downloadInvoice/${invoiceId}`, {
      responseType: 'blob', // Handle the response as a binary blob (PDF)
      headers: {
        'Accept': 'application/pdf',  // Indicate that we expect a PDF
      },
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));

    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${customerId}_${invoiceId}.pdf`; // Customize the filename
    document.body.appendChild(link);
    link.click(); // Trigger the download
    document.body.removeChild(link); // Clean up the link element

    // Optionally revoke the URL to free up memory
    window.URL.revokeObjectURL(url);

    return true;  // Indicate success
  } catch (error) {
    console.error('Download error:', error);
    return false;  // Indicate failure
  }
};


