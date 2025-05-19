import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import { CompanyloginApi, ValidateOtp } from "../Utils/Axios";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import '../LayOut/NewLogin/Message.css'
import Loader from "../Utils/Loader";

const CompanyLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      otp: "",
    },
    mode: "onChange",
  });

  const { setAuthUser } = useAuth();
    const { company } = useParams();
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [otpSent, setOtpSent] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [otpTimeLimit, setOtpTimeLimit] = useState(56); 
  const [otpExpired, setOtpExpired] = useState(false); 

  useEffect(() => {
    localStorage.setItem("companyName", company);
  }, [company]);

  useEffect(() => {
    if (otpTimeLimit > 0) {
      const timer = setTimeout(() => {
        setOtpTimeLimit((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // OTP expired logic
      setOtpExpired(true);
      setOtpSent(false);
      setOtpTimeLimit(56); // Reset OTP timer
      reset({ otp: "" });
    }
  }, [otpTimeLimit]);
  

  const sendOtp = (data) => {
    const payload = {
      username: data.username,
      password: data.password,
      company: company,
    };
  
    setLoading(true);
    CompanyloginApi(payload)
      .then((response) => {
        const token = response.data?.token;
        if (token) {
          localStorage.setItem("token", token);
          const decodedToken = jwtDecode(token);
          const { sub: userId, roles: userRole, company, employeeId } = decodedToken;
          setAuthUser({ userId, userRole, company, employeeId });
          toast.success("OTP Sent Successfully");
          setOtpSent(true);
          setOtpExpired(false);
          setOtpTimeLimit(56);
          setShowOtpField(true); // Show OTP field
        } else {
          console.error('Token not found in response');
          setErrorMessage("Unexpected response format. Token not found.");
          setShowErrorModal(true);
          setOtpSent(false);
          reset('')
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
  
        // Ensure we're accessing the error message properly
        const errorMessage = error.message || "Login failed. Please try again later.";
        console.error('sendOtp error:', errorMessage); // Log the error
        setErrorMessage(errorMessage);
        setShowErrorModal(true);
      });

  }; 


  const verifyOtpAndCompanyLogin = (data) => {
    const payload = {
      username: data.username,
      otp: data.otp,
      company: company,
    };
    setLoading(true);
    ValidateOtp(payload)
      .then((response) => {
        setLoading(false);
        toast.success("Login Successful", {
          position: "top-right",
          transition: Bounce,
          hideProgressBar: true,
          theme: "colored",
          autoClose: 2000,
        });
        setTimeout(() => {
          window.location.href = "/main";        
        }, 1000);

      })
      .catch((error) => {
        setLoading(false);
        console.log("sendOtp",error)
        if (error.response && error.response.data && error.response.data.error) {
          const errorMessage = error.response.data.error.message;
          setErrorMessage(errorMessage);
          setShowErrorModal(true);
        } else {
          setErrorMessage("Login failed. Please try again later.");
          setShowErrorModal(true);
        }
        if (otpTimeLimit <= 0) {
          setOtpExpired(true);
          setOtpSent(true)
          setErrorMessage("OTP Expired. Please Login Again");
          setShowErrorModal(true);
          reset();
        }
      });
  };

  const closeModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const handleEmailChange = (e) => {
    if (e.keyCode === 32) {
      e.preventDefault();
    }
  };

  const onSubmit = (data) => {
    if (otpSent && !otpExpired) {
      verifyOtpAndCompanyLogin(data);
    } else {
      sendOtp(data);
    }
  };


  const validatePassword = (value) => {
    const errors = [];
    if (!/(?=.*[0-9])/.test(value)) {
      errors.push("at least one digit");
    }
    if (!/(?=.*[a-z])/.test(value)) {
      errors.push("at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      errors.push("at least one uppercase letter");
    }
    if (!/(?=.*\W)/.test(value)) {
      errors.push("at least one special character");
    }
    if (value.includes(" ")) {
      errors.push("no spaces");
    }
    
    if (errors.length > 0) {
      return `Password must contain ${errors.join(", ")}.`;
    }
    return true; // Return true if all conditions are satisfied
  };

  const toInputLowerCase = (e) => {
    const input = e.target;
    let value = input.value;
  
    // Remove all spaces from the input
    value = value.replace(/\s+/g, '');
  
    // If the first character is not lowercase, make it lowercase
    if (value.length > 0 && value[0] !== value[0].toLowerCase()) {
      value = value.charAt(0).toLowerCase() + value.slice(1);
    }
  
    // Update the input value
    input.value = value;
  };
  

  return (
    <div>
          <main className="newLoginMainWrapper">
          {loading &&(
             <Loader/>
          )}
        <div className="newLoginWrapper">
            <div className="newLoginContainer">
                <div className="newLoginLeftSectionOuter">
                    <div className="newLoginLeftTitle">Welcome To <br/> Employee Management System</div>
                    <div className="newLoginLeftImgHolder"><img src="..\assets\img\left-img.png" alt='#' /></div>
                </div>
                <div className='newLoginRightSectionOuter'>
                    <div className="newLoginRightSection">
                        <div className="newLoginRightSecTitle">Login</div>
                        <div className="newLoginRightSecSelectLogin">

                            <div className="loginBtn"><span>Continue With Company Login</span></div>

                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div class="formgroup">
                                <label class="form-label">Email Id</label>
                                <input class="form-control form-control-lg"
                                  type="email"
                                  name="email"
                                  placeholder="Email Id"
                                  autoComplete="off"
                                 // onInput={toInputLowerCase}
                                  onKeyDown={handleEmailChange}
                                  readOnly={otpSent}
                                  {...register("username", {
                                    required: "Email Id is Required.",
                                    pattern: {
                                      value:
                                      /^[a-z][a-zA-Z0-9._+-]*@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,                                      message: "Invalid Email Id Format",
                                    },
                                    })}
                                  />
                                  {errors.username && (
                                  <p className="errorMsg" style={{ marginLeft: "20px" }}>
                                    {errors.username.message}
                                  </p>
                                  )}
                            </div>
                            {!otpSent && ( 
                              <> 
                                <div className="formgroup">
                                  <label className="form-label">Password</label>
                                  <div className="password-input-container">
                                    <input 
                                      className="form-control form-control-lg" 
                                      name="password"
                                      placeholder="Password"
                                      onChange={handleEmailChange}
                                      type={passwordShown ? "text" : "password"}
                                      maxLength={16}
                                      {...register("password", {
                                        required: "Password is Required",
                                        minLength: {
                                          value: 6,
                                          message: "Password must be at least 6 characters long",
                                        },
                                        validate: validatePassword,  
                                      })}
                                    />
                                    <span
                                      className={`bi bi-eye field-icon pb-1 toggle-password ${passwordShown ? 'text-primary' : ''}`}
                                      onClick={togglePasswordVisibility}
                                    ></span>
                                  </div>
                                  {errors.password && (
                                    <p className="errorMsg" style={{ marginLeft: "20px" }}>
                                      {errors.password.message}
                                    </p>
                                  )}
                                  <small>
                                    <a href="/forgotPassword">Forgot Password?</a>
                                  </small>
                                </div>

                          
                            {/* <div>
                                <div class="form-check align-items-center">
                                    <input id='customControlInline' type="checkbox" class="form-check-input" value="remember-me" name="remember-me"  />
                                    <label class="form-check-label text-small" for="customControlInline">Remember me</label>
                                </div>
                            </div> */}
                            </>
                          )}
                          {otpSent && !otpExpired && (   
                            <div class="formgroup">
                                <label class="form-label">OTP</label>
                                <input class="form-control form-control-lg" 
                                type="text"
                                name="otp"
                                id="otp"
                                placeholder="Enter Your OTP"
                                autoComplete="off"
                                {...register("otp", {
                                  required: "OTP is Required.",
                                  pattern: {
                                    value: /^\d{6}$/,
                                    message: "OTP must be 6 digits.",
                                  },
                                })}
                                />
                                {errors.otp && (
                                    <p className="errorMsg">{errors.otp.message}</p>
                                  )}
                            </div>
                            )}
                            <div class="d-grid gap-2 mt-3">
                                <button class="btn btn-lg btn-primary" type="submit">Sign in</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Modal
        show={showErrorModal}
        onHide={closeModal}
        centered
        style={{ zIndex: "1050"}}
        className="custom-modal"
      >
        <ModalHeader closeButton>
          <ModalTitle className="text-center">Error</ModalTitle>
        </ModalHeader>
        <ModalBody className="text-center fs-bold">
          {errorMessage}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default CompanyLogin;
