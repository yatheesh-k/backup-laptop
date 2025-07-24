package com.ems.taxConsultant.repository;


import com.ems.taxConsultant.controller.filter.Filter;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.model.IDEntity;
import java.util.Collection;
import java.util.Optional;

public interface Repository {

    <T extends IDEntity> Optional<T> get(String id, Class<T> documentClass, String indexName) throws TaxConsultantException;

    <T extends IDEntity> Collection<T> search(Collection<Filter> filters, Class<T> documentClass, String indexName) throws TaxConsultantException;

    <T extends IDEntity> Collection<T> getAll(Class<T> documentClass, String indexName) throws TaxConsultantException;

    <T extends IDEntity> T save(T entity, String indexName) throws TaxConsultantException;

    <T extends IDEntity> T update(T entity, String indexName) throws TaxConsultantException;

    <T extends IDEntity> void delete(String id,  Class<T> documentClass, String indexName) throws TaxConsultantException;
}
