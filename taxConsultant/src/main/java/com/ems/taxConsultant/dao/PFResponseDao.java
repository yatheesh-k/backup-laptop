package com.ems.taxConsultant.dao;

import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.PFResponseEntity;

import java.util.Collection;

public interface PFResponseDao extends Dao<PFResponseEntity> {

    default Class<PFResponseEntity> getEntityClass() {return PFResponseEntity.class;}


    Collection<PFResponseEntity> getPFResponse(String companyName, String id, String pfResponseId, String month, String year) throws AccountantException;
}
