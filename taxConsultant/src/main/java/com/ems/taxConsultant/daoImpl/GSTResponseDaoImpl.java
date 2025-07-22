package com.ems.taxConsultant.daoImpl;

import com.ems.taxConsultant.controller.filter.Filter;
import com.ems.taxConsultant.controller.filter.Operator;
import com.ems.taxConsultant.dao.GSTResponseDao;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.GSTResponseEntity;
import com.ems.taxConsultant.repository.Repository;
import com.ems.taxConsultant.utils.Constants;
import io.micrometer.common.util.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Component
public class GSTResponseDaoImpl extends AbstractDao<GSTResponseEntity> implements GSTResponseDao {


    public GSTResponseDaoImpl(Repository repository) {super(repository);}

    @Override
    public Collection<GSTResponseEntity> getGSTResponse(String companyName, String companyId, String pfResponseId, String month, String year) throws AccountantException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(companyId)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }
        if (StringUtils.isNotBlank(pfResponseId)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, pfResponseId));
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
