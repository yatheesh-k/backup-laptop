package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.UserDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.CompanyEntity;
import com.pb.employee.persistance.model.DepartmentEntity;
import com.pb.employee.persistance.model.EmployeeEntity;
import com.pb.employee.persistance.model.UserEntity;
import com.pb.employee.request.UpdateRolesRequest;
import com.pb.employee.request.UserRequest;
import com.pb.employee.request.UserUpdateRequest;
import com.pb.employee.response.EmployeeResponse;
import com.pb.employee.response.UserResponse;
import com.pb.employee.service.EmployeeService;
import com.pb.employee.service.UserService;
import com.pb.employee.util.Constants;
import com.pb.employee.util.EmailUtils;
import com.pb.employee.util.PasswordUtils;
import com.pb.employee.util.ResourceIdUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private UserDao dao;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmailUtils emailUtils;

    @Autowired
    private EmployeeService employeeService;

    @Override
    public ResponseEntity<?> registerUser(String companyName, UserRequest userRequest, HttpServletRequest request) throws EmployeeException, IOException {
        String resourceId = null;
        String index = null;
        String defaultPassword ;
        String password ;
        EmployeeEntity employee ;

        try {
            resourceId = ResourceIdUtils.generateUserResourceId(userRequest.getEmailId());
            index = ResourceIdUtils.generateCompanyIndex(companyName);

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            if (companyEntity.getEmailId().equals(userRequest.getEmailId())){
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMAIL_ALREADY_EXIST), HttpStatus.BAD_REQUEST);
            }
            if(userRequest.getEmployeeId() != null && !userRequest.getEmployeeId().isEmpty()){
              employee = openSearchOperations.getEmployeeById(userRequest.getEmployeeId(),null,index);
                if (employee == null){
                    log.error("Exception while fetching the employee details");
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.CONFLICT);
                }
                password =employee.getPassword();
                defaultPassword = new String(Base64.getDecoder().decode(employee.getPassword()), StandardCharsets.UTF_8);

            }else {
                employee = openSearchOperations.getEmployeeByEmailId(userRequest.getEmailId(), companyName);
                if (employee != null){
                userRequest.setEmployeeId(employee.getId());
                password =employee.getPassword();
                defaultPassword = new String(Base64.getDecoder().decode(employee.getPassword()), StandardCharsets.UTF_8);

                }else {
                    defaultPassword = PasswordUtils.generateStrongPassword();
                    password = Base64.getEncoder().encodeToString(defaultPassword.getBytes());
                }
            }

            Object existingEntity = openSearchOperations.getById(resourceId, null, index);
            if (existingEntity != null) {
                log.error("User already exists in the company {}", companyName);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.USER_ID_ALREADY_EXISTS)), HttpStatus.CONFLICT);
            }
            DepartmentEntity departmentEntity = null;
            if (userRequest.getDepartment() != null && !userRequest.getDepartment().isEmpty()) {
                 departmentEntity = openSearchOperations.getDepartmentById(userRequest.getDepartment(), null, index);
                if (departmentEntity == null) {
                    log.error("Department not found: {}", userRequest.getDepartment());
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT)))),
                            HttpStatus.CONFLICT);
                }
            }

            // Convert UserRequest to EmployeeEntity and then override other fields
            UserEntity userEntity = objectMapper.convertValue(userRequest, UserEntity.class);
            userEntity.setId(resourceId);
            userEntity.setPassword(password);
            userEntity.setType(Constants.USER);
            userEntity.setCompanyId(companyEntity.getId());
            // Handle optional department
            if (departmentEntity != null && departmentEntity.getId() != null) {
                userEntity.setDepartment(departmentEntity.getId());
            }

            dao.save(userEntity, companyName);

        } catch (EmployeeException employeeException) {
            throw employeeException;
        } catch (Exception e) {
            log.error("Error during user registration: {}", e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_USER), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        String finalDefaultPassword = defaultPassword;
        CompletableFuture.runAsync(() -> {
            try {
                String companyUrl = EmailUtils.getBaseUrl(request)+companyName+Constants.SLASH+Constants.LOGIN ;
                log.info("The company url : "+companyUrl);// Example URL
                emailUtils.sendRegistrationEmail(userRequest.getEmailId(), companyUrl,Constants.USER, finalDefaultPassword);
            } catch (Exception e) {
                log.error("Error sending email to employee: {}", userRequest.getEmailId());
                throw new RuntimeException(e);
            }
        });

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public Collection<UserResponse> getUserById(String companyName, String Id) throws EmployeeException {
        try {
            String index = ResourceIdUtils.generateCompanyIndex(companyName);

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Exception while fetching the company details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<UserEntity> users = dao.getUsers(companyName, Id, companyEntity.getId(), null);
            List<UserResponse> userResponses = new ArrayList<>();
            for (UserEntity user : users) {
                UserResponse userResponse = objectMapper.convertValue(user, UserResponse.class);
                if (user.getDepartment() != null) {
                    DepartmentEntity department = openSearchOperations.getDepartmentById(user.getDepartment(), null, index);
                    if (department != null) {
                        userResponse.setDepartmentName(department.getName());
                    }
                }
                if (user.getEmployeeId() != null && !user.getEmployeeId().isEmpty()) {
                    EmployeeResponse employee = employeeService.getEmployeeById(companyName, user.getEmployeeId(), null);
                    if (employee != null) {
                        userResponse.setEmployee(employee);
                    }
                }
                userResponses.add(userResponse);
            }

            return userResponses;

        } catch (EmployeeException employeeException) {
            log.error("Error retrieving user: {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Error retrieving user for company {}: {}", companyName, exception.getMessage());
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_USER), companyName),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Override
    public ResponseEntity<?> updateUser(String companyName, String Id, UserUpdateRequest userUpdateRequest) throws EmployeeException {
        String index = null;
        DepartmentEntity departmentEntity = null;
        try {
            index = ResourceIdUtils.generateCompanyIndex(companyName);

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<UserEntity> existingUsers = dao.getUsers(companyName, Id, companyEntity.getId(), null);
            if (existingUsers == null) {
                log.error("User not found in this company {}", companyName);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.USER_NOT_FOUND),companyName), HttpStatus.NOT_FOUND);
            }

            UserEntity existingUser = dao.get(existingUsers.stream().findFirst().get().getId(), companyName).get();

            if (userUpdateRequest.getDepartment() != null) {
                departmentEntity = openSearchOperations.getDepartmentById(userUpdateRequest.getDepartment(), null, index);
                if (departmentEntity == null) {
                    log.error("Department not found: {}", userUpdateRequest.getDepartment());
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT   )))),
                            HttpStatus.CONFLICT);
                }
            }

            if (userUpdateRequest.getUserType().equals(existingUser.getUserType()) &&
                    userUpdateRequest.getFirstName().equals(existingUser.getFirstName()) &&
                    userUpdateRequest.getLastName().equals(existingUser.getLastName()) &&
                    Objects.equals(userUpdateRequest.getDepartment(), existingUser.getDepartment())) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_CHANGES_DONE), HttpStatus.BAD_REQUEST);
            }

            UserEntity updatedData = objectMapper.convertValue(userUpdateRequest, UserEntity.class);
            BeanUtils.copyProperties(updatedData, existingUser, getNullPropertyNames(updatedData));
            dao.save(existingUser, companyName);

            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);

        } catch (EmployeeException employeeException) {
            log.error("Error during user update: {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Error during user update: {}", exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_USER), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteUser(String companyName, String Id) throws EmployeeException {
        try {
            String index = ResourceIdUtils.generateCompanyIndex(companyName);
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<UserResponse> existingUser = this.getUserById(companyName, Id);

            if (existingUser == null) {
                log.error("User not found in this company {}", index);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.USER_NOT_FOUND)), HttpStatus.NOT_FOUND);
            }
             dao.delete(Id, companyName);
        } catch (EmployeeException employeeException) {
            log.error("Employee not found for company  {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Error deleting user for company {}", exception.getMessage());
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_USER), companyName),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    @Override
    public ResponseEntity<?> updateUserRoles(String companyName, String id, UpdateRolesRequest updatePayload) throws EmployeeException {
        String index;
        try {
            index = ResourceIdUtils.generateCompanyIndex(companyName);
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<UserEntity> existingUsers = dao.getUsers(companyName, id, companyEntity.getId(), null);
            if (existingUsers == null) {
                log.error("User not found in this company {}", companyName);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.USER_NOT_FOUND),companyName), HttpStatus.NOT_FOUND);
            }

            UserEntity existingUser = dao.get(existingUsers.stream().findFirst().get().getId(), companyName).get();
            if (updatePayload.getRoles().equals(existingUser.getRoles())) {
                log.error("No changes made to user roles for user {}", existingUser.getId());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_CHANGES_DONE), HttpStatus.BAD_REQUEST);
            }
            UserEntity updatedData = objectMapper.convertValue(updatePayload, UserEntity.class);
            BeanUtils.copyProperties(updatedData, existingUser, getNullPropertyNames(updatedData));
            dao.save(existingUser, companyName);

            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);

        } catch (EmployeeException employeeException) {
            log.error("Error during user update: {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Error during user update: {}", exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_USER), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    private String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        Set<String> emptyNames = new HashSet<>();
        for (var pd : src.getPropertyDescriptors()) {
            Object value = src.getPropertyValue(pd.getName());
            if (value == null) {
                emptyNames.add(pd.getName());
            }
        }
        return emptyNames.toArray(new String[0]);
    }
}
