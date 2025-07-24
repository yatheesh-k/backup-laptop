package com.ems.taxConsultant.dao;

import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.DueDatesEntity;

import java.util.Collection;

public interface DueDatesDao extends Dao<DueDatesEntity>{

    default Class<DueDatesEntity> getEntityClass() {return DueDatesEntity.class;}

    Collection<DueDatesEntity> getDueDate(String companyName, String companyId, String id) throws TaxConsultantException;
}
