import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LayOut from '../../LayOut/LayOut';
import { Link } from 'react-router-dom';
import { getDocumentByIdAPI } from '../../Utils/Axios';
import { useSelector } from 'react-redux';
import {
    FileEarmarkPdf as FiFilePdf,
    FileEarmarkWord as FiFileWord,
    FileEarmarkImage as FiFileImage,
    ArrowLeft as FiArrowLeft,
    Eye
} from 'react-bootstrap-icons';

const EmployeeDocumentView = () => {
    const { userId } = useSelector(state => state.auth);
    const location = useLocation();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.state?.documents) {
            setDocuments(transformDocuments(location.state.documents));
            setLoading(false);
        } else {
            fetchDocuments();
        }
    }, [location.state]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await getDocumentByIdAPI('', userId);

            if (response && response.data && response.data.documentEntities) {
                setDocuments(transformApiResponse(response.data));
            } else {
                setDocuments([]);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);

            if (error.response?.status === 404) {
                toast.error(error.response.data?.message);
            } else {
                toast.error('Failed to load documents. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const transformDocuments = (formData) => {
        const transformed = [];

        if (formData.resume) {
            transformed.push({
                name: 'Resume/CV',
                url: URL.createObjectURL(formData.resume),
                status: 'uploaded',
                type: formData.resume.type,
                size: formData.resume.size
            });
        }

        if (formData.idProof) {
            transformed.push({
                name: 'ID Proof',
                url: URL.createObjectURL(formData.idProof),
                status: 'uploaded',
                type: formData.idProof.type,
                size: formData.idProof.size
            });
        }

        const educationDocs = [
            { id: 'tenth', name: '10th Marksheet' },
            { id: 'twelfth', name: '12th Marksheet' },
            { id: 'ug', name: 'Undergraduate Degree' },
            { id: 'pg', name: 'Postgraduate Degree' },
            { id: 'others', name: 'Other Certificates' }
        ];

        educationDocs.forEach(doc => {
            if (formData.education[doc.id]?.file) {
                transformed.push({
                    name: doc.name,
                    url: URL.createObjectURL(formData.education[doc.id].file),
                    status: 'uploaded',
                    type: formData.education[doc.id].file.type,
                    size: formData.education[doc.id].file.size
                });
            }
        });

        formData.experience?.forEach((exp, index) => {
            if (exp.file) {
                transformed.push({
                    name: `Experience - ${exp.company || `Company ${index + 1}`}`,
                    url: URL.createObjectURL(exp.file),
                    status: 'uploaded',
                    type: exp.file.type,
                    size: exp.file.size
                });
            }
        });

        return transformed;
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
            return <FiFilePdf className="text-danger" size={24} />;
        } else if (type?.includes('word') || name?.toLowerCase().endsWith('.doc') || name?.toLowerCase().endsWith('.docx')) {
            return <FiFileWord className="text-primary" size={24} />;
        } else if (type?.includes('image') || ['.jpg', '.jpeg', '.png', '.gif'].some(ext => name?.toLowerCase().endsWith(ext))) {
            return <FiFileImage className="text-success" size={24} />;
        }
        return <FiFilePdf className="text-secondary" size={24} />;
    };

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3"><strong>Your Documents</strong></h1>
                    </div>
                    <div className="col-auto">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to="/main" className="custom-link">Home</Link>
                                </li>
                                <li className="breadcrumb-item active">Documents</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-0">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title mb-0">Uploaded Documents</h5>
                                        <p className="text-muted mb-0">View and manage your uploaded documents</p>
                                    </div>
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                                    >
                                        <FiArrowLeft className="me-1" /> Back
                                    </button>
                                </div>
                            </div>

                            <div className="card-body">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3">Loading your documents...</p>
                                    </div>
                                ) : documents.length === 0 ? (
                                    <div className="text-center py-5">
                                        <p className="text-muted">No documents found</p>
                                        <button
                                            onClick={() => navigate('/employeeDocumentUpload')}
                                            className="btn btn-primary"
                                        >
                                            Upload Documents
                                        </button>
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
                                                                className="btn btn-sm btn-outline-primary me-2 d-inline-flex align-items-center"
                                                            >
                                                                <Eye className="me-1"/> View
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-link {
                    text-decoration: none;
                    color: inherit;
                    transition: color 0.2s;
                }
                
                .custom-link:hover {
                    color: #0d6efd;
                }
            `}</style>
        </LayOut>
    );
};

export default EmployeeDocumentView;