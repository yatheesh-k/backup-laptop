import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import DataTable from "react-data-table-component";
import { PencilSquare, XSquareFill } from "react-bootstrap-icons";
import { Bounce, toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import DeletePopup from "../../Utils/DeletePopup";
import { ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import {
  DepartmentDeleteApiById,
  DepartmentGetApi,
  DepartmentPostApi,
  DepartmentPutApiById,
} from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";

const Department = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [addDepartment, setAddDeparment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItemId(null); // Reset the selected item ID
  };

  const handleCloseAddDepartmentModal = () => {
    setAddDeparment(false);
    reset();
    setEditingId(null);
  };

  const handleShowDeleteModal = (id) => {
    setSelectedItemId(id); // Set the ID of the item to be deleted
    setShowDeleteModal(true);
  };
  const fetchDepartments = async () => {
    try {
      const response = await DepartmentGetApi();
      const sortedDepartments = response.data.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setDepartments(sortedDepartments);
    } catch (error) {
      // handleApiErrors(error);
    }
  };
  useEffect(() => {
    fetchDepartments();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = {
        companyName: user.company,
        name: data.name,
      };

      let updatedDepartments = [...departments]; // Create a copy

      if (editingId) {
        const index = updatedDepartments.findIndex(
          (dept) => dept.id === editingId
        );
        if (index !== -1) {
          updatedDepartments[index] = {
            ...updatedDepartments[index],
            name: data.name,
          }; // Optimistic update
          setDepartments(updatedDepartments); // Update the state immediately
        }
        await DepartmentPutApiById(editingId, formData);
        toast.success("Department Updated Successfully");
      } else {
        const newDepartment = { ...formData }; // Assuming API returns the ID
        updatedDepartments.push(newDepartment); // Optimistic update
        setDepartments(updatedDepartments); // Update the state immediately
        await DepartmentPostApi(formData);
        toast.success("Department Created Successfully");
      }

      handleCloseAddDepartmentModal();
      reset();
      setEditingId(null);
      setTimeout(() => {
        fetchDepartments();
      }, 1500);
    } catch (error) {
      handleApiErrors(error);
      // Revert the optimistic update if the API call fails
      fetchDepartments(); // Refetch to get the correct data
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedItemId) {
      try {
        await DepartmentDeleteApiById(selectedItemId);
        toast.success("Department Deleted Successfully", {
          position: "top-right",
          transition: Bounce,
          hideProgressBar: true,
          theme: "colored",
          autoClose: 1000,
        });

        // Fetch departments after deletion
        const updatedDepartments = departments.filter(
          (department) => department.id !== selectedItemId
        );
        setDepartments(updatedDepartments);
        setTimeout(() => {
          // Only if you want to refetch after a delay
          fetchDepartments();
          handleCloseDeleteModal();
        }, 1500);
      } catch (error) {
        handleApiErrors(error);
      }
    }
  };

  const handleApiErrors = (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error &&
      error.response.data.error.message
    ) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error !");
    }
    console.error(error.response);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    setFilteredDepartments(departments);
  }, [departments]);

  const handleEdit = (id) => {
    const userToEdit = departments.find((user) => user.id === id);
    if (userToEdit) {
      setValue("name", userToEdit.name);
      setEditingId(id);
      setAddDeparment(true);
    }
  };

  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position

    // Remove leading spaces
    value = value.replace(/^\s+/g, "");

    // Ensure only alphabets, numbers, spaces, and allowed special characters like /, -, ., etc.
    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
    value = value
      .split("")
      .filter((char) => allowedCharsRegex.test(char))
      .join("");

    // Capitalize the first letter of each word but leave the rest as-is (case-sensitive) and allow special characters
    const words = value.split(" ");
    const capitalizedWords = words.map((word) => {
      if (word.length > 0) {
        // Capitalize first letter of each word, leave the rest as-is
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    });

    // Join the words back into a string
    let formattedValue = capitalizedWords.join(" ");

    // Update input value
    input.value = formattedValue;

    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  const validateName = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();

    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Department Name is Required.";
    }

    // Allow alphabetic characters, numbers, spaces, and some special characters like /, !, @, #, &...
    else if (!/^[A-Za-z\s/]+$/.test(trimmedValue)) {
      return "Only Alphabetic Characters, Spaces, and '/' are Allowed.";
    } else {
      const words = trimmedValue.split(" ");

      // Check for minimum and maximum word length
      for (const word of words) {
        // If the word is a single character and it's not the only word in the string, skip this rule
        if (word.length < 2 && words.length === 1) {
          return "Minimum Length 2 Characters Required."; // If any word is shorter than 2 characters and it's a single word
        } else if (word.length > 40) {
          return "Max Length 40 Characters Required."; // If any word is longer than 40 characters
        }
      }

      if (trimmedValue.length > 40) {
        return "Department name must not exceed 40 characters."; // If the total length of the input is more than 40 characters
      }

      // Check for multiple spaces between words
      if (/\s{2,}/.test(trimmedValue)) {
        return "No Multiple Spaces Between Words Allowed.";
      }

      // Check if the value has leading or trailing spaces (shouldn't happen due to trimming)
      if (/^\s/.test(value)) {
        return "Leading space not allowed."; // Leading space error
      } else if (/\s$/.test(value)) {
        return "Spaces at the end are not allowed."; // Trailing space error
      }
    }

    return true; // Return true if all conditions are satisfied
  };

  const getFilteredList = (searchTerm) => {
    setSearch(searchTerm);
    if (searchTerm === "") {
      setFilteredDepartments(departments);
    } else {
      const filteredList = departments.filter((department) =>
        department.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDepartments(filteredList);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setRowsPerPage(newPerPage);
    setCurrentPage(page);
  };

  // Calculate the start index and end index for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Slice the filtered data based on the current page and rows per page
  const paginatedData = filteredDepartments.slice(startIndex, endIndex);

  // Compute the serial number for each row
  const getSerialNumber = (index) => startIndex + index + 1;

  const columns = [
    {
      name: (
        <h5>
          <b>#</b>
        </h5>
      ),
      selector: (row, index) => getSerialNumber(index),
      width: "400px",
    },
    {
      name: (
        <h5>
          <b>Department Name</b>
        </h5>
      ),
      selector: (row) => row.name,
      width: "500px",
    },
    {
      name: (
        <h5>
          <b>Actions</b>
        </h5>
      ),
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "0",
              marginRight: "10px",
            }}
            onClick={() => handleEdit(row.id, row.name)}
            title="Edit"
          >
            <PencilSquare size={22} color="#2255a4" />
          </button>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "0",
              marginLeft: "5px",
            }}
            onClick={() => handleShowDeleteModal(row.id)}
            title="Delete"
            disabled={loading}
          >
            <XSquareFill size={22} color="#da542e" />
          </button>
        </div>
      ),
    },
  ];

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
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Department</strong>{" "}
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Department</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-12 col-lg-12 col-xxl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="row">
                  <div className="col-12 col-md-6 col-lg-4">
                    <button
                      onClick={() => setAddDeparment(true)}
                      className="btn btn-primary"
                      type="submit"
                    >
                      Add Department
                    </button>
                  </div>
                  <div className="col-12 col-md-6 col-lg-4"></div>
                  <div className="col-12 col-md-6 col-lg-4">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Search...."
                      value={search}
                      onInput={toInputTitleCase}
                      onChange={(e) => getFilteredList(e.target.value)}
                    />
                  </div>
                </div>
                <div
                  className="dropdown-divider"
                  style={{ borderTopColor: "#d7d9dd" }}
                />
              </div>
              <DataTable
                columns={columns}
                data={paginatedData}
                pagination
                paginationServer
                paginationTotalRows={filteredDepartments.length}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
                highlightOnHover
                striped
                noHeader
              />
            </div>

            <DeletePopup
              show={showDeleteModal}
              handleClose={handleCloseDeleteModal}
              handleConfirm={() => handleConfirmDelete(selectedItemId)}
              id={selectedItemId}
              pageName="Department"
            />

            {addDepartment && (
              <div
                role="dialog"
                aria-modal="true"
                className="fade modal show"
                tabIndex="-1"
                style={{ zIndex: "9999", display: "block" }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    {/* <ModalHeader> */}
                    <div className="modal-header d-flex justify-content-between w-100">
                      <ModalTitle>
                        {editingId ? "Update Department" : "Add Department"}
                      </ModalTitle>
                      <button
                        type="button"
                        className="btn-close" // Bootstrap's close button class
                        aria-label="Close"
                        onClick={handleCloseAddDepartmentModal} // Function to close the modal
                      ></button>
                      {/* </ModalHeader> */}
                    </div>
                    <ModalBody>
                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        id="designationForm"
                      >
                        <div
                          className="card-body"
                          style={{ width: "1060px", paddingBottom: "0px" }}
                        >
                          <div className="row">
                            <div className="col-12 col-md-6 col-lg-4 mb-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Department"
                                name="name"
                                onInput={toInputTitleCase}
                                onKeyDown={handleEmailChange}
                                autoComplete="off"
                                {...register("name", {
                                  required: "Department is Required",
                                  validate: {
                                    validateName,
                                  },
                                })}
                              />
                              {errors.name && (
                                <p className="errorMsg">
                                  {errors.name.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCloseAddDepartmentModal}
                          >
                            Cancel
                          </button>
                          <button
                            className={
                              editingId ? "btn btn-danger" : "btn btn-primary"
                            }
                            type="submit"
                            disabled={loading}
                          >
                            {loading
                              ? "Loading..."
                              : editingId
                              ? "Update Department"
                              : "Add Department"}
                          </button>
                        </div>
                      </form>
                    </ModalBody>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default Department;
