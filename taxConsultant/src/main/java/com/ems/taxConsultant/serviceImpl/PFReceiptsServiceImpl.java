package com.ems.taxConsultant.serviceImpl;

import com.ems.taxConsultant.common.ResponseBuilder;
import com.ems.taxConsultant.dao.PFReceiptsDao;
import com.ems.taxConsultant.elasticSearch.OpenSearchOperations;
import com.ems.taxConsultant.exception.AccountantException;
import com.ems.taxConsultant.exception.ErrorMessageHandler;
import com.ems.taxConsultant.exception.ErrorMessageKey;
import com.ems.taxConsultant.persistance.CompanyEntity;
import com.ems.taxConsultant.persistance.PFReceiptsEntity;
import com.ems.taxConsultant.request.PFReceiptUpdateRequest;
import com.ems.taxConsultant.request.PFReceiptsRequest;
import com.ems.taxConsultant.service.PFReceiptsService;
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
public class PFReceiptsServiceImpl implements PFReceiptsService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PFReceiptsDao receiptsDao;

    @Value("${file.upload.path}")
    private String folderPath;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> addPFReceipts(String companyName, PFReceiptsRequest request) throws AccountantException {
        log.debug("validating company existence for companyName {}", companyName);
        String resourceId = ResourceIdUtils.generatePFReceiptsResourceId(companyName, request.getMonth(), request.getYear());
        CompanyEntity companyEntity;
        PFReceiptsEntity receiptsEntity;
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
                log.error("PF Receipts with resourceId {} already exists for company {}", resourceId, companyName);
                throw new AccountantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.PF_RECEIPTS_ALREADY_EXISTS), resourceId, companyName), HttpStatus.CONFLICT);
            }
            if (request.getFile().isEmpty()) {
                log.error("PF Receipts file is empty for month {} and year {}", request.getMonth(), request.getYear());
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.PF_RECEIPTS_FILE_EMPTY), HttpStatus.BAD_REQUEST);
            }

            PFReceiptsEntity receipts = new PFReceiptsEntity();
            receipts.setId(resourceId);
            receipts.setCompanyId(companyEntity.getId());
            receipts.setPfReceiptNumber(base64Encode(request.getPfReceiptNumber()));
            receipts.setPfReceiptDate(request.getPfReceiptDate());
            receipts.setPfTotalAmount(base64Encode(request.getPfTotalAmount()));
            receipts.setMonth(request.getMonth());
            receipts.setYear(request.getYear());
            receipts.setType(Constants.PF_RECEIPT);
            storeEmployeePFReceipts(request.getFile(), companyName, receipts);
            receiptsDao.save(receipts, companyName);


        } catch (AccountantException accountantException) {
            log.error("Error while saving PF receipt: {}", accountantException.getMessage());
            throw accountantException;
        } catch (Exception e) {
            log.error("Unable to save PF Receipts for company {} due to {}", companyName, e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_PF_RECEIPTS), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    private void storeEmployeePFReceipts(MultipartFile file, String companyName, PFReceiptsEntity receipts) throws IOException {
            if(!file.isEmpty()){
                String companyFolderPath = folderPath + companyName;
                String filename = companyFolderPath+Constants.SLASH+Constants.PF_RECEIPT+"_"+receipts.getMonth()+"_"+ receipts.getYear()+"_"+file.getOriginalFilename();
                file.transferTo(new File(filename));
                receipts.setPfReceiptFileName(companyName+Constants.SLASH+Constants.PF_RECEIPT+"_"+receipts.getMonth()+"_"+ receipts.getYear()+"_"+ file.getOriginalFilename());
                ResponseEntity.ok(filename);
            }

    }

    @Override
    public Collection<PFReceiptsEntity> getPfReceipts(String companyName, String pfReceiptsId, String month, String year, HttpServletRequest request){
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching company details for companyName: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting PF Receipts for companyName: {}, pfReceiptsId: {}, month: {}, year: {}", companyName, pfReceiptsId, month, year);
            Collection<PFReceiptsEntity> pfReceiptsEntities = receiptsDao.getPFReceipts(companyName, companyEntity.getId(), pfReceiptsId, month, year);
            for (PFReceiptsEntity pfReceiptsEntity : pfReceiptsEntities) {
                pfReceiptsEntity.setPfReceiptNumber(base64getDecode(pfReceiptsEntity.getPfReceiptNumber()));
                pfReceiptsEntity.setPfTotalAmount(base64getDecode(pfReceiptsEntity.getPfTotalAmount()));
                if (pfReceiptsEntity.getPfReceiptFileName() != null && request!=null) {
                    String baseUrl = getBaseUrl(request);
                    String filePath = baseUrl+"/var/www/ems/assets/img/" + pfReceiptsEntity.getPfReceiptFileName();
                    pfReceiptsEntity.setPfReceiptFileName(filePath);
                }
            }
            return pfReceiptsEntities;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<?> updatePFReceipt(String companyName, String pfReceiptId, PFReceiptUpdateRequest updateRequest) throws AccountantException {
        Collection<PFReceiptsEntity> pfReceiptEntity;
        PFReceiptsEntity pfReceiptsEntity;
        log.debug("Validating company existence for companyName {}", companyName);
        try {
            pfReceiptEntity = this.getPfReceipts(companyName, pfReceiptId, null, null, null);
            pfReceiptsEntity = pfReceiptEntity.stream()
                    .filter(pf -> pf.getId().equals(pfReceiptId))
                    .findFirst()
                    .orElse(null);
            if (pfReceiptEntity == null) {
                log.error("PF Receipts with ID {} not found for company {}", pfReceiptId, companyName);
                throw new AccountantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.PF_RECEIPTS_NOT_FOUND), pfReceiptId, companyName), HttpStatus.NOT_FOUND);
            }
        } catch (AccountantException e) {
            log.error("Unable to fetch PF Receipts with ID {} for company {} due to {}", pfReceiptId, companyName, e.getMessage());
            throw e;
        }
        try {
            assert pfReceiptsEntity != null;
            if ((updateRequest.getPfReceiptDate().equals(pfReceiptsEntity.getPfReceiptDate()))
                    && (updateRequest.getPfReceiptNumber().equals(pfReceiptsEntity.getPfReceiptNumber()))
                    && (updateRequest.getPfTotalAmount().equals(pfReceiptsEntity.getPfTotalAmount()))) {
                log.warn("No changes detected in PF Receipts with ID {} for company {}", pfReceiptId, companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.NO_CHANGES_DETECTED), HttpStatus.NOT_MODIFIED);
            }


            PFReceiptsEntity updatedData = new PFReceiptsEntity();
            updatedData.setPfReceiptNumber(base64Encode(updateRequest.getPfReceiptNumber()));
            updatedData.setPfReceiptDate(updateRequest.getPfReceiptDate());
            updatedData.setPfTotalAmount(base64Encode(updateRequest.getPfTotalAmount()));            BeanUtils.copyProperties(updatedData, pfReceiptsEntity, getNullPropertyNames(updatedData));
            storeEmployeePFReceipts(updateRequest.getFile(), companyName, pfReceiptsEntity);
            receiptsDao.save(pfReceiptsEntity, companyName);
        } catch (AccountantException ex) {
            log.error("Unable to update PF Receipts with ID {} for company {} due to {}", pfReceiptId, companyName, ex.getMessage());
            throw ex;
        } catch (Exception e) {
            log.error("Unable to update PF Receipts with ID {} for company {} due to {}", pfReceiptId, companyName, e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_UPDATE_PF_RECEIPT), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }


    @Override
    public void deletePFReceiptById(String companyName, String responseId) throws AccountantException, IOException {
        try {
            PFReceiptsEntity pfReceiptsEntity = this.getPfReceipts(companyName, responseId, null, null, null)
                    .stream()
                    .findFirst()
                    .orElse(null);
            receiptsDao.delete(responseId, companyName);
            log.info("Successfully deleted PF Receipts with ID {} for company {}", responseId, companyName);
        } catch (AccountantException accountantException) {
            log.error("Error while deleting PF Receipts with ID {} for company {}: {}", responseId, companyName, accountantException.getMessage());
            throw accountantException;
        } catch (Exception exception) {
            log.error("Unexpected error while deleting PF Receipts with ID {} for company {}: {}", responseId, companyName, exception.getMessage());
            throw new AccountantException(
                    ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_DELETE_PF_RECEIPTS),HttpStatus.INTERNAL_SERVER_ERROR);
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
