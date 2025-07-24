package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.GSTResponseEntity;
import com.ems.taxConsultant.request.GSTResponseRequest;
import com.ems.taxConsultant.request.GSTResponseUpdateRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface GSTResponseService {
    ResponseEntity<?> addGSTResponse(String companyName, GSTResponseRequest responseRequest) throws TaxConsultantException;

    Collection<GSTResponseEntity> getGSTResponse(String companyName, String tdsId, String month, String year);

    ResponseEntity<?> updateGSTResponse(String companyName, String tdsId, GSTResponseUpdateRequest updateRequest) throws TaxConsultantException;

    void deleteGSTResponseById(String companyName, String responseId) throws TaxConsultantException, IOException;
}
