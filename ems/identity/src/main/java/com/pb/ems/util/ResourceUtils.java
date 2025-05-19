package com.pb.ems.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
@Service
@Slf4j
public class ResourceUtils {

    public static String generateCompanyResourceId(String user) {
        return md5Hash(user);
    }

    public static String md5Hash(String user) {
        try {
            // Using Apache Commons Codec for MD5 hashing
            return DigestUtils.md5Hex(user);
        } catch (Exception e) {
            // Handle exceptions, such as NoSuchAlgorithmException
            e.printStackTrace();
            return null; // Or throw an exception based on your error handling strategy
        }
    }
}
