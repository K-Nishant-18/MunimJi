package com.munimji.dto.supplier;

public class SupplierResponse {

    private Long id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String gstin;

    public SupplierResponse(Long id, String name, String phone, String email, String address, String gstin) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.gstin = gstin;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getAddress() {
        return address;
    }

    public String getGstin() {
        return gstin;
    }
}
