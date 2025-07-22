import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserForm from './UserForm';
import { getUserById, UserPatchApi } from '../../Utils/Axios';
import LayOut from '../../LayOut/LayOut';
import { toast } from 'react-toastify';

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [defaultValues, setDefaultValues] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserById(id);
        setDefaultValues(res.data.data[0]);
      } catch (err) {
        console.error('Error fetching user:', err);
        toast.error('Failed to load user data');
      }
    };
    fetchUser();
  }, [id]);

  const onSubmit = async (data) => {
    try {
      await UserPatchApi(id, data);
      toast.success("User updated successfully", {
        autoClose: 1000,  // Show for 2 seconds
        onClose: () => {
          navigate(-1); // 👈 Go back to the previous page
        }
      });
      
    } catch (err) {
  console.error('Error adding user:', err);
  const errorMessage =
    err?.response?.data?.error?.message || "Something went wrong!";
  toast.error(errorMessage);

    }
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1">
          <div className="col">
            <h1 className="h3">
              <strong>User Edit Form</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  User Edit Form
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title text-dark">Edit User</h5>
              </div>
              {defaultValues ? (
                <UserForm
                  onSubmit={onSubmit}
                  defaultValues={defaultValues}
                  isEdit
                />
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default UpdateUser;