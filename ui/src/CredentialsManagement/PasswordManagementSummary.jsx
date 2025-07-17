import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Link } from "react-router-dom";
import LayOut from "../LayOut/LayOut";
import axios from "axios";
import {
  CredentialsDeleteAPIById,
  CredentialsGetAPI,
  CredentialsPatchAPIById,
  CredentialsPostAPI,
} from "../Utils/Axios";
import { Copy, Eye, EyeSlash } from "react-bootstrap-icons";
import { toast } from "react-toastify";

const PasswordManagementSummary = () => {
  const [isExistingData, setIsExistingData] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      credentials: [
        {
          credentialsName: "",
          userName: "",
          password: "",
          portalUrl: "",
        },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "credentials",
  });

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const response = await CredentialsGetAPI();
        const data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          setIsExistingData(true);
          replace(data);
        } else {
          setIsExistingData(false);
          reset({
            credentials: [
              {
                credentialsName: "",
                userName: "",
                password: "",
                portalUrl: "",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching credentials", error);
        setIsExistingData(false);
        reset({
          credentials: [
            {
              credentialsName: "",
              userName: "",
              password: "",
              portalUrl: "",
            },
          ],
        });
      }
    };

    fetchCredentials();
  }, [replace, reset]);

  // POST or PUT
  const onSubmit = async (data) => {
    try {
      for (let item of data.credentials) {
        if (item._id) {
          await CredentialsPatchAPIById(item._id, item); // Assuming PATCH API accepts (id, data)
        } else {
          await CredentialsPostAPI(item);
        }
      }

      alert("Credentials saved/updated successfully!");
    } catch (error) {
      console.error("Save/Update failed", error);
      alert("Something went wrong while saving credentials.");
    }
  };

  const handleDeleteAll = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all credentials?"
    );
    if (confirmDelete) {
      try {
        for (let item of fields) {
          if (item._id) {
            await CredentialsDeleteAPIById(item._id); // Warning: GET should not be used to delete
          }
        }

        reset({
          credentials: [
            {
              credentialsName: "",
              userName: "",
              password: "",
              portalUrl: "",
            },
          ],
        });
        setIsExistingData(false);
        alert("All credentials deleted.");
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Error occurred while deleting credentials.");
      }
    }
  };

  const handleCopy = (text, label = "Copied") => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${label} to clipboard!`);
      })
      .catch(() => {
        toast.error("Failed to copy!");
      });
  };

  return (
    <LayOut>
      <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
        <div className="col">
          <h1 className="h3 mb-3">
            <strong>Credentials Management</strong>
          </h1>
        </div>
        <div className="col-auto">
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <h4>Password Manager</h4>

              {fields.map((item, index) => (
                <div className="row mb-3" key={item.id || item._id || index}>
                  <div className="col-md-3">
                    <label className="form-label">Credential Name</label>
                    <input
                      type="text"
                      placeholder="Credential Name"
                      className="form-control"
                      {...register(`credentials.${index}.credentialsName`, {
                        required: "Required",
                        pattern: {
                          value: /^(?! )[A-Z][a-zA-Z]*(?: [A-Z][a-zA-Z]*)*$/,
                          message: "Start each word with a capital letter",
                        },
                        validate: (value) =>
                          value.trim() === value ||
                          "No leading/trailing spaces",
                      })}
                    />
                    {errors?.credentials?.[index]?.credentialsName && (
                      <p className="text-danger">
                        {errors.credentials[index].credentialsName.message}
                      </p>
                    )}
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      placeholder="Username"
                      className="form-control"
                      {...register(`credentials.${index}.userName`, {
                        required: "Required",
                        validate: (value) =>
                          value.trim() === value ||
                          "No leading/trailing spaces",
                      })}
                    />
                    {errors?.credentials?.[index]?.userName && (
                      <p className="text-danger">
                        {errors.credentials[index].userName.message}
                      </p>
                    )}
                  </div>

                  <div className="col-md-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="form-label mb-0">Password</label>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0"
                        onClick={() => handleCopy(item.password, "Password")}
                      >
                        <Copy />
                      </button>
                    </div>{" "}
                    <div className="input-group">
                      <input
                        type={showPasswords ? "text" : "password"}
                        className="form-control"
                        placeholder="Password"
                        {...register(`credentials.${index}.password`, {
                          required: "Required",
                          validate: (value) =>
                            value.trim() === value ||
                            "No leading/trailing spaces",
                        })}
                      />

                      <span className="input-group-text p-0 bg-transparent">
      <button
        type="button"
        className="btn btn-sm p-1 bg-transparent border-0"
        style={{
          borderRight: "1px solid #ced4da",
          borderRadius: 0,
        }}
        onClick={() => setShowPasswords((prev) => !prev)}
        tabIndex={-1}
      >
        {showPasswords ? <Eye size={18} /> : <EyeSlash size={18} />}
      </button>
    </span>
                    </div>
                    {errors.credentials?.[index]?.password && (
                      <p className="text-danger">
                        {errors.credentials[index].password.message}
                      </p>
                    )}
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Portal URL</label>
                    <input
                      type="url"
                      placeholder="Portal URL"
                      className="form-control"
                      {...register(`credentials.${index}.portalUrl`, {
                        required: "Required",
                        pattern: {
                          value: /^(https?):\/\/[^\s$.?#].[^\s]*$/gm,
                          message: "Invalid URL",
                        },
                        validate: (value) =>
                          value.trim() === value ||
                          "No leading/trailing spaces",
                      })}
                    />
                    {/* <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => handleCopy(item.password)}
                    >
                     <Copy/>
                    </button> */}
                    {errors?.credentials?.[index]?.portalUrl && (
                      <p className="text-danger">
                        {errors.credentials[index].portalUrl.message}
                      </p>
                    )}
                  </div>

                  <div className="col-md-1 d-flex align-items-end mb-1">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="d-flex justify-content-between mb-3">
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

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success">
                    {isExistingData ? "Update" : "Save All"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => reset({ credentials: [] })}
                  >
                    Clear
                  </button>
                  {fields.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDeleteAll}
                    >
                      Delete All
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default PasswordManagementSummary;
