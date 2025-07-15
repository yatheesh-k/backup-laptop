import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DepartmentGetApi } from "../../Utils/Axios";
import {
  toInputTitleCase,
  validateEmail,
  validateFirstName,
  validateLastName,
} from "../../Utils/Validate";
import Loader from "../../Utils/Loader";

const USER_TYPES = [
  { id: "Admin", name: "Admin" },
  { id: "Accountant", name: "Accountant" },
  { id: "HR", name: "HR" },
];

const UserForm = ({ onSubmit, defaultValues = {}, isEdit = false }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmployee, setShowEmployee] = useState(false); // ← control employee visibility
  const departmentWatch = watch("department");

  const employee = defaultValues?.employee;

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await DepartmentGetApi();
        setDepartments(res.data.data);
      } catch (err) {
        console.error("Error fetching departments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    if (departmentWatch) {
      setValue("designation", "");
    }
  }, [departmentWatch, setValue]);

  if (loading) return <Loader />;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 border rounded bg-light"
    >
      {/* Basic User Fields */}
      <div className="row">
        <div className="mb-3 col-md-6">
          <label className="form-label">First Name</label>
          <input
            className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
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
            className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
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
            className={`form-control ${errors.emailId ? "is-invalid" : ""}`}
            {...register("emailId", {
              required: "Email is required",
              validate: validateEmail,
            })}
            onKeyPress={(e) => {
              if (e.key === ' ') e.preventDefault();
            }}
            disabled={isEdit}
          />
          <div className="invalid-feedback">{errors.emailId?.message}</div>
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">User Type</label>
          <select
            {...register("userType", { required: "User Type is required" })}
            className={`form-select ${errors.userType ? "is-invalid" : ""}`}
          >
            <option value="">Select User Type</option>
            {USER_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">{errors.userType?.message}</div>
        </div>
      </div>

      <div className="row">
        <div className="mb-3 col-md-6">
          <label className="form-label">Department</label>
          <select
            {...register("department", {
              required: "Department is required",
              onChange: () => setValue("designation", ""),
            })}
            className={`form-select ${errors.department ? "is-invalid" : ""}`}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">{errors.department?.message}</div>
        </div>
      </div>

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
