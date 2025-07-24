package com.ems.taxConsultant.daoImpl;

import com.ems.taxConsultant.controller.filter.Filter;
import com.ems.taxConsultant.controller.filter.Operator;
import com.ems.taxConsultant.dao.PortalsCredDao;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.PortalsCredEntity;
import com.ems.taxConsultant.repository.Repository;
import com.ems.taxConsultant.utils.Constants;
import io.micrometer.common.util.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Component
public class PortalsCredDaoImpl extends AbstractDao<PortalsCredEntity> implements PortalsCredDao {

    public PortalsCredDaoImpl(Repository repository) {super(repository);}

    @Override
    public Collection<PortalsCredEntity> getPortalDetails(String companyName, String companyId, String id) throws TaxConsultantException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(companyId)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }

        if (StringUtils.isNotBlank(id)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, id));
        }

        return search(filters, companyName);
    }


}
