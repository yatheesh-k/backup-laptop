package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.GSTAccountEntity;
import com.ems.taxConsultant.request.GSTAccountRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collection;

public interface GSTAccountService {

    ResponseEntity<?> gstComparing(String companyName, String month, String year, MultipartFile file) throws TaxConsultantException, IOException;

    ResponseEntity<?> getGstAccountComparing(String companyName, String month, String year) throws TaxConsultantException;

    ResponseEntity<?> registerGSTAccount(String companyName, String month, String year, MultipartFile file) throws TaxConsultantException;

    ResponseEntity<?> addSingleGSTAccount(String companyName,GSTAccountRequest gstAccountRequest) throws TaxConsultantException;

    Collection<GSTAccountEntity> getGSTAccount(String companyName, String month, String year, String Id) throws TaxConsultantException;

    ResponseEntity<?> updateGSTAccount(String companyName, String Id, GSTAccountRequest gstAccountRequest) throws TaxConsultantException;

    ResponseEntity<?> deleteGSTAccount(String companyName, String Id) throws TaxConsultantException;

    ResponseEntity<?> GstAccountRegister( String companyName, String month, String year) throws TaxConsultantException;

}