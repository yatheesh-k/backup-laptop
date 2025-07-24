package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.TDSReceiptEntity;
import com.ems.taxConsultant.request.TDSReceiptRequest;
import com.ems.taxConsultant.request.TDSReceiptUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface TDSReceiptsService {

    ResponseEntity<?> addTDSReceipt(String companyName, TDSReceiptRequest request) throws TaxConsultantException;

    Collection<TDSReceiptEntity> getTDSReceipts(String companyName, String tdsReceiptsId, String month, String year, HttpServletRequest request);

    ResponseEntity<?> updateTDSReceipt(String companyName, String tdsReceiptsId, TDSReceiptUpdateRequest updateRequest) throws TaxConsultantException;

    void deleteTDSReceiptById(String companyName, String id) throws TaxConsultantException, IOException;

    }
