import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ModalTitle } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import './Message.css'

function Message() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            companyName: '',
        },
    });
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false);
    const [companyName, setCompanyName] = useState('');

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
    };

    const handleCompanyNameChange = (event) => {
        setCompanyName(event.target.value);
    };
    const toInputLowerCase = (e) => {
        const inputValue = e.target.value;
        let newValue = "";
        for (let i = 0; i < inputValue.length; i++) {
          const char = inputValue.charAt(i);
          if (char.match(/[a-z]/)) {
            // Only allow lowercase letters
            newValue += char;
          }
        }
          e.target.value = newValue;
      };

    const onSubmit = (data) => {
        closeModal()
        const { companyName } = data;
        localStorage.setItem('companyName',companyName)
        reset();
        navigate(`/${companyName}/login`);

    };

    const handleEmailChange = (e) => {
        // Get the current value of the input field
        const value = e.target.value;
    
        // Check if the value is empty
        if (value.trim() !== "") {
          return; // Allow space button
        }
    
        // Prevent space character entry if the value is empty
        if (e.keyCode === 32) {
          e.preventDefault();
        }
      };

    return (
        <main className="newLoginMainWrapper">
            <div className="newLoginWrapper">
                <div className="newLoginContainer">
                    <div className="newLoginLeftSectionOuter">
                        <div className="newLoginLeftTitle">Welcome to <br/> Employee Management System</div>
                        <div className="newLoginLeftImgHolder"><img src="assets/img/left-img.png" /></div>
                    </div>
                    <div className='newLoginRightSectionOuter'>
                        <div className="newLoginRightSection">
                            <div className="newLoginRightSecTitle">Login</div>
                            <div className="newLoginRightSecSelectLogin">
                                <div className="loginBtn"><span>Continue with Company login</span></div>
                            </div>
                            <form>
                                <div class="formgroup">
                                    <label class="form-label">Email</label>
                                    <input class="form-control form-control-lg" type="email" name="email" placeholder="Enter your email" />
                                </div>
                                <div class="formgroup">
                                    <label class="form-label">Password</label>
                                    <input class="form-control form-control-lg" type="password" name="password" placeholder="Enter your password" />
                                    <span toggle="#password-field" class="fa fa-fw fa-eye field-icon toggle-password"></span>
                                    <small>
                                        <a href="javascript:void(0);">Forgot password?</a>
                                    </small>
                                </div>
                                <div>
                                    <div class="form-check align-items-center">
                                        <input id='customControlInline' type="checkbox" class="form-check-input" value="remember-me" name="remember-me"  />
                                        <label class="form-check-label text-small" for="customControlInline">Remember me</label>
                                    </div>
                                </div>
                                <div class="d-grid gap-2 mt-3">
                                    <a class="btn btn-lg btn-primary" href="/">Sign in</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container flex-column" style={{ background: 'red', display:'none' }}>
                <div className="row vh-100">
                    <div className="col-sm-10 col-md-7 col-lg-6 mx-auto d-table h-100">
                        <div className="d-table-cell align-middle">
                            <div className="text-center mt-2">
                                <img src="assets/img/person-1.svg" alt="person" style={{ width: '800px', height: '300px', marginBottom: "40px" }} />
                                <h1 className="lead" style={{ fontSize: "3rem", fontFamily: "Arial, sans-serif", fontWeight: 'bold', color: '#333', display: 'inline-block', whiteSpace: 'nowrap' }}>Welcome To Employee Management System </h1>
                                <h3 style={{ fontFamily: "sans-serif", color: '#555' }}>Enter The Path According To Your Company...</h3>
                            </div>
                            <div className='row' style={{ marginTop: "20px" }}>
                                <div className='col-12 col-md-6 col-lg-5 mb-3' style={{ paddingLeft: "200px" }}>
                                    <Link to={'/ems/login'}>
                                        <button className="btn btn-primary btn-lg" >EMS Login</button>
                                    </Link>
                                </div>
                                <div className='col-lg-1'></div>
                                <div className='col-12 col-md-6 col-lg-5 mb-3' style={{ paddingLeft: "190px" }} >
                                    <button className="btn btn-primary btn-lg" onClick={openModal}>Company Login</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <ModalTitle className="modal-title">Company Service Name</ModalTitle>
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>                         
                         </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <input
                                        type="text"
                                        name="companyName"
                                        className="form-control"
                                        onChange={handleCompanyNameChange}
                                        placeholder="Enter Company Service Name"
                                        onInput={toInputLowerCase}
                                        onKeyDown={handleEmailChange}
                                        {...register("companyName", {
                                            required: "Company Service Name is Required",
                                            pattern: {
                                                value: /^[a-z]+$/,
                                                message: "This field accepts only lowercase alphabetic characters without spaces",
                                            },
                                        })}
                                    />
                                    {errors.companyName && (
                                        <p className='errorMsg'>{errors.companyName.message}</p>
                                    )}
                                    <div className="modal-footer">
                                        <button type="submit" className="btn btn-primary">Submit</button>
                                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div >
            )}
        </main >
    );
}

export default Message;


