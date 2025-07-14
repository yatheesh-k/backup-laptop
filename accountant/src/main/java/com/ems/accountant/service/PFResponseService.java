package com.ems.accountant.service;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.PFResponseEntity;
import com.ems.accountant.request.PFResponseRequest;
import com.ems.accountant.request.PFResponseUpdateRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface PFResponseService {
    ResponseEntity<?> addPFResponse(String companyName, PFResponseRequest responseRequest) throws AccountantException;

    Collection<PFResponseEntity> getPFResponse(String companyName, String pfResponseId, String month, String year);

    ResponseEntity<?> updatePFResponse(String companyName, String pfResponseId, PFResponseUpdateRequest updateRequest) throws AccountantException;

    void deletePFResponseById(String companyName, String responseId) throws AccountantException, IOException;
}
