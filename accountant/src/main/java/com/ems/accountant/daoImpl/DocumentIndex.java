package com.ems.accountant.daoImpl;

import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

@Getter
public class DocumentIndex {

    private final String name;

    private static final Map<String, DocumentIndex> indexMap = new HashMap<>();

    public DocumentIndex(String name) {
        this.name = name;
        indexMap.put(name, this);
    }

    public static DocumentIndex getByName(String name) {
        return indexMap.get(name);
    }

    public static DocumentIndex getCompanyIndex(String companyName) {
        String shortName = companyName.length() > 16 ? companyName.substring(0, 16).toLowerCase() : companyName.toLowerCase();
        String indexName = "ems_" + shortName;

        if (!indexMap.containsKey(indexName)) {
            new DocumentIndex(indexName);
        }

        return indexMap.get(indexName);
    }

}
