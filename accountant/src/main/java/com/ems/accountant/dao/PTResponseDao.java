package com.ems.accountant.dao;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.PTResponseEntity;

import java.util.Collection;

public interface PTResponseDao extends Dao<PTResponseEntity> {

    default Class<PTResponseEntity> getEntityClass() {return PTResponseEntity.class;}

    Collection<PTResponseEntity> getPTResponse(String companyName, String id, String ptResponseId, String month, String year) throws AccountantException;
}

