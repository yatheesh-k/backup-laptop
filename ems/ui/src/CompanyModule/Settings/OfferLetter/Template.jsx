import React, { useEffect, useState } from 'react';
import { Download } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../Context/AuthContext';
import { CompanySalaryStructureGetApi, companyViewByIdApi, OfferLetterDownload } from '../../../Utils/Axios';
import LayOut from '../../../LayOut/LayOut';

const Template = () => {
    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const date = formatDate(new Date());
    const { setValue, register, formState: { errors } } = useForm({ mode: "onChange" });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [calculatedValues, setCalculatedValues] = useState({});
    const [salaryStructures, setSalaryStructures] = useState([]);
    const[basic,setBasic]=useState(0);
    const [salaryConfigurationId, setSalaryConfigurationId] = useState(null);
    const [refNo, setRefNo] = useState('OFLTR-09');
    const [companyDetails, setCompanyDetails] = useState(null);
    const [recipientName, setRecipientName] = useState("Recipient's Name");
    const [fatherName, setFatherName] = useState("Recipient's Father's Name");
    const [address, setAddress] = useState("Recipient's Address");
    const [cityStateZip, setCityStateZip] = useState("City, State, Zip");
    const [contactNumber, setContactNumber] = useState("+91 ");
    const [role, setRole] = useState("[Role]");
    const [joiningDate, setJoiningDate] = useState("Joining date");
    const [location, setLocation] = useState("Location");
    const [grossAmount, setGrossAmount] = useState(0);
    const [companyName, setCompanyName] = useState("Company Name");
    const [hasCinNo, setHasCinNo] = useState(false);
    const [hasCompanyRegNo, setHasCompanyRegNo] = useState(false);
    const { user, logoFileName } = useAuth();

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        calculateValues();
        setIsEditing(false);
    };

    useEffect(() => {
        const fetchCompanyData = async () => {
            if (!user.companyId) return;
            try {
                const response = await companyViewByIdApi(user.companyId);
                const data = response.data;
                setCompanyDetails(data);
                setCompanyName(data?.companyName || "[Company Name]");
                Object.keys(data).forEach(key => setValue(key, data[key]));
                setHasCinNo(!!data.cinNo);
                setHasCompanyRegNo(!!data.companyRegNo);
            } catch (err) {
                setError(err);
            }
        };
        fetchCompanyData();
    }, [user.companyId, setValue, setError]);

    const fetchSalary = async () => {
        try {
            const response = await CompanySalaryStructureGetApi();
            console.log("API Response:", response); // Check the full response

            const structures = response.data.data; // Assuming this is where your structures are
            setSalaryStructures(structures); // Update state with the structures

            // Find the active salary structure
            const activeStructure = structures.find(structure => structure.status === "Active");
            console.log("Active Structure:", activeStructure); // Log the active structure

            // If an active structure is found, set the ID
            if (activeStructure) {
                setSalaryConfigurationId(activeStructure.id);
            } else {
                toast.error("No active salary structure found.");
            }
        } catch (error) {
            console.error("API fetch error:", error);
            toast.error("Error fetching salary structures.");
        }
    };

    useEffect(() => {
        fetchSalary();
    }, []);

    const calculateValues = () => {
        console.log("Gross Amount: ", grossAmount); // Log the grossAmount
    
        // if (salaryStructures.length === 0) {
        //     toast.error("No salary structure available for calculation.");
        //     return;
        // }
    
        const activeStructure = salaryStructures.find(structure => structure.status === "Active");
        if (!activeStructure) {
            toast.error("No active salary structure available.");
            return;
        }
    
        const allowances = activeStructure.allowances;
        const deductions = activeStructure.deductions;
        console.log("Deductions: ", deductions); // Log deductions to check the structure
    
        // Extract Basic Salary from allowances
        const basicSalary = allowances["Basic Salary"] ? parseFloat(allowances["Basic Salary"]) : 0; // Assuming "Basic" is the key
        console.log("Basic Salary: ", basicSalary); // Log the Basic Salary
            setBasic(basicSalary)
        const totalAllowances = Object.entries(allowances).reduce((dcc, [key, value]) => {
            let allowanceAmount = 0;
    
            if (key === "HRA" || key ==='Provident Fund Employer') {
                // If the allowance is HRA, calculate it using Basic Salary
                if (typeof value === 'string' && value.includes('%')) {
                    const percentageValue = parseFloat(value.slice(0, -1));
                    allowanceAmount = basicSalary * (percentageValue / 100); // HRA based on Basic Salary
                } else {
                    allowanceAmount = parseFloat(value);
                }
            } else {
                // For other allowances, calculate based on Gross Amount
                if (typeof value === 'string' && value.includes('%')) {
                    const percentageValue = parseFloat(value.slice(0, -1));
                    allowanceAmount = grossAmount * (percentageValue / 100);
                } else {
                    allowanceAmount = parseFloat(value);
                }
            }
            return dcc + allowanceAmount;
        }, 0);
    
        const totalDeductions = Object.entries(deductions).reduce((acc, [key, value]) => {
            let deductionAmount = 0;
            if (typeof value === 'string' && value.includes('%')) {
                const percentageValue = parseFloat(value.slice(0, -1));
                deductionAmount = grossAmount * (percentageValue / 100);
            } else {
                deductionAmount = parseFloat(value);
            }
            return acc + deductionAmount;
        }, 0);
    
        console.log("Calculated Total Deductions: ", totalDeductions); // Log totalDeductions
    
        const netSalary = grossAmount - totalDeductions;
        console.log("Net Salary: ", netSalary); // Log netSalary
    
        setCalculatedValues({
            totalAllowances,
            totalDeductions,
            netSalary,
        });
    };    

    console.log("calculateValues", calculatedValues)

    return (
        <LayOut>
            <div className='card' style={{ position: "relative", overflow: "hidden" }}>
                <div
                    style={{
                        position: "absolute",
                        top: "30%",
                        left: "20%",
                        width: "50%",
                        height: "50%",
                        backgroundImage: `url(${logoFileName})`,
                        transform: "rotate(340deg)",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        opacity: 0.3,
                        zIndex: 1,
                        pointerEvents: "none",
                    }}
                />
                <div className='card-body' style={{ paddingLeft: "20px", paddingRight: "20px", position: "relative", zIndex: "2" }}>
                    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                        <div style={{ textAlign: "right" }}>
                            {logoFileName ? (
                                <img className="align-middle" src={logoFileName} alt="Logo" style={{ height: "80px", width: "180px" }} />
                            ) : (
                                <p>Logo</p>
                            )}
                        </div>
                        <h1 style={{ textAlign: "center", fontFamily: "serif", textDecoration: "underline", paddingTop: "20px" }}>Private & Confidential</h1>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <p>Date: {date}</p>
                            <p>
                                Ref No: {isEditing ?
                                    <input
                                        type="text"
                                        value={refNo}
                                        onChange={e => setRefNo(e.target.value)} />
                                    : <b>{refNo || 'N/A'}</b>}</p>
                        </div>
                        <div style={{ position: "relative", width: "100%", height: "100%" }}></div>
                        <p><strong>To, {isEditing ? <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} /> : recipientName}</strong></p>
                        <p><strong>S/o,D/o {isEditing ? <input type="text" value={fatherName} onChange={e => setFatherName(e.target.value)} /> : fatherName}</strong></p>
                        <p><strong>{isEditing ? <input type="text" value={address} onChange={e => setAddress(e.target.value)} /> : address}</strong></p>
                        <p><strong>{isEditing ? <input type="text" value={cityStateZip} onChange={e => setCityStateZip(e.target.value)} /> : cityStateZip}</strong></p>
                        <p><strong>Contact Number: {isEditing ? <input type="text" defaultValue="+91 " value={contactNumber} onChange={e => setContactNumber(e.target.value)} /> : contactNumber}</strong></p>
                        <div style={{ margin: '40px 0' }}>
                            <p>Subject: Offer of Employment</p>
                            <p>Dear {isEditing ? <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} /> : recipientName},</p>

                            <p>
                                We welcome you to our pursuit of excellence and we feel proud to have a professional of your stature as a member of the <strong>{companyName}</strong> family and wish you a long, rewarding and satisfying career with us.
                            </p>

                            <p>
                                On behalf of <strong>{companyName}</strong>, hereinafter referred to as ‘the Company’, we are pleased to extend an offer for the position of <strong>{isEditing ? <input type="text" value={role} onChange={e => setRole(e.target.value)} /> : role}</strong> in our organization with the following mentioned details:
                            </p>

                            <ul style={{ listStyleType: "none", paddingLeft: "20px" }}>
                                <li>
                                    &rarr; You would join us on or before&nbsp;
                                    <strong>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                {...register("joiningDate", {
                                                    required: "Joining Date is required",
                                                    validate: (value) => {
                                                        return value ? true : "Invalid date";
                                                    },
                                                })}
                                                onChange={(e) => setJoiningDate(e.target.value)}
                                            />
                                        ) : (
                                            joiningDate
                                        )}
                                    </strong>
                                    {errors.joiningDate && (
                                        <p className="errorMsg">{errors.joiningDate.message}</p>
                                    )}
                                </li>

                                {/* Location */}
                                <li>
                                    &rarr; You will be deployed at our office site and your job location would be at&nbsp;
                                    <strong>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                {...register("location", {
                                                    required: "Location is required",
                                                    pattern: {
                                                        value: /^[A-Za-z ]+$/,
                                                        message: "Location can only contain alphabetic characters and spaces",
                                                    },
                                                })}
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                            />
                                        ) : (
                                            location
                                        )}
                                    </strong>
                                    {errors.location && (
                                        <p className="errorMsg">{errors.location.message}</p>
                                    )}
                                </li>

                                {/* Gross Compensation */}
                                <li>
                                    &rarr; Your gross compensation per annum is&nbsp;
                                    <strong>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                placeholder="Enter Gross Amount"
                                                min={1}
                                                max={99999999} // Maximum value you expect
                                                {...register("grossAmount", {
                                                    required: "Gross Amount is required",
                                                    valueAsNumber: true,
                                                    min: {
                                                        value: 1,
                                                        message: "Gross Amount should be a positive number",
                                                    },
                                                    max: {
                                                        value: 99999999,
                                                        message: "Gross Amount should not exceed the maximum limit",
                                                    },
                                                })}
                                                value={grossAmount}
                                                onChange={(e) => setGrossAmount(e.target.value)}
                                            />
                                        ) : (
                                            grossAmount
                                        )}
                                    </strong>
                                    {errors.grossAmount && (
                                        <p className="errorMsg">{errors.grossAmount.message}</p>
                                    )}
                                </li>
                            </ul>
                            <ul>
                                <li><strong>The proposed compensation details are attached as Annexure ’1’, and details of required documents at the time of joining are attached as Annexure ’2’.</strong></li>
                            </ul>
                            <p>
                                You will also be governed by all other instructions/rules/policies of the company, which are not specifically mentioned in this letter. For clarification, if any, regarding these instructions/rules/policies please get in touch with HR Department.
                            </p>
                            <p>
                                <strong>Probation Period:</strong> Probation period will be six months. Your service will get confirmed/extended/terminated depending upon your performance shown in the probation period and feedback received through the confirmation appraisal process.
                            </p>
                            <p>
                                <strong>Attendance:</strong> Attendance cycle will be from 26th to 25th of every month. Any employee joining after 20th of the month, their salary will be processed along with next month payroll. Any employee working as an RPO or Outdoor duty for continuous period needs to submit their approved attendance/timesheet on 25th of every month to their respective HR Team. Delay in receiving the approved attendance/timesheet will result in delay in payment of your salary.
                            </p>
                            <p>
                                <strong>Statutory benefits:</strong> You will be governed as per the respective acts of ESIC, PF, and Bonus, Gratuity etc as per the rules in force from time to time.
                            </p>
                            <p>
                                <strong>Background Check:</strong> The Company reserves the right to verify the information furnished by you in your application for employment and through other documents. If it is found that you have misinterpreted any information in your application or have furnished any false information or have concealed/suppressed any relevant material facts, your services are liable to terminate any time, without any notice or compensation in lieu thereof. You will also not be eligible for any relieving or experience letter for your tenure with the Company.
                            </p>
                            <p style={{ textAlign: "center" }}>
                                {hasCinNo ? `CIN:- ${companyDetails?.cinNo} ` :
                                    hasCompanyRegNo ? `Registration:- ${companyDetails?.companyRegNo}` :
                                        null}
                            </p>
                            <hr />
                            <div style={{ padding: "2px", textAlign: "center" }}>
                                <h6>{companyDetails?.companyName}</h6>
                                <h6>{companyDetails?.companyAddress}</h6>
                                <h6>PH: {companyDetails?.mobileNo}, Email: {companyDetails?.emailId} | Web: https://{companyDetails?.shortName}.com </h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card' style={{ position: "relative", overflow: "hidden" }}>
                <div
                    style={{
                        position: "absolute",
                        top: "30%",
                        left: "20%",
                        width: "50%",
                        height: "50%",
                        backgroundImage: `url(${logoFileName})`,
                        transform: "rotate(340deg)",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        opacity: 0.3,
                        zIndex: 1,
                        pointerEvents: "none",
                    }}
                />
                <div className='card-body' style={{ paddingLeft: "20px", paddingRight: "20px", position: "relative", zIndex: "2" }}>
                    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                        <div style={{ textAlign: "right" }}>
                            {logoFileName ? (
                                <img className="align-middle" src={logoFileName} alt="Logo" style={{ height: "80px", width: "180px" }} />
                            ) : (
                                <p>Logo</p>
                            )}
                        </div>
                        <p style={{ paddingTop: "30px" }}>
                            <strong>Place of Employment and Transfer:</strong>
                            You acknowledge and agree that you may be assigned or liable to be transferred or deputed from one place to another and / or from one department / business unit to another or any other subsidiary / associate establishment / or their contractors and clients either existing or to be set up in future anywhere in India or abroad purely at the discretion of the management depending upon the needs and requirement of the Company. On such assignment, transfer or deputation you will be governed by the Rules and Regulations and other working / service conditions as applicable at the place of deployment including to consent to add / or agree to certain other agreements. The Company will seek to give you reasonable notice of extensive travel requirements, and to take into account your personal circumstances where appropriate.
                        </p>
                        <p>
                            <strong> Leave and Holidays:</strong>
                            Public/festival holidays would be divided into fixed holidays and an optional holiday (floater) for per Calendar year, Total Number of holidays may vary as per work location and / or operation
                        </p>
                        <p>
                            You would be eligible for the annual leaves of 21 days (on pro rata basis) i.e. you would be eligible for the leaves of 1.75 days per month for every calendar (January to December) year. However, you can utilize the same only after completion of probation period with  <strong>
                                {companyName}
                            </strong> . These leaves of six months will get credited to your leave balance account.
                        </p>
                        <p>
                            <strong> Un-availed Leave cannot be encashed at the end of your service.</strong> Leaves can be accumulated till the end of calendar year only.
                        </p>
                        <p>
                            <strong>Change in Contact details:</strong>
                            Any change of residential / communication address or change of primary contact details like email ID, contact number should be intimated to the HR department officially within 3 days from the date of such change. Your communication details as indicated shall be the correct address for sending all communication to you unless otherwise intimated in writing by you. Communication addressed to you at the above address shall deem to have been duly served.
                        </p>
                        <p>
                            <strong> Cessation of Services and Notice Period:</strong>
                            If you wish to leave the services of the Company you may do so under the following conditions:
                            You need to share formal resignation email during working hours to  <strong>
                                {companyName}
                            </strong>  HR Team after formal discussion with your reporting manager. Resignation sent on weekly / public holidays, after working hours will be considered with effect from next business day. Resignation will not be considered if you have tendered the same while being on leave. You need to serve 30 days’ notice period from the date of resignation based on designation.
                        </p>
                        <p>
                            <strong> Notice Period without Cause:</strong>
                        </p>
                        <p style={{ marginTop: "-15px" }}>
                            In the event that the employment is ceased without cause, you will be provided 30 days’ notice prior to such cessation or paid severance pay in lieu of thereof equivalent to the consolidated compensation package for period of 60 days calculated on the basis of last gross salary.
                        </p>
                        <ul>
                            <li>
                                A letter of appointment shall be issued to you within 15 days of joining, subjecting the completion of all joining formalities and submission of all documents required.
                            </li>
                        </ul>
                        <p>
                            You are requested to keep the compensation information highly confidential.
                        </p>
                        <p style={{ marginTop: "-15px" }}>
                            We look forward to your joining <strong> {companyName}</strong> soon.
                        </p>
                        <p>
                            Would appreciate you acknowledging the receipt of this offer and kindly <strong>send us your acceptance of this offer by a written mail and signed copy within the next 24 hours.</strong>
                        </p>
                        <p>
                            Please do not hesitate to contact us in case you have any queries.
                        </p>
                        <p style={{ textAlign: "center" }}>
                            {hasCinNo ? `CIN:- ${companyDetails?.cinNo}` :
                                hasCompanyRegNo ? ` Registration:- ${companyDetails?.companyRegNo}` :
                                    null}
                        </p>
                        <hr />
                        <div style={{ padding: "2px", textAlign: "center" }}>
                            <h6>{companyDetails?.companyName}</h6>
                            <h6>{companyDetails?.companyAddress}</h6>
                            <h6>PH: {companyDetails?.mobileNo}, Email: {companyDetails?.emailId} | Web: https://{companyDetails?.shortName}.com </h6>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card' style={{ position: "relative", overflow: "hidden" }}>
                <div
                    style={{
                        position: "absolute",
                        top: "30%",
                        left: "20%",
                        width: "50%",
                        height: "50%",
                        backgroundImage: `url(${logoFileName})`,
                        transform: "rotate(340deg)",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        opacity: 0.3,
                        zIndex: 1,
                        pointerEvents: "none",
                    }}
                />
                <div className='card-body' style={{ paddingLeft: "20px", paddingRight: "20px", position: "relative", zIndex: "2" }}>
                    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                        <div style={{ textAlign: "right" }}>
                            {logoFileName ? (
                                <img className="align-middle" src={logoFileName} alt="Logo" style={{ height: "80px", width: "180px" }} />
                            ) : (
                                <p>Logo</p>
                            )}
                        </div>
                        <h3 style={{ textAlign: "center", fontFamily: "serif", textDecoration: "underline", paddingTop: "30px" }}>Annexure - 1</h3>
                        <p>
                            Fixed Salary breakup
                        </p>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Particulars</th>
                                <th>Per Month (INR)</th>
                                <th>Per Annum (INR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salaryStructures
                                .filter(structure => structure.status === "Active")
                                .map(structure => (
                                    <React.Fragment key={structure.id}>
                                   {Object.entries(structure.allowances).map(([key, value]) => {
    let allowanceAmount;
    if (key === "HRA") {
        // Assuming Basic Salary is part of structure and it can be accessed, calculate HRA as a percentage of Basic Salary
        if (value.includes('%')) {
            allowanceAmount = basic * (parseFloat(value) / 100); // HRA is calculated on Basic Salary
        } else {
            allowanceAmount = parseFloat(value);
        }
    } else {
        // For all other allowances, calculate excluding HRA first
        if (value.includes('%')) {
            allowanceAmount = grossAmount * (parseFloat(value) / 100);
        } else {
            allowanceAmount = parseFloat(value);
        }
    }

    return (
        <tr key={key}>
            <td>
                {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                }
            </td>
            <td>{Math.floor(allowanceAmount.toFixed(2) / 12)}</td> {/* Monthly calculation */}
            <td>{Math.floor(allowanceAmount.toFixed(2))}</td> {/* Annual calculation */}
        </tr>
    );
})}
                                         <tr>
                                            <td>Other Allowance</td>
                                            <td>{Math.round((grossAmount - calculatedValues.totalAllowances) / 12)}</td>
                                            <td>{Math.floor(grossAmount-calculatedValues.totalAllowances)}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Gross (CTC)</strong></td>
                                            <td>{Math.floor(grossAmount / 12)}</td>
                                            <td>{Math.floor(grossAmount)}</td>
                                        </tr>
                                        {Object.entries(structure.deductions).map(([key, value]) => {
                                            let deductionAmount;
                                            if (value.includes('%')) {
                                                deductionAmount = grossAmount * (parseFloat(value) / 100);
                                            } else {
                                                deductionAmount = parseFloat(value);
                                            }
                                            return (
                                                <tr key={key}>
                                                    <td>
                                                        {key
                                                            .replace(/([A-Z])/g, ' $1')
                                                            .replace(/^./, str => str.toUpperCase())
                                                        }
                                                    </td>
                                                    <td>{Math.round(deductionAmount.toFixed(2) / 12)}</td>
                                                    <td>{Math.floor(deductionAmount.toFixed(2))}</td>
                                                </tr>
                                            );
                                        })}
                                        <tr>
                                            <td><strong>Total Deductions</strong></td>
                                            <td>{calculatedValues.totalDeductions ? Math.round(calculatedValues.totalDeductions / 12) : 0}</td>
                                            <td>{calculatedValues.totalDeductions ? Math.floor(calculatedValues.totalDeductions) : 0}</td>
                                        </tr>
                                        {/* <tr>
                                            <td><strong>Total Allowances</strong></td>
                                            <td>{calculatedValues.totalAllowances ? Math.round(calculatedValues.totalAllowances / 12) : 0}</td>
                                            <td>{calculatedValues.totalAllowances ? Math.floor(calculatedValues.totalAllowances) : 0}</td>
                                        </tr> */}
                                        <tr>
                                            <td><strong>Net Salary</strong></td>
                                            <td>{calculatedValues.netSalary ? Math.round(calculatedValues.netSalary / 12) : 0}</td>
                                            <td>{calculatedValues.netSalary ? Math.floor(calculatedValues.netSalary) : 0}</td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                        </tbody>
                    </table>
                    <p style={{ paddingTop: "30px" }}>
                        Net Salary (Pretaxation) may vary due to change in applicable statutory deductions such as P. Tax, PF, ESIC, LWF etc.
                    </p>
                    <p>
                        * Income Tax, Professional Tax and other applicable taxes shall be deducted from the salary on a monthly basis as per Government Policy.
                    </p>
                    <p>
                        * Income Tax deduction is subjected to timely submission of the investment details.
                    </p>
                    <p>
                        * Pan Card submission is mandatory for the disbursement of the salary.
                    </p>
                    <p style={{ textAlign: "center" }}>
                        {hasCinNo ? ` CIN:- ${companyDetails?.cinNo} ` :
                            hasCompanyRegNo ? `Registration:- ${companyDetails?.companyRegNo}` :
                                null}
                    </p>
                    <hr />
                    <div style={{ padding: "2px", textAlign: "center" }}>
                        <h6>{companyDetails?.companyName}</h6>
                        <h6>{companyDetails?.companyAddress}</h6>
                        <h6>PH: {companyDetails?.mobileNo}, Email: {companyDetails?.emailId} | Web: https://{companyDetails?.shortName}.com </h6>
                    </div>
                </div>
            </div>
            <div className='card' style={{ position: "relative", overflow: "hidden" }}>
                <div
                    style={{
                        position: "absolute",
                        top: "30%",
                        left: "20%",
                        width: "50%",
                        height: "50%",
                        backgroundImage: `url(${logoFileName})`,
                        transform: "rotate(340deg)",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        opacity: 0.3,
                        zIndex: 3,
                        pointerEvents: "none",
                    }}
                />
                <div className='card-body' style={{ paddingLeft: "20px", paddingRight: "20px", position: "relative", zIndex: "2" }}>
                    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                        <div style={{ textAlign: "right" }}>
                            {logoFileName ? (
                                <img className="align-middle" src={logoFileName} alt="Logo" style={{ height: "80px", width: "180px" }} />
                            ) : (
                                <p>Logo</p>
                            )}
                        </div>
                        <h3 style={{ textAlign: "center", fontFamily: "serif", textDecoration: "underline", paddingTop: "30px" }}>Annexure - 2</h3>
                        <p>
                            List of Joining Documents (Original Copies of all certificates are required for verification)
                        </p>
                        <p><strong>
                            Educational Certificates
                        </strong>
                        </p>
                        <ul style={{ marginTop: "-15px" }}>
                            <li>10"& 12" Certificate</li>
                            <li>Diploma / Graduation Level / Post Graduation Certifications</li>
                            <li>Any Other Certification/ Diploma</li>
                        </ul>
                        <p><strong>
                            Work Experience Related Details
                        </strong></p>
                        <ul style={{ marginTop: "-15px" }}>
                            <li>Accepted designation letter of the last organization</li>
                            <li>Relieving letter from previous employer</li>
                            <li>Experience / Appointment letter of the last organization</li>
                        </ul>
                        <p><strong>
                            Photographs Required
                        </strong></p>
                        <ul style={{ marginTop: "-15px" }}>
                            <li>3 Passport Size Photograph</li>
                            <li>2 Postcard Size Photograph (Need to produce if ESI is Applicable)</li>
                        </ul>
                        <p><strong>
                            Address Proof (Any one of the following can be taken as an address proof)
                        </strong></p>
                        <ul style={{ marginTop: "-15px" }}>
                            <li>Ration Card / Voter ID Card</li>
                            <li>AADHAR Card</li>
                        </ul>
                    </div>
                    <table className="table" style={{ zIndex: "-1" }}>
                        <tr>
                            <td colSpan={2}>Fill the following information and Submit on your Date of Joining along with your other documents.</td>

                        </tr>
                        <tr>
                            <td style={{ textAlign: "left" }}>Emergency Contact No.</td>
                            <td>Emergency Contact No.</td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "left" }}>Blood Group (Self)</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "left" }}>PAN Card No (Mandatory)</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "left" }}>Marital Status (Single /Married)</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "left" }}>Husband’s / Wife’s Full Name </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "left" }}>Husband’s / Wife’s Date of Birth, Age </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "left" }}>Husband’s / Wife’s blood group</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "left" }}>Father's Full Name </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "left" }}>Father's Date of Birth, Age</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "left" }}>Mother's Full Name </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "left" }}>Mother's Date of Birth, Age</td>
                            <td></td>
                        </tr>
                    </table>
                    <p style={{ marginTop: "30px" }}><strong>Please Note:</strong></p>
                    <ul style={{ listStyleType: "none" }}>
                        <li>Completion and submission of all the above-mentioned documents/forms, which would be given to you along with the joining kit, is mandatory.</li>
                        <li style={{ paddingTop: "15px" }}>Noncompliance with this would entail your joining kit being declared as incomplete for which you as
                            the employee would be solely responsible. Consequently, this would delay/impact on joining process.
                        </li>
                        <li style={{ paddingTop: "15px" }}>Your present and permanent addresses/ contact details, as mentioned in your application form, are put on company’s record. You would be expected to inform the company about any change in your address and telephone numbers.</li>
                    </ul>
                    <p style={{ textAlign: "center" }}>
                        {hasCinNo ? ` CIN:- ${companyDetails?.cinNo} ` :
                            hasCompanyRegNo ? `Registration:- ${companyDetails?.companyRegNo}` :
                                null}
                    </p>
                    <hr />
                    <div style={{ padding: "2px", textAlign: "center" }}>
                        <h6>{companyDetails?.companyName}</h6>
                        <h6>{companyDetails?.companyAddress}</h6>
                        <h6>PH: {companyDetails?.mobileNo}, Email: {companyDetails?.emailId} | Web: https://{companyDetails?.shortName}.com </h6>
                    </div>
                </div>
            </div>
            {/* <div className="col-12 mt-4 d-flex justify-content-between" style={{ background: "none" }}>
                <button
                    onClick={handleEditToggle}
                    className={isEditing ? "btn btn-secondary" : "btn btn-danger"}
                >
                    {isEditing ? "Cancel" : "Edit"}
                </button>

                <button
                    type="button"
                    className={isEditing ? "btn btn-primary" : "btn btn-outline-primary"}
                    onClick={isEditing ? handleSave : handleDownload}
                    style={{ marginLeft: '20px' }}
                >
                    <span className="m-2">{isEditing ? "Save" : "Download"}</span>
                    {!isEditing && <Download size={18} className="ml-1" />}
                </button>
            </div> */}

        </LayOut >
    );
};

export default Template;