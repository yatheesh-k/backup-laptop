import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  toInputTitleCase,
  validateEmail,
  validateFirstName,
  validateLastName,
} from "../../Utils/Validate";

const USER_TYPES = [
  { id: "Admin", name: "Admin" },
  { id: "Accountant", name: "Accountant" },
  { id: "HR", name: "HR" },
];

// Role mapping per userType
const ROLES_BY_USER_TYPE = {
  Admin: ["hr_management", "invoice_management", "ca"],
  HR: ["hr_management"],
  Accountant: ["invoice_management", "ca"],
};

// Role labels for UI
const ROLE_LABELS = {
  hr_management: 'HR Management',
  invoice_management: 'Invoice Management',
  ca: 'Chartered Accountant',
};

const UserForm = ({
  onSubmit,
  defaultValues = {},
  isEdit = false,
  userRole,
  resourceType,
}) => {
  const {
    register,
    handleSubmit,
    reset,setValue,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const [showEmployee, setShowEmployee] = useState(false); // ← control employee visibility

  const employee = defaultValues?.employee;
  const userTypeWatch = watch("userType");
    // Reset roles when userType changes
  useEffect(() => {
    setValue('roles', []);
  }, [userTypeWatch, setValue]);

  // Get allowed roles based on selected userType
  const roleOptions = userTypeWatch ? ROLES_BY_USER_TYPE[userTypeWatch] || [] : [];

  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4"
    >
    
      {/* Basic User Fields */}
      <div className="row">
        <div className="mb-3 col-md-6">
          <label className="form-label">First Name</label>
          <input
            className={`form-control bg-white ${errors.firstName ? "is-invalid" : ""}`}
            onInput={toInputTitleCase}
            {...register("firstName", {
              required: "First Name is required",
              validate: validateFirstName,
            })}
          />
          <div className="invalid-feedback">{errors.firstName?.message}</div>
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">Last Name</label>
          <input
            className={`form-control bg-white ${errors.lastName ? "is-invalid" : ""}`}
            onInput={toInputTitleCase}
            {...register("lastName", {
              required: "Last Name is required",
              validate: validateLastName,
            })}
          />
          <div className="invalid-feedback">{errors.lastName?.message}</div>
        </div>
      </div>

      <div className="row">
        <div className="mb-3 col-md-6">
          <label className="form-label">Email</label>
          <input
            type="email"
            className={`form-control bg-white ${errors.emailId ? "is-invalid" : ""}`}
            {...register("emailId", {
              required: "Email is required",
              validate: validateEmail,
            })}
            onKeyPress={(e) => {
              if (e.key === " ") e.preventDefault();
            }}
            disabled={isEdit}
          />
          <div className="invalid-feedback">{errors.emailId?.message}</div>
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">User Type</label>
          <select
            {...register("userType", { required: "User type is required" })}
            className="form-select"
          >
            <option value="">Select User Type</option>
            {USER_TYPES.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">{errors.userType?.message}</div>
        </div>
      </div>
{roleOptions.length > 0 && (
          <div className="mb-3">
            <label>Roles</label>
            <div>
              {roleOptions.map((role) => (
                <div key={role} className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={role}
                    {...register('roles')}
                  />
                  <label className="form-check-label">{ROLE_LABELS[role]}</label>
                </div>
              ))}
            </div>
          </div>
        )}
      {/* Radio Button to toggle employee view */}
      {isEdit && (
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="employeeToggle"
            checked={showEmployee}
            onChange={() => setShowEmployee(!showEmployee)}
          />
          <label className="form-label" htmlFor="employeeToggle">
            View Employee Details
          </label>
        </div>
      )}
      {/* Conditional rendering of employee fields */}
      {showEmployee && (
        <>
          <hr />
          <h5 className="text-dark m-2">Employee Details</h5>
          {employee ? (
            <>
              <div className="row">
                <div className="mb-3 col-md-6">
                  <label className="form-label">Employee ID</label>
                  <input
                    className="form-control"
                    defaultValue={employee.employeeId}
                    disabled
                  />
                </div>
                <div className="mb-3 col-md-6">
                  <label className="form-label">Designation</label>
                  <input
                    className="form-control"
                    defaultValue={employee.designationName}
                    disabled
                  />
                </div>
              </div>

              <div className="row">
                <div className="mb-3 col-md-6">
                  <label className="form-label">Mobile No</label>
                  <input
                    className="form-control"
                    defaultValue={employee.mobileNo}
                    disabled
                  />
                </div>
                <div className="mb-3 col-md-6">
                  <label className="form-label">Date of Birth</label>
                  <input
                    className="form-control"
                    defaultValue={employee.dateOfBirth}
                    disabled
                  />
                </div>
              </div>

              <div className="row">
                <div className="mb-3 col-md-6">
                  <label className="form-label">PAN No</label>
                  <input
                    className="form-control"
                    defaultValue={employee.panNo}
                    disabled
                  />
                </div>
                <div className="mb-3 col-md-6">
                  <label className="form-label">Aadhaar ID</label>
                  <input
                    className="form-control"
                    defaultValue={employee.aadhaarId}
                    disabled
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="alert alert-warning">
              No employee data found for this user.
            </div>
          )}
        </>
      )}

      {/* Submit Button */}
      <div className="row">
        <div className="col-12 text-end">
          <button type="submit" className="btn btn-primary">
            {isEdit ? "Update User" : "Add User"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default UserForm;
