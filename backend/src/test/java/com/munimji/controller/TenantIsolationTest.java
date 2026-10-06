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

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Multi-owner (multi-tenant) isolation:
 * every shop only ever sees its own categories, products, invoices and reports.
 * Seeded data (owner_id = 1) belongs to owner@munimji.local; every test here
 * registers a fresh second owner and proves the two shops never leak into
 * each other.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TenantIsolationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper om;

    @Test
    void newOwner_startsWithEmptyShop_whileSeededOwnerKeepsData() throws Exception {
        String ownerTwo = registerOwner("Owner Two", "ownertwo@test.local");

        mvc.perform(get("/api/categories").header("Authorization", bearer(ownerTwo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/categories").header("Authorization", bearer(ownerToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6));

        mvc.perform(get("/api/products").header("Authorization", bearer(ownerTwo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(get("/api/products").header("Authorization", bearer(ownerToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(20));

        mvc.perform(get("/api/invoices").header("Authorization", bearer(ownerTwo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(get("/api/invoices").header("Authorization", bearer(ownerToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void newOwner_cannotReadOtherShopsInvoice() throws Exception {
        String ownerTwo = registerOwner("Owner Two", "ownertwo@test.local");

        mvc.perform(get("/api/invoices/1").header("Authorization", bearer(ownerTwo)))
                .andExpect(status().isNotFound());

        mvc.perform(get("/api/invoices/1").header("Authorization", bearer(ownerToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invoiceNumber").isNotEmpty());
    }

    @Test
    void newOwner_invoiceWithOtherShopsProduct_returns404() throws Exception {
        String ownerTwo = registerOwner("Owner Two", "ownertwo@test.local");

        mvc.perform(post("/api/invoices")
                        .header("Authorization", bearer(ownerTwo))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of(
                                "items", List.of(Map.of("productId", 1, "quantity", 1))))))
                .andExpect(status().isNotFound());
    }

    @Test
    void categoryNamesAreUniquePerShop_notGlobally() throws Exception {
        // Seeded owner already has a "Kirana" category -> conflict inside his shop
        mvc.perform(post("/api/categories")
                        .header("Authorization", bearer(ownerToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of("name", "Kirana"))))
                .andExpect(status().isConflict());

        // A second shop may use the exact same name
        String ownerTwo = registerOwner("Owner Two", "ownertwo@test.local");
        mvc.perform(post("/api/categories")
                        .header("Authorization", bearer(ownerTwo))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of("name", "Kirana"))))
                .andExpect(status().isCreated());

        // ...but only once inside its own shop
        mvc.perform(post("/api/categories")
                        .header("Authorization", bearer(ownerTwo))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of("name", "Kirana"))))
                .andExpect(status().isConflict());
    }

    @Test
    void ownerAddsStaff_scopedToThatOwnersShopOnly() throws Exception {
        String ownerTwo = registerOwner("Owner Two", "ownertwo@test.local");

        mvc.perform(post("/api/categories")
                        .header("Authorization", bearer(ownerToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of("name", "Owner One Only"))))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/categories")
                        .header("Authorization", bearer(ownerTwo))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of("name", "Owner Two Only"))))
                .andExpect(status().isCreated());

        String staffTwo = registerStaff(ownerTwo, "Staff Two", "stafftwo@test.local");

        // The staff member sees only his own shop's categories
        mvc.perform(get("/api/categories").header("Authorization", bearer(staffTwo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Owner Two Only"));

        // Staff may not create more users, even for their own shop
        mvc.perform(post("/api/auth/register")
                        .header("Authorization", bearer(staffTwo))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of(
                                "name", "Staff Try", "email", "stafftry@test.local",
                                "password", "secret123", "role", "STAFF"))))
                .andExpect(status().isForbidden());

        // Staff still hits the role rules at the security layer
        mvc.perform(post("/api/categories")
                        .header("Authorization", bearer(staffTwo))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of("name", "Staff Try"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void reportsAreScopedToOwnShop() throws Exception {
        String ownerTwo = registerOwner("Owner Two", "ownertwo@test.local");

        mvc.perform(get("/api/reports/summary").header("Authorization", bearer(ownerTwo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts").value(0))
                .andExpect(jsonPath("$.totalInvoices").value(0));

        mvc.perform(get("/api/reports/summary").header("Authorization", bearer(ownerToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts").value(20))
                .andExpect(jsonPath("$.totalInvoices").value(2));
    }

    // The JWT filter leaves the logged in user on the thread; clear it so the
    // next test starts unauthenticated
    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private String ownerEmail() {
        return "owner@munimji.local";
    }

    private String ownerToken() throws Exception {
        return login(ownerEmail(), "owner123");
    }

    private String login(String email, String password) throws Exception {
        String body = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return om.readTree(body).get("token").asText();
    }

    private String registerOwner(String name, String email) throws Exception {
        String body = mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of(
                                "name", name, "email", email,
                                "password", "secret123", "role", "OWNER"))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return om.readTree(body).get("token").asText();
    }

    private String registerStaff(String ownerToken, String name, String email) throws Exception {
        String body = mvc.perform(post("/api/auth/register")
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(Map.of(
                                "name", name, "email", email,
                                "password", "secret123", "role", "STAFF"))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return om.readTree(body).get("token").asText();
    }
}
