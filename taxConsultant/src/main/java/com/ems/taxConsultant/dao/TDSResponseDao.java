package com.ems.taxConsultant.dao;

import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.TDSResponseEntity;

import java.util.Collection;

public interface TDSResponseDao extends Dao<TDSResponseEntity> {

    default Class<TDSResponseEntity> getEntityClass() {return TDSResponseEntity.class;}

    Collection<TDSResponseEntity> getTDSResponse(String companyName, String id, String tdsId, String month, String year) throws AccountantException;


}
