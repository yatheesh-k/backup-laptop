package com.ems.accountant.dao;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.DueDatesEntity;

import java.util.Collection;

public interface DueDatesDao extends Dao<DueDatesEntity>{

    default Class<DueDatesEntity> getEntityClass() {return DueDatesEntity.class;}

    Collection<DueDatesEntity> getDueDate(String companyName, String companyId, String id) throws AccountantException;
}
