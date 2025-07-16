import axios from "axios";

const protocol = window.location.protocol;
const hostname = window.location.hostname;


const BASE_URL = `${protocol}//${hostname}:8092/ems`;
const Login_URL = `${protocol}//${hostname}:9090/ems`;
// New microservice (port 8093)
const MICROSERVICE_URL = `${protocol}//${hostname}:8093/ems`;

// ✅ Create Axios Instance (Without Token)
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
const microserviceAxiosInstance = axios.create({
  baseURL: MICROSERVICE_URL,  // Instance for 8093 microservices
});

// ✅ Attach Token Dynamically Using Axios Interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Attach Token Dynamically Using Axios Interceptors
const attachTokenInterceptor = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Only set Content-Type if it's not FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
};

axiosInstance.interceptors.request.use(attachTokenInterceptor);
microserviceAxiosInstance.interceptors.request.use(attachTokenInterceptor);

// // Refresh token function
// const refreshAuthToken = async () => {
//   const refreshToken = localStorage.getItem("refreshToken");
//   try {
//     const response = await axios.post(`${Login_URL}/auth/refresh`, { refreshToken });
//     const { token, refreshToken: newRefreshToken } = response.data.data;
//     localStorage.setItem("token", token);
//     localStorage.setItem("refreshToken", newRefreshToken);
//     return token;
//   } catch (err) {
//     console.error("Token refresh failed:", err);
//     localStorage.clear();
//     window.location.href = "/login";
//     return null;
//   }
// };

// // Add response interceptor to auto-refresh token
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const newToken = await refreshAuthToken();
//       if (newToken) {
//         originalRequest.headers.Authorization = `Bearer ${newToken}`;
//         return axiosInstance(originalRequest);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

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

export const CandidateloginApi = (data) => {
  return axios.post(`${Login_URL}/candidate/login`, data)
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

export const resendPasswordOTP = (data) => {
  return axios.post(`${Login_URL}/resend/otp`, data);
}

export const CompanyRegistrationApi = (data) => {
  return axiosInstance.post("/company", data);
};

export const CompanyAddApi = (data) => {
  return axios.post(`${BASE_URL}/company/add`,data)
};

export const companyViewApi = async () => {
  return axiosInstance.get("/company");
};

export const companyViewByIdApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}`)
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

export const updateCompanyStatusApi = (id, status) => {
  return axiosInstance.patch(`company/${id}/status/${status}`)
};

export const companyPasswordUpdateById = async (companyId) => {
  axiosInstance.patch(`/company/password/${companyId}`);
}

export const DepartmentGetApi = () => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`${company}/department`);
}

export const DepartmentPostApi = async (departmentData) => {
  try {
    const response = await axiosInstance.post("/department", departmentData);
    
    // Debug the raw response
    console.log('API Response:', response.data);
    
    // Handle case where API returns just {path, message, data: 'success'}
    if (response.data?.data === 'success') {
      return {
        id: `temp-${Date.now()}`, // Temporary ID
        name: departmentData.name,
        companyName: departmentData.companyName,
        type: "department"
      };
    }
    
    // Handle case where API returns the full department
    if (response.data?.data?.name) {
      return response.data.data;
    }
    
    throw new Error('API returned unexpected format');
  } catch (error) {
    console.error('DepartmentPostApi error:', {
      error: error.response?.data || error.message,
      request: departmentData
    });
    throw error;
  }
};
export const DepartmentGetApiById = (departmentId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`${company}/department/${departmentId}`)
}

export const DepartmentDeleteApiById = (departmentId) => {
  const company = localStorage.getItem("companyName");
  if (!company) {
    throw new Error("Company Name is not found");
  }
  
  return axiosInstance.delete(`/${company}/department/${departmentId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }
  })
  .then(response => response.data)
  .catch(error => {
    console.error('Delete Department Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config // This will show the full request details
    });
    throw error;
  });
};
export const DepartmentPutApiById = (departmentId, data) => {
  const company = localStorage.getItem("companyName")
    return axiosInstance.patch(`${company}/department/${departmentId}`, data)
};

export const DesignationGetApi = async (departmentId) => {
  const company = localStorage.getItem("companyName");
  try {
    const response = await axiosInstance.get(
      `/${company}/department/${departmentId}/designation`
    );
    
    // Check if response exists and has data with expected structure
    if (!response?.data) {
      console.warn("No data in response");
      throw new Error("No data received from server");
    }

    // Validate response structure
    if (response.data.message !== "Success") {
      console.warn("API did not return success message");
      throw new Error("API request was not successful");
    }

    if (!Array.isArray(response.data.data)) {
      console.warn("Unexpected data format in response");
      throw new Error("Invalid data format received");
    }

    return response.data.data; // Return the array of designations
    
  } catch (error) {
    console.error('Designation API Error:', {
      departmentId,
      status: error.response?.status,
      url: error.config?.url,
      error: error.message,
    });
    throw error; // Re-throw the error to be caught by the thunk
  }
};

