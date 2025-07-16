package com.ems.accountant.serviceImpl;

import com.ems.accountant.common.ResponseBuilder;
import com.ems.accountant.dao.TDSReceiptsDao;
import com.ems.accountant.elasticSearch.OpenSearchOperations;
import com.ems.accountant.exception.AccountantException;
import com.ems.accountant.exception.ErrorMessageHandler;
import com.ems.accountant.exception.ErrorMessageKey;
import com.ems.accountant.persistance.CompanyEntity;
import com.ems.accountant.persistance.TDSReceiptEntity;
import com.ems.accountant.request.TDSReceiptRequest;
import com.ems.accountant.request.TDSReceiptUpdateRequest;
import com.ems.accountant.service.TDSReceiptsService;
import com.ems.accountant.utils.Constants;
import com.ems.accountant.utils.ResourceIdUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
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
public class TDSReceiptsServiceImpl implements TDSReceiptsService {

    @Autowired
    private TDSReceiptsDao tdsReceiptsDao;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Value("${file.upload.path}")
    private String folderPath;

    @Override
    public ResponseEntity<?> addTDSReceipt(String companyName, TDSReceiptRequest request) throws AccountantException {
        log.debug("Validating company existence for company: {}", companyName);
        String resourceId = ResourceIdUtils.generateTDSReceiptResourceId(companyName, request.getMonth(), request.getYear());
        CompanyEntity companyEntity;

        try {
            companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
        if (companyEntity == null) {
            log.error("Company not found with name {}", companyName);
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }
        } catch (AccountantException accountantException) {
            log.error("Error while fetching company details: {}", accountantException.getMessage());
            throw accountantException;
        }

        try {
            TDSReceiptEntity existingReceipt = tdsReceiptsDao.get(resourceId, companyName).orElse(null);
            if (existingReceipt != null) {
                log.error("TDS Receipt already exists for month {} and year {} for company {}", request.getMonth(), request.getYear(), companyName);
                throw new AccountantException(String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.TDS_RECEIPT_ALREADY_EXISTS), resourceId), HttpStatus.CONFLICT);
            }

