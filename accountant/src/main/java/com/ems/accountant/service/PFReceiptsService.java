package com.ems.accountant.service;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.PFReceiptsEntity;
import com.ems.accountant.request.PFReceiptUpdateRequest;
import com.ems.accountant.request.PFReceiptsRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collection;

public interface PFReceiptsService {
    ResponseEntity<?> addPFReceipts(String companyName, PFReceiptsRequest request) throws AccountantException;

    Collection<PFReceiptsEntity> getPfReceipts(String companyName, String pfReceiptsId, String month, String year, HttpServletRequest request);

    ResponseEntity<?> updatePFReceipt(String companyName, String pfReceiptId, PFReceiptUpdateRequest updateRequest) throws AccountantException;

    void deletePFReceiptById(String companyName, String responseId) throws AccountantException, IOException;
}