export const DesignationPostApi = (departmentId, data) => {
  return axiosInstance.post(`/department/${departmentId}/designation`, data);
};

export const DesignationGetApiById = (departmentId, designationId) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance
    .get(`/${company}/department/${departmentId}/designation/${designationId}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error fetching designation by ID:', error);
      throw error;
    });
};

export const DesignationDeleteApiById = (departmentId, designationId) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.delete(`/${company}/department/${departmentId}/designation/${designationId}`);
};

export const DesignationPutApiById = (departmentId, designationId, data) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.patch(
    `/${company}/department/${departmentId}/designation/${designationId}`,
    data
  );
};


export const EmployeeGetApi = () => {
   const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee`)
}

export const EmployeePFDetailsGetAPI = () => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.get(`/${company}/employee/accounts`);
};

// PF Api Files
export const EmployeePFComparingAPI = (month, year, file) => {
  const company = localStorage.getItem("companyName");
  const formData = new FormData();
  formData.append("file", file);

  return microserviceAxiosInstance.post(`/${company}/pf/comparing`, formData, {
    params: {
      month: month,
      year: year
    }
  });
};

export const RegisterPFEmployeeAPI = (employeeData) => {
  const company = localStorage.getItem("companyName");
  return microserviceAxiosInstance.post(`/${company}/employees/pf/register`, employeeData);
};

export const SubmitPFForProcessingAPI = (month, year, file) => {
  const company = localStorage.getItem("companyName");
  const formData = new FormData();
  formData.append("file", file);

  return microserviceAxiosInstance.post(`/${company}/employees/pf`, formData, {
    params: {
      month,
      year
    }
  });
};

export const GetPFForMonthAndYearAPI = (month, year) => {
  const company = localStorage.getItem("companyName"); 

  return microserviceAxiosInstance.get(`/${company}/employee/account`, {
    params: {
      month: month,
      year: year
    }
  });
};

