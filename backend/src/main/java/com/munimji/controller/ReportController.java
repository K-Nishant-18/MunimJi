package com.munimji.controller;

import com.munimji.dto.report.GstSummaryResponse;
import com.munimji.dto.report.MonthlySalesResponse;
import com.munimji.dto.report.ReportSummaryResponse;
import com.munimji.dto.report.TopProductResponse;
import com.munimji.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ReportSummaryResponse> summary() {
        return ResponseEntity.ok(reportService.summary());
    }

    @GetMapping("/monthly-sales")
    public ResponseEntity<List<MonthlySalesResponse>> monthlySales() {
        return ResponseEntity.ok(reportService.monthlySales());
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<TopProductResponse>> topProducts(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(reportService.topProducts(limit));
    }

    @GetMapping("/gst-summary")
    public ResponseEntity<GstSummaryResponse> gstSummary(
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(reportService.gstSummary(month));
    }
}
