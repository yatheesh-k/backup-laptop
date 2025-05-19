import React, { useEffect, useState } from 'react';
import LayOut from '../../LayOut/LayOut';
import { PayslipTemplate, TemplateGetAPI } from '../../Utils/Axios';
import PayslipTemplate1 from './Payslip/PayslipTemplate1';
import PayslipTemplate2 from './Payslip/PayslipTemplate2';
import PayslipTemplate3 from './Payslip/PayslipTemplate3';
import PayslipTemplate4 from './Payslip/PayslipTemplate4';
import { toast } from 'react-toastify';
import { useAuth } from '../../Context/AuthContext';

const PayslipTemplates = () => {
    const [currentTemplate, setCurrentTemplate] = useState(<PayslipTemplate1 />);
    const [payslipTemplateNo, setPayslipTemplateNo] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    console.log("companyId:",user.companyId);
    

    const templates = [
        { id: 1, title: 'Template 1', bgColor: '#e6e6fa', headingColor: '#4682b4', component: <PayslipTemplate1 /> },
        { id: 2, title: 'Template 2', bgColor: '#e6e6fa', headingColor: '#4682b4', component: <PayslipTemplate2 /> },
        { id: 3, title: 'Template 3', bgColor: '#e6e6fa', headingColor: '#4682b4', component: <PayslipTemplate3 /> },
        { id: 4, title: 'Template 4', bgColor: '#e6e6fa', headingColor: '#4682b4', component: <PayslipTemplate4 /> },
    ];

    const handleSelectTemplate = async () => {
        if (!payslipTemplateNo) {
            toast.error("Please select a Payslip Template first.");
            return;
        }

        setLoading(true);
        const data = {
            companyId: user.companyId,
            payslipTemplateNo,
        };

        try {
            const response = await PayslipTemplate(data);
            console.log("Template selected:", response.data);
            toast.success("Template Selected Successfully");
        } catch (error) {
            handleApiErrors(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApiErrors = (error) => {
        if (error.response && error.response.data) {
            const errorMessage = error.response.data.error?.message || "An unknown error occurred.";
            toast.error(errorMessage);
        } else {
            toast.error("Network Error! Please try again.");
        }
        console.error(error.response || error.message);
    };

    const fetchTemplate = async () => {
        try {
            const response = await TemplateGetAPI();
            const defaultTemplateId = response.data.data.payslipTemplateNo;
            if (defaultTemplateId) {
                const selectedTemplate = templates.find(template => template.id === parseInt(defaultTemplateId));
                if (selectedTemplate) {
                    setCurrentTemplate(selectedTemplate.component);
                    setPayslipTemplateNo(selectedTemplate.id);
                } else {
                    setPayslipTemplateNo(null);
                    toast.error("No valid template found for the company.");
                }
            } else {
                setPayslipTemplateNo(null);
                // toast.error("Template does not exist for the company.");
            }
        } catch (error) {
            console.error("API fetch error:", error);
        }
    };

    useEffect(() => {
        fetchTemplate();
    }, []);

    const handleViewTemplate = (id) => {
        const selectedTemplate = templates.find(template => template.id === id);
        if (selectedTemplate) {
            setCurrentTemplate(selectedTemplate.component);
            setPayslipTemplateNo(selectedTemplate.id);
        }
    };

    return (
        <LayOut>
            <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                <div className="col">
                    <h1 className="h3 mb-3"><strong>Payslip Templates</strong></h1>
                </div>
                <div className="col-auto">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><a href="/main">Home</a></li>
                            <li className="breadcrumb-item active">Payslip Templates</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="row">
                {templates.map(template => (
                    <div className="col-md-6 mb-4" key={template.id}>
                        <div
                            className="card"
                            style={{
                                backgroundColor: template.bgColor,
                                color: '#333',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                padding: '16px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <h1 className="card-title" style={{ color: template.headingColor }}>{template.title}</h1>
                            <p className="card-text">Explore this template for detailed payslip visualization.</p>
                            <button
                                type='button'
                                className='btn btn-primary'
                                onClick={() => handleViewTemplate(template.id)}
                                style={{
                                    backgroundColor: template.headingColor,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                }}
                            >
                                View Template
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                {currentTemplate}
            </div>
            <div className="col-12 d-flex justify-content-end mt-5"
                style={{ background: "none" }}
            >
                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ marginRight: "35px" }}
                    onClick={handleSelectTemplate}
                >
                    Select Template
                </button>
            </div>
        </LayOut>
    );
};

export default PayslipTemplates;
