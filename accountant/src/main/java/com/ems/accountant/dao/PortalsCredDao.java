package com.ems.accountant.dao;

import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.PFResponseEntity;
import com.ems.accountant.persistance.PortalsCredEntity;

import java.util.Collection;

public interface PortalsCredDao extends Dao<PortalsCredEntity> {

    default Class<PortalsCredEntity> getEntityClass() {
        return PortalsCredEntity.class;
    }


    Collection<PortalsCredEntity> getPortalDetails(String companyName, String companyId, String id) throws AccountantException;
}