            if (request.getFile() == null || request.getFile().isEmpty()) {
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.TDS_RECEIPT_FILE_EMPTY), HttpStatus.BAD_REQUEST);
            }

            TDSReceiptEntity receipt = new TDSReceiptEntity();
            receipt.setId(resourceId);
            receipt.setCompanyId(companyEntity.getId());
            receipt.setMonth(request.getMonth());
            receipt.setYear(request.getYear());
            receipt.setTdsReceiptNumber(base64Encode(request.getTdsReceiptNumber()));
            receipt.setTdsReceiptDate(request.getTdsReceiptDate());
            receipt.setTdsTotalAmount(base64Encode(request.getTdsTotalAmount()));
            receipt.setType(Constants.TDS_RECEIPT);

            storeTDSReceiptFile(request.getFile(), companyName, receipt);
            tdsReceiptsDao.save(receipt, companyName);
        }
        catch (AccountantException accountantException) {
            log.error("Error while saving TDS Receipts for company {}: {}", companyName, accountantException.getMessage());
            throw accountantException;
        } catch (Exception e) {
            log.error("Unable to save TDS Receipts for company {} due to {}", companyName, e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_SAVE_TDS_RECEIPTS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public Collection<TDSReceiptEntity> getTDSReceipts(String companyName, String tdsReceiptsId, String month, String year, HttpServletRequest request){
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching company details for companyName: {}", companyName);
                throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting TDS Receipts for companyName: {}, tdsReceiptsId: {}, month: {}, year: {}", companyName, tdsReceiptsId, month, year);
            Collection<TDSReceiptEntity> tdsReceiptEntities = tdsReceiptsDao.getTDSReceipts(companyName, companyEntity.getId(), tdsReceiptsId, month, year);
            for (TDSReceiptEntity tdsReceipts : tdsReceiptEntities) {
                tdsReceipts.setTdsReceiptNumber(base64getDecode(tdsReceipts.getTdsReceiptNumber()));
                tdsReceipts.setTdsTotalAmount(base64getDecode(tdsReceipts.getTdsTotalAmount()));
                if (tdsReceipts.getTdsReceiptFileName() != null) {
                    String baseUrl = getBaseUrl(request);
                    String filePath = baseUrl+folderPath + tdsReceipts.getTdsReceiptFileName();
                    tdsReceipts.setTdsReceiptFileName(filePath);
                }
            }
            return tdsReceiptEntities;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    @Override
    public ResponseEntity<?> updateTDSReceipt(String companyName, String tdsReceiptsId, TDSReceiptUpdateRequest updateRequest) throws AccountantException {
        log.debug("Updating TDS Receipt for company: {}, ID: {}", companyName, tdsReceiptsId);

        TDSReceiptEntity tdsReceiptEntity = tdsReceiptsDao.get(tdsReceiptsId, companyName)
                .orElseThrow(() -> new AccountantException(
                        String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.TDS_RECEIPTS_NOT_FOUND), tdsReceiptsId, companyName),
                        HttpStatus.NOT_FOUND));

        String decodedReceiptNumber = base64getDecode(tdsReceiptEntity.getTdsReceiptNumber());
        String decodedTotalAmount = base64getDecode(tdsReceiptEntity.getTdsTotalAmount());

        if (updateRequest.getTdsReceiptDate().equals(tdsReceiptEntity.getTdsReceiptDate())
                && updateRequest.getTdsReceiptNumber().equals(decodedReceiptNumber)
                && updateRequest.getTdsTotalAmount().equals(decodedTotalAmount)) {
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.NO_CHANGES_DETECTED), HttpStatus.NOT_MODIFIED);
        }

        // Apply updates
        tdsReceiptEntity.setTdsReceiptDate(updateRequest.getTdsReceiptDate());
        tdsReceiptEntity.setTdsReceiptNumber(base64Encode(updateRequest.getTdsReceiptNumber()));
        tdsReceiptEntity.setTdsTotalAmount(base64Encode(updateRequest.getTdsTotalAmount()));

        if (updateRequest.getFile() != null && !updateRequest.getFile().isEmpty()) {
            storeTDSReceiptFile(updateRequest.getFile(), companyName, tdsReceiptEntity);
        }

        tdsReceiptsDao.save(tdsReceiptEntity, companyName);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public void deleteTDSReceiptById(String companyName, String id) throws AccountantException {
        try {
            TDSReceiptEntity tdsReceiptEntity = tdsReceiptsDao.get(id, companyName)
                    .orElseThrow(() -> new AccountantException(
                            String.format(ErrorMessageHandler.getMessage(ErrorMessageKey.TDS_RECEIPTS_NOT_FOUND), id, companyName),
                            HttpStatus.NOT_FOUND));

            // Optionally delete file from disk
            if (tdsReceiptEntity.getTdsReceiptFileName() != null) {
                File file = new File(folderPath + tdsReceiptEntity.getTdsReceiptFileName());
                if (file.exists()) file.delete();
            }

            tdsReceiptsDao.delete(id, companyName);
            log.info("Successfully deleted TDS Receipt with ID {} for company {}", id, companyName);
        } catch (AccountantException ex) {
            log.error("Failed to delete TDS Receipt: {}", ex.getMessage());
            throw ex;
        } catch (Exception e) {
            log.error("Unexpected error while deleting TDS Receipt: {}", e.getMessage());
            throw new AccountantException(ErrorMessageHandler.getMessage(ErrorMessageKey.UNABLE_DELETE_TDS_RECEIPTS),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
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

    private void storeTDSReceiptFile(MultipartFile file, String companyName, TDSReceiptEntity receipt) throws AccountantException {
        if (file == null || file.isEmpty()) return;
        try {
            String path = folderPath + companyName;
            String filePath = path + Constants.SLASH + companyName + "_" + receipt.getMonth() + "_" + receipt.getYear() + "_" + file.getOriginalFilename();
            file.transferTo(new File(filePath));
            receipt.setTdsReceiptFileName(companyName + Constants.SLASH+Constants.TDS_RECEIPT+"_"+receipt.getMonth() + "_" + receipt.getYear() + "_" + "_" +file.getOriginalFilename());
        } catch (IOException e) {
            log.error("Failed to store TDS receipt file: {}", e.getMessage());
            throw new AccountantException("Unable to store TDS receipt file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
