package com.localapartmentexperts.crm.activity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    /**
     * Full timeline for a lead, newest first.
     * LEFT JOIN FETCH actor avoids N+1 when building ActivityDTOs — actor is
     * nullable (system events have no actor) so the join must be a LEFT join.
     */
    @Query("""
            SELECT a FROM Activity a
            LEFT JOIN FETCH a.actor
            WHERE a.lead.id = :leadId
            ORDER BY a.createdAt DESC
            """)
    List<Activity> findByLeadIdOrderByCreatedAtDesc(@Param("leadId") UUID leadId);

    /**
     * Full timeline for a property, newest first.
     * LEFT JOIN FETCH actor avoids N+1 when building ActivityDTOs — actor is
     * nullable (system events have no actor) so the join must be a LEFT join.
     */
    @Query("""
            SELECT a FROM Activity a
            LEFT JOIN FETCH a.actor
            WHERE a.property.id = :propertyId
            ORDER BY a.createdAt DESC
            """)
    List<Activity> findByPropertyIdOrderByCreatedAtDesc(@Param("propertyId") UUID propertyId);
}
