package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.CandidateDao;
import com.pb.employee.dao.UserDao;
import com.pb.employee.daoImpl.UserDaoImpl;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.CandidatePayload.CandidateRequest;
import com.pb.employee.request.CandidatePayload.CandidateResponse;
import com.pb.employee.request.CandidatePayload.CandidateUpdateRequest;
import com.pb.employee.response.UserResponse;
import com.pb.employee.service.CandidateService;
import com.pb.employee.util.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.beans.PropertyDescriptor;
import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Stream;

@Service
@Slf4j
public class CandidateServiceImpl implements CandidateService {

    @Value("${file.upload.path}")
    private  String folderPath;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CandidateDao candidateDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private EmailUtils emailUtils;

    @Override
    public ResponseEntity<?> registerCandidate(CandidateRequest candidateRequest, HttpServletRequest request) throws EmployeeException , IOException{
        log.debug("validating name {} existed ", candidateRequest.getLastName());
        String resourceId = ResourceIdUtils.generateCandidateResourceId(candidateRequest.getEmailId());
        CompanyEntity companyEntity;
        EmployeeEntity employee;
        CandidateEntity candidate;
        try {
            companyEntity = openSearchOperations.getCompanyByCompanyName(candidateRequest.getCompanyName(), Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found with name {}", candidateRequest.getCompanyName());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            employee = openSearchOperations.getEmployeeByEmailId(candidateRequest.getEmailId(), candidateRequest.getCompanyName());
            if (employee != null) {
                log.error("Employee with email {} already exists", candidateRequest.getEmailId());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_EMAILID_ALREADY_EXISTS),
                        HttpStatus.CONFLICT);
            }
            Collection<CandidateEntity> existingCandidate = candidateDao.getCandidates(candidateRequest.getCompanyName(), resourceId, companyEntity.getId());
            if (!existingCandidate.isEmpty()) {
                log.error("Candidate with email {} already exists", candidateRequest.getEmailId());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_EMAILID_ALREADY_EXISTS),
                        HttpStatus.CONFLICT);
            }

            Collection<UserEntity> existingUser = userDao.getUsers(candidateRequest.getCompanyName(),null, companyEntity.getId(), candidateRequest.getEmailId());
            if (!existingUser.isEmpty()) {
                log.error("User with email {} already exists", candidateRequest.getEmailId());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMAIL_ALREADY_USED_BY_USER),
                        HttpStatus.CONFLICT);
            }
            
            candidate = objectMapper.convertValue(candidateRequest, CandidateEntity.class);
            candidate.setId(resourceId);
            candidate.setCompanyId(companyEntity.getId());
            candidate.setExpiryDate(String.valueOf(LocalDate.now().plusDays(3)));
            candidate.setType(Constants.CANDIDATE);
        } catch (EmployeeException employeeException) {
            log.error("Error while saving candidate details: {}", employeeException.getMessage());
            throw employeeException;
        }
        CompletableFuture.runAsync(() -> {
            try {
                String companyUrl = EmailUtils.getBaseUrl(request) + candidateRequest.getCompanyName() + Constants.SLASH + Constants.CANDIDATE_LOGIN ;
                log.info("The company url : "+companyUrl);
                emailUtils.sendCandidateRegistrationEmail(candidateRequest.getEmailId(), companyUrl,Constants.CANDIDATE);
            } catch (Exception e) {
                log.error("Error sending email to candidate: {}", candidateRequest.getEmailId());
                throw new RuntimeException(e);
            }
        });

        try {
            candidateDao.save(candidate, candidateRequest.getCompanyName());
        } catch (Exception e) {
            log.error("Unable to save the candidate details {} {}", candidateRequest.getEmailId(), e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_CANDIDATE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

   @Override
   public Collection<CandidateEntity> getCandidate(String companyName, String candidateId)
           throws EmployeeException, IOException{
       try {
           CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
           if (companyEntity == null){
               log.error("Exception while fetching the company calendar details");
               throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
           }
           log.debug("Getting Company Calendar by companyName: {}", companyName);
           Collection<CandidateEntity> candidateEntities = candidateDao.getCandidates(companyName, candidateId, companyEntity.getId());
           return candidateEntities.stream()
                   .filter(c -> !Constants.CONVERTED.equalsIgnoreCase(c.getStatus()))
                   .toList();
       } catch (Exception e) {
           throw new RuntimeException(e);
       }
   }

    @Override
    public ResponseEntity<?> updateCandidate(String companyName, String candidateId, CandidateUpdateRequest candidateUpdateRequest) throws EmployeeException {
        try {
            log.debug("Validating candidate existence for id {} in company {}", candidateId, companyName);
            CandidateEntity existingCandidate = null;
            DepartmentEntity departmentEntity = null;
            String index = ResourceIdUtils.generateCompanyIndex(companyName);

            try {
                // Company validation
                CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
                if (companyEntity == null) {
                    log.error("Company not found: {}", companyName);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
                }

                existingCandidate = candidateDao.get(candidateId, companyName).orElse(null);
                if (existingCandidate == null) {
                    log.error("Candidate not found with ID {} in company {}", candidateId, companyName);
                    throw new RuntimeException();
                }
            } catch (EmployeeException e) {
                log.error("Unable to fetch candidate with id {}", candidateId);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_FOUND), candidateId), HttpStatus.NOT_FOUND);
            }
            LocalDate expiryDate = LocalDate.parse(candidateUpdateRequest.getExpiryDate());

            if (!expiryDate.isAfter(LocalDate.now())) {
                log.error("Expiry date cannot be before today");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EXPIRY_DATE_CANNOT_BE_BEFORE_TODAY),
                        HttpStatus.BAD_REQUEST);
            }

            try {
                if ((candidateUpdateRequest.getFirstName() .equals(existingCandidate.getFirstName()))
                        && (candidateUpdateRequest.getLastName().equals(existingCandidate.getLastName()))
                        && candidateUpdateRequest.getMobileNo().equals(existingCandidate.getMobileNo())
                        && candidateUpdateRequest.getDateOfHiring().equals(existingCandidate.getDateOfHiring())
                        && candidateUpdateRequest.getStatus().equals(existingCandidate.getStatus())
                        && candidateUpdateRequest.getExpiryDate().equals(existingCandidate.getExpiryDate())) {
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_CHANGES_DONE), HttpStatus.BAD_REQUEST);
                }

                CandidateEntity updatedData = objectMapper.convertValue(candidateUpdateRequest, CandidateEntity.class);
                BeanUtils.copyProperties(updatedData, existingCandidate, getNullPropertyNames(updatedData));
                candidateDao.save(existingCandidate, companyName);
            } catch (EmployeeException ex) {
                throw ex;
            } catch (Exception e) {
                log.error("Unable to update candidate with id {} due to {}", candidateId, e.getMessage());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_CANDIDATE), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (EmployeeException e) {
            throw e;
        } catch (Exception e) {
            throw new EmployeeException(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }



    @Override
    public void deleteCandidateById(String companyName, String candidateId) throws EmployeeException, IOException {
        try {
            String index = ResourceIdUtils.generateCompanyIndex(companyName);

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found while attempting to delete candidate: {}", companyName);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            candidateDao.delete(candidateId, companyName);
            log.info("Successfully deleted candidate with ID {} from company {}", candidateId, companyName);

        } catch (EmployeeException employeeException) {
            log.error("Error during candidate deletion: {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Unexpected error while deleting candidate with ID {}: {}", candidateId, exception.getMessage());
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_CANDIDATE), candidateId),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    public String[] getNullPropertyNames(Object source) {
        BeanWrapper src = new BeanWrapperImpl(source);
        return Stream.of(src.getPropertyDescriptors())
                .map(PropertyDescriptor::getName)
                .filter(name -> src.getPropertyValue(name) == null)
                .toArray(String[]::new);
    }

}
