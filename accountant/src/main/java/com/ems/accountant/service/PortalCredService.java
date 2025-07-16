package com.ems.accountant.service;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.PortalsCredEntity;
import com.ems.accountant.request.PortalsCredRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface PortalCredService {
    ResponseEntity<?> addPortalDetails(String companyName, PortalsCredRequest request) throws AccountantException;

    Collection<PortalsCredEntity> getPortalCred(String companyName, String id);

    ResponseEntity<?> updatePortalsCred(String companyName, String tdsId, PortalsCredRequest updateRequest) throws AccountantException;

    void deletePortalCredById(String companyName, String id) throws AccountantException, IOException;
}
