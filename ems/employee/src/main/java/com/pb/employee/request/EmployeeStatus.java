package com.pb.employee.request;

import lombok.*;

@Getter
@AllArgsConstructor

public enum EmployeeStatus {

    ACTIVE("Active"),
    INACTIVE("InActive"),
    PENDING("Pending"),
    NOTICE_PERIOD("NoticePeriod");

    private final String status;
}
