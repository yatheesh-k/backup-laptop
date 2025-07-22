package com.ems.taxConsultant.dao;

import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.PTReceiptEntity;

import java.util.Collection;

public interface PTReceiptDao extends Dao<PTReceiptEntity> {

    default Class<PTReceiptEntity> getEntityClass() {return PTReceiptEntity.class;}


    Collection<PTReceiptEntity> getPTReceipt(String companyName, String id, String ptId, String month, String year) throws AccountantException;
}
