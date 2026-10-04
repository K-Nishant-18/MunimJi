package com.munimji.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MoneyUtilTest {

    @Test
    void round_usesHalfUpToTwoDecimals() {
        assertEquals(new BigDecimal("100.56"), MoneyUtil.round(new BigDecimal("100.555")));
        assertEquals(new BigDecimal("3.38"), MoneyUtil.round(new BigDecimal("3.375")));
        assertEquals(2, MoneyUtil.round(new BigDecimal("45")).scale());
    }

    @Test
    void round_nullBecomesZeroWithTwoDecimals() {
        assertEquals(new BigDecimal("0.00"), MoneyUtil.round(null));
        assertEquals(new BigDecimal("0.00"), MoneyUtil.zero());
    }
}
