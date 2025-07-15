package com.ems.accountant.service;


import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.PTResponseEntity;
import com.ems.accountant.request.PTResponseRequest;
import com.ems.accountant.request.PTResponseUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface PTResponseService {

    ResponseEntity<?> addPTResponse(String companyName, @Valid PTResponseRequest responseRequest) throws AccountantException;

    Collection<PTResponseEntity> getPTResponse(String companyName, String ptResponseId, String month, String year);

    ResponseEntity<?> updatePTResponse(String companyName, String responseId, @Valid PTResponseUpdateRequest updateRequest) throws AccountantException;

    void deletePTResponseById(String companyName, String responseId)throws AccountantException;
}
