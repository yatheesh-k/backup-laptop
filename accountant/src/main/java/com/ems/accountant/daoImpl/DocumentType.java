package com.ems.accountant.daoImpl;

import com.ems.accountant.persistance.*;
import com.ems.accountant.persistance.model.Entity;
import com.ems.accountant.persistance.model.IDEntity;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

@Getter
public class DocumentType {

    private final String type;
    private final Class<? extends IDEntity> entityClass;

    private static final Map<Class<? extends Entity>, DocumentType> typeMap = new HashMap<>();

    public DocumentType(String type, Class<? extends IDEntity> entityClass) {
        this.type = type;
        this.entityClass = entityClass;
        typeMap.put(entityClass, this);
    }

    public static <T extends Entity> DocumentType getByType(Class<T> type) {
        return typeMap.get(type);
    }

    public static final DocumentType EMPLOYEE_ACCOUNT = new DocumentType("employee_account", EmployeeAccountEntity.class);

    public static final DocumentType PF_RESPONSE = new DocumentType("pf_response", PFResponseEntity.class);
    public static final DocumentType TDS_RESPONSE = new DocumentType("tds_response", TDSResponseEntity.class);
    public static final DocumentType PF_RECEIPT = new DocumentType("pf_receipt", PFReceiptsEntity.class);
    public static final DocumentType PT_RECEIPT = new DocumentType("pt_receipt", PTReceiptEntity.class);
    public static final DocumentType GST_RESPONSE = new DocumentType("gst_response", GSTResponseEntity.class);



}
