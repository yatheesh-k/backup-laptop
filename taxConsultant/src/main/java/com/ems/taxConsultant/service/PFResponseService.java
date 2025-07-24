package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.PFResponseEntity;
import com.ems.taxConsultant.request.PFResponseRequest;
import com.ems.taxConsultant.request.PFResponseUpdateRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface PFResponseService {
    ResponseEntity<?> addPFResponse(String companyName, PFResponseRequest responseRequest) throws TaxConsultantException;

    Collection<PFResponseEntity> getPFResponse(String companyName, String pfResponseId, String month, String year);

    ResponseEntity<?> updatePFResponse(String companyName, String pfResponseId, PFResponseUpdateRequest updateRequest) throws TaxConsultantException;

    void deletePFResponseById(String companyName, String responseId) throws TaxConsultantException, IOException;
}
