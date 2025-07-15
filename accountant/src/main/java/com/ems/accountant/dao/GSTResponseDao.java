package com.ems.accountant.dao;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.EmployeeAccountEntity;
import com.ems.accountant.persistance.GSTResponseEntity;

import java.util.Collection;

public interface GSTResponseDao extends Dao<GSTResponseEntity> {

    default Class<GSTResponseEntity> getEntityClass() {return GSTResponseEntity.class;}

    Collection<GSTResponseEntity> getGSTResponse(String companyName, String id, String tdsId, String month, String year) throws AccountantException;
}
