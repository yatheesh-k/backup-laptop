package com.ems.taxConsultant.daoImpl;

import com.ems.taxConsultant.persistance.*;
import com.ems.taxConsultant.persistance.EmployeeAccountEntity;
import com.ems.taxConsultant.persistance.GSTAccountEntity;
import com.ems.taxConsultant.persistance.PFReceiptsEntity;
import com.ems.taxConsultant.persistance.PFResponseEntity;
import com.ems.taxConsultant.persistance.PTResponseEntity;
import com.ems.taxConsultant.persistance.TDSResponseEntity;
import com.ems.taxConsultant.persistance.PTReceiptEntity;
import com.ems.taxConsultant.persistance.model.Entity;
import com.ems.taxConsultant.persistance.model.IDEntity;
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

    public static final DocumentType GST_RECEIPT = new DocumentType("gst_receipt", GSTReceiptEntity.class);
    public static final DocumentType PT_RESPONSE = new DocumentType("pt_response", PTResponseEntity.class);
    public static final DocumentType PORTAL_CREDENTIALS = new DocumentType("portal_credentials", PortalsCredEntity.class);
    public static final DocumentType TDS_RECEIPT = new DocumentType("tds_receipt", TDSReceiptEntity.class);

    public static final DocumentType GST_ACCOUNT = new DocumentType("gst_account", GSTAccountEntity.class);
    public static final DocumentType DUE_DATES = new DocumentType("due_dates", DueDatesEntity.class);



}
