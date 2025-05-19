package com.pb.employee.opensearch;

import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.model.UserEntity;
import com.pb.employee.persistance.model.*;

import com.pb.employee.persistance.model.CompanyEntity;
import com.pb.employee.persistance.model.DepartmentEntity;
import com.pb.employee.persistance.model.DesignationEntity;
import com.pb.employee.persistance.model.EmployeeEntity;
import com.pb.employee.persistance.model.Entity;
import com.pb.employee.util.Constants;
import com.pb.employee.util.ResourceIdUtils;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.FieldValue;
import org.opensearch.client.opensearch._types.Result;
import org.opensearch.client.opensearch._types.mapping.KeywordProperty;
import org.opensearch.client.opensearch._types.mapping.Property;
import org.opensearch.client.opensearch._types.mapping.TypeMapping;
import org.opensearch.client.opensearch._types.query_dsl.BoolQuery;
import org.opensearch.client.opensearch._types.query_dsl.Query;
import org.opensearch.client.opensearch.core.*;
import org.opensearch.client.opensearch.core.search.Hit;
import org.opensearch.client.opensearch.indices.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;


import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class OpenSearchOperations {

    private static final Integer SIZE_ELASTIC_SEARCH_MAX_VAL = 9999;
    Logger logger = LoggerFactory.getLogger(OpenSearchOperations.class);


    @Autowired
    private OpenSearchClient esClient;

    public String createIndex(String name) throws EmployeeException {
        String index = ResourceIdUtils.generateCompanyIndex(name);
        TypeMapping mapping = new TypeMapping.Builder()
                .properties(Constants.RESOURCE_ID, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build())
                .build();
        CreateIndexRequest createIndexRequest = new CreateIndexRequest.Builder()
                .index(index)
                .mappings(mapping)
                .build();
        try {
            logger.info("creating index {}", index);
            CreateIndexResponse result = esClient.indices().create(createIndexRequest);
            return result.index();
        } catch (Exception e) {
            logger.error("Not able to create index {} ", e.getMessage());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_CREATE_COMPANY), index),
                    HttpStatus.CONFLICT);
        }
    }

    public Entity saveEntity(Entity entity, String Id, String index) throws EmployeeException {
        IndexResponse indexResponse = null;
        try {
            synchronized (entity) {
                indexResponse = esClient.index(builder -> builder.index(index)
                        .id(Id)
                        .document(entity));
            }
            logger.debug("Saved the entity. Response {}.Entity:{}", indexResponse, entity);
        } catch (IOException e) {
            logger.error("Exception ", e);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_EMPLOYEE_ATTENDANCE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return entity;
    }


    public String deleteEntity(String id, String index) throws EmployeeException {
        logger.debug("Deleting the Entity {}", id);
        DeleteResponse deleteResponse = null;
        try {
            synchronized (id) {
                deleteResponse = esClient.delete(b -> b.index(index)
                        .id(id));
            }
            if (deleteResponse.result() == Result.NotFound) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE), HttpStatus.NOT_FOUND);
            }
            logger.debug("Deleted the Entity {}, Delete response {}", id, deleteResponse);
        } catch (IOException e) {
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EXCEPTION_OCCURRED), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return id;
    }

    public UserEntity getEMSAdminById(String user) throws IOException {
        GetRequest getRequest = new GetRequest.Builder().id(Constants.EMS_ADMIN + "_" + user)
                .index(Constants.INDEX_EMS).build();
        GetResponse<UserEntity> searchResponse = esClient.get(getRequest, UserEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public Object getById(String resourceId, String type, String index) throws IOException {
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<Object> searchResponse = esClient.get(getRequest, Object.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public AttendanceEntity getAttendanceById(String resourceId, String type, String index) throws IOException {
        logger.debug("Getting attendence by Id {} of index {}", resourceId, index);
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<AttendanceEntity> searchResponse = esClient.get(getRequest, AttendanceEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }


    public EmployeeEntity getEmployeeById(String resourceId, String type, String index) throws IOException {
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<EmployeeEntity> searchResponse = esClient.get(getRequest, EmployeeEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public CompanyEntity getCompanyById(String resourceId, String type, String index) throws IOException {
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<CompanyEntity> searchResponse = esClient.get(getRequest, CompanyEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public DepartmentEntity getDepartmentById(String resourceId, String type, String index) throws IOException {
        GetRequest getRequest = new GetRequest.Builder()
                .id(resourceId)
                .index(index)
                .build();

        GetResponse<DepartmentEntity> searchResponse = esClient.get(getRequest, DepartmentEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            if (searchResponse.source().getType().equals(Constants.DEPARTMENT)) {
                return searchResponse.source();
            }
        }
        return null;
    }

    public DesignationEntity getDesignationById(String resourceId, String type, String index) throws IOException {
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<DesignationEntity> searchResponse = esClient.get(getRequest, DesignationEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            if (searchResponse.source().getType().equals(Constants.DESIGNATION)) {
                return searchResponse.source();
            }
        }
        return null;
    }

    public EmployeeSalaryEntity getSalaryById(String resourceId, String type, String index) throws IOException {
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<EmployeeSalaryEntity> searchResponse = esClient.get(getRequest, EmployeeSalaryEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public PayslipEntity getPayslipById(String resourceId, String type, String index) throws IOException {
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<PayslipEntity> searchResponse = esClient.get(getRequest, PayslipEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public List<DesignationEntity> getCompanyDesignationByName(String companyName, String designationName) throws EmployeeException {
        logger.debug("Getting the Designation by company '{}' and designation '{}'", companyName, designationName);

        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();

        // Filter by type = DESIGNATION
        boolQueryBuilder.filter(q -> q.term(t -> t.field(Constants.TYPE).value(FieldValue.of(Constants.DESIGNATION))));

        // Exact match on name.keyword
        if (designationName != null && !designationName.trim().isEmpty()) {
            boolQueryBuilder.must(q -> q.term(t ->
                    t.field(Constants.NAME + ".keyword").value(FieldValue.of(designationName))
            ));
        }

        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        SearchResponse<DesignationEntity> searchResponse;

        try {
            searchResponse = esClient.search(s -> s
                            .index(index)
                            .size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                            .query(boolQueryBuilder.build()._toQuery()),
                    DesignationEntity.class
            );
        } catch (IOException e) {
            logger.error("Error searching in Elasticsearch: {}", e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<DesignationEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of exact matches for '{}' in company '{}': {}", designationName, companyName, hits.size());

        List<DesignationEntity> designationEntities = new ArrayList<>();
        for (Hit<DesignationEntity> hit : hits) {
            designationEntities.add(hit.source());
        }

        if (designationEntities.isEmpty()) {
            logger.info("No exact match found for '{}'. Size: 0", designationName);
        } else {
            logger.info("Found {} exact match(es) for '{}'", designationEntities.size(), designationName);
        }

        return designationEntities;
    }

    public boolean isDesignationPresent(String companyName, String designationName) throws EmployeeException {
        // Fetch all designations from the database
        List<DesignationEntity> designationEntities = getCompanyDesignationByName(companyName,designationName);

        // Iterate through the designation list to check if the designation already exists
        for (DesignationEntity designation : designationEntities) {
            // Check if the name matches the input designation (case-insensitive)
            if (designation.getName().equalsIgnoreCase(designationName)) {
                return true; // Designation already exists
            }
        }
        return false; // Designation doesn't exist
    }

    public boolean isDepartmentPresent(String companyName, String departmentName) throws EmployeeException {
        // Fetch all designations from the database
        List<DepartmentEntity> designationEntities = getCompanyDepartmentByName(companyName,departmentName);

        // Iterate through the designation list to check if the designation already exists
        for (DepartmentEntity department : designationEntities) {
            // Check if the name matches the input designation (case-insensitive)
            if (department.getName().equalsIgnoreCase(departmentName)) {
                return true; // Designation already exists
            }
        }
        return false; // Designation doesn't exist
    }

    public List<CompanyEntity> getCompanyByData(String companyName, String type, String shortName) throws EmployeeException {
        logger.debug("Getting the Resource by name {}, {},{}", companyName, type, shortName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(type)));
        if (companyName != null) {
            boolQueryBuilder = boolQueryBuilder
                    .filter(q -> q.matchPhrase(t -> t.field(Constants.COMPANY_NAME).query(companyName)));
        }
        if (shortName != null) {
            boolQueryBuilder = boolQueryBuilder
                    .filter(q -> q.matchPhrase(t -> t.field(Constants.SHORT_NAME).query(shortName)));
        }

        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<CompanyEntity> searchResponse = null;
        try {
            searchResponse = esClient.search(t -> t.index(Constants.INDEX_EMS).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), CompanyEntity.class);
        } catch (IOException e) {
            e.getStackTrace();
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<CompanyEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<CompanyEntity> subscriberEntities = new ArrayList<>();
        if (hits.size() > 0) {
            for (Hit<CompanyEntity> hit : hits) {
                subscriberEntities.add(hit.source());
            }
        }
        return subscriberEntities;
    }

    public List<EmployeeEntity> getCompanyEmployeeByData(String companyName, String empId, String emailId) throws EmployeeException {
        logger.debug("Getting the Resource by  , companyName{} empId,{},emailId {}", companyName, empId, emailId);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.EMPLOYEE_ID).query(empId)));
        if (emailId != null) {
            boolQueryBuilder = boolQueryBuilder
                    .filter(q -> q.matchPhrase(t -> t.field(Constants.EMAIL_ID).query(emailId)));
        }
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<EmployeeEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), EmployeeEntity.class);
        } catch (IOException e) {
            e.getStackTrace();
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<EmployeeEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<EmployeeEntity> employeeEntities = new ArrayList<>();
        if (hits.size() > 0) {
            for (Hit<EmployeeEntity> hit : hits) {
                employeeEntities.add(hit.source());
            }
        }
        return employeeEntities;
    }

    public List<DepartmentEntity> getCompanyDepartmentByName(String companyName, String departmentName) throws EmployeeException {
        logger.debug("Getting the Department by company '{}' and department '{}'", companyName, departmentName);

        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();

        // Filter by type = DEPARTMENT
        boolQueryBuilder.filter(q -> q.term(t -> t.field(Constants.TYPE).value(FieldValue.of(Constants.DEPARTMENT))));

        // Exact match on name.keyword
        if (departmentName != null && !departmentName.trim().isEmpty()) {
            boolQueryBuilder.must(q -> q.term(t ->
                    t.field(Constants.NAME + ".keyword").value(FieldValue.of(departmentName))
            ));
        }

        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        SearchResponse<DepartmentEntity> searchResponse;

        try {
            searchResponse = esClient.search(s -> s
                            .index(index)
                            .size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                            .query(boolQueryBuilder.build()._toQuery()),
                    DepartmentEntity.class
            );
        } catch (IOException e) {
            logger.error("Error searching in Elasticsearch: {}", e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<DepartmentEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of exact matches for '{}' in company '{}': {}", departmentName, companyName, hits.size());

        List<DepartmentEntity> departmentEntities = new ArrayList<>();
        for (Hit<DepartmentEntity> hit : hits) {
            departmentEntities.add(hit.source());
        }

        return departmentEntities;
    }

    public List<CompanyEntity> getCompanies() throws EmployeeException {
        logger.debug("Getting all the companies ");
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.COMPANY)));
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<CompanyEntity> searchResponse = null;
        try {
            searchResponse = esClient.search(t -> t.index(Constants.INDEX_EMS).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), CompanyEntity.class);
        } catch (IOException e) {
            e.getStackTrace();
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<CompanyEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<CompanyEntity> companyEntities = new ArrayList<>();
        if (hits.size() > 0) {
            for (Hit<CompanyEntity> hit : hits) {
                companyEntities.add(hit.source());
            }
        }
        return companyEntities;
    }

    public SearchResponse<Object> searchByQuery(BoolQuery.Builder query, String index, Class targetClass) throws EmployeeException {
        SearchResponse searchResponse = null;
        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(query.build()._toQuery()), targetClass.getClass());
        } catch (IOException e) {
            e.printStackTrace();
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_PROCESS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return searchResponse;
    }

    public List<EmployeeEntity> getCompanyEmployees(String companyName) throws EmployeeException {
        logger.debug("Getting employees for company {}", companyName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.EMPLOYEE)));
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<EmployeeEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            // Adjust the type or field according to your index structure
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), EmployeeEntity.class);
        } catch (IOException e) {
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<EmployeeEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of employee hits for company {}: {}", companyName, hits.size());

        List<EmployeeEntity> employeeEntities = new ArrayList<>();
        for (Hit<EmployeeEntity> hit : hits) {
            employeeEntities.add(hit.source());
        }

        return employeeEntities;
    }

    public TemplateEntity getCompanyTemplates(String companyName) throws EmployeeException {
        logger.debug("Getting Templates for company {}", companyName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.TEMPLATE)));
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<TemplateEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            // Adjust the type or field according to your index structure
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), TemplateEntity.class);
        } catch (IOException e) {
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<TemplateEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of employee hits for company {}: {}", companyName, hits.size());

        if (!hits.isEmpty()) {
            return hits.get(0).source();
        } else {
            return null;
        }

    }

    public List<SalaryEntity> getSalaries(String companyName, String employeeId) throws EmployeeException {
        logger.debug("Getting employees for salary details {}", companyName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.SALARY)))
                .filter(q -> q.matchPhrase(t -> t.field(Constants.EMPLOYEE_ID).query(employeeId)));

        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<SalaryEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            // Adjust the type or field according to your index structure
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build().toQuery()), SalaryEntity.class);
        } catch (IOException e) {
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<SalaryEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of employee hits for company is {}: {}", companyName, hits.size());

        List<SalaryEntity> salaryEntities = new ArrayList<>();
        for (Hit<SalaryEntity> hit : hits) {
            salaryEntities.add(hit.source());
        }

        return salaryEntities;
    }

    public List<PayslipEntity> getEmployeePayslip(String companyName, String employeeId, String month, String year) throws EmployeeException {
        logger.debug("Getting payslips for employee {} in company {}", employeeId, companyName);

        // Build the BoolQuery
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.PAYSLIP)))
                .filter(q -> q.matchPhrase(t -> t.field(Constants.EMPLOYEE_ID).query(employeeId)));
        if (year != null) {
            boolQueryBuilder = boolQueryBuilder.filter(q -> q.matchPhrase(t -> t.field(Constants.YEAR).query(year)));
        }
        if (month != null) {
            boolQueryBuilder = boolQueryBuilder.filter(q -> q.matchPhrase(t -> t.field(Constants.MONTH).query(month)));
        }
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<PayslipEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            // Execute the search
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), PayslipEntity.class);
        } catch (IOException e) {
            logger.error("Error executing search query: {}", e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Get hits from the search response
        List<Hit<PayslipEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of payslip hits for company {} and employee {}: {}", companyName, employeeId, hits.size());

        // Filter payslips for the specific employee ID
        List<PayslipEntity> payslipEntities = new ArrayList<>();
        for (Hit<PayslipEntity> hit : hits) {
            PayslipEntity payslip = hit.source();
            payslipEntities.add(payslip);
        }

        // Log if no payslips are found for the employee
        if (payslipEntities.isEmpty()) {
            logger.warn("No payslips found for employee {} in company {}", employeeId, companyName);
        }

        return payslipEntities;
    }

    public void deleteIndex(String index) throws EmployeeException {
        try {
            // Check if the index exists before attempting deletion
            DeleteIndexRequest deleteIndexRequest = new DeleteIndexRequest.Builder().index(index).build();
            DeleteIndexResponse deleteIndexResponse = esClient.indices().delete(deleteIndexRequest);

            if (!deleteIndexResponse.acknowledged()) {
                throw new EmployeeException("Failed to delete index " + index, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            logger.debug("Index {} deleted successfully", index);
        } catch (IOException e) {
            logger.error("Exception while deleting index {}: {}", index, e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_DELETE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public List<AttendanceEntity> getAttendanceByMonthAndYear(String companyName, String employeeId, String month, String year) throws EmployeeException {
        logger.debug("Getting attendance for employee {} for month {} and year {}", employeeId, month, year);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.ATTENDANCE)));
        if (employeeId != null)
            boolQueryBuilder = boolQueryBuilder.filter(q -> q.matchPhrase(t -> t.field(Constants.EMPLOYEE_ID).query(employeeId)));
        if (month != null) {
            boolQueryBuilder = boolQueryBuilder.filter(q -> q.matchPhrase(t -> t.field(Constants.MONTH).query(month)));
        }
        if (year != null) {
            boolQueryBuilder = boolQueryBuilder.filter(q -> q.matchPhrase(t -> t.field(Constants.YEAR).query(year)));
        }
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<AttendanceEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build().toQuery()), AttendanceEntity.class);
        } catch (IOException e) {
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<AttendanceEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of attendance hits for employee {}: {}", employeeId, hits.size());

        List<AttendanceEntity> attendanceEntities = new ArrayList<>();

        for (Hit<AttendanceEntity> hit : hits) {
            attendanceEntities.add(hit.source());
        }
        return attendanceEntities;
    }

    public List<AttendanceEntity> getAttendanceByYear(String companyName, String employeeId, String year) throws EmployeeException {
        logger.debug("Getting attendance for employee {} for month {} and year {}", employeeId, year);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.ATTENDANCE)));
        if (year != null) {
            boolQueryBuilder = boolQueryBuilder.filter(q -> q.matchPhrase(t -> t.field(Constants.YEAR).query(year)));
        }
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<AttendanceEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build().toQuery()), AttendanceEntity.class);
        } catch (IOException e) {
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<AttendanceEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of attendance hits for employee {}: {}", employeeId, hits.size());

        List<AttendanceEntity> attendanceEntities = new ArrayList<>();

        for (Hit<AttendanceEntity> hit : hits) {
            attendanceEntities.add(hit.source());
        }
        return attendanceEntities;
    }

    public List<PayslipEntity> getAllPayslips(String companyName, String month, String year) throws EmployeeException {
        logger.debug("Getting payslips for  for month {} and year {}", month, year);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.PAYSLIP)))
                .filter(q -> q.matchPhrase(t -> t.field(Constants.YEAR).query(year)));
        if (month != null) {
            boolQueryBuilder = boolQueryBuilder.filter(q -> q.matchPhrase(t -> t.field(Constants.MONTH).query(month)));
        }

        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<PayslipEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build().toQuery()), PayslipEntity.class);
        } catch (IOException e) {
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<PayslipEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of attendance hits for  {}: {}", hits.size());

        List<PayslipEntity> payslipEntities = new ArrayList<>();

        for (Hit<PayslipEntity> hit : hits) {
            payslipEntities.add(hit.source());
        }
        return payslipEntities;
    }

    public SalaryConfigurationEntity getSalaryStructureById(String resourceId, String type, String index) throws IOException {
        logger.debug("Getting attendence by Id {} of index {}", resourceId, index);
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<SalaryConfigurationEntity> searchResponse = esClient.get(getRequest, SalaryConfigurationEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public List<SalaryConfigurationEntity> getSalaryStructureByCompanyDate(String companyName) throws EmployeeException {
        logger.debug("Getting the Resource by name {} ", companyName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder =
                boolQueryBuilder.filter(q -> q.term(t -> t.field(Constants.TYPE).value(FieldValue.of(Constants.SALARY_STRUCTURE))));

        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<SalaryConfigurationEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), SalaryConfigurationEntity.class);
        } catch (IOException e) {
            e.getStackTrace();
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<SalaryConfigurationEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<SalaryConfigurationEntity> salaryConfigurationEntities = new ArrayList<>();
        if (hits.size() > 0) {
            for (Hit<SalaryConfigurationEntity> hit : hits) {
                salaryConfigurationEntities.add(hit.source());
            }
        }
        return salaryConfigurationEntities;
    }

    public List<EmployeeSalaryEntity> getEmployeeSalaries(String companyName, String employeeId) throws EmployeeException {

        logger.debug("Getting employees for salary details {}", companyName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.SALARY)));
        if (employeeId != null) {
            boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.EMPLOYEE_ID).query(employeeId)));
        }
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<EmployeeSalaryEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            // Adjust the type or field according to your index structure
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build().toQuery()), EmployeeSalaryEntity.class);
        } catch (IOException e) {
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<EmployeeSalaryEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of employee hits for company is {}: {}", companyName, hits.size());

        List<EmployeeSalaryEntity> salaryEntities = new ArrayList<>();
        for (Hit<EmployeeSalaryEntity> hit : hits) {
            salaryEntities.add(hit.source());
        }

        return salaryEntities;
    }

    public EmployeeSalaryEntity getEmployeeSalaryById(String resourceId, String type, String index) throws IOException {
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<EmployeeSalaryEntity> searchResponse = esClient.get(getRequest, EmployeeSalaryEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public TemplateEntity getTemplateById(String resourceId, String type, String index) throws IOException {
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<TemplateEntity> searchResponse = esClient.get(getRequest, TemplateEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public RelievingEntity getRelievingByEmployeeId(String employeeId, String type, String companyName) throws IOException, EmployeeException {

        logger.debug("Getting employee for salary details {}", companyName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.RELIEVING)))
                .filter(q -> q.matchPhrase(t -> t.field(Constants.EMPLOYEE_ID).query(employeeId)));
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<RelievingEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            // Set size to 1 to get a single entity
            searchResponse = esClient.search(t -> t.index(index).size(1)
                    .query(finalBoolQueryBuilder.build().toQuery()), RelievingEntity.class);
        } catch (IOException e) {
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<RelievingEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of employee hits for company is {}: {}", companyName, hits.size());

        // Return the first hit if available, otherwise return null or throw an exception
        if (!hits.isEmpty()) {
            return hits.get(0).source();
        } else {
            logger.warn("No relieving entity found for employeeId {}", employeeId);
            return null; // or throw a custom exception
        }
    }

    public List<RelievingEntity> getEmployeeRelieving(String companyName, Object o) throws EmployeeException {
        logger.debug("Getting the Resource by id {} ", companyName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder =
                boolQueryBuilder.filter(q -> q.term(t -> t.field(Constants.TYPE).value(FieldValue.of(Constants.RELIEVING))));

        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<RelievingEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), RelievingEntity.class);
        } catch (IOException e) {
            e.getStackTrace();
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<RelievingEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<RelievingEntity> relievingEntities = new ArrayList<>();
        if (hits.size() > 0) {
            for (Hit<RelievingEntity> hit : hits) {
                relievingEntities.add(hit.source());
            }
        }
        return relievingEntities;

    }

    public RelievingEntity getRelievingById(String resourceId, String type, String index) throws IOException {
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<RelievingEntity> searchResponse = esClient.get(getRequest, RelievingEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public void partialUpdate(String employeeId, Map<String, Object> partialData, String index) throws IOException {
        try {
            // Create an UpdateRequest using the builder pattern
            UpdateRequest updateRequest = new UpdateRequest.Builder()
                    .index(index)                   // The index where the document is stored
                    .id(employeeId)                  // Document ID
                    .doc(partialData)                // The fields to update
                    .docAsUpsert(false)              // Only update if the document exists
                    .retryOnConflict(3)              // Retry in case of conflicts
                    .build();                        // Build the request
            // Execute the update request
            UpdateResponse response = esClient.update(updateRequest, EmployeeEntity.class);
            // Optionally, log the response result or handle it
            logger.info("Update successful, status: " + response.result());
        } catch (IOException e) {
            // Handle errors and throw as a specific exception
            logger.error("Error occurred while updatingstatus: " + e.getMessage());
            throw new IOException("Error updating employee status in OpenSearch", e);
        }
    }

    public BankEntity getBankById(String index, String type, String resourceId) throws IOException {
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<BankEntity> searchResponse = esClient.get(getRequest, BankEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public BackgroundEntity getBackgroundById(String index, String type, String resourceId) throws IOException {
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<BackgroundEntity> searchResponse = esClient.get(getRequest, BackgroundEntity.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }


    public List<BankEntity> getBankDetailsOfCompany(String index) throws EmployeeException{
        logger.debug("Getting the Resource by id : {}", index);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder =
                boolQueryBuilder.filter(q -> q.term(t -> t.field(Constants.TYPE).value(FieldValue.of(Constants.BANK))));

        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<BankEntity> searchResponse = null;
        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), BankEntity.class);
        } catch (IOException e) {
            e.getStackTrace();
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<BankEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<BankEntity> departmentEntities = new ArrayList<>();
        if (hits.size() > 0) {
            for (Hit<BankEntity> hit : hits) {
                departmentEntities.add(hit.source());
            }
        }
        return departmentEntities;

    }
    public List<BackgroundEntity> getBackGroundDetailsOfCompany(String index) throws EmployeeException{
        logger.debug("Getting the Resource by id : {}", index);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder =
                boolQueryBuilder.filter(q -> q.term(t -> t.field(Constants.TYPE).value(FieldValue.of(Constants.BACKGROUND))));

        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<BackgroundEntity> searchResponse = null;
        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), BackgroundEntity.class);
        } catch (IOException e) {
            e.getStackTrace();
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<BackgroundEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<BackgroundEntity> backgroundEntities = new ArrayList<>();
        if (hits.size() > 0) {
            for (Hit<BackgroundEntity> hit : hits) {
                backgroundEntities.add(hit.source());
            }
        }
        return backgroundEntities;

    }

    public List<BackgroundEntity> getBackGroundDetailsOfEmployeeId(String companyName,String employeeId) throws EmployeeException{
        logger.debug("Getting employees for salary details {}", companyName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.BACKGROUND)))
                .filter(q -> q.matchPhrase(t -> t.field(Constants.EMPLOYEE_ID).query(employeeId)));
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<BackgroundEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            // Adjust the type or field according to your index structure
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build().toQuery()), BackgroundEntity.class);
        } catch (IOException e) {
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<BackgroundEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of employee hits for company is {}: {}", companyName, hits.size());

        List<BackgroundEntity> salaryEntities = new ArrayList<>();
        for (Hit<BackgroundEntity> hit : hits) {
            salaryEntities.add(hit.source());
        }

        return salaryEntities;
    }

    public AttendanceEntity getEmployeeAttendance(String employeeId, String month, String year, String index) {
        SearchResponse<AttendanceEntity> searchResponse = null;
        try {
            BoolQuery boolQuery = BoolQuery.of(b -> b
                    .filter(f -> f.matchPhrase(m -> m.field(Constants.EMPLOYEE_ID).query(employeeId)))
                    .filter(f -> f.matchPhrase(m -> m.field(Constants.MONTH).query(month)))
                    .filter(f -> f.matchPhrase(m -> m.field(Constants.YEAR).query(year))))
                    ;
            SearchRequest searchRequest = SearchRequest.of(s -> s
                    .index(index)  // Specify the index
                    .query(Query.of(q -> q.bool(boolQuery)))
                    .size(1));
            searchResponse = esClient.search(searchRequest, AttendanceEntity.class);

        } catch (IOException e) {
            logger.error("Unable to fetch employee attendance by id: {} ", employeeId, e);
        }
        List<Hit<AttendanceEntity>> hits = searchResponse.hits().hits();
        if (hits != null && !hits.isEmpty()) {
            return hits.get(0).source();
        }
        return null;
    }
}