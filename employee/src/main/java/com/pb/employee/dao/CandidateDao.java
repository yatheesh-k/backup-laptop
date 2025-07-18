package com.pb.employee.dao;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.CandidateEntity;

import java.util.Collection;

public interface CandidateDao extends Dao<CandidateEntity> {

    default Class<CandidateEntity> getEntityClass() {return CandidateEntity.class;}

    Collection<CandidateEntity> getCandidates(String companyName, String candidateId, String companyId, String emailId) throws EmployeeException;

}
