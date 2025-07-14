package com.ems.accountant.daoImpl;

import com.ems.accountant.controller.filter.Filter;
import com.ems.accountant.controller.filter.Operator;
import com.ems.accountant.dao.EmployeeAccountDao;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.EmployeeAccountEntity;
import com.ems.accountant.repository.Repository;
import com.ems.accountant.utils.Constants;
import io.micrometer.common.util.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Component
public class EmployeeAccountDaoImpl extends AbstractDao<EmployeeAccountEntity> implements EmployeeAccountDao{


    public EmployeeAccountDaoImpl(Repository repository) {super(repository);}

    @Override
    public Collection<EmployeeAccountEntity> getEmployeeAccountByUanMonthYear(String uanEncoded, String id, String month, String year, String companyName, String employeeId, String accountId) throws AccountantException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(uanEncoded)) {
            filters.add(new Filter(Constants.UAN_NUMBER, Operator.EQ, uanEncoded));
        }
        if (StringUtils.isNotBlank(id)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, id));
        }
        if (StringUtils.isNotBlank(month)) {
            filters.add(new Filter(Constants.MONTH, Operator.EQ, month));
        }
        if (StringUtils.isNotBlank(year)) {
            filters.add(new Filter(Constants.YEAR, Operator.EQ, year));
        }
        if (StringUtils.isNotBlank(accountId)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, accountId));
        }
        if (StringUtils.isNotBlank(employeeId)) {
            filters.add(new Filter(Constants.EMPLOYEE_ID, Operator.EQ, employeeId));
        }



        return search(filters, companyName);
    }

}
