package com.munimji.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AmountInWordsUtilTest {

    @Test
    void convert_showsRupeesAndPaise() {
        assertEquals(
                "Twenty One Thousand Two Hundred Eighty Rupees and Fifty Paise Only",
                AmountInWordsUtil.convert(new BigDecimal("21280.50")));
    }

    @Test
    void convert_handlesZeroAndLakh() {
        assertEquals("Zero Rupees Only", AmountInWordsUtil.convert(BigDecimal.ZERO));
        assertEquals("One Lakh Rupees Only", AmountInWordsUtil.convert(new BigDecimal("100000")));
    }
}
