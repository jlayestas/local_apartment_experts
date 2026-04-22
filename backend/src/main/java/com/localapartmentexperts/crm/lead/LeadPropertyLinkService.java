package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.activity.ActivityService;
import com.localapartmentexperts.crm.common.exception.BusinessException;
import com.localapartmentexperts.crm.common.exception.ResourceNotFoundException;
import com.localapartmentexperts.crm.lead.dto.CreateLeadPropertyLinkRequest;
import com.localapartmentexperts.crm.lead.dto.LeadPropertyLinkDTO;
import com.localapartmentexperts.crm.lead.dto.UpdateLeadPropertyLinkRequest;
import com.localapartmentexperts.crm.property.Property;
import com.localapartmentexperts.crm.property.PropertyRepository;
import com.localapartmentexperts.crm.user.User;
import com.localapartmentexperts.crm.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LeadPropertyLinkService {

    private final LeadPropertyLinkRepository linkRepository;
    private final LeadRepository leadRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    // ── List ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<LeadPropertyLinkDTO> getLinksForLead(UUID leadId) {
        if (!leadRepository.existsById(leadId)) {
            throw new ResourceNotFoundException("Lead", leadId);
        }
        return linkRepository.findByLeadIdOrderByCreatedAtDesc(leadId)
                .stream()
                .map(LeadPropertyLinkDTO::from)
                .toList();
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public LeadPropertyLinkDTO create(UUID leadId, CreateLeadPropertyLinkRequest req,
                                      String actorEmail) {
        Lead lead = findLead(leadId);
        Property property = findProperty(req.propertyId());
        User actor = resolveUser(actorEmail);

        // Validate uniqueness: a lead cannot have the same link_type for the same property twice
        if (linkRepository.existsByLeadIdAndPropertyIdAndLinkType(
                leadId, req.propertyId(), req.linkType())) {
            throw new BusinessException(
                    "This lead already has a '" + req.linkType() + "' link to this property. "
                    + "Use PATCH to update the existing link or POST a different link type.");
        }

        // Reject blank notes — the DB enforces this too but an early check gives a clearer message
        if (req.note() != null && req.note().isBlank()) {
            throw new BusinessException("Note must not be blank. Omit the field to leave it empty.");
        }

        LeadPropertyLink link = LeadPropertyLink.builder()
                .lead(lead)
                .property(property)
                .linkType(req.linkType())
                .note(req.note() != null ? req.note().trim() : null)
                .createdBy(actor)
                .build();

        link = linkRepository.save(link);

        activityService.recordPropertyLinked(
                lead, actor,
                property.getId(), property.getTitle(),
                req.linkType().name());

        return LeadPropertyLinkDTO.from(link);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public LeadPropertyLinkDTO update(UUID leadId, UUID linkId,
                                      UpdateLeadPropertyLinkRequest req,
                                      String actorEmail) {
        Lead lead = findLead(leadId);
        LeadPropertyLink link = findLink(linkId);
        User actor = resolveUser(actorEmail);

        // Make sure the link actually belongs to this lead
        if (!link.getLead().getId().equals(leadId)) {
            throw new ResourceNotFoundException("LeadPropertyLink", linkId);
        }

        boolean changed = false;

        // Update link_type if provided and different
        if (req.getLinkType() != null && req.getLinkType() != link.getLinkType()) {
            // Validate uniqueness for the new link_type
            if (linkRepository.existsByLeadIdAndPropertyIdAndLinkType(
                    leadId, link.getProperty().getId(), req.getLinkType())) {
                throw new BusinessException(
                        "This lead already has a '" + req.getLinkType() + "' link to this property.");
            }
            link.setLinkType(req.getLinkType());
            changed = true;
        }

        // Update note if provided (empty string clears the note)
        if (req.getNote() != null) {
            String trimmed = req.getNote().trim();
            if (!trimmed.isEmpty() && !trimmed.equals(link.getNote())) {
                link.setNote(trimmed);
                changed = true;
            } else if (trimmed.isEmpty() && link.getNote() != null) {
                link.setNote(null);
                changed = true;
            }
        }

        link = linkRepository.save(link);

        if (changed) {
            activityService.recordPropertyLinkUpdated(
                    lead, actor,
                    link.getProperty().getId(), link.getProperty().getTitle(),
                    link.getLinkType().name());
        }

        // Re-fetch with eager joins so the DTO is fully populated
        return linkRepository.findByIdWithDetails(link.getId())
                .map(LeadPropertyLinkDTO::from)
                .orElseThrow(() -> new ResourceNotFoundException("LeadPropertyLink", linkId));
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public void delete(UUID leadId, UUID linkId, String actorEmail) {
        Lead lead = findLead(leadId);
        LeadPropertyLink link = findLink(linkId);
        User actor = resolveUser(actorEmail);

        if (!link.getLead().getId().equals(leadId)) {
            throw new ResourceNotFoundException("LeadPropertyLink", linkId);
        }

        // Capture property info before deletion for the activity record
        UUID propertyId = link.getProperty().getId();
        String propertyTitle = link.getProperty().getTitle();
        String linkType = link.getLinkType().name();

        linkRepository.delete(link);

        activityService.recordPropertyUnlinked(lead, actor, propertyId, propertyTitle, linkType);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Lead findLead(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead", id));
    }

    private Property findProperty(UUID id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", id));
    }

    private LeadPropertyLink findLink(UUID id) {
        return linkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeadPropertyLink", id));
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
