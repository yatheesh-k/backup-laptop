package com.ems.accountant.model;

import com.ems.accountant.controller.filter.Filter;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.model.IDEntity;
import com.ems.accountant.repository.Repository;


import java.util.Collection;
import java.util.Optional;

/**
 * @author Susmitha
 *
 * EntityManager to perform the CURD operation.
 */
public final class EntityManager {

    public static <T extends IDEntity> Optional<T> get(String id, Class<T> documentClass, String indexName, final Repository repository) throws AccountantException {
        return repository.get(id, documentClass, indexName);
    }

    public static <T extends IDEntity> Collection<T> getAll(Class<T> documentClass,  String companyName, final Repository repository) throws AccountantException {
        return repository.getAll(documentClass, companyName);
    }

    public static <T extends IDEntity> Collection<T> search(Collection<Filter> filters, Class<T> documentClass, String companyName, final Repository repository) throws AccountantException {
        return repository.search(filters, documentClass, companyName);
    }

    public static <T extends IDEntity> T save(T entity,  String companyName, final Repository repository) throws AccountantException {
        return repository.save(entity, companyName);
    }

    public static <T extends IDEntity> T update(T entity,  String companyName,  final Repository repository) throws AccountantException {
        return repository.update(entity, companyName);
    }

    public static <T extends IDEntity> void delete(String id, Class<T> documentClass, String companyName, final Repository repository) throws AccountantException {
        repository.delete(id, documentClass, companyName);
    }
}
