package com.invoice.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyStampUpdate {

    @NotNull(message = "{notnull.message}")
    private String image;
}
