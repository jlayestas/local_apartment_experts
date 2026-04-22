package com.localapartmentexperts.crm.lead;

import com.localapartmentexperts.crm.activity.ActivityService;
import com.localapartmentexperts.crm.common.exception.ResourceNotFoundException;
import com.localapartmentexperts.crm.lead.dto.CreateNoteRequest;
import com.localapartmentexperts.crm.lead.dto.NoteDTO;
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
public class LeadNoteService {

    private final LeadNoteRepository leadNoteRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    // ── Create note ───────────────────────────────────────────────────────────

    public NoteDTO create(UUID leadId, CreateNoteRequest req, String actorEmail) {
        Lead lead = findLead(leadId);
        User author = resolveUser(actorEmail);

        LeadNote note = LeadNote.builder()
                .lead(lead)
                .author(author)
                .body(req.body())
                .build();

        note = leadNoteRepository.save(note);

        activityService.recordNoteAdded(lead, author, note.getId(), note.getBody());

        return NoteDTO.from(note);
    }

    // ── List notes ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NoteDTO> getLeadNotes(UUID leadId) {
        if (!leadRepository.existsById(leadId)) {
            throw new ResourceNotFoundException("Lead", leadId);
        }
        return leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(leadId)
                .stream()
                .map(NoteDTO::from)
                .toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Lead findLead(UUID leadId) {
        return leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead", leadId));
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Author user not found: " + email));
    }
}
