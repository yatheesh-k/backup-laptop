package com.ems.taxConsultant.dao;

import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.PortalsCredEntity;

import java.util.Collection;

public interface PortalsCredDao extends Dao<PortalsCredEntity> {

    default Class<PortalsCredEntity> getEntityClass() {
        return PortalsCredEntity.class;
    }


    Collection<PortalsCredEntity> getPortalDetails(String companyName, String companyId, String id) throws AccountantException;
}