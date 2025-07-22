package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.GSTResponseEntity;
import com.ems.taxConsultant.request.GSTResponseRequest;
import com.ems.taxConsultant.request.GSTResponseUpdateRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface GSTResponseService {
    ResponseEntity<?> addGSTResponse(String companyName, GSTResponseRequest responseRequest) throws AccountantException;

    Collection<GSTResponseEntity> getGSTResponse(String companyName, String tdsId, String month, String year);

    ResponseEntity<?> updateGSTResponse(String companyName, String tdsId, GSTResponseUpdateRequest updateRequest) throws AccountantException;

    void deleteGSTResponseById(String companyName, String responseId) throws AccountantException, IOException;
}
