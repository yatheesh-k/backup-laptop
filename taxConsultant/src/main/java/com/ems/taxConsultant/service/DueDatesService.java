package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.DueDatesEntity;
import com.ems.taxConsultant.request.DueDatesRequest;
import com.ems.taxConsultant.request.TaxStatusResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

public interface DueDatesService {
    ResponseEntity<?> addDueDates(String companyName, DueDatesRequest request) throws AccountantException;

    Collection<DueDatesEntity> getDueDates(String companyName, String id);

    ResponseEntity<?> updateDueDates(String companyName, String id, DueDatesRequest updateRequest) throws AccountantException;

    void deleteDueDatesById(String companyName, String id) throws AccountantException, IOException;

    List<TaxStatusResponse> getDueDatesValidation(String companyName, HttpServletRequest request) throws AccountantException;
}
