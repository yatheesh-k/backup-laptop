package com.ems.accountant.service;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.GSTAccountEntity;
import com.ems.accountant.request.GSTAccountRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collection;

public interface GSTAccountService {

    ResponseEntity<?> gstComparing(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException;

    ResponseEntity<?> registerGSTAccount(String companyName, String month, String year, MultipartFile file) throws AccountantException;

    ResponseEntity<?> addSingleGSTAccount(String companyName,GSTAccountRequest gstAccountRequest) throws AccountantException;

    Collection<GSTAccountEntity> getGSTAccount(String companyName, String month, String year, String Id) throws AccountantException;

    ResponseEntity<?> updateGSTAccount(String companyName, String Id, GSTAccountRequest gstAccountRequest) throws AccountantException;

    ResponseEntity<?> deleteGSTAccount(String companyName, String Id) throws AccountantException;

}