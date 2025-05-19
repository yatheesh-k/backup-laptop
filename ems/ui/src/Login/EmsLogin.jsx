import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { loginApi } from "../Utils/Axios";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import Loader from "../Utils/Loader";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import '../LayOut/NewLogin/Message.css';

const EmsLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { username: "", password: "" },
    mode: "onChange",
  });
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const handleEmailChange = (e) => {
    if (e.keyCode === 32) {
      e.preventDefault();
    }
  };

  const onSubmit = async (data) => {
    setLoading(true); // Set loading to true when the request starts

    try {
      const response = await loginApi(data);
      const token = response.data?.token;
      console.log("token",token)
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          console.log("decodedToken",decodedToken)
          const {
            sub: userId,
            roles: userRole,
            company,
            employeeId,
          } = decodedToken;
          setAuthUser({ userId, userRole, company, employeeId });
          toast.success("Login Successful");
          setTimeout(() => {
            window.location.href = "/main";
          }, 500);  
        } catch (decodeError) {
          setErrorMessage("Failed to decode token. Ensure token is valid.");
          setShowErrorModal(true);
        }
      } else {
        setErrorMessage("Unexpected response format. Token not found.");
        setShowErrorModal(true);
      }
    } catch (error) {
      if (error) {
        const errorMessage = error;
        setErrorMessage(errorMessage);
        setShowErrorModal(true);
      } else {
        setErrorMessage("Login failed. Please try again later.");
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false); // Set loading to false after the request is completed
    }
  };

  const closeModal = () => {
    setShowErrorModal(false);
    setErrorMessage(""); // Clear error message when modal is closed
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

                  <div className="loginBtn"><span>Continue with EMS login</span></div>

                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="formgroup">
                    <label className="form-label">Email Id</label>
                    <input
                      className="form-control form-control-lg"
                      type="email"
                      placeholder="Email Id"
                      autoComplete="off"
                      onKeyDown={handleEmailChange}
                      // onInput={toInputLowerCase}
                      {...register("username", {
                        required: "Email Id is Required.",
                        pattern: {
                          value:
                            /^[a-z][a-zA-Z0-9._+-]*@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                          message:
                            "Invalid email Id format. Only .com, .in, .org, .net, .edu, .gov are allowed.",
                        },
                      })}
                    />
                    {errors.username && (
                      <p className="errorMsg">{errors.username.message}</p>
                    )}
                  </div>
                  <div className="formgroup position-relative">
                    <label className="form-label">Password</label>
                    <div className="password-input-container">
                      <input
                        className="form-control form-control-lg"
                        name="password"
                        placeholder="Password"
                        onChange={handleEmailChange}
                        maxLength={16}
                        type={passwordShown ? "text" : "password"}
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
                        className={`bi bi-eye-fill field-icon pb-1 toggle-password ${passwordShown ? "text-primary" : ""
                          }`}
                        onClick={togglePasswordVisibility}
                      ></span>
                    </div>
                    {errors.password && (
                      <p className="errorMsg">{errors.password.message}</p>
                    )}
                  </div>
                  <div className="d-grid gap-2 mt-3">
                    <button className="btn btn-lg btn-primary" type="submit">
                      Sign in
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Error Modal */}
      <Modal
        show={showErrorModal}
        onHide={closeModal}
        centered
        style={{ zIndex: "1050" }}
        className="custom-modal"
      >
        <ModalHeader closeButton>
          <ModalTitle className="text-center">Error</ModalTitle>
        </ModalHeader>
        <ModalBody className="text-center fs-bold">{errorMessage}</ModalBody>
      </Modal>
    </div>
  );
};

export default EmsLogin;