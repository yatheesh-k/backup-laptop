package com.ems.taxConsultant.dao;

import com.ems.taxConsultant.controller.filter.Filter;
import com.ems.taxConsultant.exception.TaxConsultantException;
import com.ems.taxConsultant.persistance.model.Entity;

import java.util.Collection;
import java.util.Optional;

/**
 * @author Susmitha
 * @param <T>
 */

public interface Dao<T extends Entity> {

    Optional<T> get(String id, String companyName) throws TaxConsultantException;

    Collection<T> search(Collection<Filter> filters, String companyName) throws TaxConsultantException;

    Collection<T> getAll(String companyName) throws TaxConsultantException;

    T save(T t, String companyName, String ... params) throws TaxConsultantException;

    T update(T t, String companyName,  String ... params) throws TaxConsultantException;

    void delete(String id, String companyName) throws TaxConsultantException;

    Class<T> getEntityClass();

}
