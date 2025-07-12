package com.ems.accountant.persistance;

import com.ems.accountant.persistance.model.IDTypeEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@SuperBuilder
@NoArgsConstructor
public abstract class AbstractEntity implements IDTypeEntity {

    @JsonIgnore public static final String ID_PROPERTY = "id";
    @JsonIgnore public static final String TYPE_PROPERTY = "type";

    @JsonProperty(ID_PROPERTY)
    private String id;

    @JsonProperty(TYPE_PROPERTY)
    private String type;

}
