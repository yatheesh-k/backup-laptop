package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.DocumentException;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.InternOfferLetterDao;
import com.pb.employee.dao.OfferLetterDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.OfferLetterRequest;
import com.pb.employee.request.OfferLetterUpdateRequest;
import com.pb.employee.service.OfferLetterService;
import com.pb.employee.util.*;
import freemarker.template.Configuration;
import freemarker.template.Template;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.beans.PropertyDescriptor;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.List;

@Service
@Slf4j
public class OfferLetterServiceImpl implements OfferLetterService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private Configuration freeMarkerConfig;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OfferLetterDao offerLetterDao;

    @Autowired
    private InternOfferLetterDao internOfferLetterDao;

    @Override
    public ResponseEntity<byte[]> downloadOfferLetter(OfferLetterRequest request, HttpServletRequest httpRequest) throws EmployeeException {

        String resourceId = ResourceIdUtils.generateOfferLetterId(request.getReferenceNo());
        try {
            SSLUtil.disableSSLVerification();

            CompanyEntity rawCompany = openSearchOperations.getCompanyById(request.getCompanyId(), null, Constants.INDEX_EMS);
            if (rawCompany == null) {
                log.error("Company is not found");
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), request.getCompanyId()), HttpStatus.NOT_FOUND);
            }

            Entity companyDetails = CompanyUtils.unmaskCompanyProperties(rawCompany, httpRequest);
            SalaryConfigurationEntity salaryConfig = openSearchOperations.getSalaryStructureById(request.getSalaryConfigurationId(), null, Constants.INDEX_EMS + "_" + rawCompany.getShortName());
            CompanyUtils.unMaskCompanySalaryStructureProperties(salaryConfig);

            if (salaryConfig == null || !Constants.ACTIVE.equals(salaryConfig.getStatus())) {
                log.error("Salary configuration is not active or does not exist");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_SALARY_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            Map<String, Object> model = new HashMap<>();
            model.put(Constants.COMPANY, companyDetails);
            model.put(Constants.OFFER_LETTER_REQUEST, request);
            model.put(Constants.SALARY, PayslipUtils.calculateSalaryComponents(salaryConfig, request.getSalaryPackage()));

            if (!request.isDraft()) {
                String imageUrl = rawCompany.getImageFile();
                if (imageUrl == null || imageUrl.isBlank() || imageUrl.contains("base64string")) {
                    log.error("Invalid or missing company logo image for companyId: {}", request.getCompanyId());
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_LOGO), HttpStatus.BAD_REQUEST);
                }

                try {
                    BufferedImage image = ImageIO.read(new URL(imageUrl));
                    if (image == null) {
                        log.error("Unable to read the company logo image from URL: {}", imageUrl);
                        throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_LOGO), HttpStatus.BAD_REQUEST);
                    }

                    BufferedImage watermark = CompanyUtils.applyOpacity(image, 0.1f, 1.6d, 30);
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    ImageIO.write(watermark, "png", baos);
                    model.put(Constants.BLURRED_IMAGE, Constants.DATA + Base64.getEncoder().encodeToString(baos.toByteArray()));

                } catch (IOException e) {
                    log.error("Error while reading or processing company logo image for companyId: {}", request.getCompanyId(), e);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_LOGO), HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }


            Collection<OfferLetterEntity> offerLetters = offerLetterDao.getOfferLetter(rawCompany.getShortName(), null);
            if (offerLetters != null && !offerLetters.isEmpty()) {
                boolean refExists = offerLetters.stream()
                        .anyMatch(o -> o.getReferenceNo() != null &&
                                o.getReferenceNo().equalsIgnoreCase(request.getReferenceNo()));

                if (refExists) {
                    log.error("Offer letter already exists for referenceNo: {}", request.getReferenceNo());
                    throw new EmployeeException(
                            String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.OFFER_LETTER_REF_EXIST), request.getReferenceNo()),
                            HttpStatus.CONFLICT // or BAD_REQUEST
                    );
                }
            }


            OfferLetterEntity entity = objectMapper.convertValue(request, OfferLetterEntity.class);
            entity.setId(resourceId);
            entity.setType(Constants.OFFER_LETTER);
            Template template = freeMarkerConfig.getTemplate(Constants.OFFER_LETTER_TEMPLATE1);
            StringWriter writer = new StringWriter();
            template.process(model, writer);

            byte[] pdf = generatePdfFromHtml(writer.toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder(Constants.ATTACHMENT).filename(Constants.OFFER_LETTER_PDF).build());
            offerLetterDao.save(entity, rawCompany.getShortName());
            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);

        }catch (EmployeeException employeeException){
            log.error("EmployeeException occurred while generating offer letter: {}", employeeException.getMessage());
            throw  employeeException;

        } catch (Exception e) {
            log.error("Error occurred while generating offer letter: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Collection<OfferLetterEntity> getOfferLetter(String companyName, String offerLetterId) throws EmployeeException {
        try {
            log.debug("Fetching company entity for companyName: {}", companyName);
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for companyName: {}", companyName);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            log.debug("Fetching offer letter(s) for offerLetterId: {} in company: {}", offerLetterId, companyName);
            return offerLetterDao.getOfferLetter(companyEntity.getShortName(), offerLetterId);

        } catch (EmployeeException e) {
            log.error("EmployeeException while fetching offer letters: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while fetching offer letters for companyName: {} and offerLetterId: {}", companyName, offerLetterId, e);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.OFFER_LETTER_NOT_FOUND), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> updateOfferLetter(String companyName, String offerLetterId, OfferLetterUpdateRequest offerLetterUpdateRequest)
            throws EmployeeException, IOException {

        try {
            log.debug("Validating offer letter existence for offerLetterId: {} in companyName: {}", offerLetterId, companyName);

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for companyName: {}", companyName);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            SalaryConfigurationEntity salaryConfig = openSearchOperations.getSalaryStructureById(offerLetterUpdateRequest.getSalaryConfigurationId(), null, Constants.INDEX_EMS + "_" + companyEntity.getShortName());
            if (salaryConfig == null || !Constants.ACTIVE.equals(salaryConfig.getStatus())) {
                log.error("Salary configuration is invalid for salaryConfigurationId: {}", offerLetterUpdateRequest.getSalaryConfigurationId());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_SALARY_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            Collection<OfferLetterEntity> offerLetters = offerLetterDao.getOfferLetter(companyEntity.getShortName(), offerLetterId);
            OfferLetterEntity existingOffer = offerLetters.stream().findFirst().orElse(null);

            if (existingOffer == null) {
                log.error("Offer letter not found for offerLetterId: {}", offerLetterId);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.OFFER_LETTER_NOT_FOUND), offerLetterId), HttpStatus.NOT_FOUND);
            }

            if (isOfferLetterSame(existingOffer, offerLetterUpdateRequest)) {
                log.warn("No changes detected for offerLetterId: {}", offerLetterId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.No_UPDATE_DONE_IN_OFFER_LETTER), HttpStatus.BAD_REQUEST);
            }

            OfferLetterEntity updatedOffer = objectMapper.convertValue(offerLetterUpdateRequest, OfferLetterEntity.class);

            BeanUtils.copyProperties(updatedOffer, existingOffer, getNullPropertyNames(updatedOffer));

            offerLetterDao.update(existingOffer, companyEntity.getShortName());
            log.info("Offer letter updated successfully for offerLetterId: {}", offerLetterId);

            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);

        } catch (EmployeeException e) {
            log.error("EmployeeException while updating offer letter: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating offer letter for offerLetterId {}: {}", offerLetterId, e.getMessage(), e);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_UPDATE_OFFER_LETTER), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private byte[] generatePdfFromHtml(String html) throws IOException {
        html = html.replaceAll("&(?![a-zA-Z]{2,6};|#\\d{1,5};)", "&amp;");
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(baos);
            return baos.toByteArray();
        } catch (DocumentException e) {
            throw new IOException(e.getMessage());
        }
    }

    private String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        return Arrays.stream(src.getPropertyDescriptors())
                .map(PropertyDescriptor::getName)
                .filter(name -> src.getPropertyValue(name) == null)
                .toArray(String[]::new);
    }

    private boolean isOfferLetterSame(OfferLetterEntity existing, OfferLetterUpdateRequest updated) {
        return Objects.equals(existing.getOfferDate(), updated.getOfferDate()) &&
                Objects.equals(existing.getReferenceNo(), updated.getReferenceNo()) &&
                Objects.equals(existing.getEmployeeName(), updated.getEmployeeName()) &&
                Objects.equals(existing.getEmployeeFatherName(), updated.getEmployeeFatherName()) &&
                Objects.equals(existing.getEmployeeAddress(), updated.getEmployeeAddress()) &&
                Objects.equals(existing.getEmployeeContactNo(), updated.getEmployeeContactNo()) &&
                Objects.equals(existing.getJoiningDate(), updated.getJoiningDate()) &&
                Objects.equals(existing.getJobLocation(), updated.getJobLocation()) &&
                Objects.equals(existing.getSalaryPackage(), updated.getSalaryPackage()) &&
                Objects.equals(existing.getDesignation(), updated.getDesignation()) &&
                Objects.equals(existing.getDepartment(), updated.getDepartment()) &&
                Objects.equals(existing.getSalaryConfigurationId(), updated.getSalaryConfigurationId());
    }

}