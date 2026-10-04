package com.munimji.dto.report;

import java.math.BigDecimal;

public class MonthlySalesResponse {

    private String month;
    private BigDecimal total;

    public MonthlySalesResponse(String month, BigDecimal total) {
        this.month = month;
        this.total = total;
    }

    public String getMonth() {
        return month;
    }

    public BigDecimal getTotal() {
        return total;
    }
}
