package com.ems.accountant.dao;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.EmployeeAccountEntity;

import java.util.Collection;

public interface EmployeeAccountDao extends Dao<EmployeeAccountEntity> {

    default Class<EmployeeAccountEntity> getEntityClass() {return EmployeeAccountEntity.class;}


    Collection<EmployeeAccountEntity> getEmployeeAccountByUanMonthYear(String uanEncoded, String id, String prevMonth, String prevYear, String companyMonth) throws AccountantException;
}
