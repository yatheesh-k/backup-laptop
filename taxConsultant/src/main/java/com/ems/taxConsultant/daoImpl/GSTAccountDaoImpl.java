package com.ems.taxConsultant.daoImpl;

import com.ems.taxConsultant.controller.filter.Filter;
import com.ems.taxConsultant.controller.filter.Operator;
import com.ems.taxConsultant.dao.GSTAccountDao;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.GSTAccountEntity;
import com.ems.taxConsultant.repository.Repository;
import com.ems.taxConsultant.utils.Constants;
import io.micrometer.common.util.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Component
public class GSTAccountDaoImpl extends AbstractDao<GSTAccountEntity> implements GSTAccountDao {

    public GSTAccountDaoImpl(Repository repository) {super(repository);}

    @Override
    public Collection<GSTAccountEntity> findByCompanyIdAndMonthAndYear(String companyName,String companyId,String year, String month ,String accountId) throws TaxConsultantException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(companyId)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
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
