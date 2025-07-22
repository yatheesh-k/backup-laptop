package com.ems.taxConsultant.controller.filter;

import lombok.Getter;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

/**
 * @author Susmitha
 *
 * Operator used in filter query expression.
 */
@Getter
public enum Operator {

    EQ("eq"),
    NE("ne"),
    LT("lt"),
    GT("gt"),
    LE("le"),
    GE("ge"),
    IN("in"),
    NI("ni"),
    SW("sw"),
    CN("cn"),

    AND("and"),
    OR("or"),

    UNDEFINED("");

    private final String name;
    Operator(String name) {
        this.name = name;
    }

    public static Operator byName(final String name) {
        if(StringUtils.isNotEmpty(name)) {
            for (Operator op : values()) {
                if (name.equalsIgnoreCase(op.name())
                        || name.equalsIgnoreCase(op.getName())) {
                    return op;
                }
            }
        }
        return UNDEFINED;
    }

    public static List<Operator> conditionalOperators() {
        return List.of(EQ, NE, GT, GE, LT, LE, IN, NI, SW, CN);
    }

    public static List<Operator> logicalOperators() {
        return List.of(AND, OR);
    }
}
