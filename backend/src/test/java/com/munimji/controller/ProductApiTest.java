package com.munimji.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProductApiTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper om;

    @Test
    void create_product_returns201WithBody() throws Exception {
        String ownerToken = login();

        mvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of(
                                "name", "Test Widget", "barcode", "TEST-0001", "unit", "pcs",
                                "hsnCode", "9999", "gstRate", 18, "sellingPrice", 99.90,
                                "reorderLevel", 5, "categoryId", 1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Test Widget"));
    }

    @Test
    void create_duplicateBarcode_returns409() throws Exception {
        String ownerToken = login();

        mvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of(
                                "name", "Rice Copy", "barcode", "8901234000011", "unit", "pouch",
                                "gstRate", 5, "sellingPrice", 440, "reorderLevel", 10))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void create_blankName_returns400WithMessage() throws Exception {
        String ownerToken = login();

        mvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"unit\":\"pcs\",\"gstRate\":5,"
                                + "\"sellingPrice\":10,\"reorderLevel\":1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("name is required")));
    }

    @Test
    void list_respectsPageSizeAndTotals() throws Exception {
        String ownerToken = login();

        mvc.perform(get("/api/products?size=5&page=0")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(5))
                .andExpect(jsonPath("$.totalElements").value(20))
                .andExpect(jsonPath("$.totalPages").value(4));
    }

    // The JWT filter leaves the logged in user on the thread; clear it so the
    // next test starts unauthenticated
    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private String login() throws Exception {
        String body = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(
                                Map.of("email", "owner@munimji.local", "password", "owner123"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return om.readTree(body).get("token").asText();
    }
}
