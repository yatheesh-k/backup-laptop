package com.ems.accountant.dao;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.TDSReceiptEntity;

import java.util.Collection;

public interface TDSReceiptsDao extends Dao<TDSReceiptEntity>{

    default Class<TDSReceiptEntity> getEntityClass() {return TDSReceiptEntity.class;}

    Collection<TDSReceiptEntity> getTDSReceipts(String companyName, String companyId, String tdsReceiptsId, String month, String year) throws AccountantException;

}
