package com.ems.taxConsultant.dao;

import com.ems.taxConsultant.controller.filter.Filter;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.persistance.model.Entity;

import java.util.Collection;
import java.util.Optional;

/**
 * @author Susmitha
 * @param <T>
 */

public interface Dao<T extends Entity> {

    Optional<T> get(String id, String companyName) throws AccountantException;

    Collection<T> search(Collection<Filter> filters, String companyName) throws AccountantException;

    Collection<T> getAll(String companyName) throws AccountantException;

    T save(T t, String companyName, String ... params) throws AccountantException;

    T update(T t, String companyName,  String ... params) throws AccountantException;

    void delete(String id, String companyName) throws  AccountantException;

    Class<T> getEntityClass();

}
