package com.ems.accountant.dao;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.PFReceiptsEntity;

import java.util.Collection;

public interface PFReceiptsDao extends Dao<PFReceiptsEntity> {

    default Class<PFReceiptsEntity> getEntityClass() {return PFReceiptsEntity.class;}

    Collection<PFReceiptsEntity> getPFReceipts(String companyName, String companyId, String pfReceiptsId, String month, String year) throws AccountantException;
}
