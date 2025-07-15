package com.ems.accountant.elasticSearch;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.Result;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.GetResponse;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.exception.ErrorMessageHandler;
import com.ems.accountant.exception.ErrorMessageKey;
import com.ems.accountant.persistance.CompanyEntity;
import com.ems.accountant.persistance.EmployeeEntity;
import com.ems.accountant.persistance.model.Entity;
import com.ems.accountant.utils.Constants;
import com.ems.accountant.utils.ResourceIdUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class OpenSearchOperations {

    private static final Integer SIZE_ELASTIC_SEARCH_MAX_VAL = 9999;
    Logger logger = LoggerFactory.getLogger(OpenSearchOperations.class);

    @Autowired
    private ElasticsearchClient esClient;


    public Entity saveEntity(Entity entity, String Id, String index) throws AccountantException {
        co.elastic.clients.elasticsearch.core.IndexResponse indexResponse = null;
        try {
            synchronized (entity){
                indexResponse = esClient.index(builder -> builder.index(index)
                        .id(Id)
                        .document(entity));
            }
            logger.debug("Saved the entity. Response {}.Entity:{}", indexResponse, entity);
        } catch (IOException e) {
            logger.error("Exception ", e);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return entity;
    }


    public String deleteEntity(String id, String index) throws AccountantException {
        logger.debug("Deleting the Entity {}", id);
        co.elastic.clients.elasticsearch.core.DeleteResponse deleteResponse = null;
        try {
            synchronized (id){
                deleteResponse = esClient.delete(b -> b.index(index)
                        .id(id));

            }
            if(deleteResponse.result() == Result.NotFound) {
                throw new AccountantException(String.format("Entity Id not found",id), HttpStatus.NOT_FOUND);
            }
            logger.debug("Deleted the Entity {}, Delete response {}", id, deleteResponse);
        } catch (IOException e) {
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.EXCEPTION_OCCURRED), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return id;
    }

    public Object getById(String resourceId, String type, String index) throws IOException {
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        co.elastic.clients.elasticsearch.core.GetRequest getRequest = new co.elastic.clients.elasticsearch.core.GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<Object> searchResponse = esClient.get(getRequest, Object.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public CompanyEntity getCompanyByCompanyName(String companyName, String index) {
        SearchResponse<CompanyEntity> searchResponse = null;
        try {
            BoolQuery boolQuery = BoolQuery.of(b -> b
                    .filter(f -> f.matchPhrase(m -> m.field(Constants.SHORT_NAME).query(companyName))));
            SearchRequest searchRequest = SearchRequest.of(s -> s
                    .index(index)  // Specify the index
                    .query(Query.of(q -> q.bool(boolQuery)))
                    .size(1));
            searchResponse = esClient.search(searchRequest, CompanyEntity.class);

        } catch (IOException e) {
            logger.error("Unable to fetch company details", e);
        }
        List<Hit<CompanyEntity>> hits = searchResponse.hits().hits();
        if (hits != null && !hits.isEmpty()) {
            return hits.get(0).source();
        }
        return null;
    }

    public List<EmployeeEntity> getCompanyEmployees(String companyName) throws AccountantException {
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
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<EmployeeEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of employee hits for company {}: {}", companyName, hits.size());

        List<EmployeeEntity> employeeEntities = new ArrayList<>();
        for (Hit<EmployeeEntity> hit : hits) {
            employeeEntities.add(hit.source());
        }

        return employeeEntities;
    }

    public EmployeeEntity getEmployeeByUanNo(String shortName, String uanNo) {
        logger.debug("Getting employee by UAN No: {} for company {}", uanNo, shortName);
        BoolQuery boolQuery = BoolQuery.of(b -> b
                .filter(f -> f.matchPhrase(m -> m.field(Constants.UAN_NUMBER).query(uanNo))));
        SearchRequest searchRequest = SearchRequest.of(s -> s
                .index(ResourceIdUtils.generateCompanyIndex(shortName))  // Specify the index
                .query(Query.of(q -> q.bool(boolQuery)))
                .size(1));

        try {
            SearchResponse<EmployeeEntity> searchResponse = esClient.search(searchRequest, EmployeeEntity.class);
            List<Hit<EmployeeEntity>> hits = searchResponse.hits().hits();
            if (hits != null && !hits.isEmpty()) {
                return hits.get(0).source();
            }
        } catch (IOException e) {
            logger.error("Unable to fetch employee details", e);
        }
        return null;
    }
}
