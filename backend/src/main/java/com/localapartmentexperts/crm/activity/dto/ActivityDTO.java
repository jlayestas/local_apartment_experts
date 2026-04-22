package com.localapartmentexperts.crm.activity.dto;

import com.localapartmentexperts.crm.activity.Activity;
import com.localapartmentexperts.crm.common.enums.ActivityType;
import com.localapartmentexperts.crm.user.User;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Read-only projection of an Activity for the frontend timeline component.
 * actorName is pre-composed ("Jane Doe") so the UI doesn't need to join on its side.
 * metadata is passed through as-is — shape varies by activityType (see Activity.java).
 */
public record ActivityDTO(
        UUID id,
        UUID leadId,
        UUID propertyId,
        UUID actorId,
        String actorName,
        ActivityType activityType,
        Map<String, Object> metadata,
        Instant createdAt
) {

    public static ActivityDTO from(Activity activity) {
        User actor = activity.getActor();
        return new ActivityDTO(
                activity.getId(),
                activity.getLead() != null ? activity.getLead().getId() : null,
                activity.getProperty() != null ? activity.getProperty().getId() : null,
                actor != null ? actor.getId() : null,
                actor != null ? actor.getFirstName() + " " + actor.getLastName() : null,
                activity.getActivityType(),
                activity.getMetadata(),
                activity.getCreatedAt()
        );
    }
}
