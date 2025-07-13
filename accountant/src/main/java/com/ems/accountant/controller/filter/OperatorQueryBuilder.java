package com.ems.accountant.controller.filter;


import com.ems.accountant.utils.Constants;

public final class OperatorQueryBuilder {

    public static BaseQuery build(final Filter filter) {
        if(Constants.ID.equalsIgnoreCase(filter.getField())) {
            filter.setField("_" + filter.getField());
        }
        return switch (filter.getOperator()) {
            case EQ -> new MatchQuery(filter);
            case IN -> new TermsQuery(filter);
            case null, default -> throw new UnsupportedOperationException();
        };
    }
}
