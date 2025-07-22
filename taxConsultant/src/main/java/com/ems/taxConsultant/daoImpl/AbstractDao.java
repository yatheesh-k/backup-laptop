package com.ems.taxConsultant.daoImpl;

import com.ems.taxConsultant.controller.filter.Filter;
import com.ems.taxConsultant.controller.filter.Operator;
import com.ems.taxConsultant.dao.Dao;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.model.EntityManager;
import com.ems.taxConsultant.persistance.model.IDEntity;
import com.ems.taxConsultant.repository.Repository;

import java.util.Collection;
import java.util.Optional;

public abstract class AbstractDao<T extends IDEntity> implements Dao<T> {

    private final Repository repository;

    public AbstractDao(Repository repository) {
        this.repository = repository;
    }

    public Optional<T> get(String id, String companyName) throws AccountantException {
        return EntityManager.get(id, getEntityClass(), companyName, repository);
    }

    public Collection<T> getAll(String companyName) throws AccountantException {
        return EntityManager.getAll(getEntityClass(),companyName, repository);
    }

    public Collection<T> search(Collection<Filter> filters, String companyName) throws AccountantException {
        Class<T> entityClass = getEntityClass();
        DocumentType documentType = DocumentType.getByType(entityClass);
        if (documentType != null && !hasField(filters, "type")) {
            filters.add(new Filter("type", Operator.EQ, documentType.getType()));
        }
        return EntityManager.search(filters, entityClass,companyName, repository);
    }

    public T save(T entity, String companyName, String... params) throws AccountantException {
        return EntityManager.save(entity,companyName, repository);
    }

    public T update(T entity, String companyName, String... params) throws AccountantException {
        return EntityManager.update(entity,companyName, repository);
    }

    public void delete(String id, String companyName) throws AccountantException {
        EntityManager.delete(id, getEntityClass(), companyName, repository);
    }

    private static boolean hasField(Collection<Filter> filters, String field) {
        return filters.stream().anyMatch(f -> f.getField().equalsIgnoreCase(field));
    }
}
