package com.ems.taxConsultant.controller.filter;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class Filter implements Serializable {

    public Filter(final String field, final Operator operator, final String... value) {
        this.field = field;
        this.operator = operator;
        this.value = value;
    }

    private String field;
    private Operator operator;
    private String[] value;

}
