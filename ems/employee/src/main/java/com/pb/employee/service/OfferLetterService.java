package com.pb.employee.service;

import com.pb.employee.request.OfferLetterRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

public interface OfferLetterService {


    ResponseEntity<byte[]> downloadOfferLetter(OfferLetterRequest offerLetterRequest, HttpServletRequest request);

}
