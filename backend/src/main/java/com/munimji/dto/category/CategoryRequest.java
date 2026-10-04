package com.munimji.dto.category;

import jakarta.validation.constraints.NotBlank;

public class CategoryRequest {

    @NotBlank(message = "is required")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
