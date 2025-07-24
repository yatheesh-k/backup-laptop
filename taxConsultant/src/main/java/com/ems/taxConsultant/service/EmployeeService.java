package com.ems.taxConsultant.service;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.EmployeeResponse;

import java.util.List;

public interface EmployeeService {
    List<EmployeeResponse> getEmployeeResponseDetails(String companyName) throws TaxConsultantException;
}
