package com.localapartmentexperts.crm.lead.dto;

import com.localapartmentexperts.crm.lead.LeadPropertyLinkType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Partial update for PATCH /leads/{id}/properties/{linkId}.
 *
 * <p>Null means "leave unchanged". At least one field should be non-null.
 *
 * <p>Changing {@code linkType} is subject to the uniqueness constraint:
 * the new (lead, property, linkType) triple must not already exist.
 */
@Getter
@Setter
@NoArgsConstructor
public class UpdateLeadPropertyLinkRequest {

    /** New link type. Null = leave unchanged. */
    LeadPropertyLinkType linkType;

    /** Updated note. Null = leave unchanged. Send an empty string to clear the note. */
    String note;
}
