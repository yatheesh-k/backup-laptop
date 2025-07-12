package com.ems.accountant.repository;


import com.ems.accountant.controller.filter.Filter;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.persistance.model.IDEntity;
import java.util.Collection;
import java.util.Optional;

public interface Repository {

    <T extends IDEntity> Optional<T> get(String id, Class<T> documentClass, String indexName) throws AccountantException;

    <T extends IDEntity> Collection<T> search(Collection<Filter> filters, Class<T> documentClass, String indexName) throws AccountantException;

    <T extends IDEntity> Collection<T> getAll(Class<T> documentClass, String indexName) throws AccountantException;

    <T extends IDEntity> T save(T entity, String indexName) throws AccountantException;

    <T extends IDEntity> T update(T entity, String indexName) throws AccountantException;

    <T extends IDEntity> void delete(String id,  Class<T> documentClass, String indexName) throws AccountantException;
}
