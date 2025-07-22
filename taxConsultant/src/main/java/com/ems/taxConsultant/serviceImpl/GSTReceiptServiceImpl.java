package com.ems.taxConsultant.serviceImpl;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.dao.GSTReceiptDao;
import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.CompanyEntity;
import com.ems.taxConsultant.persistance.GSTReceiptEntity;
import com.ems.taxConsultant.request.GSTReceiptRequest;
import com.ems.taxConsultant.request.GSTReceiptUpdateRequest;
import com.ems.taxConsultant.service.GSTReceiptService;
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
public class GSTReceiptServiceImpl implements GSTReceiptService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GSTReceiptDao receiptsDao;

    @Value("${file.upload.path}")
    private String folderPath;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> addGstReceipts(String companyName, GSTReceiptRequest request) throws AccountantException {
        log.debug("validating company existence for companyName {}", companyName);
        String resourceId = ResourceIdUtils.generateGSTReceiptsResourceId(companyName, request.getMonth(), request.getYear());
        CompanyEntity companyEntity;
        GSTReceiptEntity receiptsEntity;
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
                log.error("GST Receipts with resourceId {} already exists for company {}", resourceId, companyName);
                throw new AccountantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_RECEIPTS_ALREADY_EXISTS), resourceId, companyName), HttpStatus.CONFLICT);
            }
            if (request.getFile().isEmpty()) {
                log.error("GST Receipts file is empty for month {} and year {}", request.getMonth(), request.getYear());
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_RECEIPTS_FILE_EMPTY), HttpStatus.BAD_REQUEST);
            }

            GSTReceiptEntity receipts = new GSTReceiptEntity();
            receipts.setId(resourceId);
            receipts.setCompanyId(companyEntity.getId());
            receipts.setGstReceiptNumber(base64Encode(request.getGstReceiptNumber()));
            receipts.setGstReceiptDate(request.getGstReceiptDate());
            receipts.setGstTotalAmount(base64Encode(request.getGstTotalAmount()));
            receipts.setMonth(request.getMonth());
            receipts.setYear(request.getYear());
            receipts.setType(Constants.GST_RECEIPT);
            storeEmployeeGstReceipts(request.getFile(), companyName, receipts);
            receiptsDao.save(receipts, companyName);


        } catch (AccountantException accountantException) {
            log.error("Error while saving GST receipt: {}", accountantException.getMessage());
            throw accountantException;
        } catch (Exception e) {
            log.error("Unable to save GST Receipts for company {} due to {}", companyName, e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_GST_RECEIPTS), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }
    

    @Override
    public Collection<GSTReceiptEntity> getGstReceipts(String companyName, String gstReceiptsId, String month, String year, HttpServletRequest request) {
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching company details for companyName: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting GST Receipts for companyName: {}, gstReceiptsId: {}, month: {}, year: {}", companyName, gstReceiptsId, month, year);
            Collection<GSTReceiptEntity> gstReceiptsEntities = receiptsDao.getGstReceipts(companyName, companyEntity.getId(), gstReceiptsId, month, year);
            for (GSTReceiptEntity gstReceiptsEntity : gstReceiptsEntities) {
                gstReceiptsEntity.setGstReceiptNumber(base64getDecode(gstReceiptsEntity.getGstReceiptNumber()));
                gstReceiptsEntity.setGstTotalAmount(base64getDecode(gstReceiptsEntity.getGstTotalAmount()));
                if (gstReceiptsEntity.getGstReceiptFileName() != null && request!=null) {
                    String baseUrl = getBaseUrl(request);
                    String filePath = baseUrl+"/var/www/ems/assets/img/" + gstReceiptsEntity.getGstReceiptFileName();
                    gstReceiptsEntity.setGstReceiptFileName(filePath);
                }
            }
            return gstReceiptsEntities;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<?> updateGstReceipt(String companyName, String gstReceiptId, GSTReceiptUpdateRequest updateRequest) throws AccountantException {
        Collection<GSTReceiptEntity> gstReceiptEntity;
        GSTReceiptEntity gstReceiptsEntity;
        log.debug("Validating company existence for companyName {}", companyName);
        try {
            gstReceiptEntity = this.getGstReceipts(companyName, gstReceiptId, null, null, null);
            gstReceiptsEntity = gstReceiptEntity.stream()
                    .filter(gst -> gst.getId().equals(gstReceiptId))
                    .findFirst()
                    .orElse(null);
            if (gstReceiptEntity == null) {
                log.error("GST Receipts with ID {} not found for company {}", gstReceiptId, companyName);
                throw new AccountantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.GST_RECEIPTS_NOT_FOUND), gstReceiptId, companyName), HttpStatus.NOT_FOUND);
            }
        } catch (AccountantException e) {
            log.error("Unable to fetch GST Receipts with ID {} for company {} due to {}", gstReceiptId, companyName, e.getMessage());
            throw e;
        }
        try {
            assert gstReceiptsEntity != null;
            if ((updateRequest.getGstReceiptDate().equals(gstReceiptsEntity.getGstReceiptDate()))
                    && (updateRequest.getGstReceiptNumber().equals(gstReceiptsEntity.getGstReceiptNumber()))
                    && (updateRequest.getGstTotalAmount().equals(gstReceiptsEntity.getGstTotalAmount()))) {
                log.warn("No changes detected in GST Receipts with ID {} for company {}", gstReceiptId, companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.NO_CHANGES_DETECTED), HttpStatus.NOT_MODIFIED);
            }


            GSTReceiptEntity updatedData = new GSTReceiptEntity();
            updatedData.setGstReceiptNumber(base64Encode(updateRequest.getGstReceiptNumber()));
            updatedData.setGstReceiptDate(updateRequest.getGstReceiptDate());
            updatedData.setGstTotalAmount(base64Encode(updateRequest.getGstTotalAmount()));
            BeanUtils.copyProperties(updatedData, gstReceiptsEntity, getNullPropertyNames(updatedData));
            storeEmployeeGstReceipts(updateRequest.getFile(), companyName, gstReceiptsEntity);
            receiptsDao.save(gstReceiptsEntity, companyName);
        } catch (AccountantException ex) {
            log.error("Unable to update GST Receipts with ID {} for company {} due to {}", gstReceiptId, companyName, ex.getMessage());
            throw ex;
        } catch (Exception e) {
            log.error("Unable to update GST Receipts with ID {} for company {} due to {}", gstReceiptId, companyName, e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_UPDATE_GST_RECEIPT), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public void deleteGstReceiptById(String companyName, String receiptId) throws AccountantException {

        try {
            GSTReceiptEntity gstReceiptsEntity = this.getGstReceipts(companyName, receiptId, null, null, null)
                    .stream()
                    .findFirst()
                    .orElse(null);
            receiptsDao.delete(receiptId, companyName);
            log.info("Successfully deleted GST Receipts with ID {} for company {}", receiptId, companyName);
        } catch (AccountantException accountantException) {
            log.error("Error while deleting GST Receipts with ID {} for company {}: {}", receiptId, companyName, accountantException.getMessage());
            throw accountantException;
        } catch (Exception exception) {
            log.error("Unexpected error while deleting GST Receipts with ID {} for company {}: {}", receiptId, companyName, exception.getMessage());
            throw new AccountantException(
                    ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_DELETE_GST_RECEIPTS),HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }

    private void storeEmployeeGstReceipts(MultipartFile file, String companyName, GSTReceiptEntity receipts) throws IOException {
        if(!file.isEmpty()){
            String companyFolderPath = folderPath + companyName;
            String filename = companyFolderPath+Constants.SLASH+Constants.GST_RECEIPT+"_"+receipts.getMonth()+"_"+ receipts.getYear()+"_"+file.getOriginalFilename();
            file.transferTo(new File(filename));
            receipts.setGstReceiptFileName(companyName+Constants.SLASH+Constants.GST_RECEIPT+"_"+receipts.getMonth()+"_"+ receipts.getYear()+"_"+file.getOriginalFilename());
            ResponseEntity.ok(filename);
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
