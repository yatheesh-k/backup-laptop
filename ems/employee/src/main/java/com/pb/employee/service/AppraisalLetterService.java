package com.pb.employee.service;

import com.pb.employee.request.AppraisalLetterRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

public interface AppraisalLetterService {

    ResponseEntity<byte[]> downloadAppraisalLetter(AppraisalLetterRequest appraisalLetterRequest, HttpServletRequest request);

}
