package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.common.response.ApiResponse;
import com.localapartmentexperts.crm.lead.dto.PublicInquiryRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/leads")
@RequiredArgsConstructor
public class PublicLeadController {

    private final LeadService leadService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> submit(@Valid @RequestBody PublicInquiryRequest request) {
        leadService.createFromWebsite(request);
        return ApiResponse.noContent("Solicitud recibida");
    }
}
