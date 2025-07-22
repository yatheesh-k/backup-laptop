package com.ems.taxConsultant.service;


import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.PTResponseEntity;
import com.ems.taxConsultant.request.PTResponseRequest;
import com.ems.taxConsultant.request.PTResponseUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;

import java.util.Collection;

public interface PTResponseService {

    ResponseEntity<?> addPTResponse(String companyName, @Valid PTResponseRequest responseRequest) throws AccountantException;

    Collection<PTResponseEntity> getPTResponse(String companyName, String ptResponseId, String month, String year);

    ResponseEntity<?> updatePTResponse(String companyName, String responseId, @Valid PTResponseUpdateRequest updateRequest) throws AccountantException;

    void deletePTResponseById(String companyName, String responseId)throws AccountantException;
}
