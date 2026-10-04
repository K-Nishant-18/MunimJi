package com.munimji.dto.supplier;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SupplierRequest {

    @NotBlank(message = "is required")
    @Size(max = 200, message = "must be under 200 characters")
    private String name;

    @Size(max = 20, message = "must be under 20 characters")
    private String phone;

    @Size(max = 100, message = "must be under 100 characters")
    private String email;

    @Size(max = 300, message = "must be under 300 characters")
    private String address;

    @Size(max = 20, message = "must be under 20 characters")
    private String gstin;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getGstin() {
        return gstin;
    }

    public void setGstin(String gstin) {
        this.gstin = gstin;
    }
}
