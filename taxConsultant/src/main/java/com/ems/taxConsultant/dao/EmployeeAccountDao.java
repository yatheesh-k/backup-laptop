package com.ems.taxConsultant.dao;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.EmployeeAccountEntity;

import java.util.Collection;

public interface EmployeeAccountDao extends Dao<EmployeeAccountEntity> {

    default Class<EmployeeAccountEntity> getEntityClass() {return EmployeeAccountEntity.class;}


    Collection<EmployeeAccountEntity> getEmployeeAccountByUanMonthYear(String uanEncoded, String id, String month, String year, String companyMonth, String employeeId, String accountId) throws TaxConsultantException;

    Collection<EmployeeAccountEntity> getEmployeeAccountByPanMonthYear(String panEncoded,String id,String month,String year, String companyMonth, String employeeId,String accountId) throws TaxConsultantException;
}
