package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.PortalsCredEntity;
import com.ems.taxConsultant.request.PortalsCredRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface PortalCredService {
    ResponseEntity<?> addPortalDetails(String companyName, PortalsCredRequest request) throws TaxConsultantException;

    Collection<PortalsCredEntity> getPortalCred(String companyName, String id);

    ResponseEntity<?> updatePortalsCred(String companyName, String tdsId, PortalsCredRequest updateRequest) throws TaxConsultantException;

    void deletePortalCredById(String companyName, String id) throws TaxConsultantException, IOException;
}
