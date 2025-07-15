package com.ems.accountant.daoImpl;

import com.ems.accountant.controller.filter.Filter;
import com.ems.accountant.controller.filter.Operator;
import com.ems.accountant.dao.TDSResponseDao;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.TDSResponseEntity;
import com.ems.accountant.repository.Repository;
import com.ems.accountant.utils.Constants;
import io.micrometer.common.util.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Component
public class TDSResponseDaoImpl extends AbstractDao<TDSResponseEntity> implements TDSResponseDao {

    public TDSResponseDaoImpl(Repository repository) {super(repository);}

    @Override
    public Collection<TDSResponseEntity> getTDSResponse(String companyName, String companyId, String pfResponseId, String month, String year) throws AccountantException {
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
