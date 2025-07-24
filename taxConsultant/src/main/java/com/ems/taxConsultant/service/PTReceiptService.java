package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.PTReceiptEntity;
import com.ems.taxConsultant.request.PTReceiptRequest;
import com.ems.taxConsultant.request.PTReceiptUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface PTReceiptService {
    ResponseEntity<?> addPTReceipts(String companyName, PTReceiptRequest request) throws TaxConsultantException;

    Collection<PTReceiptEntity> getPTReceipts(String companyName, String ptId, String month, String year, HttpServletRequest request);

    ResponseEntity<?> updatePTReceipt(String companyName, String ptId, PTReceiptUpdateRequest updateRequest) throws TaxConsultantException;

    void deletePTReceiptById(String companyName, String id) throws TaxConsultantException, IOException;
}
