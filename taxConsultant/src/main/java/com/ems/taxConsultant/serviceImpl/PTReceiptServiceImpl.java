package com.ems.taxConsultant.serviceImpl;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.dao.PTReceiptDao;
import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.CompanyEntity;
import com.ems.taxConsultant.persistance.PTReceiptEntity;
import com.ems.taxConsultant.request.PTReceiptRequest;
import com.ems.taxConsultant.request.PTReceiptUpdateRequest;
import com.ems.taxConsultant.service.PTReceiptService;
import com.ems.taxConsultant.utils.Constants;
import com.ems.taxConsultant.utils.ResourceIdUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collection;
import java.util.stream.Stream;

@Service
@Slf4j
public class PTReceiptServiceImpl implements PTReceiptService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PTReceiptDao receiptsDao;

    @Value("${file.upload.path}")
    private String folderPath;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> addPTReceipts(String companyName, PTReceiptRequest request) throws AccountantException {
        log.debug("validating company existence for companyName {}", companyName);
        String resourceId = ResourceIdUtils.generatePTReceiptsResourceId(companyName, request.getMonth(), request.getYear());
        CompanyEntity companyEntity;
        PTReceiptEntity receiptsEntity;
        try {
            companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found with name {}", companyName);
                throw new AccountantException("Company not found", HttpStatus.NOT_FOUND);
            }
        } catch (AccountantException accountantException) {
            log.error("Error while fetching company details: {}", accountantException.getMessage());
            throw accountantException;
        }
        try {
            receiptsEntity = receiptsDao.get(resourceId, companyName).orElse(null);
            if (receiptsEntity != null) {
                log.error("Professional Tax Receipts already exists for month {} and year {} for company {}", request.getMonth(), request.getYear(), companyName);
                throw new AccountantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.PT_RECEIPTS_ALREADY_EXISTS), resourceId, companyName), HttpStatus.CONFLICT);
            }
            if (request.getFile().isEmpty()) {
                log.error("Professional Tax Receipts file is empty for company {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PT_RECEIPTS_FILE_EMPTY), HttpStatus.BAD_REQUEST);
            }

            PTReceiptEntity receipts = new PTReceiptEntity();
            receipts.setId(resourceId);
            receipts.setCompanyId(companyEntity.getId());
            receipts.setPtReceiptNumber(base64Encode(request.getPtReceiptNumber()));
            receipts.setPtReceiptDate(request.getPtReceiptDate());
            receipts.setPtTotalAmount(base64Encode(request.getPtTotalAmount()));
            receipts.setMonth(request.getMonth());
            receipts.setYear(request.getYear());
            receipts.setType(Constants.PT_RECEIPT);
            storeEmployeePTReceipts(request.getFile(), companyName, receipts);
            receiptsDao.save(receipts, companyName);


        } catch (AccountantException accountantException) {
            log.error("Error while saving Professional Tax Receipts for company {}: {}", companyName, accountantException.getMessage());
            throw accountantException;
        } catch (Exception e) {
            log.error("Unable to save Professional Tax Receipts for company {} due to {}", companyName, e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_PT_RECEIPTS), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    private void storeEmployeePTReceipts(MultipartFile file, String companyName, PTReceiptEntity receipts) throws IOException {
        if(!file.isEmpty()){
            String companyFolderPath = folderPath + companyName;
            String filename = companyFolderPath+Constants.SLASH+Constants.PT_RECEIPT+"_"+receipts.getMonth()+"_"+ receipts.getYear()+"_"+file.getOriginalFilename();
            file.transferTo(new File(filename));
            receipts.setPtReceiptFileName(companyName+Constants.SLASH+Constants.PT_RECEIPT+"_"+receipts.getMonth()+"_"+ receipts.getYear()+"_"+file.getOriginalFilename());
            ResponseEntity.ok(filename);
        }

    }

    @Override
    public Collection<PTReceiptEntity> getPTReceipts(String companyName, String ptId, String month, String year, HttpServletRequest request){
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching company details for companyName: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting Professional Tax Receipts for companyName: {}, ptId: {}, month: {}, year: {}", companyName, ptId, month, year);
            Collection<PTReceiptEntity> ptReceiptEntities = receiptsDao.getPTReceipt(companyName, companyEntity.getId(), ptId, month, year);
            for (PTReceiptEntity ptReceipts : ptReceiptEntities) {
                ptReceipts.setPtReceiptNumber(base64getDecode(ptReceipts.getPtReceiptNumber()));
                ptReceipts.setPtTotalAmount(base64getDecode(ptReceipts.getPtTotalAmount()));
                if (ptReceipts.getPtReceiptFileName() != null && request!=null) {
                    String baseUrl = getBaseUrl(request);
                    String filePath = baseUrl+folderPath + ptReceipts.getPtReceiptFileName();
                    ptReceipts.setPtReceiptFileName(filePath);
                }
            }
            return ptReceiptEntities;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<?> updatePTReceipt(String companyName, String ptId, PTReceiptUpdateRequest updateRequest) throws AccountantException {
        PTReceiptEntity ptReceiptEntity;
        log.debug("Validating company existence for companyName {}", companyName);
        try {
            ptReceiptEntity = this.getPTReceipts(companyName, ptId, null, null, null)
                    .stream()
                    .findFirst()
                    .orElse(null);
            if (ptReceiptEntity == null) {
                log.error("Professional Tax Receipts not found with ID {} for company {}", ptId, companyName);
                throw new AccountantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.PT_RECEIPTS_NOT_FOUND), ptId, companyName), HttpStatus.NOT_FOUND);
            }
        } catch (AccountantException e) {
            log.error("Unable to fetch Professional tax Receipts with ID {} for company {} due to {}", ptId, companyName, e.getMessage());
            throw e;
        }
        try {
            if ((updateRequest.getPtReceiptDate().equals(ptReceiptEntity.getPtReceiptDate()))
                    && (updateRequest.getPtReceiptNumber().equals(ptReceiptEntity.getPtReceiptNumber()))
                    && (updateRequest.getPtTotalAmount().equals(ptReceiptEntity.getPtTotalAmount()))) {
                log.warn("No changes detected in Professional tax Receipts with ID {} for company {}", ptId, companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.NO_CHANGES_DETECTED), HttpStatus.NOT_MODIFIED);
            }

            PTReceiptEntity updatedData = new PTReceiptEntity();
            updatedData.setPtReceiptNumber(base64Encode(updateRequest.getPtReceiptNumber()));
            updatedData.setPtReceiptDate(updateRequest.getPtReceiptDate());
            updatedData.setPtTotalAmount(base64Encode(updateRequest.getPtTotalAmount()));
            BeanUtils.copyProperties(updatedData, ptReceiptEntity, getNullPropertyNames(updatedData));
            storeEmployeePTReceipts(updateRequest.getFile(), companyName, ptReceiptEntity);
            receiptsDao.save(ptReceiptEntity, companyName);
        } catch (AccountantException ex) {
            log.error("Unable to update Professional tax Receipts with ID {} for company {} due to {}", ptId, companyName, ex.getMessage());
            throw ex;
        } catch (Exception e) {
            log.error("Unable to update Professional tax Receipts with ID {} for company {} due to {}", ptId, companyName, e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_UPDATE_PT_RESPONSE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }


    @Override
    public void deletePTReceiptById(String companyName, String id) throws AccountantException, IOException {
        try {
            PTReceiptEntity ptReceiptEntity = this.getPTReceipts(companyName, id, null, null, null)
                    .stream()
                    .findFirst()
                    .orElse(null);
            receiptsDao.delete(id, companyName);
            log.info("Successfully deleted professional tax Receipts with ID {} for company {}", id, companyName);
        } catch (AccountantException accountantException) {
            log.error("Error while deleting professional tax Receipts with ID {} for company {}: {}", id, companyName, accountantException.getMessage());
            throw accountantException;
        } catch (Exception exception) {
            log.error("Unexpected error while deleting professional tax Receipts with ID {} for company {}: {}", id, companyName, exception.getMessage());
            throw new AccountantException(
                    ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_DELETE_PT_RECEIPTS),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    public String[] getNullPropertyNames(Object source) {
        BeanWrapper src = new BeanWrapperImpl(source);
        return Stream.of(src.getPropertyDescriptors())
                .map(PropertyDescriptor::getName)
                .filter(name -> src.getPropertyValue(name) == null)
                .toArray(String[]::new);
    }

    private String base64Encode(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }


    private String base64getDecode(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        byte[] decodedBytes = Base64.getDecoder().decode(value);
        return new String(decodedBytes, StandardCharsets.UTF_8);

    }

    public static String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        String contextPath = request.getContextPath();

        return scheme + "://" + serverName + ":" + serverPort + contextPath;
    }
}
