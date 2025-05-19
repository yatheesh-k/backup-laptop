package com.pb.employee.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class EmailUtils {

    @Value("${mail.subject}")
    public String subject;

    @Value("${mail.text}")
    public String text;

    @Autowired
    public JavaMailSender javaMailSender;

    public void sendRegistrationEmail(String emailId, String url,String name, String defaultPassword) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(emailId);
        mailMessage.setSubject(subject);

        String mailText = text;
        // Replace placeholders in the mail text
        String formattedText = mailText.replace("{emailId}", emailId);
        formattedText = formattedText.replace("{url}", url);  // Finally replace the URL
        formattedText = formattedText.replace("{name}", name);// Finally replace the URL
        formattedText = formattedText.replace("{password}", defaultPassword);

        mailMessage.setText(formattedText);
        javaMailSender.send(mailMessage);
        log.info("Credentials sent to the Email...");
    }

    public static String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme(); // http or https
        String serverName = request.getServerName(); // localhost or IP address
        return scheme + "://" + serverName + "/";
    }
}
