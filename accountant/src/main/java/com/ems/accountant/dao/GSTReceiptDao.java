package com.ems.accountant.dao;


import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.GSTReceiptEntity;

import java.util.Collection;

public interface GSTReceiptDao extends Dao<GSTReceiptEntity>{
    default Class<GSTReceiptEntity> getEntityClass() {return GSTReceiptEntity.class;}

    Collection<GSTReceiptEntity> getGstReceipts(String companyName, String companyId, String gstReceiptsId, String month, String year) throws AccountantException;

}

