package com.invoice.common;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResponseObject<T> {

    @Schema(required = true, description = "${globalResource.path.description}", example = "https://localhost:8082/invoice")
    private String path;
    @Schema(required = true, description = "${globalResource.message.description}", example = "example message")
    private String message;
    @Schema(hidden = true, accessMode = Schema.AccessMode.READ_ONLY)
    private ResponseErrorObject error;
    @Schema(description = "${globalResource.data.description}")
    private T data;
}
