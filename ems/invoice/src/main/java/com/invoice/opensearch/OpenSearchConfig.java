package com.invoice.opensearch;

import com.invoice.util.Constants;
import org.apache.http.HttpHost;
import org.opensearch.client.RestClient;
import org.opensearch.client.json.jackson.JacksonJsonpMapper;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.mapping.KeywordProperty;
import org.opensearch.client.opensearch._types.mapping.ObjectProperty;
import org.opensearch.client.opensearch._types.mapping.Property;
import org.opensearch.client.opensearch._types.mapping.TypeMapping;
import org.opensearch.client.opensearch.indices.CreateIndexRequest;
import org.opensearch.client.transport.OpenSearchTransport;
import org.opensearch.client.transport.rest_client.RestClientTransport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.HashMap;
import java.util.Map;

@Configuration
@ConfigurationProperties("es")
public class OpenSearchConfig {

  @Autowired
  private Environment environment;
  @Autowired
  private OpenSearchOperations openSearchOperations;

  private static Logger logger = LoggerFactory.getLogger(OpenSearchConfig.class);

  private String clusterName;

  private String esHost;

  private String esPort;

  public String getClusterName() {
        return clusterName;
    }

  public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

  @Bean
  public OpenSearchClient esClient() {
    logger.debug("Intializing opensearch");
    // Create the low-level client
    RestClient restClient = RestClient.builder(
            new HttpHost(getEsHost(), Integer.parseInt(getEsPort()))).build();
// Create the transport with a Jackson mapper
    OpenSearchTransport transport = new RestClientTransport(
            restClient, new JacksonJsonpMapper());
    Map<String, Property> allowancesProperties = new HashMap<>();
    allowancesProperties.put("name", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
    allowancesProperties.put("amount", new Property.Builder().text(new org.opensearch.client.opensearch._types.mapping.TextProperty.Builder().build()).build());

    Map<String, Property> deductionsProperties = new HashMap<>();
    deductionsProperties.put("name", new Property.Builder().keyword(new KeywordProperty.Builder().build()).build());
    deductionsProperties.put("amount", new Property.Builder().text(new org.opensearch.client.opensearch._types.mapping.TextProperty.Builder().build()).build());

    TypeMapping mapping = new TypeMapping.Builder()
            .properties(Constants.RESOURCE_ID, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build())
            .properties(Constants.SHORT_NAME, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build())
            .properties(Constants.NAME, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build())
            .properties(Constants.DESIGNATION, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build())
            .properties(Constants.DEPARTMENT, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build())
            .properties("allowances", new Property.Builder()
                    .object(new ObjectProperty.Builder()
                            .properties(allowancesProperties)
                            .build())
                    .build())
            .properties("deductions", new Property.Builder()
                    .object(new ObjectProperty.Builder()
                            .properties(deductionsProperties)
                            .build())
                    .build())
            .build();
    CreateIndexRequest createIndexRequest = new CreateIndexRequest.Builder()
            .index(Constants.INDEX_EMS)
            .mappings(mapping)
            .build();

    // And create the API client
    OpenSearchClient esClient = new OpenSearchClient(transport);
    try {
      esClient.indices().create(createIndexRequest);
    } catch (Exception e) {
      logger.warn("Not able to create index {} " , e.getCause());
    }
    return esClient;
  }

  public String getEsHost() {
    return esHost;
  }

  public void setEsHost(String esHost) {
    this.esHost = esHost;
  }

  public String getEsPort() {
    return esPort;
  }

  public void setEsPort(String esPort) {
    this.esPort = esPort;
  }
}
