package com.localapartmentexperts.crm.property.image.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

/**
 * Body for the reorder endpoint.
 *
 * <p>{@code orderedIds} must list every image ID that belongs to the property, in the
 * desired display order.  The service validates this and rejects partial lists.
 */
public record ReorderImagesRequest(
        @NotEmpty List<UUID> orderedIds
) {}
