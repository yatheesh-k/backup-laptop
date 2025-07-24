package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.TDSResponseEntity;
import com.ems.taxConsultant.request.TDSResponseRequest;
import com.ems.taxConsultant.request.TDSResponseUpdateRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface TDSResponseService {
    ResponseEntity<?> addTDSResponse(String companyName, TDSResponseRequest responseRequest) throws TaxConsultantException;

    Collection<TDSResponseEntity> getTDSResponse(String companyName, String tdsId, String month, String year);

    ResponseEntity<?> updateTDSResponse(String companyName, String tdsId, TDSResponseUpdateRequest updateRequest) throws TaxConsultantException;

    void deleteTDSResponseById(String companyName, String responseId) throws TaxConsultantException, IOException;
}
