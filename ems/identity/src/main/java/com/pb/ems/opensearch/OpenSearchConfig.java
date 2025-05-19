package com.pb.ems.opensearch;

import com.pb.ems.model.EmployeeEntity;
import com.pb.ems.persistance.Entity;
import com.pb.ems.util.Constants;
import org.apache.http.HttpHost;
import org.opensearch.client.RestClient;
import org.opensearch.client.json.jackson.JacksonJsonpMapper;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.mapping.KeywordProperty;
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
    logger.debug("Intializing ES");
    // Create the low-level client
    RestClient restClient = RestClient.builder(
            new HttpHost(getEsHost(), Integer.parseInt(getEsPort()))).build();
// Create the transport with a Jackson mapper
    OpenSearchTransport transport = new RestClientTransport(
            restClient, new JacksonJsonpMapper());
    TypeMapping mapping = new TypeMapping.Builder()
            .properties(Constants.RESOURCE_ID, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build())
            .build();
    CreateIndexRequest createIndexRequest = new CreateIndexRequest.Builder()
            .index(Constants.INDEX_EMS)
            .mappings(mapping)
            .build();

    // And create the API client
    OpenSearchClient esClient = new OpenSearchClient(transport);
    try {
      esClient.indices().create(createIndexRequest);
      logger.info("Creating EMS admin user");
      String userName = environment.getProperty(Constants.EMS_USERNAME);
      String password = environment.getProperty(Constants.EMS_PASSWORD);
      Entity entity = new EmployeeEntity().builder().emailId(userName)
              .password(password).
              type(Constants.EMS_ADMIN).build();
      String id = Constants.EMS_ADMIN+"_" + userName;
      esClient.index(builder -> builder.index(Constants.INDEX_EMS)
              .id(id)
              .document(entity));
    } catch (Exception e) {
      logger.warn("Index already exists");
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
