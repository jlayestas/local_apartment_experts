package com.localapartmentexperts.crm.lead.dto;

import com.localapartmentexperts.crm.lead.LeadNote;
import com.localapartmentexperts.crm.user.User;

import java.time.Instant;
import java.util.UUID;

public record NoteDTO(
        UUID id,
        UUID leadId,
        UUID authorId,
        String authorName,
        String body,
        Instant createdAt
) {

    public static NoteDTO from(LeadNote note) {
        User author = note.getAuthor();
        return new NoteDTO(
                note.getId(),
                note.getLead().getId(),
                author.getId(),
                author.getFirstName() + " " + author.getLastName(),
                note.getBody(),
                note.getCreatedAt()
        );
    }
}
