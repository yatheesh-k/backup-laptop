import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import {
  CompanyloginApi,
  ValidateOtp,
  resendPasswordOTP,
} from "../Utils/Axios";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import "../LayOut/NewLogin/Message.css";
import Loader from "../Utils/Loader";
import { setAuthDetails } from "../Redux/AuthSlice";
import { useDispatch } from "react-redux";

const CompanyLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      otp: "",
    },
  });

  const { setAuthUser } = useAuth();
  const { company } = useParams();
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [otpTimeLimit, setOtpTimeLimit] = useState(180); // 3 minutes
  const [otpExpired, setOtpExpired] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    localStorage.setItem("companyName", company);
  }, [company]);

  useEffect(() => {
    if (otpSent && otpTimeLimit > 0) {
      const timer = setTimeout(() => {
        setOtpTimeLimit((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (otpSent && otpTimeLimit <= 0) {
      setOtpExpired(true);
    }
  }, [otpTimeLimit, otpSent]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

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
          const {
            sub: userId,
            roles: userRole,
            company,
            employee: employeeId,
            resourceType,
          } = decodedToken;

          dispatch(
            setAuthDetails({
              userId,
              userRole,
              company,
              employeeId,
              resourceType,
              source: "company",
            })
          );
          setAuthUser({ userId, userRole, company, employeeId, resourceType });
          toast.success("OTP Sent Successfully");
          setOtpSent(true);
          setOtpExpired(false);
          setOtpTimeLimit(180);
        } else {
          setErrorMessage("Unexpected response format. Token not found.");
          setShowErrorModal(true);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        const errorMessage =
          error.message || "Login failed. Please try again later.";
        setErrorMessage(errorMessage);
        setShowErrorModal(true);
      });
  };

  const resendOtp = () => {
    const currentValues = getValues();
    setLoading(true);

    resendPasswordOTP({
      username: currentValues.username,
      company: company,
    })
      .then((response) => {
        setLoading(false);
        toast.success("New OTP Sent Successfully");
        setOtpExpired(false);
        setOtpTimeLimit(180);
      })
      .catch((error) => {
        setLoading(false);
        const errorMessage =
          error.response?.data?.message ||
          "Failed to resend OTP. Please try again.";
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
          navigate("/main");
        }, 1000);
      })
      .catch((error) => {
        setLoading(false);
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          setErrorMessage(error.response.data.error.message);
        } else {
          setErrorMessage("Login failed. Please try again later.");
        }
        setShowErrorModal(true);
      });
  };

  const closeModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
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
    if (!/(?=.*[\W_])/.test(value)) {
      errors.push("at least one special character");
    }
    if (value.includes(" ")) {
      errors.push("no spaces");
    }

    if (errors.length > 0) {
      return `Password must contain ${errors.join(", ")}.`;
    }
    return true;
  };

  const onSubmit = (data) => {
    if (otpSent && !otpExpired) {
      verifyOtpAndCompanyLogin(data);
    } else {
      sendOtp(data);
    }
  };
  const preventSpaces = (e) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  return (
    <div>
      <main className="newLoginMainWrapper">
        {loading && <Loader />}
        <div className="newLoginWrapper">
          <div className="newLoginContainer">
            <div className="newLoginLeftSectionOuter">
              <div className="newLoginLeftTitle">
                Welcome To <br /> Employee Management System
              </div>
              <div className="newLoginLeftImgHolder">
                <img src="..\assets\img\left-img.png" alt="#" />
              </div>
            </div>
            <div className="newLoginRightSectionOuter">
              <div className="newLoginRightSection">
                <div className="newLoginRightSecTitle">Login</div>
                <div className="newLoginRightSecSelectLogin">
                  <div className="loginBtn">
                    <span>Continue With Company Login</span>
                  </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="formgroup">
                    <label className="form-label">Email Id</label>
                    <input
                      className="form-control form-control-lg"
                      type="email"
                      placeholder="Email Id"
                      autoComplete="off"
                      readOnly={otpSent}
                      onKeyDown={preventSpaces}
                      {...register("username", {
                        required: "Email Id is Required.",
                        pattern: {
                          value:
                            /^[a-z][a-zA-Z0-9._+-]*@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                          message: "Invalid Email Id Format",
                        },
                      })}
                    />
                    {errors.username && (
                      <p className="errorMsg">{errors.username.message}</p>
                    )}
                  </div>

                  {!otpSent ? (
                    <div className="formgroup">
                      <label className="form-label">Password</label>
                      <div className="password-input-container">
                        <input
                          className="form-control form-control-lg"
                          placeholder="Password"
                          autoComplete="off"
                          type={passwordShown ? "text" : "password"}
                          maxLength={16}
                          onKeyDown={preventSpaces}
                          {...register("password", {
                            required: "Password is Required",
                            minLength: {
                              value: 6,
                              message:
                                "Password must be at least 6 characters long",
                            },
                            validate: validatePassword,
                          })}
                        />
                        <span
                          className={`bi bi-eye field-icon pb-1 toggle-password ${
                            passwordShown ? "text-primary" : ""
                          }`}
                          onClick={togglePasswordVisibility}
                        ></span>
                      </div>
                      {errors.password && (
                        <p className="errorMsg">{errors.password.message}</p>
                      )}
                      <small>
                        <a href="/forgotPassword">Forgot Password?</a>
                      </small>
                    </div>
                  ) : (
                    <div className="formgroup">
                      <label className="form-label">OTP</label>
                      <input
                        className="form-control form-control-lg"
                        placeholder="Enter Your OTP"
                        autoComplete="off"
                        disabled={otpExpired}
                        onKeyDown={preventSpaces}
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
                      <div className="otp-timer">
                        {!otpExpired ? (
                          <span className="text-primary">
                            OTP expires in: {formatTime(otpTimeLimit)}
                          </span>
                        ) : (
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-danger">OTP expired</span>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-primary"
                              onClick={resendOtp}
                            >
                              Resend OTP
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="d-grid gap-2 mt-3">
                    <button className="btn btn-lg btn-primary" type="submit">
                      {otpSent ? "Verify OTP" : "Sign in"}
                    </button>
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
        style={{ zIndex: "1050" }}
        className="custom-modal"
      >
        <ModalHeader>
          <ModalTitle className="text-center">Error</ModalTitle>
          <button
            type="button"
            className="text-dark"
            aria-label="Close"
            onClick={closeModal}
          >
            {" "}
            X
          </button>
        </ModalHeader>
        <ModalBody className="text-center fs-bold">{errorMessage}</ModalBody>
      </Modal>
    </div>
  );
};

export default CompanyLogin;
