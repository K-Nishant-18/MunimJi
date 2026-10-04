package com.munimji.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * All money values are BigDecimal rounded HALF_UP to 2 decimals.
 */
public final class MoneyUtil {

    private MoneyUtil() {
    }

    public static final BigDecimal TWO = BigDecimal.valueOf(2);
    public static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    public static BigDecimal round(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal zero() {
        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }
}
