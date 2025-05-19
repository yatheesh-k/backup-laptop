package com.pb.employee.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
@Service
@Slf4j
public class TaxCalculatorUtils {

    public static double getOldTax(double salary) {
        // Lies under tax rebate limit
        if (salary <= 500000) {
            return 0;
        }
        if (salary <= 1000000) {
            return (salary - 500000) * 0.2
                    + (250000 * 0.05);
        }
        return (salary - 1000000) * 0.3 + (500000 * 0.2)
                + (250000 * 0.05);
    }

    public static double getNewTax(double salary) {
        double tax = 0;
        double newSalary = salary - 75000;

        if (newSalary <= 300000) {
            return 0; // No tax
        } else if (newSalary <= 700000) {
            tax += (newSalary - 300000) * 0.05;
        } else if (newSalary <= 1000000) {
            tax += (400000 * 0.05); // 3-7 lakh slab
            tax += (newSalary - 700000) * 0.10;
        } else if (newSalary <= 1200000) {
            tax += (400000 * 0.05); // 3-7 lakh slab
            tax += (300000 * 0.10); // 7-10 lakh slab
            tax += (newSalary - 1000000) * 0.15;
        } else if (newSalary <= 1500000) {
            tax += (400000 * 0.05); // 3-7 lakh slab
            tax += (300000 * 0.10); // 7-10 lakh slab
            tax += (200000 * 0.15); // 10-12 lakh slab
            tax += (newSalary - 1200000) * 0.20;
        } else {
            tax += (400000 * 0.05); // 3-7 lakh slab
            tax += (300000 * 0.10); // 7-10 lakh slab
            tax += (200000 * 0.15); // 10-12 lakh slab
            tax += (300000 * 0.20); // 12-15 lakh slab
            tax += (newSalary - 1500000) * 0.30;
        }

        // Add additional 4% charge
        tax += tax * 0.04;

        return tax;
    }




    public static double getPfTax(double salary) {
        if (salary <= 180000) {
            // Return 0 if salary is less than or equal to 15000
            return 0;
        } else if (salary <= 240000) {
            // Return a fixed amount or percentage for salary between 15001 and 20000
            return 150*12;
        } else {
            // Return a different fixed amount or percentage for salary above 20000
            return 200*12;
        }
    }

}
