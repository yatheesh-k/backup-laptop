package com.invoice.request;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductColumnsRequest {

    private String key;
    private String title;
    private String type;
}
