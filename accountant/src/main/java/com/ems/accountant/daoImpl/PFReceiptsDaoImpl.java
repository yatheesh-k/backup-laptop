package com.ems.accountant.daoImpl;

import com.ems.accountant.controller.filter.Filter;
import com.ems.accountant.controller.filter.Operator;
import com.ems.accountant.dao.PFReceiptsDao;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.PFReceiptsEntity;
import com.ems.accountant.persistance.PFResponseEntity;
import com.ems.accountant.repository.Repository;
import com.ems.accountant.utils.Constants;
import io.micrometer.common.util.StringUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

@Component
public class PFReceiptsDaoImpl extends AbstractDao<PFReceiptsEntity> implements PFReceiptsDao {

    public PFReceiptsDaoImpl(Repository repository) {super(repository);}

    @Override
    public Collection<PFReceiptsEntity> getPFReceipts(String companyName, String companyId, String pfReceiptsId, String month, String year) throws AccountantException {
        Collection<Filter> filters = new ArrayList<>();

        if (StringUtils.isNotBlank(companyId)) {
            filters.add(new Filter(Constants.COMPANY_ID, Operator.EQ, companyId));
        }
        if (StringUtils.isNotBlank(pfReceiptsId)) {
            filters.add(new Filter(Constants.ID, Operator.EQ, pfReceiptsId));
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
