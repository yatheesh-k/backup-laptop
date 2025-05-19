package com.invoice.opensearch;

import com.invoice.exception.InvoiceErrorMessageHandler;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.model.BankEntity;
import com.invoice.model.CompanyEntity;
import com.invoice.model.Entity;
import com.invoice.model.InvoiceModel;
import com.invoice.util.Constants;
import com.invoice.util.InvoiceUtils;
import com.invoice.util.ResourceIdUtils;
import org.opensearch.client.opensearch._types.FieldValue;
import org.opensearch.client.opensearch._types.OpenSearchException;
import org.opensearch.client.opensearch._types.SortOrder;
import org.opensearch.client.opensearch._types.query_dsl.BoolQuery;
import org.opensearch.client.opensearch.core.search.Hit;
import org.opensearch.client.opensearch.core.SearchRequest;
import org.opensearch.client.opensearch.core.SearchResponse;
import org.opensearch.client.opensearch.OpenSearchClient;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.opensearch.client.opensearch.core.*;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;


@Component
public class OpenSearchOperations {

    private static final Integer SIZE_ELASTIC_SEARCH_MAX_VAL = 9999;
    Logger logger = LoggerFactory.getLogger(OpenSearchOperations.class);

    @Autowired
    private OpenSearchClient esClient;


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

    public List<BankEntity> getBankDetailsOfCompany(String index) throws  InvoiceException {
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
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
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

    public InvoiceModel getInvoiceById(String index, String type, String resourceId) throws IOException{
        if (type != null) {
            resourceId = type + "_" + resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<InvoiceModel> searchResponse = esClient.get(getRequest, InvoiceModel.class);
        if (searchResponse != null && searchResponse.source() != null) {
            return searchResponse.source();
        }
        return null;
    }

    public Entity saveEntity(Entity entity, String Id, String index) throws InvoiceException {
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
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.UNEXPECTED_ERROR), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return entity;
    }

    public List<InvoiceModel> getInvoicesByCustomerId(String companyId, String customerId, String index) throws InvoiceException {
        logger.debug("Getting invoices for company {} and customer {} from index {}", companyId, customerId, index);

        // Build query
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder()
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.INVOICE)))
                .filter(q -> q.matchPhrase(t -> t.field(Constants.COMPANY_ID).query(companyId)));

        if (StringUtils.hasText(customerId)) {
            boolQueryBuilder.filter(q -> q.matchPhrase(t -> t.field(Constants.CUSTOMER_ID).query(customerId)));
        }

        try {
            // Execute search
            SearchResponse<InvoiceModel> searchResponse = esClient.search(t ->
                            t.index(index)
                                    .size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                                    .query(boolQueryBuilder.build().toQuery()),
                    InvoiceModel.class
            );

            List<Hit<InvoiceModel>> hits = Optional.ofNullable(searchResponse.hits()).map(h -> h.hits()).orElse(Collections.emptyList());
            logger.info("Number of invoice hits for company {} and customer {}: {}", companyId, customerId, hits.size());

            return hits.stream()
                    .map(Hit::source)
                    .filter(Objects::nonNull)  // Ensure no null values
                    .collect(Collectors.toList());

        } catch (IOException e) {
            logger.error("Error fetching invoices for company {} and customer {}: ", companyId, customerId, e);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    public List<InvoiceModel> getInvoicesByCompanyId(String companyId, String index) throws InvoiceException {
        logger.debug("Getting invoices for company {} from index {}", companyId, index);

        // Build query
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder()
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.INVOICE)))
                .filter(q -> q.matchPhrase(t -> t.field(Constants.COMPANY_ID).query(companyId)));

        try {
            // Execute search
            SearchResponse<InvoiceModel> searchResponse = esClient.search(t ->
                            t.index(index)
                                    .size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                                    .query(boolQueryBuilder.build().toQuery()),
                    InvoiceModel.class
            );

            List<Hit<InvoiceModel>> hits = Optional.ofNullable(searchResponse.hits()).map(h -> h.hits()).orElse(Collections.emptyList());
            logger.info("Number of invoice hits for company {}: {}", companyId, hits.size());

            return hits.stream()
                    .map(Hit::source)
                    .filter(Objects::nonNull)  // Ensure no null values
                    .collect(Collectors.toList());

        } catch (IOException e) {
            logger.error("Error fetching invoices for company {}: ", companyId, e);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public String findLastInvoiceNumber(String companyId, String shortName) throws InvoiceException {
        String indexName = ResourceIdUtils.generateCompanyIndex(shortName);

        try {
            // ✅ Check if the index exists in OpenSearch
            boolean indexExists = esClient.indices().exists(i -> i.index(indexName)).value();
            if (!indexExists) {
                logger.warn("Index '{}' does not exist. Creating first invoice for the financial year.", indexName);
                return null; // Generate first invoice dynamically
            }

            // ✅ Build search query to get the last invoice number
            SearchRequest searchRequest = new SearchRequest.Builder()
                    .index(indexName)
                    .size(1)  // Fetch only the latest invoice
                    .sort(s -> s.field(f -> f.field("invoiceNo.keyword").order(SortOrder.Desc))) // Sort descending
                    .build();

            // ✅ Execute search query
            SearchResponse<InvoiceModel> searchResponse = esClient.search(searchRequest, InvoiceModel.class);
            List<Hit<InvoiceModel>> hits = searchResponse.hits().hits();

            // ✅ Check if the response contains results
            if (!hits.isEmpty() && hits.get(0).source() != null) {
                String lastInvoiceNo = hits.get(0).source().getInvoiceNo();
                logger.info("Last invoice number found: {}", lastInvoiceNo);
                return lastInvoiceNo; // ✅ Return last invoice number found
            } else {
                logger.warn("No invoices found in index '{}'. Generating first invoice number.", indexName);
            }

        } catch (OpenSearchException e) {
            logger.error("OpenSearch error while fetching last invoice for company '{}': {}", companyId, e.getMessage(), e);
            return null; // ✅ Generate first invoice on failure
        } catch (IOException e) {
            logger.error("I/O error while fetching last invoice number for company '{}': {}", companyId, e.getMessage(), e);
            return null; // ✅ Generate first invoice on failure
        }
        // ✅ Return first invoice number if no invoices exist
        return null;
    }
}