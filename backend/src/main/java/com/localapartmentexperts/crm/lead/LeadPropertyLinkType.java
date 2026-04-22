package com.localapartmentexperts.crm.lead;

/**
 * Stage of a lead's relationship with a specific property.
 *
 * <p>Multiple link types for the same (lead, property) pair may coexist as
 * separate rows to capture the full progression over time.
 * The unique constraint on (lead_id, property_id, link_type) prevents
 * duplicate entries for the same stage.
 */
public enum LeadPropertyLinkType {
    /** An agent proposed this property to the lead. */
    SUGGESTED,

    /** The lead expressed interest (self-reported or agent-noted). */
    INTERESTED,

    /** The lead visited the property in person or virtually. */
    TOURED,

    /** The lead declined this property. */
    REJECTED
}
