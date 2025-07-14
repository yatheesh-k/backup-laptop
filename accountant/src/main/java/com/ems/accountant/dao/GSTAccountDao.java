package com.ems.accountant.dao;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.GSTAccountEntity;

import java.util.Collection;

public interface GSTAccountDao extends Dao<GSTAccountEntity>{

    default Class<GSTAccountEntity> getEntityClass() {return GSTAccountEntity.class;}

    Collection<GSTAccountEntity> findByCompanyIdAndMonthAndYear(String companyId,String customerId,String year, String month, String Id) throws AccountantException;


}
