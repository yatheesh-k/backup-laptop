package com.invoice.config;

import com.invoice.util.Constants;

import java.math.BigDecimal;
import java.text.DecimalFormat;

public class NumberToWordsConverter {

    public static String convert(BigDecimal number) {
        if (number.compareTo(BigDecimal.ZERO) == 0) {
            return Constants.ZEROS;
        }

        String numberStr = new DecimalFormat("#.##").format(number);
        String[] parts = numberStr.split("\\.");
        int integerPart = Integer.parseInt(parts[0]);
        int fractionalPart = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;

        StringBuilder words = new StringBuilder();
        words.append(convertInteger(integerPart));
        if (fractionalPart > 0) {
            words.append(Constants.AND).append(convertInteger(fractionalPart)).append(Constants.PAISE);
        }
        words.append(Constants.ONLY);
        return words.toString();
    }

    private static String convertInteger(int number) {
        if (number < 20) {
            return Constants.UNITS[number];
        } else if (number < 100) {
            return Constants.TENS[number / 10] + (number % 10 != 0 ? " " + Constants.UNITS[number % 10] : "");
        } else if (number < 1000) {
            return Constants.UNITS[number / 100] + Constants.HUNDRED + (number % 100 != 0 ? Constants.AND + convertInteger(number % 100) : "");
        } else if (number < 100000) {
            return convertInteger(number / 1000) + Constants.THOUSAND + (number % 1000 != 0 ? " " + convertInteger(number % 1000) : "");
        } else if (number < 10000000) {
            return convertInteger(number / 100000) + Constants.LAKH + (number % 100000 != 0 ? " " + convertInteger(number % 100000) : "");
        } else {
            return convertInteger(number / 10000000) + Constants.CRORE + (number % 10000000 != 0 ? " " + convertInteger(number % 10000000) : "");
        }
    }
}