export const AddPFReceiptsAPI = (data) => {
  const company = localStorage.getItem("companyName");
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return microserviceAxiosInstance.post(`/${company}/pf/receipt`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const AddPFResponseAPI = (data) => {
  const companyName = localStorage.getItem("companyName");
  
  return microserviceAxiosInstance.post(`/${companyName}/pf/response`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const GetPFResponsesAPI = (month, year) => {
  const companyName = localStorage.getItem("companyName");

  return microserviceAxiosInstance.get(`/${companyName}/pf/response`, {
    params: {
      ...(month && { month }),
      ...(year && { year })
    },
    headers: {
      "Content-Type": "application/json"
    }
  });
};

// PT Api Files
export const EmployeePTComparingAPI = (month, year, file) => {
  const company = localStorage.getItem("companyName");
  const formData = new FormData();
  formData.append("file", file);

  return microserviceAxiosInstance.post(`/${company}/employee/pt`, formData, {
    params: {
      month: month,
      year: year
    }
  });
};

export const SubmitPTForProcessingAPI = (month, year, file) => {
  const company = localStorage.getItem("companyName");
  const formData = new FormData();
  formData.append("file", file);

  return microserviceAxiosInstance.post(`/${company}/employees/pt`, formData, {
    params: {
      month,
      year
    }
  });
};

export const AddPTReceiptsAPI = (data) => {
  const company = localStorage.getItem("companyName");
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return microserviceAxiosInstance.post(`/${company}/pt/receipt`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};




export const EmployeeNoAttendanceGetAPI = (month, year) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.get(`/${company}/withoutAttendance`, {
    params: { month, year }, // Passing month and year as query params
  });
};


export const EmployeePostApi = (data) => {
  return axiosInstance.post('/employee', data);
}

export const uploadEmployeeImage = (employeeId, file) => {
  const companyName = localStorage.getItem("companyName");
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post(`/${companyName}/employee/${employeeId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const getEmployeeImage = (employeeId) => {
  const companyName = localStorage.getItem("companyName");
  return axiosInstance.get(`/${companyName}/employee/${employeeId}/image`);
};


export const CandidateToEmployeePostApi = (candidateId, data) => {
  return axiosInstance.post(`/candidate/${candidateId}`, data);
}


export const EmployeeGetApiById = (employeeId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/${employeeId}`)
}

export const BankNamesGetApi = () => {
  return axiosInstance.get("bank/list")
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

export const downloadEmployeesFileAPI = async (format, selectedFields, showToast) => {
  const company = localStorage.getItem("companyName");
  try {
    showToast("Downloading file...", "info"); // Show info toast before downloading

    const response = await axiosInstance.post(
      `${company}/employees/download?format=${format}`,
      { selectedFields },
      {
        responseType: "blob",
      }
    );

    // Check if response is an error by trying to parse JSON from Blob
    const contentType = response.headers["content-type"];
    if (contentType && contentType.includes("application/json")) {
      // Convert Blob to JSON
      const errorText = await response.data.text();
      const errorJson = JSON.parse(errorText);

      if (errorJson?.error?.message) {
        throw new Error(errorJson.error.message); // Throw extracted API error message
      }
    }

    // If the response is valid, proceed with the download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Employees_data.${format === "excel" ? "xlsx" : "pdf"}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("Download successful!", "success"); // Show success toast
  } catch (error) {
    let errorMessage = "Download failed. Please try again.";

    if (error.response) {
      const errorBlob = error.response.data;
      try {
        const errorText = await errorBlob.text();
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson?.error?.message || errorMessage;
      } catch (jsonError) {
        console.error("Failed to parse error response:", jsonError);
      }
    } else {
      errorMessage = error.message;
    }

    showToast(`❌ ${errorMessage}`, "error");
  }
};

export const downloadEmployeeBankDataAPI = async (format, showToast) => {
  const company = localStorage.getItem("companyName")

  try {
    showToast("Downloading file...", "info"); // Show info toast before downloading

    const response = await axiosInstance.get(`${company}/employees/bank?format=${format}`, {
      responseType: "blob",
    });

     // Check if response is an error by trying to parse JSON from Blob
     const contentType = response.headers["content-type"];
     if (contentType && contentType.includes("application/json")) {
       // Convert Blob to JSON
       const errorText = await response.data.text();
       const errorJson = JSON.parse(errorText);
 
       if (errorJson?.error?.message) {
         throw new Error(errorJson.error.message); // Throw extracted API error message
       }
     }

    // If the response is valid, proceed with the download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Employees_Bank_Data.${format === "excel" ? "xlsx" : "pdf"}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("Download successful!", "success"); // Show success toast
  } catch (error) {
    let errorMessage = "Download failed. Please try again.";

    if (error.response) {
      const errorBlob = error.response.data;
      try {
        const errorText = await errorBlob.text();
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson?.error?.message || errorMessage;
      } catch (jsonError) {
        console.error("Failed to parse error response:", jsonError);
      }
    } else {
      errorMessage = error.message;
    }

    showToast(`❌ ${errorMessage}`, "error");
  }
};

export const downloadAttendanceFileAPI = async (format, year, month, employeeId, showToast) => { 
  const company = localStorage.getItem("companyName");

  if (!format) {
    showToast("⚠️ Please select a file format!", "warning");
    return;
  }

  try {
    showToast("📥 Downloading file...", "info");

    const response = await axiosInstance.get(`${company}/employee/attendance/download`, {
      params: { format, month: month || "", year: year || "", employeeId: employeeId || "" },
      responseType: "blob", // Response is expected as a file, but errors can still be in JSON
    });

    // Check if response is an error by trying to parse JSON from Blob
    const contentType = response.headers["content-type"];
    if (contentType && contentType.includes("application/json")) {
      // Convert Blob to JSON
      const errorText = await response.data.text();
      const errorJson = JSON.parse(errorText);

      if (errorJson?.error?.message) {
        throw new Error(errorJson.error.message); // Throw extracted API error message
      }
    }

    // If no error, proceed with file download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Employees_Attendance_data.${format === "excel" ? "xlsx" : "pdf"}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("✅ Download successful!", "success");
  } catch (error) {
    console.error("Error downloading file:", error);

    // Extract API error message properly
    let errorMessage = "Download failed. Please try again.";

    if (error.response) {
      const errorBlob = error.response.data;
      try {
        const errorText = await errorBlob.text();
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson?.error?.message || errorMessage;
      } catch (jsonError) {
        console.error("Failed to parse error response:", jsonError);
      }
    } else {
      errorMessage = error.message;
    }

    showToast(`❌ ${errorMessage}`, "error");
  }
};

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

export const EmployeesSalariesGetApi = () => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/salaries`);
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

export const downloadEmployeeSalaryDataAPI = async (format, selectedFields, showToast) => {
  const company = localStorage.getItem("companyName");

  try {
    showToast("Downloading file...", "info"); // Show info toast before downloading

    const response = await axiosInstance.post(
      `${company}/employee/salaries/download?format=${format}`,
      { selectedFields },
      {
        responseType: "blob",
      }
    );

    // Check if response is an error by trying to parse JSON from Blob
    const contentType = response.headers["content-type"];
    if (contentType && contentType.includes("application/json")) {
      const errorText = await response.data.text();
      const errorJson = JSON.parse(errorText);

      if (errorJson?.error?.message) {
        throw new Error(errorJson.error.message);
      }
    }

    // Proceed with file download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Employees_Salaries_Data.${format === "excel" ? "xlsx" : "pdf"}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("Download successful!", "success");
  } catch (error) {
    let errorMessage = "Download failed. Please try again.";

    if (error.response) {
      const errorBlob = error.response.data;
      try {
        const errorText = await errorBlob.text();
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson?.error?.message || errorMessage;
      } catch (jsonError) {
        console.error("Failed to parse error response:", jsonError);
      }
    } else {
      errorMessage = error.message;
    }

    showToast(`❌ ${errorMessage}`, "error");
  }
};



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
        'Accept': 'application/json', // Change from application/pdf to application/json
      }
    });

     const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip.pdf`;
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

export const RelievingLetterDownload = async (employeeId, draft, payload) => {
  const company = localStorage.getItem("companyName")
  try {
    const response = await axiosInstance.post(`/${company}/employee/${employeeId}/download?draft=${draft}`,payload, {
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

export const InternOfferLetterDownload = async (payload) => {
  try {
    const response = await axiosInstance.post(`/internShipLetter/download`,payload, {
      responseType: 'blob', 
      headers: {
        'Accept': 'application/pdf', 
      }
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Intern_offer_letter.pdf`; 
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
  // Validate inputs
  if (!companyId || !customerId) {
    console.error('Missing required parameters:', { companyId, customerId });
    return Promise.reject(new Error('Missing companyId or customerId'));
  }

  return axiosInstance.post(
    `/company/${encodeURIComponent(companyId)}/customer/${encodeURIComponent(customerId)}/invoice`,
    data
  )
  .then(response => response.data)
  .catch(error => {
    console.error('Error creating invoice:', error);
    throw error;
  });
};

export const InvoiceGetAllApi = (companyId, customerId = null) => {
  const params = {};
  if (customerId) {
    params.customerId = customerId;
  }
  return axiosInstance.get(`/company/${companyId}/invoice`, { params });
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
export const DialCodesListApi = () => {
  return axiosInstance.get(`/dialcodes/list`);
}
export const TdsGetApi = () => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.get(`/company/${company}/tds`);
};
export const TdsPostApi = (data) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.post(`/company/${company}/tds`, data, {
    headers: { "Content-Type": "application/json" },
  });
};
export const TdsPatchApi = (id, data) => {
  const company = localStorage.getItem("companyName"); // Retrieve company name
  return axiosInstance.patch(`/company/${company}/tds/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });
};
export const getCompanyTdsByYear = (year) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.get(`/company/${company}/tds/${year}/year`);
};

export const calendarPostAPI=async (data)=>{
  const company = localStorage.getItem("companyName")
    try {
    const response = await axiosInstance.post(`/company/${company}/calendar`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }  
}

export const CalendarGetApi=()=>{
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/company/${company}/calendar`);
}

export const CalendarGetApiById=(id)=>{
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/company/${company}/calendar/${id}`);
}

export const TodayCalendarGetApi=()=>{
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/company/${company}/calendar/today`);
}

export const calendarPatchAPIById=async (data,id)=>{
  const company = localStorage.getItem("companyName")
    try {
    const response = await axiosInstance.patch(`/company/${company}/calendar/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }  
}

export const CalendarDeleteByIdApi = async (id) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.delete(`/company/${company}/calendar/${id}`);
};

export const UserGetApi = () => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.get(`/${company}/users`);
};
export const UserPostApi = (data) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.post(`/${company}/user`, data);
};
export const UserPatchApi = (id, data) => {
  const company = localStorage.getItem("companyName"); // Retrieve company name
  return axiosInstance.patch(`/${company}/user/${id}`, data);
};
export const getUserById = (id) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.get(`/${company}/user/${id}`);
};
export const DeleteUserById = (id) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.delete(`/${company}/user/${id}`);
};

// Candidate apis
export const CandidatePostApi = async (candidateData) => {
    try {
        const response = await axiosInstance.post("/candidate", candidateData);
        
        // Return the full response object
        return {
            status: response.status,
            data: response.data,
            fullResponse: response
        };
    } catch (error) {
        console.error('API Error:', {
            config: error.config,
            response: error.response,
            message: error.message
        });
        
        // Return a consistent error structure
        return {
            status: error.response?.status || 500,
            error: true,
            message: error.response?.data?.message || error.message,
            fullResponse: error.response
        };
    }
};
export const CandidateGetAllApi = () => {
  const company = localStorage.getItem("companyName");
  if (!company) {
    throw new Error("Company Name is not found");
  }
  
  return axiosInstance.get(`/candidate/${company}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }
  });
};

export const CandidateGetByIdApi = (candidateId) => {
  const company = localStorage.getItem("companyName");
  if (!company) {
    throw new Error("Company Name is not found");
  }
  return axiosInstance.get(`/candidate/${company}/${candidateId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }
  });
};

export const CandidateDeleteApi = (id) => {  // Changed parameter name to be more clear
  const company = localStorage.getItem("companyName");
  if (!company) {
    throw new Error("Company Name is not found");
  }
  
  return axiosInstance.delete(`/${company}/candidate/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }
  })
  .then(response => response.data)
  .catch(error => {
    console.error('Delete Candidate Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    throw error;
  });
};

 export const uploadDocumentAPI = async (candidateId, docNames, files) => {
  const companyName = localStorage.getItem("companyName");
  const formData = new FormData();
  
  // Log the data being sent
  console.log("Uploading to:", `/${companyName}/candidate/${candidateId}/upload`);
  console.log("Document names:", docNames);
  console.log("Files:", files.map(f => ({
    name: f.name,
    type: f.type,
    size: f.size
  })));

  // Add data to FormData
  docNames.forEach((name, index) => {
    formData.append(`docNames[${index}]`, name);
    formData.append(`files[${index}]`, files[index]);
  });

  try {
    const response = await axiosInstance.post(
      `/${companyName}/candidate/${candidateId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Full error details:', {
      url: error.config.url,
      method: error.config.method,
      headers: error.config.headers,
      data: error.config.data,
      response: error.response?.data
    });
    throw error;
  }
};

export const getDocumentByIdAPI = async (candidateId = '', employeeId = '') => {
  const companyName = localStorage.getItem("companyName");

  try {
    const response = await axiosInstance.get(
      `/${companyName}/documents`,
      {
        params: {
          ...(candidateId && { candidateId }),
          ...(employeeId && { employeeId })
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // Gracefully handle 404
    }
    // Suppress all other errors silently
    return null;
  }
};


export const deleteDocumentByIdAPI = async (candidateId, documentId) => {
  const companyName = localStorage.getItem("companyName");
  
  try {
    const response = await axiosInstance.delete(
      `/${companyName}/candidate/${candidateId}/document/${documentId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', {
      url: error.config?.url,
      method: error.config?.method,
      response: error.response?.data
    });
    throw error;
  }
};

export const uploadEmployeeDocumentAPI = async (employeeId, docNames, files) => {
  const companyName = localStorage.getItem("companyName");
  const formData = new FormData();
  
  // Log the data being sent for debugging
  console.log("Uploading to:", `/${companyName}/employee/${employeeId}/upload`);
  console.log("Document names:", docNames);
  console.log("Files:", files.map(f => ({
    name: f.name,
    type: f.type,
    size: f.size
  })));

  // Add data to FormData
  docNames.forEach((name, index) => {
    formData.append(`docNames[${index}]`, name);
    formData.append(`files[${index}]`, files[index]);
  });

  try {
    const response = await axiosInstance.post(
      `/${companyName}/employee/${employeeId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading employee documents:', {
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      data: error.config?.data,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const updateCandidateDocument = (candidateId, documentId, documentNumbers, docNames, files) => {
    const companyName = localStorage.getItem("companyName");
    const formData = new FormData();
    
    // Verify counts match
    if (docNames.length !== files.length || docNames.length !== documentNumbers.length) {
        throw new Error(`Mismatched counts: ${documentNumbers.length} documentNumbers, ${docNames.length} docNames vs ${files.length} files`);
    }

    // Append all documents
    docNames.forEach((name, index) => {
        formData.append(`documentNo[${index}]`, documentNumbers[index]);
        formData.append(`docNames[${index}]`, name);
        formData.append(`files[${index}]`, files[index]);
    });

    return axiosInstance.patch(
        `/${companyName}/candidate/${candidateId}/document/${documentId}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
};
