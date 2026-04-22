package com.localapartmentexperts.crm.activity;

import com.localapartmentexperts.crm.activity.dto.ActivityDTO;
import com.localapartmentexperts.crm.common.enums.ActivityType;
import com.localapartmentexperts.crm.common.enums.ContactMethod;
import com.localapartmentexperts.crm.common.enums.LeadStatus;
import com.localapartmentexperts.crm.lead.Lead;
import com.localapartmentexperts.crm.property.Property;
import com.localapartmentexperts.crm.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Internal service for recording and querying lead activity events.
 *
 * <p>Callers should use the named {@code record*()} methods rather than the
 * generic {@link #record} overloads — the named methods enforce correct metadata
 * shapes and make call sites self-documenting.
 *
 * <p>All writes are fire-and-forget within the caller's transaction. No async,
 * no events. If the caller is not already in a transaction, one is created.
 */
@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    // ── Named record methods ──────────────────────────────────────────────────

    /** Records that a new lead was created. */
    public void recordLeadCreated(Lead lead, User actor) {
        record(lead, actor, ActivityType.LEAD_CREATED, Map.of());
    }

    /**
     * Records that general lead fields were updated (phone, email, neighborhoods, etc.).
     *
     * @param changedFields map of field name → new value, e.g. {"phone": "+1 555 9999"}
     */
    public void recordLeadUpdated(Lead lead, User actor, Map<String, Object> changedFields) {
        record(lead, actor, ActivityType.LEAD_UPDATED,
                changedFields != null ? changedFields : Map.of());
    }

    /**
     * Records a lead status transition.
     *
     * @param from previous status — nullable when recording the initial status on creation
     * @param to   new status — never null
     */
    public void recordStatusChanged(Lead lead, User actor, LeadStatus from, LeadStatus to) {
        Map<String, Object> meta = new HashMap<>();
        if (from != null) {
            meta.put("from", from.name());
        }
        meta.put("to", to.name());
        record(lead, actor, ActivityType.STATUS_CHANGED, meta);
    }

    /**
     * Records a lead assignment event.
     *
     * @param assignedTo the user the lead was assigned to — nullable when unassigning
     */
    public void recordAssigned(Lead lead, User actor, User assignedTo) {
        Map<String, Object> meta = new HashMap<>();
        if (assignedTo != null) {
            meta.put("assignedToId", assignedTo.getId().toString());
            meta.put("assignedToName", assignedTo.getFirstName() + " " + assignedTo.getLastName());
        }
        record(lead, actor, ActivityType.ASSIGNED, meta);
    }

    /**
     * Records that a note was added to a lead.
     * The preview is truncated to 80 characters to keep the timeline scannable.
     *
     * @param noteId   the persisted ID of the new note
     * @param noteBody full body text of the note
     */
    public void recordNoteAdded(Lead lead, User actor, UUID noteId, String noteBody) {
        String preview = (noteBody != null && noteBody.length() > 80)
                ? noteBody.substring(0, 80) + "…"
                : (noteBody != null ? noteBody : "");
        Map<String, Object> meta = new HashMap<>();
        meta.put("noteId", noteId.toString());
        meta.put("preview", preview);
        record(lead, actor, ActivityType.NOTE_ADDED, meta);
    }

    /**
     * Records that a follow-up date was set or changed.
     *
     * @param date the new follow-up date — nullable when clearing the follow-up
     */
    public void recordFollowUpSet(Lead lead, User actor, LocalDate date) {
        Map<String, Object> meta = date != null
                ? Map.of("date", date.toString())
                : Map.of();
        record(lead, actor, ActivityType.FOLLOW_UP_SET, meta);
    }

    /**
     * Records that the preferred contact method was changed.
     *
     * @param from previous method — nullable if method was not set before
     * @param to   new method — never null
     */
    public void recordContactMethodUpdated(Lead lead, User actor, ContactMethod from, ContactMethod to) {
        Map<String, Object> meta = new HashMap<>();
        if (from != null) {
            meta.put("from", from.name());
        }
        meta.put("to", to.name());
        record(lead, actor, ActivityType.CONTACT_METHOD_UPDATED, meta);
    }

    // ── Property record methods ───────────────────────────────────────────────

    /** Records that a new property listing was created. */
    public void recordPropertyCreated(Property property, User actor) {
        recordForProperty(property, actor, ActivityType.PROPERTY_CREATED, Map.of());
    }

    /**
     * Records that property fields were updated.
     *
     * @param changedFields map of field name → new value
     */
    public void recordPropertyUpdated(Property property, User actor, Map<String, Object> changedFields) {
        recordForProperty(property, actor, ActivityType.PROPERTY_UPDATED,
                changedFields != null ? changedFields : Map.of());
    }

    /** Records that the property was published (status → PUBLISHED). */
    public void recordPropertyPublished(Property property, User actor) {
        recordForProperty(property, actor, ActivityType.PROPERTY_PUBLISHED, Map.of());
    }

    /** Records that a published property was reverted to draft (status → DRAFT). */
    public void recordPropertyUnpublished(Property property, User actor) {
        recordForProperty(property, actor, ActivityType.PROPERTY_UNPUBLISHED, Map.of());
    }

    /** Records that the property was archived (status → ARCHIVED). */
    public void recordPropertyArchived(Property property, User actor) {
        recordForProperty(property, actor, ActivityType.PROPERTY_ARCHIVED, Map.of());
    }

    // ── Property image record methods ─────────────────────────────────────────

    /**
     * Records that a new image was uploaded to the property gallery.
     *
     * @param imageId the persisted ID of the new image
     * @param cover   true if this image was automatically promoted to cover (first upload)
     */
    public void recordPropertyImageUploaded(Property property, User actor, UUID imageId, boolean cover) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("imageId", imageId.toString());
        meta.put("cover", cover);
        recordForProperty(property, actor, ActivityType.PROPERTY_IMAGE_UPLOADED, meta);
    }

    /**
     * Records that an image was removed from the property gallery.
     *
     * @param imageId  ID of the deleted image
     * @param wasCover true if the deleted image was the cover (triggers auto-promotion)
     */
    public void recordPropertyImageDeleted(Property property, User actor, UUID imageId, boolean wasCover) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("imageId", imageId.toString());
        meta.put("wasCover", wasCover);
        recordForProperty(property, actor, ActivityType.PROPERTY_IMAGE_DELETED, meta);
    }

    /**
     * Records that the cover image was manually changed.
     *
     * @param imageId ID of the image promoted to cover
     */
    public void recordPropertyImageCoverChanged(Property property, User actor, UUID imageId) {
        recordForProperty(property, actor, ActivityType.PROPERTY_IMAGE_COVER_CHANGED,
                Map.of("imageId", imageId.toString()));
    }

    /**
     * Records that the gallery image order was changed.
     *
     * @param count total number of images that were reordered
     */
    public void recordPropertyImagesReordered(Property property, User actor, int count) {
        recordForProperty(property, actor, ActivityType.PROPERTY_IMAGE_REORDERED,
                Map.of("count", count));
    }

    // ── Lead-property link record methods ─────────────────────────────────────

    /**
     * Records on the lead timeline that a property was linked (any initial link type).
     *
     * @param propertyId    ID of the linked property
     * @param propertyTitle title of the linked property
     * @param linkType      the link type string (e.g. "SUGGESTED")
     */
    public void recordPropertyLinked(Lead lead, User actor,
                                     UUID propertyId, String propertyTitle, String linkType) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("propertyId", propertyId.toString());
        meta.put("propertyTitle", propertyTitle);
        meta.put("linkType", linkType);
        record(lead, actor, ActivityType.PROPERTY_LINKED, meta);
    }

    /**
     * Records on the lead timeline that an existing property link was updated.
     *
     * @param propertyId    ID of the linked property
     * @param propertyTitle title of the linked property
     * @param linkType      updated link type string (may be same as before if only note changed)
     */
    public void recordPropertyLinkUpdated(Lead lead, User actor,
                                          UUID propertyId, String propertyTitle, String linkType) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("propertyId", propertyId.toString());
        meta.put("propertyTitle", propertyTitle);
        meta.put("linkType", linkType);
        record(lead, actor, ActivityType.PROPERTY_LINK_UPDATED, meta);
    }

    /**
     * Records on the lead timeline that a property link was removed.
     *
     * @param propertyId    ID of the unlinked property
     * @param propertyTitle title of the unlinked property
     * @param linkType      the link type that was removed (e.g. "SUGGESTED")
     */
    public void recordPropertyUnlinked(Lead lead, User actor,
                                       UUID propertyId, String propertyTitle, String linkType) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("propertyId", propertyId.toString());
        meta.put("propertyTitle", propertyTitle);
        meta.put("linkType", linkType);
        record(lead, actor, ActivityType.PROPERTY_UNLINKED, meta);
    }

    // ── Timeline query ────────────────────────────────────────────────────────

    /**
     * Returns the full activity timeline for a lead, newest first.
     * Caller is responsible for verifying the lead exists before calling this.
     */
    @Transactional(readOnly = true)
    public List<ActivityDTO> getLeadTimeline(UUID leadId) {
        return activityRepository.findByLeadIdOrderByCreatedAtDesc(leadId)
                .stream()
                .map(ActivityDTO::from)
                .toList();
    }

    /**
     * Returns the full activity timeline for a property, newest first.
     * Caller is responsible for verifying the property exists before calling this.
     */
    @Transactional(readOnly = true)
    public List<ActivityDTO> getPropertyTimeline(UUID propertyId) {
        return activityRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId)
                .stream()
                .map(ActivityDTO::from)
                .toList();
    }

    // ── Generic record (for internal use and tests) ───────────────────────────

    /**
     * Low-level record method. Prefer the named {@code record*()} overloads at call sites.
     *
     * @param metadata event payload — null is treated as an empty map
     */
    public void record(Lead lead, User actor, ActivityType type, Map<String, Object> metadata) {
        Activity activity = Activity.builder()
                .lead(lead)
                .actor(actor)
                .activityType(type)
                .metadata(metadata != null ? new HashMap<>(metadata) : new HashMap<>())
                .build();
        activityRepository.save(activity);
    }

    /** Convenience overload for events with no metadata. */
    public void record(Lead lead, User actor, ActivityType type) {
        record(lead, actor, type, null);
    }

    // ── Property-specific record (internal) ──────────────────────────────────

    private void recordForProperty(Property property, User actor, ActivityType type,
                                   Map<String, Object> metadata) {
        Activity activity = Activity.builder()
                .property(property)
                .actor(actor)
                .activityType(type)
                .metadata(metadata != null ? new HashMap<>(metadata) : new HashMap<>())
                .build();
        activityRepository.save(activity);
    }
}
