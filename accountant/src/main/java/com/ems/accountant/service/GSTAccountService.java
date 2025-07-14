package com.ems.accountant.service;

import com.ems.accountant.exception.AccountantException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface GSTAccountService {

    ResponseEntity<?> gstComparing(String companyName, String month, String year, MultipartFile file) throws AccountantException, IOException;

    ResponseEntity<?> registerGSTAccount(String companyName, String month, String year, MultipartFile file) throws AccountantException;


}
