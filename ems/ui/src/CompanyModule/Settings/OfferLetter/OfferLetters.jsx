import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import LayOut from '../../../LayOut/LayOut';

const OfferLetters = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleViewTemplate = () => {
    navigate('/template'); // Navigate to the template page
  };

  return (
    <LayOut>
      <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
        <div className="col">
          <h1 className="h3 mb-3"><strong>Offer Letters</strong></h1>
        </div>
        <div className="col-auto">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="/main">Home</a></li>
              <li className="breadcrumb-item active">Offer Letters</li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title" style={{ color: "black" }}>Template 1</h1>
              <button type='button' className='btn btn-primary mt-2' onClick={handleViewTemplate}>
                View Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default OfferLetters;