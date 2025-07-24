package com.ems.taxConsultant.daoImpl;

import com.ems.taxConsultant.controller.filter.Filter;
import com.ems.taxConsultant.controller.filter.Operator;
import com.ems.taxConsultant.dao.PTResponseDao;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.PTResponseEntity;
import com.ems.taxConsultant.repository.Repository;
import com.ems.taxConsultant.utils.Constants;
import io.micrometer.common.util.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Component
public class PTResponseDaoImpl extends AbstractDao<PTResponseEntity> implements PTResponseDao {
    public PTResponseDaoImpl(Repository repository) {super(repository);}

    @Override
    public Collection<PTResponseEntity> getPTResponse(String companyName, String companyId, String ptResponseId, String month, String year) throws TaxConsultantException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(companyId)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }
        if (StringUtils.isNotBlank(ptResponseId)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, ptResponseId));
        }
        if (StringUtils.isNotBlank(month)) {
            filters.add(new Filter(Constants.MONTH, Operator.EQ, month));
        }
        if (StringUtils.isNotBlank(year)) {
            filters.add(new Filter(Constants.YEAR, Operator.EQ, year));
        }

        return search(filters, companyName);
    }

}
