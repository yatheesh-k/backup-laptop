import React from 'react';
import { useAuth } from '../../../Context/AuthContext';

const ExperienceTemplate2 = ({
    companyLogo,
    companyData,
    date,
    employeeName,
    employeeId,
    designation,
    department,
    joiningDate,
    experienceDate

}) => {
  const {logoFileName} = useAuth();

    return (
            <div
          className="watermarked"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <h4 className="text-center">EXPERIENCE CERTIFICATE</h4>
          <div className="row d-flex align-items-center p-1">
            <div className="col-6 d-flex align-items-center">
                <p className="mb-0">{date}</p>
            </div>
            <div className="col-6 d-flex justify-content-end">
                <img
                src={companyLogo}
                alt="Logo"
                style={{ height: "100px", width: "160px" }}
                />
            </div>
            </div>
          <h5 className="text-center">To Whom It May Concern,</h5>
          {/* Background image div */}
          <div
       style={{
        position: 'absolute',
        top: '30%',
        left: '20%',
        right: '30%',
        width: '50%',
        height: '50%',
        backgroundImage: `url(${logoFileName})`, // Use the logo or another image
        transform: 'rotate(340deg)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      //  filter: 'blur(2px)', // Optional: adjust blur as needed
        zIndex: 1, // Ensure it's behind the content
      }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2, // Bring the content in front
              padding: "20px",
              backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional: semi-transparent background for contrast
              backdropFilter: "blur(2px)", // Optional: backdrop blur
            }}
          >
            <p>
              This letter certifies that <strong>{employeeName}</strong>with and ID <strong>{employeeId}</strong> was a valued member of our team at <strong>{companyData.companyName}</strong> as a <strong>{designation}</strong> in the <strong>{department} </strong> Department from {joiningDate} to {experienceDate}.
            </p>
            <p>
              During <strong>{employeeName}</strong>’s employment, he/she exhibited exceptional
              proficiency in coding and software development. He/She actively
              participated in multiple projects, demonstrating strong
              problem-solving abilities and meticulous attention to detail.{" "}
              <strong>{employeeName}</strong> consistently met project deadlines and
              collaborated seamlessly with team members to ensure the delivery
              of high-quality software solutions.
            </p>
            <p>
              <strong>{employeeName}</strong>’s dedication and hard work significantly
              contributed to the success of our projects. His/Her innovative ideas
              and proactive approach were instrumental in overcoming challenges
              and achieving project objectives.
            </p>
            <p>
              We commend <strong>{employeeName}</strong> for his outstanding performance and
              professionalism throughout his/her tenure with{" "}
              {companyData.companyName}. His/Her contributions have been invaluable
              to our team, and we have no doubt that he/she will continue to excel
              in his/her future endeavors.
            </p>

            <div className="mt-5 pt-3">
              <p className='mb-5'>Sincerely,</p>
              <div className='mt-5 pt-5'>
              <p>Authorized Signature</p>
              <p>{companyData.companyName}</p>
              <p>{companyData.mobileNo},{companyData.emailId}</p>
              <p>{companyData.companyAddress}</p>
              </div>
            </div>
          </div>
        </div>
    );
}

export default ExperienceTemplate2;
