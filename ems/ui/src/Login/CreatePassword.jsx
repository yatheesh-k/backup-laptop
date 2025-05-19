import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { forgotPasswordStep1, forgotPasswordStep2, ValidateOtp } from '../Utils/Axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EnvelopeFill, LockFill, UnlockFill } from 'react-bootstrap-icons';
import Loader from '../Utils/Loader';
import { Modal, ModalBody, ModalHeader, ModalTitle } from 'react-bootstrap';

const CreatePassword = () => {
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({ mode: "onChange", defaultValues: {
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  }, });
  const { company } = useParams();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [otpShown, setOtpShown] = useState(false); // Separate state for OTP visibility
  const [otpTimeLimit, setOtpTimeLimit] = useState(56);
  const [otpExpired, setOtpExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const watchPassword = watch('password', '');
  const navigate = useNavigate();

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
      setOtpExpired(true);  // OTP expired
      setOtpShown(false);  // Hide OTP input
      setStep(1); // Move to Step 1 (Email Step) if OTP expired
      reset({ otp: '' });
    }
  }, [otpTimeLimit]);
  


  const onSubmitEmail = async (data) => {
    setLoading(true);
    const formData = {
      username: data.email,
      company: company
    };
    try {
      const response = await forgotPasswordStep1(formData);
      console.log(response.data);
      toast.success("OTP Sent Successfully"); // Handle API response as needed
      setEmail(data.email); // Update email state here
      setStep(2); // Move to Step 2 if successful
    } catch (error) {
      console.error("Failed to send OTP:", error);
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp = async (data) => {
    setLoading(true);
  
    const formData = {
      username: data.email,
      otp: data.otp,
      company: company,
    };
  
    try {
      const response = await ValidateOtp(formData);
      toast.success("Verification Successful");
      
      // Move to Step 3 if OTP is valid
      setStep(3);

      // Reset form, clearing OTP and password fields
      reset({
        otp: '',  // Clear OTP field
        password: '',  // Clear password field to avoid OTP being passed to password
        confirmPassword: '',  // Clear confirm password field
      });

      setOtpExpired(false); // Reset OTP expiration state
      setOtpTimeLimit(40); // Reset timer when OTP is valid
      setErrorMessage(""); // Clear any error messages after successful validation
    } catch (error) {
      handleApiErrors(error);
      reset({ otp: '' }); // Reset OTP if error occurs
      setStep(1); // Move back to Step 1 if OTP is invalid
      setOtpTimeLimit(40); // Reset OTP timer
      setOtpExpired(false); // Reset OTP expired flag
      setLoading(false);
      setErrorMessage("Invalid OTP. Please try again."); // Error message for invalid OTP
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmitNewPassword = async (data) => {
    setLoading(true);
    try {
      const formData = {
        username: email,
        password: data.password,
        company: company,
        companyFullName: data.companyName,
      };
      await forgotPasswordStep2(formData);
      toast.success("Password Updated Successfully");
      reset(); // Reset the form data
      navigate(`/${company}/login`);    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
  };  

  const handleApiErrors = (error) => {
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error !");
    }
    console.error(error.response);
  };

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };
  const confirmPasswordVisibility = () => {
    setConfirmPasswordShown(!confirmPasswordShown);
  };

  const toggleOtpVisibility = () => {
    setOtpShown(!otpShown);
  };

  const closeButton = () => {
    // Reset the OTP and other states
    reset();
    setOtpTimeLimit(40); // Reset the OTP timer
    // setStep(1);  // Go back to Step 1
    navigate(`/${company}/login`);
  };
  

  const closeModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
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
  const handleEmailChange = (e) => {
    const value = e.target.value;

    // Prevent space key (keyCode 32) from being entered
    if (e.keyCode === 32) {
      e.preventDefault();
    }

    // If there is any space already entered, prevent re-render with spaces
    if (value.includes(" ")) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('Text');
    const sanitizedText = pastedText.replace(/[^A-Za-z0-9]/g, ''); // Keep only alphanumeric characters
    e.preventDefault(); // Prevent the default paste action
    e.target.value = sanitizedText; // Insert the sanitized text back into the input
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSubmit(onSubmitEmail)}>

            <div className="form-group mb-1">
              <label>Email Id</label>
              <div className="input-group">
                <span className="input-group-text">
                  <EnvelopeFill size={20} color="#4C489D" />
                </span>
                <input
                  type="email"
                  placeholder='Enter Your Email Id'
                  className="form-control"
                  onKeyDown={handleEmailChange}
                  onPaste={handlePaste}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value:
                      /^[a-z][a-zA-Z0-9._+-]*@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,                      message: "Invalid email format",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="errorMsg p-0" style={{ marginLeft: "60px" }}>
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="text-center mt-4">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Loading..." : "Send OTP"}
              </button>
            </div>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleSubmit(onSubmitOtp)}>
            <div className="form-group mb-1">
              <label>Email Id:</label>
              <div className="input-group">
                <span className="input-group-text">
                  <EnvelopeFill size={20} color="#4C489D" />
                </span>
                <input type="email" className="form-control" value={email} disabled />
              </div>
            </div>
            <div className="form-group">
              <label>OTP:</label>
              <div className="input-group">
                <span className="input-group-text" onClick={toggleOtpVisibility} style={{ cursor: 'pointer' }}>
                  {otpShown ? (
                    <UnlockFill size={20} color="#4C489D" />
                  ) : (
                    <LockFill size={20} color="#4C489D" />
                  )}
                </span>
                <input
                  type={otpShown ? "text" : "password"}
                  placeholder='Enter OTP'
                  className="form-control"
                  onKeyDown={handleEmailChange}
                  onPaste={handlePaste}
                  {...register('otp', {
                    required: 'OTP is required',
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: 'Invalid OTP'
                    },
                    maxLength: {
                      value: 6,
                      message: "Maximum 6 Digits Allowed",
                    },
                  })}
                />
              </div>
              {errors.otp && <span className="text-danger" style={{ marginLeft: "60px" }}>{errors.otp.message}</span>}
            </div>
            <div className="text-center mt-4">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Loading..." : "Submit"}
              </button>
            </div>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleSubmit(onSubmitNewPassword)}>
            <div className="form-group mb-1">
              <label>Email:</label>
              <div className="input-group">
                <span className="input-group-text">
                  <EnvelopeFill size={20} color="#4C489D" />
                </span>
                <input type="email" className="form-control" value={email} disabled />
              </div>
            </div>
            <div className="form-group">
              <label>New Password:</label>
              <div className="input-group">
                <span className="input-group-text" onClick={togglePasswordVisibility}>
                  {passwordShown ? (
                    <UnlockFill size={20} color="#4C489D" />
                  ) : (
                    <LockFill size={20} color="#4C489D" />
                  )}
                </span>
                <input
                  placeholder='Enter Your New Password'
                  type={passwordShown ? "text" : "password"}
                  className="form-control"
                  name='password'
                  onPaste={handlePaste}
                  onKeyDown={handleEmailChange}
                  {...register("password", {
                    required: "Password is Required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                    maxLength: {
                      value: 16,
                      message: "Password must be at least 16 characters long",
                    },
                    validate: validatePassword,
                  })}
                />
              </div>
              {errors.password && (
                <p className="errorMsg" style={{ marginLeft: "55px", marginBottom: "0" }}>
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="form-group">
              <label>Confirm Password:</label>
              <div className="input-group">
                <span className="input-group-text" onClick={confirmPasswordVisibility}>
                  {confirmPasswordShown ? (
                    <UnlockFill size={20} color="#4C489D" />
                  ) : (
                    <LockFill size={20} color="#4C489D" />
                  )}
                </span>
                <input
                  placeholder='Confirm Password'
                  type={confirmPasswordShown ? "text" : "password"}
                  className="form-control"
                  onKeyDown={handleEmailChange}
                  onPaste={handlePaste}
                  name='confirmPassword'
                  {...register('confirmPassword', {
                    required: 'Confirm Password is required',
                    validate: value => value === watchPassword || "Passwords do not match",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                    maxLength: {
                      value: 16,
                      message: "Password must be at least 16 characters long",
                    },
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="errorMsg" style={{ marginLeft: "60px", marginBottom: "0" }}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="text-center mt-4">
              <button type="submit" className="btn btn-primary" disabled={loading || isSubmitting}>
                {loading ? "Loading..." : "Create Password"}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <main className="d-flex w-100 ">
      {loading && (
        <Loader />
      )}
      <div className="container d-flex flex-column">
        <div className="row vh-100">
          <div className="col-sm-10 col-md-7 col-lg-6 mx-auto d-table h-100">
            <div className="d-table-cell align-middle">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center pb-0">
                  <div className="text-center">
                    <p className="lead">Create Password</p>
                  </div>
                  <button className='btn text-white' style={{ marginBottom: "6px" }} onClick={closeButton}>X</button>
                </div>

                <div className="card-body" style={{ marginRight: '60px', paddingTop: '0px' }}>
                  <div className="mt-2 m-sm-2 ">
                    {renderStep()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        <ModalBody className="text-center fs-bold">
          {errorMessage}
        </ModalBody>
      </Modal>
    </main>
  );
};

export default CreatePassword;