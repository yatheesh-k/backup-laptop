import React, { useState, useEffect } from "react";
import { XSquareFill, FileEarmarkPdf, FileEarmarkWord, FileEarmarkImage, Download, ArrowLeft } from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Slide, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import LayOut from "../../LayOut/LayOut";
import { CandidateDeleteApi } from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";
import { fetchCandidates, removeCandidateFromState } from "../../Redux/CandidateSlice";
import DeletePopup from "../../Utils/DeletePopup";
import Loader from "../../Utils/Loader";
import { getDocumentByIdAPI } from "../../Utils/Axios";

const CandidatesView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { candidates, loading, error } = useSelector((state) => state.candidates);
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [isFetching, setIsFetching] = useState(true);
    const { employee } = useAuth();
    const companyId = employee?.companyId;
    const [documents, setDocuments] = useState([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showDocumentsModal, setShowDocumentsModal] = useState(false);

    useEffect(() => {
        if (companyId) {
            setIsFetching(true);
            const timer = setTimeout(() => {
                dispatch(fetchCandidates(companyId)).finally(() => setIsFetching(false));
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [dispatch, companyId]);

    useEffect(() => {
        console.log("Candidates from Redux store:", candidates);
    }, [candidates]);

    useEffect(() => {
        if (candidates && Array.isArray(candidates)) {
            const result = candidates.filter((candidate) => {
                const fullName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.toLowerCase();
                return (
                    fullName.includes(search.toLowerCase()) ||
                    (candidate.emailId && candidate.emailId.toLowerCase().includes(search.toLowerCase())) ||
                    (candidate.mobileNo && candidate.mobileNo.includes(search))
                );
            });
            setFilteredData(result);
        } else {
            setFilteredData([]);
            toast.error(error);
        }
    }, [search, candidates, error]);

    const handleOpenDeleteModal = (candidateId) => {
        setSelectedItemId(candidateId);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedItemId(null);
    };

    const handleDelete = async (id) => {
        if (!id) return;
        try {
            await CandidateDeleteApi(id);
            dispatch(removeCandidateFromState(id));
            toast.success("Candidate deleted successfully", {
                position: "top-right",
                transition: Slide,
                hideProgressBar: true,
                theme: "colored",
                autoClose: 1000,
            });
        } catch (error) {
            console.error("Error in handleDelete:", error.response || error);
            toast.error(error.response?.data?.message || "Failed to delete candidate", {
                position: "top-right",
                transition: Slide,
                hideProgressBar: true,
                theme: "colored",
                autoClose: 2000,
            });
        } finally {
            handleCloseDeleteModal();
        }
    };

    const handleViewDocuments = async (candidate) => {
        try {
            setSelectedCandidate(candidate);
            setDocumentsLoading(true);

            const response = await getDocumentByIdAPI(candidate.id);

            if (response?.data?.documentEntities) {
                setDocuments(transformApiResponse(response.data));
            } else {
                setDocuments([]);
                toast.info('No documents found for this candidate');
            }
        } catch (error) {
            console.error('Error fetching documents:', error);

            if (error.response) {
                const status = error.response.status;

                switch (status) {
                    case 404:
                        toast.warning('Documents not found for this candidate.');
                        break;
                    case 401:
                        toast.error('Unauthorized access. Please log in again.');
                        break;
                    case 500:
                        toast.error('Server error. Please try again later.');
                        break;
                    default:
                        toast.error(`Unexpected error (${status}). Please try again.`);
                }
            } else {
                toast.error('Network error or server not reachable.');
            }

            setDocuments([]);
        } finally {
            setDocumentsLoading(false);
            setShowDocumentsModal(true);
        }
    };


    const transformApiResponse = (apiData) => {
        if (!apiData || !apiData.documentEntities) return [];

        return apiData.documentEntities.map(doc => ({
            name: doc.docName,
            url: doc.filePath,
            status: 'uploaded',
            type: 'application/pdf',
            size: 0
        }));
    };

    const getFileIcon = (type, name) => {
        if (type?.includes('pdf') || name?.toLowerCase().endsWith('.pdf')) {
            return <FileEarmarkPdf className="text-danger" size={24} />;
        } else if (type?.includes('word') || name?.toLowerCase().endsWith('.doc') || name?.toLowerCase().endsWith('.docx')) {
            return <FileEarmarkWord className="text-primary" size={24} />;
        } else if (type?.includes('image') || ['.jpg', '.jpeg', '.png', '.gif'].some(ext => name?.toLowerCase().endsWith(ext))) {
            return <FileEarmarkImage className="text-success" size={24} />;
        }
        return <FileEarmarkPdf className="text-secondary" size={24} />;
    };

    const toInputTitleCase = (e) => {
        const input = e.target;
        let value = input.value;
        const cursorPosition = input.selectionStart;
        value = value.replace(/^\s+/g, '');
        const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
        value = value.split('').filter(char => allowedCharsRegex.test(char)).join('');
        const words = value.split(' ');
        const capitalizedWords = words.map(word => {
            if (word.length > 0) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return '';
        });
        let formattedValue = capitalizedWords.join(' ');
        if (formattedValue.length > 2) {
            formattedValue = formattedValue.slice(0, 2) + formattedValue.slice(2).replace(/\s+/g, ' ');
        }
        input.value = formattedValue;
        input.setSelectionRange(cursorPosition, cursorPosition);
    };

    const columns = [
        {
            name: <h6><b>#</b></h6>,
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            width: "45px",
        },
        {
            name: <h6><b>Full Name</b></h6>,
            selector: (row) => (
                <div title={`${row.firstName || ""} ${row.lastName || ""}`}>
                    {`${(row.firstName?.length > 10 ? row.firstName.slice(0, 10) + '...' : row.firstName) || "N/A"} 
           ${(row.lastName?.length > 10 ? row.lastName.slice(0, 10) + '...' : row.lastName) || ""}`}
                </div>
            ),
            width: "180px",
        },
        {
            name: <h6><b>Mobile</b></h6>,
            selector: (row) => row.mobileNo || "N/A",
            width: "150px",
        },
        {
            name: <h6><b>Email</b></h6>,
            selector: (row) => (
                <div title={row.emailId || "N/A"}>
                    {row.emailId?.length > 20 ? `${row.emailId.slice(0, 20)}...` : row.emailId || "N/A"}
                </div>
            ),
            width: "200px",
        },
        {
            name: <h6><b>Hiring Date</b></h6>,
            selector: (row) => row.dateOfHiring || "N/A",
            format: (row) => {
                if (!row.dateOfHiring) return "N/A";
                const date = new Date(row.dateOfHiring);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            },
            width: "140px",
        },
        {
            name: <h6><b>Status</b></h6>,
            cell: (row) => (
                <span className={`badge ${row.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                    {row.status}
                </span>
            ),
            width: "100px",
        },
        {
            name: <h6><b>Actions</b></h6>,
            cell: (row) => (
                <div className="d-flex">
                    <button
                        className="btn btn-sm me-2"
                        style={{ backgroundColor: "transparent", border: "none" }}
                        onClick={() => handleViewDocuments(row)}
                        title="View Documents"
                    >
                        <i className="bi bi-file-earmark-text" style={{ fontSize: "1.2rem", color: "#0d6efd" }}></i>
                    </button>
                    <button
                        className="btn btn-sm me-2"
                        style={{ backgroundColor: "transparent", border: "none" }}
                        onClick={() => navigate(`/candidate-to-employee/${row.id}`, {
                            state: {
                                candidate: {
                                    // Only pass basic details (no email)
                                    id: row.id,
                                    firstName: row.firstName,
                                    lastName: row.lastName,
                                    mobileNo: row.mobileNo
                                }
                            }
                        })}
                        title="Register as Employee"
                    >
                        <i className="bi bi-person-plus" style={{ fontSize: "1.2rem", color: "#198754" }}></i>
                    </button>
                    <button
                        className="btn btn-sm"
                        style={{ backgroundColor: "transparent", border: "none" }}
                        onClick={() => handleOpenDeleteModal(row.id)}
                        title="Delete"
                    >
                        <XSquareFill size={22} color="#da542e" />
                    </button>
                </div>
            ),
            width: "120px",
        }
    ];

    const getFilteredList = (searchTerm) => {
        setSearch(searchTerm);
    };

    return (
        <LayOut>
            <div className="container-fluid p-0">
                {(isFetching || loading) ? (
                    <div className="row">
                        <div className="col-12">
                            <Loader />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                            <div className="col">
                                <h1 className="h3 mb-3">
                                    <strong>Candidates View</strong>
                                </h1>
                            </div>
                            <div className="col-auto">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-0">
                                        <li className="breadcrumb-item">
                                            <Link to="/main" className="custom-link">Home</Link>
                                        </li>
                                        <li className="breadcrumb-item active">Candidates</li>
                                        <li className="breadcrumb-item active">Candidates View</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-lg-12 col-xxl-12 d-flex">
                                <div className="card flex-fill">
                                    <div className="card-header">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <Link to={"/candidateRegistration"}>
                                                    <button className="btn btn-primary">Add Candidate</button>
                                                </Link>
                                            </div>
                                            <div className="col-md-4 offset-md-4 d-flex justify-content-end">
                                                <input
                                                    type="search"
                                                    className="form-control"
                                                    placeholder="Search..."
                                                    value={search}
                                                    onInput={toInputTitleCase}
                                                    onChange={(e) => getFilteredList(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <DataTable
                                        columns={columns}
                                        data={filteredData}
                                        pagination
                                        paginationPerPage={rowsPerPage}
                                        onChangePage={(page) => setCurrentPage(page)}
                                        onChangeRowsPerPage={(perPage) => setRowsPerPage(perPage)}
                                    />
                                </div>
                                <DeletePopup
                                    show={showDeleteModal}
                                    handleClose={handleCloseDeleteModal}
                                    handleConfirm={handleDelete}
                                    id={selectedItemId}
                                    pageName="Candidate Details"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Documents Modal */}
                {showDocumentsModal && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Documents for {selectedCandidate?.firstName} {selectedCandidate?.lastName}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            setShowDocumentsModal(false);
                                            setDocuments([]);
                                        }}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    {documentsLoading ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-3">Loading documents...</p>
                                        </div>
                                    ) : documents.length === 0 ? (
                                        <div className="text-center py-5">
                                            <p className="text-muted">No documents found for this candidate</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Document</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {documents.map((doc, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    {getFileIcon(doc.type, doc.name)}
                                                                    <span className="ms-3">{doc.name}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <a
                                                                    href={doc.url}
                                                                    target="_blank"
                                                                    className="btn btn-sm btn-outline-primary me-2"
                                                                >
                                                                    <Download className="me-1" /> View
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowDocumentsModal(false);
                                            setDocuments([]);
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LayOut>
    );
};

export default CandidatesView;