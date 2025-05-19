import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { PencilSquare, XSquareFill } from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import { ModalBody, ModalHeader, ModalTitle } from 'react-bootstrap';
import { Bounce, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DeletePopup from '../../Utils/DeletePopup';
import LayOut from '../../LayOut/LayOut';
import {
  DesignationDeleteApiById,
  DesignationGetApi,
  DesignationPostApi,
  DesignationPutApiById
} from '../../Utils/Axios';
import { useAuth } from '../../Context/AuthContext';

const Designation = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({ mode: "onChange" });
  const [designations, setDesignations] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addDesignation, setAddDesignation] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState(null); 
  const { user } = useAuth();

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItemId(null);
  };

  const handleShowDeleteModal = (id) => {
    setSelectedItemId(id);
    setShowDeleteModal(true);
  };

  const handleCloseAddDesignationModal = () => {
    setAddDesignation(false);
    reset();
  };

  const fetchDesignation = async () => {
    try {
      const designations = await DesignationGetApi();
      const sortedDesignations = designations.sort((a, b) => a.name.localeCompare(b.name));
      setDesignations(sortedDesignations);
    } catch (error) {
      // handleApiErrors(error);
    }
  };

  useEffect(() => {
    fetchDesignation();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = {
        companyName: user.company,
        name: data.name
      };
  
      let updatedDesignations = [...designations]; // Create a copy for optimistic update
  
      if (editingUserId) {
        const index = updatedDesignations.findIndex(dept => dept.id === editingUserId); // Find the index of the designation to update
        if (index !== -1) {
          updatedDesignations[index] = { ...updatedDesignations[index], name: data.name }; // Optimistic update
          setDesignations(updatedDesignations); // Update the state immediately
        }
        await DesignationPutApiById(editingUserId, formData); // Await the actual API call
        toast.success('Designation Updated Successfully');
      } else {
        const newDesignation = { ...formData }; // Create a new designation object (you might need to add the ID if your API returns it)
        updatedDesignations.push(newDesignation); // Optimistic update
        setDesignations(updatedDesignations); // Update the state immediately
        await DesignationPostApi(formData); // Await the actual API call
        toast.success('Designation Created Successfully');
      }
  
      setAddDesignation(false); // Close the modal *after* successful update
      reset();
      setEditingUserId(null);
      setTimeout(() => {
        fetchDesignation();
      }, 1500);
    } catch (error) {
      handleApiErrors(error);
      // Revert the optimistic update in case of error
      fetchDesignation(); // Refetch designations from the API to correct the UI
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedItemId) {
      try {
        await DesignationDeleteApiById(selectedItemId);
        toast.success("Designation Deleted Successfully", {
          position: "top-right",
          transition: Bounce,
          hideProgressBar: true,
          theme: "colored",
          autoClose: 1000,
        });
        const updatedDesignations = designations.filter(designation => designation.id !== selectedItemId);
        setDesignations(updatedDesignations);
        setTimeout(() => {
          fetchDesignation();
          handleCloseDeleteModal();
        }, 2000);
      } catch (error) {
        handleApiErrors(error);
        // If there's an error, revert to the original state (not shown in your code)
        setDesignations(designations); // Reset to original state
      } finally {
        handleCloseDeleteModal();
      }
    }
  };


  const handleApiErrors = (error) => {
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error !");
    }
    console.error(error.response);
  };

  const validateName = (value) => {
    // Trim leading and trailing spaces before validation
    const trimmedValue = value.trim();
  
    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Designation Name is Required.";
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
          return "Minimum Length 2 Characters Required.";  // If any word is shorter than 2 characters and it's a single word
        } else if (word.length > 40) {
          return "Max Length 40 Characters Required.";  // If any word is longer than 40 characters
        }
      }
  
      // Check for the total length of the string after trimming (no more than 40 characters)
      if (trimmedValue.length > 40) {
        return "Designation name must not exceed 40 characters.";  // If the total length of the input is more than 40 characters
      }
  
      // Check for multiple spaces between words
      if (/\s{2,}/.test(trimmedValue)) {
        return "No Multiple Spaces Between Words Allowed.";
      }
  
      // Check if the value has leading or trailing spaces (shouldn't happen due to trimming)
      if (/^\s/.test(value)) {
        return "Leading space not allowed.";  // Leading space error
      } else if (/\s$/.test(value)) {
        return "Spaces at the end are not allowed.";  // Trailing space error
      }
    }
  
    return true; // Return true if all conditions are satisfied
  };

  useEffect(() => {
    setFilteredData(designations);
  }, [designations]);

  const getFilteredList = (searchTerm) => {
    setSearch(searchTerm);
    if (searchTerm === '') {
      setFilteredData(designations);
    } else {
      const filteredList = designations.filter(designation =>
        designation.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filteredList);
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
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Compute the serial number for each row
  const getSerialNumber = (index) => startIndex + index + 1;

  const columns = [
    {
      name: <h5><b>#</b></h5>,
      selector: (row, index) => getSerialNumber(index),
      width: "400px"
    },
    {
      name: <h5><b>Designation</b></h5>,
      selector: (row) => row.name,
      width: "500px"
    },
    {
      name: <h5><b>Actions</b></h5>,
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent", border: "none", padding: "0", marginRight: "10px" }}
            onClick={() => handleEdit(row.id)}
            title='Edit'
          >
            <PencilSquare size={22} color='#2255a4' />
          </button>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent", border: "none", padding: "0", marginLeft: "5px" }}
            onClick={() => handleShowDeleteModal(row.id)}
            title='Delete'
          >
            <XSquareFill size={22} color='#da542e' />
          </button>
        </div>
      )
    }
  ];

  const handleEdit = (id) => {
    const userToEdit = designations.find(user => user.id === id);
    if (userToEdit) {
      setValue('name', userToEdit.name);
      setEditingUserId(id);
      setAddDesignation(true);
    }
  };
  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position

    // Remove leading spaces
    value = value.replace(/^\s+/g, '');

    // Ensure only alphabets, numbers, spaces, and allowed special characters like /, -, ., etc.
    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
    value = value.split('').filter(char => allowedCharsRegex.test(char)).join('');

    // Capitalize the first letter of each word but leave the rest as-is (case-sensitive) and allow special characters
    const words = value.split(' ');
    const capitalizedWords = words.map(word => {
      if (word.length > 0) {
        // Capitalize first letter of each word, leave the rest as-is
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    });

    // Join the words back into a string
    let formattedValue = capitalizedWords.join(' ');

    // Update input value
    input.value = formattedValue;

    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  const handleEmailChange = (e) => {
    // Get the current value of the input field
    const value = e.target.value;

    // Check if the value is empty
    if (value.trim() !== '') {
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
            <h1 className="h3 mb-3"><strong>Designation</strong> </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  Designation
                </li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-lg-12 col-xxl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className='row mb-2'>
                  <div className='col-12 col-md-6 col-lg-4'>
                    <button
                      onClick={() => setAddDesignation(true)}
                      className="btn btn-primary"
                      type='submit'
                    >
                      Add Designation

                    </button>
                  </div>
                  <div className='col-12 col-md-6 col-lg-4'></div>
                  <div className='col-12 col-md-6 col-lg-4'>
                    <input
                      type='search'
                      className="form-control"
                      placeholder='Search....'
                      value={search}
                      onInput={toInputTitleCase}
                      onChange={(e) => getFilteredList(e.target.value)}
                    />
                  </div>
                </div>
                <div className="dropdown-divider" style={{ borderTopColor: "#d7d9dd" }} />
              </div>
              <DataTable
                columns={columns}
                data={paginatedData}
                pagination
                paginationServer
                paginationTotalRows={filteredData.length}
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
              pageName="Designation"
            />

            {addDesignation && (
              <div
                role='dialog'
                aria-modal="true"
                className='fade modal show'
                tabIndex="-1"
                style={{ zIndex: "9999", display: "block" }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <ModalHeader>
                      <ModalTitle>{editingUserId ? "Update Designation" : "Add Designation"}</ModalTitle>
                      <button
                        type="button"
                        className="btn-close" // Bootstrap's close button class
                        aria-label="Close"
                        onClick={handleCloseAddDesignationModal} // Function to close the modal
                      ></button>
                    </ModalHeader>
                    <ModalBody>
                      <form onSubmit={handleSubmit(onSubmit)} id='designationForm'>
                        <div className="card-body" style={{ width: "1060px", paddingBottom: "0px" }}>
                          <div className='row'>
                            <div className='col-12 col-md-6 col-lg-4 mb-2'>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Designation"
                                name='name'
                                id='designation'
                                onInput={toInputTitleCase}
                                onKeyDown={handleEmailChange}
                                autoComplete='off'
                                {...register("name", {
                                  required: "Designation is Required",
                                  validate: {
                                    validateName,
                                  },
                                })}
                              />
                              {errors.name && (<p className='errorMsg'>{errors.name.message}</p>)}
                            </div>
                          </div>
                        </div>
                        <div className='modal-footer'>
                          <button
                            type='button'
                            className="btn btn-secondary"
                            onClick={handleCloseAddDesignationModal}
                          >
                            Cancel
                          </button>
                          <button
                            className={editingUserId ? "btn btn-danger" : "btn btn-primary"}
                            type='submit'
                          >
                            {editingUserId ? "Update Designation" : "Add Designation"}
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

export default Designation;