package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.GSTReceiptEntity;
import com.ems.taxConsultant.request.GSTReceiptRequest;
import com.ems.taxConsultant.request.GSTReceiptUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;

import java.util.Collection;

public interface GSTReceiptService {
    ResponseEntity<?> addGstReceipts(String companyName, @Valid GSTReceiptRequest request) throws TaxConsultantException;

    Collection<GSTReceiptEntity> getGstReceipts(String companyName, String gstReceiptsId, String month, String year, HttpServletRequest request);

    ResponseEntity<?> updateGstReceipt(String companyName, String receiptId, @Valid GSTReceiptUpdateRequest updateRequest) throws TaxConsultantException;

    void deleteGstReceiptById(String companyName, String receiptId) throws TaxConsultantException;
}
