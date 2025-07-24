package com.ems.taxConsultant.dao;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.GSTResponseEntity;

import java.util.Collection;

public interface GSTResponseDao extends Dao<GSTResponseEntity> {

    default Class<GSTResponseEntity> getEntityClass() {return GSTResponseEntity.class;}

    Collection<GSTResponseEntity> getGSTResponse(String companyName, String id, String tdsId, String month, String year) throws TaxConsultantException;
}
