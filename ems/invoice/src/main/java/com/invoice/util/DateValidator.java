package com.invoice.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class DateValidator {
    public static boolean isPastOrPresent(String dateStr) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); // Adjust format if needed
            LocalDate date = LocalDate.parse(dateStr, formatter);
            return !date.isAfter(LocalDate.now()); // Ensures date is not in the future
        } catch (DateTimeParseException e) {
            return false; // Invalid date format
        }
    }
}

