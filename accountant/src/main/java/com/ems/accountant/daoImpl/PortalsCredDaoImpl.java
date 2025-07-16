package com.ems.accountant.daoImpl;

import com.ems.accountant.controller.filter.Filter;
import com.ems.accountant.controller.filter.Operator;
import com.ems.accountant.dao.PortalsCredDao;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.PortalsCredEntity;
import com.ems.accountant.repository.Repository;
import com.ems.accountant.utils.Constants;
import io.micrometer.common.util.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Component
public class PortalsCredDaoImpl extends AbstractDao<PortalsCredEntity> implements PortalsCredDao {

    public PortalsCredDaoImpl(Repository repository) {super(repository);}

    @Override
    public Collection<PortalsCredEntity> getPortalDetails(String companyName, String companyId, String id) throws AccountantException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(companyId)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }

        return search(filters, companyName);
    }


}
