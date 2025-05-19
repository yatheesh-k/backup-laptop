package com.invoice.exception;

public enum InvoiceErrorMessageKey {

    PRODUCT_NOT_FOUND("product.not.found"),
    CUSTOMER_NOT_FOUND("customer.not.found"),
    COMPANY_NOT_FOUND("company.not.found"),
    UNEXPECTED_ERROR("unexpected.error"),
    CREATE_FAILED("create.failed"),
    INTERNAL_SERVER_ERROR("internal.server.error"),
    INVOICE_NOT_FOUND("invoice.not.found"),
    ERROR_CREATING_PRODUCT("error.creating.product"),
    ERROR_CREATING_CUSTOMER("error.creating.customer"),
    INVALID_RESOURCE_TYPE("invalid.resource"),
    CUSTOMER_ALREADY_EXISTS("customer.already.exists"),
    UNABLE_TO_GET_CUSTOMER("unable.to.get.customer"),
    UNABLE_TO_UPDATE_CUSTOMER("unable.to.update.customer"),
    UNABLE_TO_DELETE_CUSTOMER("unable.to.delete.customer"),
    PRODUCT_NOT_NULL("product.not.null"),
    PRODUCT_ALREADY_EXISTS("product.already.exists"),
    INVOICE_ALREADY_EXISTS("invoice.already.exists"),
    CUSTOMER_NOT_ASSOCIATED_WITH_COMPANY("customer.not.associated.with.company"),
    PRODUCE_NOT_ASSOCIATED_WITH_COMPANY("product.not.associated.with.company"),
    UNABLE_TO_SEARCH("unable.to.search"),
    BANK_DETAILS_NOT_FOUND("bank.details.not.found"),
    RESPONSE_BUILD_ERROR("builder.error"),
    UNABLE_GET_BANK_DETAILS("unable.to.get.bank.details"),
    INVALID_COMPANY("invalid.company"),
    INVALID_INVOICE_ID_FORMAT("invalid.invoiceId.format"),
    INVALID_INVOICE_DATE("invalid.invoice.date"),
    PLEASE_ENTER_FIELD_NAME("please.enter.field.name"),
    NO_CHANGES_DETECTED("no.changes.detected");

    private final String message;

    InvoiceErrorMessageKey(String message) {
        this.message = message;
    }
    public String getMessage() {
        return message;
    }
    @Override
    public String toString() {
        return message;
    }
}
