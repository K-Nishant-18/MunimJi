package com.munimji.security;

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

/**
 * Role rules: STAFF may only read categories/products/stock and create/read
 * invoices. Everything else needs the OWNER token.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityRulesTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper om;

    @Test
    void unauthenticated_products_returns401JsonBody() throws Exception {
        mvc.perform(get("/api/products"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Please login first"));
    }

    @Test
    void staff_createCategory_returns403() throws Exception {
        String staffToken = login("staff@munimji.local", "staff123");

        mvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of("name", "Staff Try"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void staff_reports_returns403() throws Exception {
        String staffToken = login("staff@munimji.local", "staff123");

        mvc.perform(get("/api/reports/summary")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void staff_createInvoice_returns201() throws Exception {
        String staffToken = login("staff@munimji.local", "staff123");

        mvc.perform(post("/api/invoices")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of(
                                "items", java.util.List.of(Map.of("productId", 5, "quantity", 1))))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.invoiceNumber").isNotEmpty());
    }

    @Test
    void staff_readInvoices_returns200() throws Exception {
        String staffToken = login("staff@munimji.local", "staff123");

        mvc.perform(get("/api/invoices")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    // The JWT filter leaves the logged in user on the thread; clear it so the
    // next test starts unauthenticated
    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private String login(String email, String password) throws Exception {
        String body = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return om.readTree(body).get("token").asText();
    }
}
