import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import {
  CandidateloginApi,
  ValidateOtp,
} from "../Utils/Axios";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import "../LayOut/NewLogin/Message.css";
import Loader from "../Utils/Loader";
import { setAuthDetails } from "../Redux/AuthSlice";
import { useDispatch } from "react-redux";

const CandidateLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [otpTimeLimit, setOtpTimeLimit] = useState(180);
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
      // OTP expired logic
      setOtpExpired(true);
    }
  }, [otpTimeLimit, otpSent]);

  const sendOtp = (data) => {
    const payload = {
      username: data.username,
      company: company,
    };

    setLoading(true);
    CandidateloginApi(payload)
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
          console.log("Dispatched User Role:", userRole); // Log this to verify
          setAuthUser({ userId, userRole, company, employeeId,resourceType });
          toast.success("OTP Sent Successfully");
          setOtpSent(true);
          setOtpExpired(false);
          setOtpTimeLimit(180); // Reset OTP time limit to 3 minutes
          setShowOtpField(true); // Show OTP field
        } else {
          console.error("Token not found in response");
          setErrorMessage("Unexpected response format. Token not found.");
          setShowErrorModal(true);
          setOtpSent(false);
          reset("");
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        const errorMessage =
          error.message || "Login failed. Please try again later.";
        console.error("sendOtp error:", errorMessage);
        setErrorMessage(errorMessage);
        setShowErrorModal(true);
      });
  };

  const resendOtp = () => {
    const currentValues = getValues();
    reset({ username: currentValues.username });
    sendOtp(currentValues);
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
        console.log("sendOtp", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          const errorMessage = error.response.data.error.message;
          setErrorMessage(errorMessage);
          setShowErrorModal(true);
        } else {
          setErrorMessage("Login failed. Please try again later.");
          setShowErrorModal(true);
        }
        if (otpTimeLimit <= 0) {
          setOtpExpired(true);
          setErrorMessage("OTP Expired. Please Resend OTP");
          setShowErrorModal(true);
        }
      });
  };

  const closeModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
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
                      name="email"
                      placeholder="Email Id"
                      autoComplete="off"
                      onKeyDown={handleEmailChange}
                      readOnly={otpSent && !otpExpired}
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
                      <p className="errorMsg" style={{ marginLeft: "20px" }}>
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {otpSent && !otpExpired && (
                    <div className="formgroup">
                      <label className="form-label">OTP</label>
                      <input
                        className="form-control form-control-lg"
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
                      <div className="otp-timer">
                        {otpTimeLimit > 0 ? (
                          <span className="text-primary">
                            OTP expires in: {otpTimeLimit} seconds
                          </span>
                        ) : (
                          <span>OTP expired</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="d-grid gap-2 mt-3">
                    {otpExpired ? (
                      <button
                        className="btn btn-lg btn-primary"
                        type="button"
                        onClick={resendOtp}
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <button className="btn btn-lg btn-primary" type="submit">
                        {otpSent ? "Verify OTP" : "Sign in"}
                      </button>
                    )}
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

export default CandidateLogin;
