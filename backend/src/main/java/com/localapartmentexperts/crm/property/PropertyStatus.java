package com.localapartmentexperts.crm.property;

/**
 * Publishing lifecycle of a {@link Property}.
 *
 * <ul>
 *   <li>{@code DRAFT}     – created internally; not visible on the public website.</li>
 *   <li>{@code PUBLISHED} – live on the public website; {@code published_at} must be set.</li>
 *   <li>{@code ARCHIVED}  – removed from the website; data retained for history.</li>
 * </ul>
 *
 * <p>Prefer {@code ARCHIVED} over hard delete so that lead-property link history
 * and agent notes are preserved.
 */
public enum PropertyStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED
}
