import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import LayOut from '../../LayOut/LayOut';
import { getDocumentByIdAPI } from '../../Utils/Axios';
import {
  FileEarmarkPdf as FiFilePdf,
  FileEarmarkWord as FiFileWord,
  FileEarmarkImage as FiFileImage,
  ArrowLeft as FiArrowLeft,
  PencilSquare,Eye
} from 'react-bootstrap-icons';

const CandidateDocumentsView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useSelector(state => state.auth);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (location.state?.documents) {
      setDocuments(transformDocuments(location.state.documents));
      setLoading(false);
      setIsEditMode(location.state.isEditMode || false);
    } else {
      fetchDocuments();
    }
  }, [location.state]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getDocumentByIdAPI(userId, '');

      if (response && response.data && response.data.documentEntities) {
        setDocuments(transformApiResponse(response.data));
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
      if (!error.response || error.response.status !== 404) {
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
        url: formData.resume.url || URL.createObjectURL(formData.resume),
        type: formData.resume.type || 'application/pdf',
        size: formData.resume.size || 0,
        documentId: formData.resume.documentId || ''
      });
    }

    if (formData.idProof) {
      transformed.push({
        name: 'ID Proof',
        url: formData.idProof.url || URL.createObjectURL(formData.idProof),
        type: formData.idProof.type || 'application/pdf',
        size: formData.idProof.size || 0,
        documentId: formData.idProof.documentId || ''
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
          url: formData.education[doc.id].file.url || URL.createObjectURL(formData.education[doc.id].file),
          type: formData.education[doc.id].file.type || 'application/pdf',
          size: formData.education[doc.id].file.size || 0,
          documentId: formData.education[doc.id].file.documentId || ''
        });
      }
    });

    formData.experience?.forEach((exp, index) => {
      if (exp.file) {
        transformed.push({
          name: `Experience - ${exp.company || `Company ${index + 1}`}`,
          url: exp.file.url || URL.createObjectURL(exp.file),
          type: exp.file.type || 'application/pdf',
          size: exp.file.size || 0,
          documentId: exp.file.documentId || ''
        });
      }
    });

    return transformed;
  };

  const transformApiResponse = (apiData) => {
    if (!apiData || !apiData.documentEntities || apiData.documentEntities.length === 0) {
      return [];
    }

    return apiData.documentEntities.map(doc => ({
      name: doc.docName,
      url: doc.filePath,
      type: 'application/pdf',
      size: 0,
      documentId: doc.documentId,
      status: 'uploaded'
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

  const handleEditDocument = (documentId) => {
    const documentToEdit = documents.find(doc => doc.documentId === documentId);
    if (!documentToEdit) return;

    navigate('/documentUpload', {
      state: {
        isEditMode: true,
        documentToEdit: documentToEdit
      }
    });
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
                    <p className="text-muted mb-0">View your uploaded documents</p>
                  </div>
                  <div>
                    <button
                      onClick={() => navigate(-1)}
                      className="btn btn-outline-secondary btn-sm me-2 d-flex align-items-center"
                    >
                      <FiArrowLeft className="me-1" /> Back
                    </button>
                  </div>
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
                      onClick={() => navigate('/documentUpload')}
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
                          <th>Documents</th>
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
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary me-2 d-inline-flex align-items-center"
                              >
                                <Eye className="me-1" /> View
                              </a>

                              <button
                                onClick={() => handleEditDocument(doc.documentId)}
                                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
                              >
                                <PencilSquare className="me-1" /> Edit
                              </button>
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

export default CandidateDocumentsView;