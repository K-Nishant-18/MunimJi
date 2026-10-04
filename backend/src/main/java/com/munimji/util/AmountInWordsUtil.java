package com.munimji.util;

/**
 * Converts an amount to words using the Indian numbering system
 * (crore, lakh, thousand). Used on the PDF invoice.
 */
public final class AmountInWordsUtil {

    private static final String[] ONES = {
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
            "Seventeen", "Eighteen", "Nineteen"
    };

    private static final String[] TENS = {
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };

    private AmountInWordsUtil() {
    }

    /**
     * Example: 21280.50 -> "Twenty One Thousand Two Hundred Eighty Rupees and Fifty Paise Only"
     */
    public static String convert(java.math.BigDecimal amount) {
        long rupees = amount.longValue();
        int paise = amount.remainder(java.math.BigDecimal.ONE)
                .multiply(java.math.BigDecimal.valueOf(100))
                .intValue();

        if (rupees == 0 && paise == 0) {
            return "Zero Rupees Only";
        }

        StringBuilder words = new StringBuilder();
        if (rupees > 0) {
            words.append(numberToWords(rupees)).append(" Rupees");
        }
        if (paise > 0) {
            if (words.length() > 0) {
                words.append(" and ");
            }
            words.append(numberToWords(paise)).append(" Paise");
        }
        words.append(" Only");
        return words.toString();
    }

    // Splits the number into crore / lakh / thousand / hundred / rest parts
    private static String numberToWords(long number) {
        if (number == 0) {
            return "Zero";
        }
        StringBuilder result = new StringBuilder();

        long crore = number / 10000000;
        long lakh = (number % 10000000) / 100000;
        long thousand = (number % 100000) / 1000;
        long hundred = (number % 1000) / 100;
        long rest = number % 100;

        if (crore > 0) {
            append(result, twoDigitWords(crore) + " Crore");
        }
        if (lakh > 0) {
            append(result, twoDigitWords(lakh) + " Lakh");
        }
        if (thousand > 0) {
            append(result, twoDigitWords(thousand) + " Thousand");
        }
        if (hundred > 0) {
            append(result, ONES[(int) hundred] + " Hundred");
        }
        if (rest > 0) {
            append(result, twoDigitWords(rest));
        }
        return result.toString();
    }

    private static String twoDigitWords(long number) {
        if (number < 20) {
            return ONES[(int) number];
        }
        long tensPart = number / 10;
        long onesPart = number % 10;
        if (onesPart == 0) {
            return TENS[(int) tensPart];
        }
        return TENS[(int) tensPart] + " " + ONES[(int) onesPart];
    }

    private static void append(StringBuilder result, String part) {
        if (result.length() > 0) {
            result.append(" ");
        }
        result.append(part);
    }
}
