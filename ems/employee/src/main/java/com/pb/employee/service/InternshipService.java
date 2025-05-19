package com.pb.employee.service;

import com.pb.employee.request.AppraisalLetterRequest;
import com.pb.employee.request.InternshipRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

public interface InternshipService {

    ResponseEntity<byte[]> downloadInternship(InternshipRequest internshipRequest, HttpServletRequest request);
}
