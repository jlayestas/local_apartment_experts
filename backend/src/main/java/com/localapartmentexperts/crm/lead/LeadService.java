package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.activity.ActivityService;
import com.localapartmentexperts.crm.common.enums.LeadSource;
import com.localapartmentexperts.crm.common.enums.LeadStatus;
import com.localapartmentexperts.crm.common.exception.BusinessException;
import com.localapartmentexperts.crm.common.exception.ResourceNotFoundException;
import com.localapartmentexperts.crm.lead.dto.AssignLeadRequest;
import com.localapartmentexperts.crm.lead.dto.ChangeStatusRequest;
import com.localapartmentexperts.crm.lead.dto.CreateLeadRequest;
import com.localapartmentexperts.crm.lead.dto.LeadDetailDTO;
import com.localapartmentexperts.crm.lead.dto.LeadSummaryDTO;
import com.localapartmentexperts.crm.lead.dto.PublicInquiryRequest;
import com.localapartmentexperts.crm.lead.dto.UpdateLeadRequest;
import com.localapartmentexperts.crm.user.User;
import com.localapartmentexperts.crm.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LeadService {

    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final LeadStatusHistoryRepository statusHistoryRepository;
    private final LeadAssignmentRepository assignmentRepository;
    private final ActivityService activityService;

    // ── Public website lead ───────────────────────────────────────────────────

    public void createFromWebsite(PublicInquiryRequest req) {
        Lead lead = Lead.builder()
                .firstName(req.firstName())
                .lastName(req.lastName())
                .phone(req.phone())
                .email(req.email())
                .message(req.message())
                .source(LeadSource.WEBSITE)
                .build();
        leadRepository.save(lead);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public LeadDetailDTO create(CreateLeadRequest req, String actorEmail) {
        User actor = resolveUser(actorEmail);

        User assignee = req.assignedUserId() != null
                ? resolveAssignableUser(req.assignedUserId())
                : null;

        // Build incrementally so @Builder.Default on urgencyLevel is preserved when caller
        // omits the field — calling .urgencyLevel(null) would override the default to null.
        Lead.LeadBuilder builder = Lead.builder()
                .firstName(req.firstName())
                .lastName(req.lastName())
                .email(req.email())
                .phone(req.phone())
                .whatsappNumber(req.whatsappNumber())
                .preferredContactMethod(req.preferredContactMethod())
                .source(req.source())
                .moveInDate(req.moveInDate())
                .budgetMin(req.budgetMin())
                .budgetMax(req.budgetMax())
                .preferredNeighborhoods(toArray(req.preferredNeighborhoods()))
                .bedroomCount(req.bedroomCount())
                .bathroomCount(req.bathroomCount())
                .message(req.message())
                .languagePreference(req.languagePreference() != null ? req.languagePreference() : "es")
                .lastContactDate(req.lastContactDate())
                .nextFollowUpDate(req.nextFollowUpDate())
                .assignedUser(assignee);

        if (req.urgencyLevel() != null) {
            builder.urgencyLevel(req.urgencyLevel());
        }

        Lead lead = builder.build();

        lead = leadRepository.save(lead);

        // Initial status history — fromStatus NULL signals lead creation
        statusHistoryRepository.save(LeadStatusHistory.builder()
                .lead(lead)
                .fromStatus(null)
                .toStatus(LeadStatus.NEW)
                .changedBy(actor)
                .build());

        // Initial assignment history if assigned at creation
        if (assignee != null) {
            assignmentRepository.save(LeadAssignment.builder()
                    .lead(lead)
                    .assignedTo(assignee)
                    .assignedBy(actor)
                    .build());
        }

        activityService.recordLeadCreated(lead, actor);

        if (assignee != null) {
            activityService.recordAssigned(lead, actor, assignee);
        }

        return LeadDetailDTO.from(lead);
    }

    // ── List ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<LeadSummaryDTO> list(
            String search,
            LeadStatus status,
            UUID assignedUserId,
            LeadSource source,
            Boolean followUpDue,
            LocalDate createdFrom,
            LocalDate createdTo,
            int page,
            int size) {

        Specification<Lead> spec = LeadSpecification.withFilters(
                search, status, assignedUserId, source, followUpDue, createdFrom, createdTo);

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return leadRepository.findAll(spec, pageable).map(LeadSummaryDTO::from);
    }

    // ── Get detail ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public LeadDetailDTO getById(UUID id) {
        return LeadDetailDTO.from(findLead(id));
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public LeadDetailDTO update(UUID id, UpdateLeadRequest req, String actorEmail) {
        User actor = resolveUser(actorEmail);
        Lead lead = findLead(id);

        List<String> changedFields = applyScalarFields(req, lead);

        handleStatusChange(req, lead, actor);
        handleAssignmentChange(req, lead, actor);

        lead = leadRepository.save(lead);

        if (!changedFields.isEmpty()) {
            activityService.recordLeadUpdated(lead, actor, Map.of("fields", changedFields));
        }

        return LeadDetailDTO.from(lead);
    }

    // ── Change status ─────────────────────────────────────────────────────────

    /**
     * Dedicated status-change action. Unlike the general PATCH, this:
     * <ul>
     *   <li>Requires the new status explicitly in its own request body.</li>
     *   <li>Accepts an optional free-text reason stored in lead_status_history.</li>
     *   <li>Guards against further transitions out of terminal statuses.</li>
     * </ul>
     */
    public LeadDetailDTO changeStatus(UUID leadId, ChangeStatusRequest req, String actorEmail) {
        User actor = resolveUser(actorEmail);
        Lead lead = findLead(leadId);

        LeadStatus currentStatus = lead.getStatus();

        if (currentStatus.isTerminal()) {
            throw new BusinessException(
                    "Lead is already in a terminal status (" + currentStatus + ") and cannot be transitioned further");
        }

        if (currentStatus == req.status()) {
            throw new BusinessException("Lead is already in status " + currentStatus);
        }

        lead.setStatus(req.status());
        lead = leadRepository.save(lead);

        statusHistoryRepository.save(LeadStatusHistory.builder()
                .lead(lead)
                .fromStatus(currentStatus)
                .toStatus(req.status())
                .changedBy(actor)
                .note(req.note())
                .build());

        activityService.recordStatusChanged(lead, actor, currentStatus, req.status());

        return LeadDetailDTO.from(lead);
    }

    // ── Assign ────────────────────────────────────────────────────────────────

    /**
     * Dedicated assignment action.
     * No-ops silently if the lead is already assigned to the same user,
     * so the response is always the current state without an error.
     */
    public LeadDetailDTO assign(UUID leadId, AssignLeadRequest req, String actorEmail) {
        User actor = resolveUser(actorEmail);
        Lead lead = findLead(leadId);
        User newAssignee = resolveAssignableUser(req.assignedUserId());

        UUID currentAssigneeId = lead.getAssignedUser() != null
                ? lead.getAssignedUser().getId()
                : null;

        if (newAssignee.getId().equals(currentAssigneeId)) {
            // Already assigned to this user — return current state without side effects
            return LeadDetailDTO.from(lead);
        }

        lead.setAssignedUser(newAssignee);
        lead = leadRepository.save(lead);

        assignmentRepository.save(LeadAssignment.builder()
                .lead(lead)
                .assignedTo(newAssignee)
                .assignedBy(actor)
                .build());

        activityService.recordAssigned(lead, actor, newAssignee);

        return LeadDetailDTO.from(lead);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Applies all non-status, non-assignment scalar fields from the request to the
     * lead entity. Returns the list of field names that were actually changed so
     * the caller can decide whether to record a LEAD_UPDATED activity.
     */
    private List<String> applyScalarFields(UpdateLeadRequest req, Lead lead) {
        List<String> changed = new ArrayList<>();

        if (req.getFirstName() != null) {
            lead.setFirstName(req.getFirstName());
            changed.add("firstName");
        }
        if (req.getLastName() != null) {
            lead.setLastName(req.getLastName());
            changed.add("lastName");
        }
        if (req.getEmail() != null) {
            lead.setEmail(req.getEmail());
            changed.add("email");
        }
        if (req.getPhone() != null) {
            lead.setPhone(req.getPhone());
            changed.add("phone");
        }
        if (req.getWhatsappNumber() != null) {
            lead.setWhatsappNumber(req.getWhatsappNumber());
            changed.add("whatsappNumber");
        }
        if (req.getPreferredContactMethod() != null) {
            lead.setPreferredContactMethod(req.getPreferredContactMethod());
            changed.add("preferredContactMethod");
        }
        if (req.getSource() != null) {
            lead.setSource(req.getSource());
            changed.add("source");
        }
        if (req.getMoveInDate() != null) {
            lead.setMoveInDate(req.getMoveInDate());
            changed.add("moveInDate");
        }
        if (req.getBudgetMin() != null) {
            lead.setBudgetMin(req.getBudgetMin());
            changed.add("budgetMin");
        }
        if (req.getBudgetMax() != null) {
            lead.setBudgetMax(req.getBudgetMax());
            changed.add("budgetMax");
        }
        if (req.getPreferredNeighborhoods() != null) {
            lead.setPreferredNeighborhoods(toArray(req.getPreferredNeighborhoods()));
            changed.add("preferredNeighborhoods");
        }
        if (req.getBedroomCount() != null) {
            lead.setBedroomCount(req.getBedroomCount());
            changed.add("bedroomCount");
        }
        if (req.getBathroomCount() != null) {
            lead.setBathroomCount(req.getBathroomCount());
            changed.add("bathroomCount");
        }
        if (req.getMessage() != null) {
            lead.setMessage(req.getMessage());
            changed.add("message");
        }
        if (req.getLanguagePreference() != null) {
            lead.setLanguagePreference(req.getLanguagePreference());
            changed.add("languagePreference");
        }
        if (req.getUrgencyLevel() != null) {
            lead.setUrgencyLevel(req.getUrgencyLevel());
            changed.add("urgencyLevel");
        }
        if (req.getLastContactDate() != null) {
            lead.setLastContactDate(req.getLastContactDate());
            changed.add("lastContactDate");
        }
        if (Boolean.TRUE.equals(req.getClearNextFollowUpDate())) {
            lead.setNextFollowUpDate(null);
            changed.add("nextFollowUpDate");
        } else if (req.getNextFollowUpDate() != null) {
            lead.setNextFollowUpDate(req.getNextFollowUpDate());
            changed.add("nextFollowUpDate");
        }

        return changed;
    }

    /**
     * If the request contains a new status that differs from the current one,
     * updates the lead, writes a status history row, and records the activity.
     */
    private void handleStatusChange(UpdateLeadRequest req, Lead lead, User actor) {
        if (req.getStatus() == null || req.getStatus() == lead.getStatus()) {
            return;
        }

        LeadStatus oldStatus = lead.getStatus();
        lead.setStatus(req.getStatus());

        statusHistoryRepository.save(LeadStatusHistory.builder()
                .lead(lead)
                .fromStatus(oldStatus)
                .toStatus(req.getStatus())
                .changedBy(actor)
                .build());

        activityService.recordStatusChanged(lead, actor, oldStatus, req.getStatus());
    }

    /**
     * If the request contains an assignedUserId that differs from the current assignee,
     * updates the lead, writes an assignment history row, and records the activity.
     */
    private void handleAssignmentChange(UpdateLeadRequest req, Lead lead, User actor) {
        if (req.getAssignedUserId() == null) {
            return;
        }

        UUID currentAssigneeId = lead.getAssignedUser() != null
                ? lead.getAssignedUser().getId()
                : null;

        if (req.getAssignedUserId().equals(currentAssigneeId)) {
            return;
        }

        User newAssignee = resolveAssignableUser(req.getAssignedUserId());
        lead.setAssignedUser(newAssignee);

        assignmentRepository.save(LeadAssignment.builder()
                .lead(lead)
                .assignedTo(newAssignee)
                .assignedBy(actor)
                .build());

        activityService.recordAssigned(lead, actor, newAssignee);
    }

    private Lead findLead(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead", id));
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Actor user not found: " + email));
    }

    private User resolveAssignableUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Assignee not found: " + userId));
        if (!user.isActive()) {
            throw new BusinessException("Assignee is inactive: " + userId);
        }
        return user;
    }

    private String[] toArray(List<String> list) {
        return list != null ? list.toArray(String[]::new) : null;
    }
}
