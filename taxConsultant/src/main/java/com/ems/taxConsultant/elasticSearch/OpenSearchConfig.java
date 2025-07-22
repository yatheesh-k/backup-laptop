package com.ems.taxConsultant.elasticSearch;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.mapping.Property;
import co.elastic.clients.elasticsearch._types.mapping.TypeMapping;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import com.ems.taxConsultant.utils.Constants;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
@ConfigurationProperties("es")
public class OpenSearchConfig {

  private static final Logger logger = LoggerFactory.getLogger(OpenSearchConfig.class);

  private String clusterName;
  private String esHost;
  private String esPort;

  public String getClusterName() {
    return clusterName;
  }

  public void setClusterName(String clusterName) {
    this.clusterName = clusterName;
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

  @Bean
  public ElasticsearchClient esClient() {
    logger.debug("Initializing Elasticsearch client");

    RestClient restClient = RestClient.builder(
            new HttpHost(getEsHost(), Integer.parseInt(getEsPort()))
    ).build();

    RestClientTransport transport = new RestClientTransport(
            restClient, new JacksonJsonpMapper()
    );

    ElasticsearchClient client = new ElasticsearchClient(transport);

    try {
      Map<String, Property> allowancesProps = new HashMap<>();
      allowancesProps.put("name", Property.of(p -> p.keyword(k -> k)));
      allowancesProps.put("amount", Property.of(p -> p.text(t -> t)));

      Map<String, Property> deductionsProps = new HashMap<>();
      deductionsProps.put("name", Property.of(p -> p.keyword(k -> k)));
      deductionsProps.put("amount", Property.of(p -> p.text(t -> t)));

      TypeMapping mapping = new TypeMapping.Builder()
              .properties(Constants.RESOURCE_ID, Property.of(p -> p.keyword(k -> k)))
              .properties(Constants.SHORT_NAME, Property.of(p -> p.keyword(k -> k)))
              .properties(Constants.TYPE, Property.of(p -> p.keyword(k -> k)))
              .properties("allowances", Property.of(p -> p.object(o -> o.properties(allowancesProps))))
              .properties("deductions", Property.of(p -> p.object(o -> o.properties(deductionsProps))))
              .build();

      // Create index if not exists
      if (!client.indices().exists(e -> e.index(Constants.INDEX_EMS)).value()) {
        client.indices().create(c -> c.index(Constants.INDEX_EMS).mappings(mapping));
      }
    } catch (Exception e) {
      logger.warn("Failed to create index: {}", e.getMessage());
    }

    return client;
  }
}
