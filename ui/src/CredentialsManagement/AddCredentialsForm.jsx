import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import LayOut from "../LayOut/LayOut";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { validatePassword } from "../Utils/Validate";

const AddCredentialForm = () => {
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      credentials: [
        { credentialsName: "", userName: "", password: "", portalUrl: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "credentials",
  });

  const onSubmit = async (data) => {
    try {
      // API call to your endpoint
      const response = await 
      toast.success("Credentials saved successfully!");
      console.log("Saved:", response.data);
      reset();
    } catch (error) {
      toast.error("Failed to save credentials.");
      console.error("API Error:", error);
    }
  };

  return (
    <LayOut>
      <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
        <div className="col">
          <h1 className="h3 mb-3">
            <strong>Credentials Management</strong>
          </h1>
        </div>
        <div className="col-auto" style={{ paddingBottom: "20px" }}>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/main" className="custom-link">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active">Credentials Management</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mt-4">
        <div className="card">
          <div className="card-body">
            <form className="mt-3" onSubmit={handleSubmit(onSubmit)}>
              <h5>Add Credentials</h5>
              {fields.map((item, index) => (
                <div key={item.id} className="border p-3 mb-3 rounded">
                  <div className="row">
                    <div className="col-md-3 mb-2">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register(`credentials.${index}.credentialsName`, {
                          required: "Category is required",
                          pattern: {
                            value: /^(?! )[A-Z][a-z]*(?: [A-Z][a-z]*)*(?<! )$/,
                            message:
                              "Start each word with a capital. No leading/trailing/multiple spaces.",
                          },
                        })}
                      />
                      {errors.credentials?.[index]?.credentialsName && (
                        <small className="text-danger">
                          {errors.credentials[index].credentialsName.message}
                        </small>
                      )}
                    </div>

                    <div className="col-md-3 mb-2">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register(`credentials.${index}.userName`, {
                          required: "Username is required",
                          pattern: {
                            value: /^\S+$/,
                            message: "No leading/trailing spaces.",
                          },
                        })}
                      />
                      {errors.credentials?.[index]?.userName && (
                        <small className="text-danger">
                          {errors.credentials[index].userName.message}
                        </small>
                      )}
                    </div>

                    <div className="col-md-3 mb-2">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        {...register(`credentials.${index}.password`, {
                          required: "Password is required",
                          validate: validatePassword,
                        })}
                      />
                      {errors.credentials?.[index]?.password && (
                        <small className="text-danger">
                          {errors.credentials[index].password.message}
                        </small>
                      )}
                    </div>

                    <div className="col-md-3 mb-2">
                      <label className="form-label">Portal URL</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register(`credentials.${index}.portalUrl`, {
                          required: "URL is required",
                          pattern: {
                            value: /^\S+$/,
                            message: "No leading/trailing spaces.",
                          },
                        })}
                      />
                      {errors.credentials?.[index]?.portalUrl && (
                        <small className="text-danger">
                          {errors.credentials[index].portalUrl.message}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    append({
                      credentialsName: "",
                      userName: "",
                      password: "",
                      portalUrl: "",
                    })
                  }
                >
                  + Add More
                </button>

                <div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      reset({
                        credentials: [
                          {
                            credentialsName: "",
                            userName: "",
                            password: "",
                            portalUrl: "",
                          },
                        ],
                      })
                    }
                  >
                    Clear
                  </button>
                  <button type="submit" className="btn btn-success ms-2">
                    Save All
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default AddCredentialForm;
