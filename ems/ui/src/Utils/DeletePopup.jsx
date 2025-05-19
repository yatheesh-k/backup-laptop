import React from 'react'
import {Modal,ModalBody, ModalFooter, ModalHeader, ModalTitle,Button } from 'react-bootstrap'

const DeletePopup = ({ show, handleClose, handleConfirm,id,employeeId,pageName }) => {
  return (
    <Modal show={show} onHide={handleClose} centered  style={{ zIndex: 9999 }}>
      <ModalHeader closeButton>
        <ModalTitle>Confirm Delete</ModalTitle>
      </ModalHeader>
      <ModalBody>Are you sure you want to Delete {pageName} ?</ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        {employeeId !== undefined && employeeId !== null ? (
          <Button variant="danger" onClick={() => handleConfirm(employeeId,id)}>
            Delete
          </Button>
        ) : (
          <Button variant="danger" onClick={() => handleConfirm(id)}>
            Delete
          </Button>
        )}
      </ModalFooter>
    </Modal>
  )
}

export default DeletePopup
