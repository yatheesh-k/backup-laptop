package com.ems.accountant.daoImpl;

import com.ems.accountant.controller.filter.Filter;
import com.ems.accountant.controller.filter.Operator;
import com.ems.accountant.dao.DueDatesDao;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.DueDatesEntity;
import com.ems.accountant.repository.Repository;
import com.ems.accountant.utils.Constants;
import io.micrometer.common.util.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Component
public class DueDatesDaoImpl extends AbstractDao<DueDatesEntity> implements DueDatesDao {

    public DueDatesDaoImpl(Repository repository) {super(repository);}

    @Override
    public Collection<DueDatesEntity> getDueDate(String companyName, String companyId, String id) throws AccountantException {
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
