package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.PFReceiptsEntity;
import com.ems.taxConsultant.request.PFReceiptUpdateRequest;
import com.ems.taxConsultant.request.PFReceiptsRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface PFReceiptsService {
    ResponseEntity<?> addPFReceipts(String companyName, PFReceiptsRequest request) throws TaxConsultantException;

    Collection<PFReceiptsEntity> getPfReceipts(String companyName, String pfReceiptsId, String month, String year, HttpServletRequest request);

    ResponseEntity<?> updatePFReceipt(String companyName, String pfReceiptId, PFReceiptUpdateRequest updateRequest) throws TaxConsultantException;

    void deletePFReceiptById(String companyName, String responseId) throws TaxConsultantException, IOException;
}
