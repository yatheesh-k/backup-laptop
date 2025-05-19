import React from 'react';

const Template = ({
  handleEdit,
  handleSave,
  handleDownload,
  salaryStructures,
  recipientName,
  fatherName,
  address,
  contactNumber,
  role,
  joiningDate,
  location,
  grossAmount,
  companyName,
  calculatedValues,
  hasCinNo,
  hasCompanyRegNo,
  companyDetails,
  logoFileName,
  isEditing ,// Get the isEditing prop
  handleGrossAmountChange,
  handleAllowanceChange,
  totalAllowances
}) => {
  return (
    <div>
      <h1>Offer Letter Template</h1>
      {/* Show different buttons based on the edit mode */}
      {isEditing ? (
        <div>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleDownload}>Download</button>
        </div>
      ) : (
        <div>
          <button onClick={handleEdit}>Edit</button>
        </div>
      )}

      <div>
        <h2>Recipient Details</h2>
        {isEditing ? (
          <div>
            {/* Input fields for editing */}
            <input type="text" defaultValue={recipientName} />
            <input type="text" defaultValue={fatherName} />
            <input type="text" defaultValue={address} />
            <input type="text" defaultValue={contactNumber} />
            <input type="text" defaultValue={role} />
            <input type="text" defaultValue={joiningDate} />
            <input type="text" defaultValue={location} />
            <input type="text" defaultValue={grossAmount}  onChange={handleGrossAmountChange}/>
            <input type="text" defaultValue={companyName} />
          </div>
        ) : (
          <div>
            {/* Display details when not editing */}
            <p>Name: {recipientName}</p>
            <p>Father's Name: {fatherName}</p>
            <p>Address: {address}</p>
            <p>Contact: {contactNumber}</p>
            <p>Role: {role}</p>
            <p>Location: {location}</p>
            <p>Joining Date: {joiningDate}</p>
            <p>Gross Amount: {grossAmount}</p>
            <p>Company: {companyName}</p>
          </div>
        )}
      </div>

      <div>
        <h3>Salary Details</h3>
        <table>
        <tbody>
        {salaryStructures && salaryStructures.length > 0 ? (
  salaryStructures.map(structure => (
    <React.Fragment key={structure.id}>
      {structure.allowances && Object.entries(structure.allowances).map(([key, value]) => {
        const valueStr = value.toString();

        return (
          <tr key={key}>
            <td>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </td>
            <td>
              <input 
                type="number" 
                value={valueStr.includes('%')
                  ? Math.floor((grossAmount * (parseFloat(valueStr) / 100)) / 12) 
                  : Math.floor(parseFloat(valueStr) / 12)} 
                onChange={(e) => handleAllowanceChange(structure.id, key, e.target.value)} 
              />
            </td>
            <td>
              <input 
                type="number" 
                value={valueStr.includes('%')
                  ? Math.floor(grossAmount * (parseFloat(valueStr) / 100)) 
                  : Math.floor(parseFloat(valueStr))} 
                onChange={(e) => handleAllowanceChange(structure.id, key, e.target.value)} 
              />
            </td>
          </tr>
        );
      })}

      {/* Add a row for total allowances */}
      <tr>
        <td><strong>Total Allowances</strong></td>
        <td colSpan="2">
          <strong>{totalAllowances}</strong>
        </td>
      </tr>
    </React.Fragment>
  ))
) : (
  <tr><td>No Salary Structure Available</td></tr>
)}



</tbody>

        </table>
      </div>

      <div>
        <h3>Calculated Values</h3>
        <p>Total Deductions: {calculatedValues.totalDeductions}</p>
        <p>Net Salary: {calculatedValues.netSalary}</p>
      </div>

      <div>
        <h3>Company Details</h3>
        {companyDetails && (
          <div>
            <p>Company Name: {companyDetails.companyName}</p>
            <p>CIN Number: {hasCinNo ? companyDetails.cinNo : 'Not Available'}</p>
            <p>Company Reg No: {hasCompanyRegNo ? companyDetails.companyRegNo : 'Not Available'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Template;
