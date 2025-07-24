package com.ems.taxConsultant.dao;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.TDSReceiptEntity;

import java.util.Collection;

public interface TDSReceiptsDao extends Dao<TDSReceiptEntity>{

    default Class<TDSReceiptEntity> getEntityClass() {return TDSReceiptEntity.class;}

    Collection<TDSReceiptEntity> getTDSReceipts(String companyName, String companyId, String tdsReceiptsId, String month, String year) throws TaxConsultantException;

}
