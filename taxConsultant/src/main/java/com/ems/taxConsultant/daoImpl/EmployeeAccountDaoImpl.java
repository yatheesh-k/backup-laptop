package com.ems.taxConsultant.daoImpl;

import com.ems.taxConsultant.controller.filter.Filter;
import com.ems.taxConsultant.controller.filter.Operator;
import com.ems.taxConsultant.dao.EmployeeAccountDao;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.EmployeeAccountEntity;
import com.ems.taxConsultant.repository.Repository;
import com.ems.taxConsultant.utils.Constants;
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

    @Override
    public Collection<EmployeeAccountEntity> getEmployeeAccountByPanMonthYear(String panEncoded, String id, String month, String year, String companyName, String employeeId, String accountId) throws AccountantException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(panEncoded)) {
            filters.add(new Filter(Constants.PAN_NUMBER, Operator.EQ, panEncoded));
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
