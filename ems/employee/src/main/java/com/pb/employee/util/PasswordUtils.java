package com.pb.employee.util;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

public class PasswordUtils {

    public static String generateStrongPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        password.append((char) (random.nextInt(26) + 97));
        password.append((char) (random.nextInt(10) + 48));  // Digits: 0-9
        String remainingChars = random.ints(6, 33, 127) // Generate 7 random ASCII characters (33 to 126)
                .mapToObj(i -> String.valueOf((char) i))
                .collect(Collectors.joining());
        password.append(remainingChars);
        return password.chars()
                .mapToObj(c -> (char) c)
                .collect(Collectors.collectingAndThen(Collectors.toList(), list -> {
                    java.util.Collections.shuffle(list);
                    return list.stream().map(String::valueOf).collect(Collectors.joining());
                }));
    }

}
