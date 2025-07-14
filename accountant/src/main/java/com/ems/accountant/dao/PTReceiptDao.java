package com.ems.accountant.dao;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.PTReceiptEntity;

import java.util.Collection;

public interface PTReceiptDao extends Dao<PTReceiptEntity> {

    default Class<PTReceiptEntity> getEntityClass() {return PTReceiptEntity.class;}


    Collection<PTReceiptEntity> getPTReceipt(String companyName, String id, String ptId, String month, String year) throws AccountantException;
}
