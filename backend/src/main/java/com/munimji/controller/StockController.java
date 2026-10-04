package com.munimji.controller;

import com.munimji.dto.stock.ExpiryAlertResponse;
import com.munimji.dto.stock.LowStockResponse;
import com.munimji.dto.stock.StockViewResponse;
import com.munimji.service.StockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping
    public ResponseEntity<List<StockViewResponse>> view() {
        return ResponseEntity.ok(stockService.viewStock());
    }

    @GetMapping("/low")
    public ResponseEntity<List<LowStockResponse>> low() {
        return ResponseEntity.ok(stockService.lowStock());
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<ExpiryAlertResponse>> expiring(
            @RequestParam(defaultValue = "60") int days) {
        return ResponseEntity.ok(stockService.expiring(days));
    }

    @GetMapping("/expired")
    public ResponseEntity<List<ExpiryAlertResponse>> expired() {
        return ResponseEntity.ok(stockService.expired());
    }
}
