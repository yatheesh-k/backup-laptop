package com.ems.taxConsultant.dao;


import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.GSTReceiptEntity;

import java.util.Collection;

public interface GSTReceiptDao extends Dao<GSTReceiptEntity>{
    default Class<GSTReceiptEntity> getEntityClass() {return GSTReceiptEntity.class;}

    Collection<GSTReceiptEntity> getGstReceipts(String companyName, String companyId, String gstReceiptsId, String month, String year) throws AccountantException;

}

