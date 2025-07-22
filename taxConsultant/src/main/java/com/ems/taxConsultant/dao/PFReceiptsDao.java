package com.ems.taxConsultant.dao;

import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.PFReceiptsEntity;

import java.util.Collection;

public interface PFReceiptsDao extends Dao<PFReceiptsEntity> {

    default Class<PFReceiptsEntity> getEntityClass() {return PFReceiptsEntity.class;}

    Collection<PFReceiptsEntity> getPFReceipts(String companyName, String companyId, String pfReceiptsId, String month, String year) throws AccountantException;
}
