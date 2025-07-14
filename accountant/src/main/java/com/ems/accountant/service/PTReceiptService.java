package com.ems.accountant.service;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.PTReceiptEntity;
import com.ems.accountant.request.PTReceiptRequest;
import com.ems.accountant.request.PTReceiptUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface PTReceiptService {
    ResponseEntity<?> addPTReceipts(String companyName, PTReceiptRequest request) throws AccountantException;

    Collection<PTReceiptEntity> getPTReceipts(String companyName, String ptId, String month, String year, HttpServletRequest request);

    ResponseEntity<?> updatePTReceipt(String companyName, String ptId, PTReceiptUpdateRequest updateRequest) throws AccountantException;

    void deletePTReceiptById(String companyName, String id) throws AccountantException, IOException;
}
