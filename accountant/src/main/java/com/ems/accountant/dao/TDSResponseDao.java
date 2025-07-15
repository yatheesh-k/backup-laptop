package com.ems.accountant.dao;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.PFResponseEntity;
import com.ems.accountant.persistance.TDSResponseEntity;

import java.util.Collection;

public interface TDSResponseDao extends Dao<TDSResponseEntity> {

    default Class<TDSResponseEntity> getEntityClass() {return TDSResponseEntity.class;}

    Collection<TDSResponseEntity> getTDSResponse(String companyName, String id, String tdsId, String month, String year) throws AccountantException;


}
