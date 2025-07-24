package com.ems.taxConsultant.dao;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.GSTAccountEntity;

import java.util.Collection;

public interface GSTAccountDao extends Dao<GSTAccountEntity>{

    default Class<GSTAccountEntity> getEntityClass() {return GSTAccountEntity.class;}

    Collection<GSTAccountEntity> findByCompanyIdAndMonthAndYear(String companyName,String companyId, String year, String month,String accountId) throws TaxConsultantException;


}
