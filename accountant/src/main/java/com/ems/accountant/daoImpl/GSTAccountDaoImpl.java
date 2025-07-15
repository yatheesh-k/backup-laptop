package com.ems.accountant.daoImpl;

import com.ems.accountant.controller.filter.Filter;
import com.ems.accountant.controller.filter.Operator;
import com.ems.accountant.dao.GSTAccountDao;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.GSTAccountEntity;
import com.ems.accountant.repository.Repository;
import com.ems.accountant.utils.Constants;
import io.micrometer.common.util.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Component
public class GSTAccountDaoImpl extends AbstractDao<GSTAccountEntity> implements GSTAccountDao {

    public GSTAccountDaoImpl(Repository repository) {super(repository);}

    @Override
    public Collection<GSTAccountEntity> findByCompanyIdAndMonthAndYear(String companyName,String companyId, String year, String month,String customerId ,String accountId) throws AccountantException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(companyId)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }
        if (StringUtils.isNotBlank(customerId)) {
            filters.add(new Filter(Constants.CUSTOMER_ID, Operator.EQ, customerId));
        }
        if (StringUtils.isNotBlank(year)) {
            filters.add(new Filter(Constants.YEAR, Operator.EQ, year));
        }
        if (StringUtils.isNotBlank(month)) {
            filters.add(new Filter(Constants.MONTH, Operator.EQ, month));
        }
        if (StringUtils.isNotBlank(accountId)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, accountId));
        }

        return search(filters, companyName);
    }
}
