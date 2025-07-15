import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import LayOut from '../../LayOut/LayOut';
import { Link } from 'react-router-dom';
import { uploadEmployeeDocumentAPI } from '../../Utils/Axios';
import { useSelector } from 'react-redux';
import {
    Upload as FiUpload,
    X as FiX,
    Plus as FiPlus,
    Trash as FiTrash2,
    File as FiFile,
    FileEarmarkPdf as FiFilePdf,
    FileEarmarkWord as FiFileWord,
    FileEarmarkImage as FiFileImage,
    ChevronDown,
    ChevronUp,
    CheckCircleFill,
    InfoCircle,
    ExclamationTriangle
} from 'react-bootstrap-icons';

const EmployeeDocumentUpload = () => {
    const { userId, company } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [expandedQualification, setExpandedQualification] = useState(null);
    const [completedSections, setCompletedSections] = useState({
        basic: false,
        education: false,
        experience: true
    });
    const [touchedFields, setTouchedFields] = useState({
        resume: false,
        idProof: false,
        education: {
            tenth: false,
            twelfth: false,
            ug: false,
            pg: false,
            others: false
        },
        experience: []
    });

    const educationQualifications = [
        { id: 'tenth', name: '10th Marksheet', required: true, description: 'Upload your 10th standard marksheet or equivalent' },
        { id: 'twelfth', name: '12th Marksheet', required: true, description: 'Upload your 12th standard marksheet or equivalent' },
        { id: 'ug', name: 'Undergraduate Degree', required: true, description: 'Upload your bachelor\'s degree certificate' },
        { id: 'pg', name: 'Postgraduate Degree', required: false, description: 'Upload your master\'s degree certificate if applicable' },
        { id: 'others', name: 'Other Certificates', required: false, description: 'Upload any additional academic certificates' }
    ];

    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        watch,
        formState: { errors, isValid, isDirty },
        trigger,
        reset
    } = useForm({
        defaultValues: {
            resume: null,
            idProof: null,
            education: {
                tenth: { file: null, verified: false },
                twelfth: { file: null, verified: false },
                ug: { file: null, verified: false },
                pg: { file: null, verified: false },
                others: []
            },
            experience: []
        },
        mode: "onChange"
    });

    const formValues = watch();

    useEffect(() => {
        const checkSectionCompletion = () => {
            // Resume is optional for employees
            const basicCompleted = !!formValues.idProof;
            const educationCompleted = educationQualifications.every(qual => {
                if (!qual.required) return true;
                return !!formValues.education?.[qual.id]?.file;
            });
            const experienceCompleted = (() => {
                if (!formValues.experience || formValues.experience.length === 0) return true;
                return formValues.experience.every(exp => {
                    return exp.company?.trim() && exp.file;
                });
            })();

            setCompletedSections({
                basic: basicCompleted,
                education: educationCompleted,
                experience: experienceCompleted
            });
        };

        const subscription = watch(() => {
            checkSectionCompletion();
        });
        return () => subscription.unsubscribe();
    }, [watch, formValues]);

    const validateFile = (file, isRequired = true, fieldName = '', maxSizeMB = 1) => {
        if (isRequired && !file) return `${fieldName} is required`;
        if (!file) return true;

        if (file.size === 0) return `${fieldName} file is empty (0 bytes)`;
        if (file.size > maxSizeMB * 1024 * 1024) return `${fieldName} file size exceeds ${maxSizeMB}MB limit`;

        const validExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExt)) {
            return `${fieldName} must be PDF, DOC, DOCX, PNG, JPG, or JPEG format`;
        }

        return true;
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e, fieldName) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setValue(fieldName, file);
            setTouchedFields(prev => ({
                ...prev,
                [fieldName]: true
            }));
            trigger(fieldName);
        }
    };

    const handleFileChange = useCallback((e, fieldName) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setValue(fieldName, file);
            setTouchedFields(prev => ({
                ...prev,
                [fieldName]: true
            }));
            trigger(fieldName);
        }
    }, [setValue, trigger]);

    const handleAddExperience = () => {
        const currentExperience = getValues("experience") || [];
        setValue("experience", [...currentExperience, { file: null, company: '' }]);
        setTouchedFields(prev => ({
            ...prev,
            experience: [...prev.experience, false]
        }));
    };

    const handleExperienceChange = async (index, field, value) => {
        const currentExperience = [...getValues("experience")];
        currentExperience[index][field] = value;
        setValue("experience", currentExperience);

        if (field === 'company') {
            setTouchedFields(prev => {
                const newExperience = [...prev.experience];
                newExperience[index] = true;
                return { ...prev, experience: newExperience };
            });
        }

        if (field === 'company' && getValues(`experience.${index}.file`)) {
            await trigger(`experience.${index}.company`);
        } else if (field === 'file' && getValues(`experience.${index}.company`)?.trim()) {
            await trigger(`experience.${index}.file`);
        }
    };

    const removeExperience = (index) => {
        const currentExperience = [...getValues("experience")];
        currentExperience.splice(index, 1);
        setValue("experience", currentExperience);
        setTouchedFields(prev => {
            const newExperience = [...prev.experience];
            newExperience.splice(index, 1);
            return { ...prev, experience: newExperience };
        });
    };

    const onSubmit = async (data) => {
        if (!userId || !company) {
            toast.error('Authentication required. Please login again.');
            return;
        }

        // Mark all fields as touched before validation
        setTouchedFields({
            resume: true,
            idProof: true,
            education: {
                tenth: true,
                twelfth: true,
                ug: true,
                pg: true,
                others: true
            },
            experience: formValues.experience?.map(() => true) || []
        });

        // Trigger validation for all fields
        const isValid = await trigger();

        // Additional manual validation for required education documents
        const educationValid = educationQualifications.every(qual => {
            if (!qual.required) return true;
            return !!data.education[qual.id]?.file;
        });

        if (!isValid || !educationValid) {
            if (!educationValid) {
                toast.error('Please upload all required education documents');
            } else {
                toast.error('Please complete all required fields');
            }
            return;
        }

        setIsSubmitting(true);
        let progressInterval;

        try {
            setUploadProgress(0);

            // Prepare documents
            const docNames = [];
            const files = [];

            // Resume is optional for employees
            if (data.resume) {
                docNames.push('Resume');
                files.push(data.resume);
            }

            // ID Proof is required
            if (data.idProof) {
                docNames.push('ID Proof');
                files.push(data.idProof);
            }

            // Education documents
            educationQualifications.forEach(qual => {
                if (data.education[qual.id]?.file) {
                    docNames.push(qual.name);
                    files.push(data.education[qual.id].file);
                }
            });

            // Experience documents
            data.experience?.forEach((exp, index) => {
                if (exp.file) {
                    docNames.push(`Experience_${exp.company || index}`);
                    files.push(exp.file);
                }
            });

            if (files.length === 0) {
                throw new Error('No documents selected for upload');
            }

            // Progress simulation
            progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 300);

            // Actual upload using the employee API
            const response = await uploadEmployeeDocumentAPI(
                userId, // Using the full userId from Redux
                docNames,
                files
            );

            // Complete progress
            clearInterval(progressInterval);
            setUploadProgress(100);
            await new Promise(resolve => setTimeout(resolve, 500));

            toast.success('Documents uploaded successfully!');
            navigate('/employeeDocumentView', { state: { documents: data } });

        } catch (error) {
            if (progressInterval) clearInterval(progressInterval);
            setUploadProgress(0);

            console.error('Upload error details:', {
                employeeId: userId,
                company,
                error: error.response?.data || error.message
            });

            let errorMessage = 'Upload failed. Please try again.';

            if (error.response) {
                // Handle the specific "document already exists" error
                if (error.response.data?.error?.message?.includes('Document already exists')) {
                    errorMessage = error.response.data.error.message;
                }
                // Handle other response errors
                else {
                    errorMessage = error.response.data?.message ||
                        `Server error: ${error.response.status}`;

                    if (error.response.status === 500) {
                        errorMessage = 'Server encountered an error. Please contact support.';
                    }
                }
            } else if (error.request) {
                errorMessage = 'Network error - please check your connection';
            } else if (error.message.includes('No documents')) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const FilePreview = ({ file, onRemove, fieldName, showRemove = true, thumbnail = false }) => {
        const [previewUrl, setPreviewUrl] = useState(null);
        const [showFullPreview, setShowFullPreview] = useState(false);
        const isImage = file?.type?.startsWith('image/');
        const isPDF = file?.name?.toLowerCase().endsWith('.pdf');
        const modalRef = useRef(null);

        useEffect(() => {
            if (file && (isImage || isPDF)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewUrl(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl(null);
            }
        }, [file, isImage, isPDF]);

        if (!file) return null;

        if (thumbnail) {
            return (
                <div className="position-relative" style={{ width: "fit-content" }}>
                    <div
                        className="thumbnail-preview"
                        onClick={() => setShowFullPreview(true)}
                        style={{ cursor: 'pointer' }}
                    >
                        {isImage && previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Thumbnail"
                                className="img-thumbnail"
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover"
                                }}
                            />
                        ) : (
                            <div className="file-thumbnail d-flex flex-column align-items-center justify-content-center bg-light rounded p-1">
                                {isPDF ? (
                                    <FiFilePdf size={24} className="text-danger" />
                                ) : file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx') ? (
                                    <FiFileWord size={24} className="text-primary" />
                                ) : (
                                    <FiFile size={24} className="text-primary" />
                                )}
                                <small className="text-truncate mt-1" style={{ maxWidth: '60px' }}>
                                    {file.name.split('.')[0].substring(0, 6)}...
                                </small>
                            </div>
                        )}
                    </div>

                    {showRemove && (
                        <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-0 p-0 rounded-circle"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove && onRemove();
                            }}
                            aria-label="Remove file"
                            style={{
                                width: '20px',
                                height: '20px',
                                transform: 'translate(30%, -30%)'
                            }}
                        >
                            <FiX size={12} />
                        </button>
                    )}

                    {showFullPreview && (
                        <div
                            className="modal-backdrop"
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                zIndex: 1050,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={() => setShowFullPreview(false)}
                        >
                            <div
                                ref={modalRef}
                                className="modal-content"
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    maxWidth: '90%',
                                    maxHeight: '90vh',
                                    overflow: 'auto',
                                    padding: '20px',
                                    position: 'relative'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    className="btn-close"
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        zIndex: 1
                                    }}
                                    onClick={() => setShowFullPreview(false)}
                                    aria-label="Close"
                                ></button>

                                <div className="modal-body">
                                    {isImage ? (
                                        <img
                                            src={previewUrl}
                                            alt="Full Preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '80vh',
                                                display: 'block',
                                                margin: '0 auto'
                                            }}
                                        />
                                    ) : isPDF ? (
                                        <embed
                                            src={previewUrl}
                                            type="application/pdf"
                                            style={{
                                                width: '100%',
                                                height: '80vh',
                                                border: 'none'
                                            }}
                                        />
                                    ) : (
                                        <div className="d-flex flex-column align-items-center justify-content-center p-5">
                                            <FiFile size={48} className="text-muted mb-3" />
                                            <p>No preview available for this file type</p>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowFullPreview(false)}
                                    >
                                        Close
                                    </button>
                                    <a
                                        href={previewUrl}
                                        download={file.name}
                                        className="btn btn-primary"
                                    >
                                        Download
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="file-preview-container">
                {isImage && previewUrl ? (
                    <div className="image-preview-wrapper position-relative">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="img-thumbnail"
                            style={{
                                width: "150px",
                                height: "150px",
                                objectFit: "cover"
                            }}
                        />
                        <div className="file-info-overlay">
                            <div className="d-flex justify-content-between align-items-center w-100">
                                <span className="text-truncate" style={{ maxWidth: '120px' }}>{file.name}</span>
                                <small className="text-white">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                            </div>
                        </div>
                        {showRemove && (
                            <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle"
                                onClick={() => {
                                    setValue(fieldName, null);
                                    onRemove && onRemove();
                                }}
                                aria-label="Remove file"
                                style={{ width: '24px', height: '24px', padding: '0' }}
                            >
                                <FiX size={12} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="file-preview d-flex align-items-center bg-light rounded p-3 position-relative">
                        {showRemove && (
                            <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle"
                                onClick={() => {
                                    setValue(fieldName, null);
                                    onRemove && onRemove();
                                }}
                                aria-label="Remove file"
                                style={{ width: '24px', height: '24px', padding: '0' }}
                            >
                                <FiX size={12} />
                            </button>
                        )}
                        <div className="d-flex align-items-center w-100">
                            <FiFile className="me-3 fs-4 text-primary" />
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium text-truncate me-2" style={{ maxWidth: '200px' }}>{file.name}</span>
                                    <small className="text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                                </div>
                                <div className="d-flex align-items-center mt-1">
                                    <CheckCircleFill className="text-success me-1" size={12} />
                                    <small className="text-success">Uploaded</small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const DragDropArea = ({ fieldName, label, required = false, accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg", description }) => {
        const file = getValues(fieldName);
        const fileInputRef = useRef(null);
        const isImageField = accept.includes('.png') || accept.includes('.jpg') || accept.includes('.jpeg');

        const handleClick = (e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
        };

        const handleFileChangeWrapper = (e) => {
            handleFileChange(e, fieldName);
        };

        return (
            <div className="row g-3 align-items-center">
                <div className="col-md-4">
                    <label className="form-label d-block fw-medium">
                        {label} {required && <span className="text-danger">*</span>}
                    </label>
                    {description && <p className="text-muted small mb-2">{description}</p>}
                    {!file ? (
                        <div
                            className={`drag-drop-area ${dragActive ? 'drag-active' : ''} ${errors[fieldName] && touchedFields[fieldName] ? 'is-invalid' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={(e) => {
                                handleDrop(e, fieldName);
                                setTouchedFields(prev => ({
                                    ...prev,
                                    [fieldName]: true
                                }));
                            }}
                            onClick={handleClick}
                            style={{ cursor: 'pointer' }}
                            aria-describedby={`${fieldName}-help`}
                        >
                            <FiUpload className="upload-icon mb-2" size={24} />
                            <p className="mb-1">
                                <span className="text-primary">Click to upload</span>
                            </p>
                            <small className="text-muted">
                                {accept.includes('.pdf') ? 'PDF, DOC, DOCX, PNG, JPG (Max 1MB)' : 'PNG, JPG (Max 1MB)'}
                            </small>
                            <input
                                type="file"
                                className="d-none"
                                id={fieldName}
                                ref={fileInputRef}
                                accept={accept}
                                onChange={handleFileChangeWrapper}
                                aria-invalid={errors[fieldName] ? "true" : "false"}
                            />
                        </div>
                    ) : (
                        <div className="text-center">
                            <input
                                type="file"
                                className="d-none"
                                id={fieldName}
                                ref={fileInputRef}
                                accept={accept}
                                onChange={handleFileChangeWrapper}
                            />
                            <label
                                htmlFor={fieldName}
                                className="btn btn-sm btn-outline-primary me-2"
                            >
                                <FiUpload className="me-1" /> Change File
                            </label>
                            <button
                                onClick={() => {
                                    setValue(fieldName, null);
                                    trigger(fieldName);
                                }}
                                className="btn btn-sm btn-outline-danger"
                            >
                                <FiX className="me-1" /> Remove
                            </button>
                        </div>
                    )}
                    {errors[fieldName] && touchedFields[fieldName] && (
                        <div className="invalid-feedback d-block">{errors[fieldName].message}</div>
                    )}
                </div>
                <div className="col-md-4">
                    {file && (
                        <div className="d-flex justify-content-center">
                            <FilePreview
                                file={file}
                                fieldName={fieldName}
                                onRemove={() => {
                                    setValue(fieldName, null);
                                    trigger(fieldName);
                                }}
                                thumbnail={true}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ExperienceFileUpload = ({ index }) => {
        const fileInputRef = useRef(null);
        const file = getValues(`experience.${index}.file`);

        const handleClick = () => {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        };

        return (
            <div className="row g-3 align-items-center">
                <div className="col-md-4">
                    <div className="mb-2">
                        <label className="form-label">Experience Letter</label>
                    </div>
                    <Controller
                        name={`experience.${index}.file`}
                        control={control}
                        rules={{
                            validate: (file) => {
                                const company = getValues(`experience.${index}.company`)?.trim();
                                if (file && !company) return true;
                                if (company && !file) return 'Experience certificate is required when company name is provided';
                                return validateFile(file, false, 'Experience Certificate');
                            }
                        }}
                        render={({ field }) => (
                            <div
                                className={`drag-drop-area small ${errors.experience?.[index]?.file && touchedFields.experience?.[index] ? 'is-invalid' : ''}`}
                                onClick={handleClick}
                                style={{ cursor: 'pointer' }}
                            >
                                {!file ? (
                                    <>
                                        <FiUpload className="upload-icon mb-2" size={18} />
                                        <p className="mb-1">
                                            <span className="text-primary">Click to upload</span>
                                        </p>
                                        <small className="text-muted">
                                            PDF, DOC, DOCX (Max 1MB)
                                        </small>
                                        <input
                                            type="file"
                                            className="d-none"
                                            ref={fileInputRef}
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                field.onChange(e.target.files[0]);
                                                handleExperienceChange(index, 'file', e.target.files[0]);
                                                setTouchedFields(prev => {
                                                    const newExperience = [...prev.experience];
                                                    newExperience[index] = true;
                                                    return { ...prev, experience: newExperience };
                                                });
                                                // Reset input value to allow selecting same file again
                                                e.target.value = null;
                                            }}
                                            aria-invalid={errors.experience?.[index]?.file ? "true" : "false"}
                                        />
                                    </>
                                ) : (
                                    <div className="text-center py-2">
                                        <button
                                            type="button"
                                            onClick={handleClick}
                                            className="btn btn-sm btn-link text-primary p-0"
                                        >
                                            <FiUpload className="me-1" size={18} />
                                            Replace file
                                        </button>
                                        <input
                                            type="file"
                                            className="d-none"
                                            ref={fileInputRef}
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                field.onChange(e.target.files[0]);
                                                handleExperienceChange(index, 'file', e.target.files[0]);
                                                // Reset input value to allow selecting same file again
                                                e.target.value = null;
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    {errors.experience?.[index]?.file && touchedFields.experience?.[index] && (
                        <div className="invalid-feedback d-block">{errors.experience[index].file.message}</div>
                    )}
                </div>
                <div className="col-md-4">
                    {file && (
                        <div className="d-flex justify-content-center">
                            <FilePreview
                                file={file}
                                fieldName={`experience.${index}.file`}
                                onRemove={() => handleExperienceChange(index, 'file', null)}
                                thumbnail={true}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const EducationFileUpload = ({ qualification }) => {
        const fileInputRef = useRef(null);
        const file = getValues(`education.${qualification.id}.file`);

        const handleClick = () => {
            fileInputRef.current.click();
        };

        const handleFileChange = (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setValue(`education.${qualification.id}.file`, file);
                setTouchedFields(prev => ({
                    ...prev,
                    education: {
                        ...prev.education,
                        [qualification.id]: true
                    }
                }));
                trigger(`education.${qualification.id}.file`);
            }
            // Reset input value to allow selecting same file again
            e.target.value = null;
        };

        return (
            <div className="row g-3 align-items-center">
                <div className="col-md-4">
                    <label className="form-label d-block fw-medium">
                        {qualification.name} {qualification.required && <span className="text-danger">*</span>}
                    </label>
                    {qualification.description && <p className="text-muted small mb-2">{qualification.description}</p>}
                    {!file ? (
                        <div
                            className={`drag-drop-area small ${errors.education?.[qualification.id]?.file && touchedFields.education?.[qualification.id] ? 'is-invalid' : ''}`}
                            onClick={handleClick}
                            style={{ cursor: 'pointer' }}
                            aria-describedby={`education-${qualification.id}-help`}
                        >
                            <FiUpload className="upload-icon mb-2" size={18} />
                            <p className="mb-1">
                                <span className="text-primary">Click to upload</span>
                            </p>
                            <small className="text-muted">
                                PDF, DOC, DOCX, PNG, JPG (Max 1MB)
                            </small>
                            <input
                                type="file"
                                className="d-none"
                                ref={fileInputRef}
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                onChange={handleFileChange}
                                aria-invalid={errors.education?.[qualification.id]?.file ? "true" : "false"}
                            />
                        </div>
                    ) : (
                        <div className="text-center">
                            <input
                                type="file"
                                className="d-none"
                                ref={fileInputRef}
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={handleClick}
                                className="btn btn-sm btn-outline-primary me-2"
                            >
                                <FiUpload className="me-1" /> Change File
                            </button>
                            <button
                                onClick={() => {
                                    setValue(`education.${qualification.id}.file`, null);
                                    trigger(`education.${qualification.id}.file`);
                                }}
                                className="btn btn-sm btn-outline-danger"
                            >
                                <FiX className="me-1" /> Remove
                            </button>
                        </div>
                    )}
                    {errors.education?.[qualification.id]?.file && touchedFields.education?.[qualification.id] && (
                        <div className="invalid-feedback d-block">
                            {errors.education[qualification.id].file.message}
                        </div>
                    )}
                </div>
                <div className="col-md-4">
                    {file && (
                        <div className="d-flex justify-content-center">
                            <FilePreview
                                file={file}
                                fieldName={`education.${qualification.id}.file`}
                                onRemove={() => {
                                    setValue(`education.${qualification.id}.file`, null);
                                    trigger(`education.${qualification.id}.file`);
                                }}
                                thumbnail={true}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const toggleQualification = (id) => {
        if (expandedQualification === id) {
            setExpandedQualification(null);
        } else {
            setExpandedQualification(id);
        }
    };

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3"><strong>Upload Your Documents</strong></h1>
                    </div>
                    <div className="col-auto">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to="/main" className="custom-link">Home</Link>
                                </li>
                                <li className="breadcrumb-item active">Document Upload</li>
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
                                        <h5 className="card-title mb-0">Complete Your Profile</h5>
                                        <p className="text-muted mb-0">Upload the required documents to proceed with your application</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="row g-4">
                                        {/* Basic Documents Section */}
                                        <div className="col-12">
                                            <div className="section-header mb-3 d-flex align-items-center">
                                                <h6 className="fw-bold mb-0">Basic Documents</h6>
                                                {completedSections.basic && (
                                                    <CheckCircleFill className="text-success ms-2" size={16} />
                                                )}
                                            </div>
                                            <div className="alert alert-info d-flex align-items-center">
                                                <InfoCircle className="me-2" size={18} />
                                                <small>Please upload clear scans of your documents. Make sure all text is readable.</small>
                                            </div>

                                            <div className="row g-4">
                                                <div className="col-12">
                                                    <Controller
                                                        name="resume"
                                                        control={control}
                                                        rules={{
                                                            validate: (file) => validateFile(file, false, 'Resume/CV') // Changed to optional
                                                        }}
                                                        render={({ field }) => (
                                                            <DragDropArea
                                                                fieldName="resume"
                                                                label="Resume/CV"
                                                                required={false} // Changed to optional
                                                                description="Upload your most recent resume or curriculum vitae (optional)"
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div className="col-12">
                                                    <Controller
                                                        name="idProof"
                                                        control={control}
                                                        rules={{
                                                            validate: (file) => validateFile(file, true, 'ID Proof')
                                                        }}
                                                        render={({ field }) => (
                                                            <DragDropArea
                                                                fieldName="idProof"
                                                                label="ID Proof"
                                                                required
                                                                description="Upload a government-issued ID (Passport, Driver's License, Aadhar, etc.)"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Education Documents Section */}
                                        <div className="col-12">
                                            <div className="section-header mb-3 d-flex align-items-center">
                                                <h6 className="fw-bold mb-0">Education Certificates</h6>
                                                {completedSections.education && (
                                                    <CheckCircleFill className="text-success ms-2" size={16} />
                                                )}
                                            </div>

                                            <div className="alert alert-warning d-flex align-items-center">
                                                <ExclamationTriangle className="me-2" size={16} />
                                                <small>Documents marked with <span className="text-danger">*</span> are mandatory</small>
                                            </div>

                                            <div className="accordion" id="educationAccordion">
                                                {educationQualifications.map((qualification) => (
                                                    <div key={qualification.id} className="accordion-item mb-2">
                                                        <div className="accordion-header">
                                                            <button
                                                                className="accordion-button d-flex justify-content-between align-items-center"
                                                                type="button"
                                                                onClick={() => toggleQualification(qualification.id)}
                                                                aria-expanded={expandedQualification === qualification.id}
                                                            >
                                                                <span>
                                                                    {qualification.name}
                                                                    {qualification.required && <span className="text-danger ms-1">*</span>}
                                                                    {formValues.education?.[qualification.id]?.file && (
                                                                        <CheckCircleFill className="text-success ms-2" size={14} />
                                                                    )}
                                                                </span>
                                                                {expandedQualification === qualification.id ? (
                                                                    <ChevronUp />
                                                                ) : (
                                                                    <ChevronDown />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div
                                                            className={`accordion-collapse collapse ${expandedQualification === qualification.id ? 'show' : ''}`}
                                                        >
                                                            <div className="accordion-body p-3">
                                                                <EducationFileUpload
                                                                    qualification={qualification}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Experience Documents Section */}
                                        <div className="col-12">
                                            <div className="section-header mb-3">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                                                        <h6 className="fw-bold mb-0">Experience Certificates</h6>
                                                        {completedSections.experience && formValues.experience?.length > 0 && (
                                                            <CheckCircleFill className="text-success ms-2" size={16} />
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={handleAddExperience}
                                                        disabled={isSubmitting}
                                                    >
                                                        <FiPlus className="me-1" /> Add Experience
                                                    </button>
                                                </div>
                                                <p className="text-muted small mb-0">Add your work experience documents (optional)</p>
                                            </div>

                                            {(!formValues.experience || formValues.experience.length === 0) && (
                                                <div className="alert alert-info mb-0 d-flex align-items-center">
                                                    <InfoCircle className="me-2" size={16} />
                                                    <small>No experience documents added (optional)</small>
                                                </div>
                                            )}

                                            {formValues.experience?.map((exp, index) => (
                                                <div key={index} className="experience-item card mb-3 border-light shadow-sm">
                                                    <div className="card-body">
                                                        <div className="row g-3 align-items-end">
                                                            <div className="col-md-5">
                                                                <label className="form-label">
                                                                    Company Name
                                                                    {getValues(`experience.${index}.file`) && <span className="text-danger"> *</span>}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="Company name"
                                                                    disabled={isSubmitting}
                                                                    {...register(`experience.${index}.company`, {
                                                                        validate: (value) => {
                                                                            const file = getValues(`experience.${index}.file`);
                                                                            if (file && !value?.trim()) {
                                                                                return 'Company name is required when uploading experience letter';
                                                                            }
                                                                            return true;
                                                                        }
                                                                    })}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        setValue(`experience.${index}.company`, value);
                                                                        if (getValues(`experience.${index}.file`)) {
                                                                            trigger(`experience.${index}.company`);
                                                                        }
                                                                    }}
                                                                />
                                                                {errors.experience?.[index]?.company && (
                                                                    <p className="errorMsg">{errors.experience[index].company.message}</p>
                                                                )}
                                                            </div>
                                                            <div className="col-md-7">
                                                                <ExperienceFileUpload index={index} />
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 text-end">
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => removeExperience(index)}
                                                                disabled={isSubmitting}
                                                            >
                                                                <FiTrash2 className="me-1" /> Remove Experience
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Progress Bar */}
                                        {uploadProgress > 0 && (
                                            <div className="col-12">
                                                <div className="upload-progress mb-3">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span className="small">Uploading documents...</span>
                                                        <span className="small">{uploadProgress}%</span>
                                                    </div>
                                                    <div className="progress" style={{ height: '8px' }}>
                                                        <div
                                                            className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                                                            role="progressbar"
                                                            style={{ width: `${uploadProgress}%` }}
                                                            aria-valuenow={uploadProgress}
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Form Actions */}
                                        <div className="col-12 mt-2">
                                            <div className="d-flex justify-content-end border-top pt-4">
                                                <div className="d-flex align-items-center">
                                                    {!isValid && (
                                                        <div className="text-danger me-3 small d-flex align-items-center">
                                                            <ExclamationTriangle className="me-1" size={14} />
                                                            Please complete all required fields
                                                        </div>
                                                    )}
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary px-4"
                                                        disabled={isSubmitting || !isValid}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                Uploading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiUpload className="me-1" /> Submit Documents
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .drag-drop-area {
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                    padding: 2rem;
                    text-align: center;
                    transition: all 0.3s ease;
                    background-color: #f8f9fa;
                }
                
                .drag-drop-area.drag-active {
                    border-color: #0d6efd;
                    background-color: rgba(13, 110, 253, 0.05);
                }
                
                .drag-drop-area.small {
                    padding: 1.5rem;
                }
                
                .drag-drop-area.is-invalid {
                    border-color: #dc3545;
                }
                
                .upload-icon {
                    color: #6c757d;
                }
                
                .drag-drop-area:hover .upload-icon {
                    color: #0d6efd;
                }
                
                .file-preview-container {
                    margin-top: 0.5rem;
                }
                
                .image-preview-wrapper {
                    position: relative;
                    display: inline-block;
                }
                
                .file-info-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 0.25rem 0.5rem;
                    font-size: 0.8rem;
                }
                
                .thumbnail-preview {
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }
                
                .thumbnail-preview:hover {
                    border-color: #0d6efd;
                    transform: scale(1.05);
                }
                
                .file-thumbnail {
                    width: 60px;
                    height: 60px;
                }
                
                .modal {
                    z-index: 1050;
                }
                
                .modal-backdrop {
                    z-index: 1040;
                }
                
                .experience-item {
                    transition: all 0.3s ease;
                }
                
                .experience-item:hover {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }
                
                .section-header {
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #dee2e6;
                }
                
                .accordion-button:not(.collapsed) {
                    background-color: rgba(13, 110, 253, 0.05);
                    color: #0d6efd;
                }
                
                .accordion-button:focus {
                    box-shadow: none;
                    border-color: rgba(13, 110, 253, 0.25);
                }
            `}</style>
        </LayOut>
    );
};

export default EmployeeDocumentUpload;