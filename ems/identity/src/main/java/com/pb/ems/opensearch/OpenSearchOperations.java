package com.pb.ems.opensearch;

import com.pb.ems.exception.ErrorMessageHandler;
import com.pb.ems.exception.IdentityErrorMessageKey;
import com.pb.ems.exception.IdentityException;
import com.pb.ems.model.CompanyEntity;
import com.pb.ems.model.DepartmentEntity;
import com.pb.ems.model.EmployeeEntity;
import com.pb.ems.persistance.Entity;
import com.pb.ems.util.Constants;
import com.pb.ems.util.ResourceUtils;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.Result;
import org.opensearch.client.opensearch._types.query_dsl.BoolQuery;
import org.opensearch.client.opensearch.core.*;
import org.opensearch.client.opensearch.core.search.Hit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
public class OpenSearchOperations {

    private static final Integer SIZE_ELASTIC_SEARCH_MAX_VAL = 9999;
    Logger logger = LoggerFactory.getLogger(OpenSearchOperations.class);

    @Autowired
    private OpenSearchClient esClient;

    @Autowired
    private ResourceUtils resourceIdUtils;


    public Entity saveEntity(Entity entity, String Id, String index) throws IdentityException {
        IndexResponse indexResponse = null;
        try {
            synchronized (entity){
                indexResponse = esClient.index(builder -> builder.index(index)
                                        .id(Id)
                                        .document(entity));
            }
            logger.debug("Saved the entity. Response {}.Entity:{}",indexResponse, entity);
        } catch (IOException e) {
            logger.error("Exception ",e);
            throw new IdentityException(String.format("Unable to save the entity {} ",entity.toString()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return entity;
    }

    public String deleteEntity(String Id, String index) throws IdentityException {
        logger.debug("Deleting the Entity {}", Id);
        DeleteResponse deleteResponse = null;
        try {
            synchronized (Id){
                deleteResponse = esClient.delete(b -> b.index(index)
                                      .id(Id));

            }
            if(deleteResponse.result() == Result.NotFound) {
                throw new IdentityException(String.format("Entity Id not found",Id), HttpStatus.NOT_FOUND);
            }
            logger.debug("Deleted the Entity {}, Delete response {}", Id, deleteResponse);
        } catch (IOException e) {
            e.printStackTrace();
            throw new IdentityException(String.format("Exception while deleting Entity {} .",Id), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return Id;
    }
    public EmployeeEntity getEMSAdminById(String user) throws IOException {
        GetRequest getRequest = new GetRequest.Builder().id(Constants.EMS_ADMIN+"_"+user)
                .index(Constants.INDEX_EMS).build();
        GetResponse<EmployeeEntity> searchResponse = esClient.get(getRequest, EmployeeEntity.class);
        if(searchResponse != null && searchResponse.source() != null){
            return searchResponse.source();
        }
        return null;
    }
    public EmployeeEntity getEmployeeById(String user, String company) throws IOException {
        String index = Constants.INDEX_EMS+"_"+company;
        String username = resourceIdUtils.generateCompanyResourceId(user);
        GetRequest getRequest = new GetRequest.Builder().id(Constants.EMPLOYEE+"-"+username)
                .index(index).build();
        GetResponse<EmployeeEntity> searchResponse = esClient.get(getRequest, EmployeeEntity.class);
        if(searchResponse != null && searchResponse.source() != null){
            EmployeeEntity employee = searchResponse.source();
            employee.setId(searchResponse.id()); // Set the _id from the response
            return employee;
        }
        return null;
    }

    public CompanyEntity getCompanyById(String user) throws IOException {
        String index = Constants.INDEX_EMS;
        String username = resourceIdUtils.generateCompanyResourceId(user);
        GetRequest getRequest = new GetRequest.Builder().id(Constants.COMPANY+"-"+username)
                .index(index).build();
        GetResponse<CompanyEntity> searchResponse = esClient.get(getRequest, CompanyEntity.class);
        if(searchResponse != null && searchResponse.source() != null){
            CompanyEntity employee = searchResponse.source();
            employee.setId(searchResponse.id()); // Set the _id from the response
            return employee;
        }
        return null;
    }

    public void saveOtpToUser(EmployeeEntity user, Long otp, String company) throws IdentityException {
        user.setOtp(otp);
        user.setExpiryTime(Instant.now().plus(60, ChronoUnit.SECONDS).getEpochSecond()); // Set expiry time, for example, 1 minutes from now
        String index =  Constants.INDEX_EMS +"_"+ company; // Use dynamic index
        String id = Constants.EMPLOYEE+"-"+resourceIdUtils.generateCompanyResourceId(user.getEmailId());
        saveEntity(user,id , index);  // Ensure this method saves the user entity to the correct index
        logger.info("The otp and expiry time saved into the db for index: " + index);
    }//save the entity


    public SearchResponse<Object> searchByQuery(BoolQuery.Builder query, String index, Class targetClass) throws IdentityException {
        SearchResponse searchResponse = null;
        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(query.build()._toQuery()), targetClass.getClass());
        } catch (IOException e) {
            e.printStackTrace();
            throw new IdentityException("Search operation Failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return searchResponse;
    }

    public void updateEmployee(EmployeeEntity employee,String company) throws IOException {
        String index = Constants.INDEX_EMS + "_" + company;
        String employeeId = employee.getId();

        IndexRequest<EmployeeEntity> request = new IndexRequest.Builder<EmployeeEntity>()
                .index(index)
                .id(employeeId)
                .document(employee)
                .build();

        IndexResponse response = esClient.index(request);
        if (response.result() != Result.Updated && response.result() != Result.Created) {
            throw new IOException("Failed to update employee: " + employeeId);
        }
    }

    public Object getById(String resourceId, String type, String index) throws IOException {
        if(type != null) {
            resourceId = type+"_"+resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<Object> searchResponse = esClient.get(getRequest, Object.class);
        if(searchResponse != null && searchResponse.source() != null){
            return searchResponse.source();
        }
        return null;
    }

    public void updateCompany(CompanyEntity company) throws IOException {
        String index = Constants.INDEX_EMS;
        String comapanyId = company.getId();

        IndexRequest<CompanyEntity> request = new IndexRequest.Builder<CompanyEntity>()
                .index(index)
                .id(comapanyId)
                .document(company)
                .build();

        IndexResponse response = esClient.index(request);
        if (response.result() != Result.Updated && response.result() != Result.Created) {
            throw new IOException("Failed to update employee: " + comapanyId);
        }
    }

    public List<CompanyEntity> getCompanyByData(String companyName, String type, String shortName) throws IdentityException {
        logger.debug("Getting the Resource by name {}, {},{}", companyName, type, shortName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(type)));
        if(companyName != null) {
            boolQueryBuilder = boolQueryBuilder
                    .filter(q -> q.matchPhrase(t -> t.field(Constants.COMPANY_NAME).query(companyName)));
        }
        if(shortName != null) {
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
            throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<CompanyEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<CompanyEntity> subscriberEntities = new ArrayList<>();
        if(hits.size() > 0) {
            for(Hit<CompanyEntity> hit : hits){
                subscriberEntities.add(hit.source());
            }
        }
        return subscriberEntities;
    }
    public DepartmentEntity getDepartmentById(String resourceId, String type, String index) throws IOException {
        GetRequest getRequest = new GetRequest.Builder()
                .id(resourceId)
                .index(index)
                .build();

        GetResponse<DepartmentEntity> searchResponse = esClient.get(getRequest, DepartmentEntity.class);
        if(searchResponse != null && searchResponse.source() != null){
            if (searchResponse.source().getType().equals(Constants.DEPARTMENT)) {
                return searchResponse.source();
            }
        }
        return null;
    }
}
