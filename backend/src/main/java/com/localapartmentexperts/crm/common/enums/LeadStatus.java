package com.localapartmentexperts.crm.common.enums;

import java.util.EnumSet;
import java.util.Set;

public enum LeadStatus {
    NEW,
    CONTACT_ATTEMPTED,
    CONTACTED,
    QUALIFIED,
    APPOINTMENT_SCHEDULED,
    APPLICATION_IN_PROGRESS,
    CLOSED_WON,
    CLOSED_LOST,
    UNRESPONSIVE;

    private static final Set<LeadStatus> TERMINAL = EnumSet.of(CLOSED_WON, CLOSED_LOST);
    private static final Set<LeadStatus> OPEN     = EnumSet.complementOf(EnumSet.copyOf(TERMINAL));

    /** Returns true for CLOSED_WON and CLOSED_LOST — no further transitions allowed. */
    public boolean isTerminal() {
        return TERMINAL.contains(this);
    }

    /** Returns true for all statuses that are not terminal. */
    public boolean isOpen() {
        return OPEN.contains(this);
    }

    /** All terminal statuses as an immutable set — useful for @Query exclusion lists. */
    public static Set<LeadStatus> terminalStatuses() {
        return TERMINAL;
    }

    /** All open statuses as an immutable set. */
    public static Set<LeadStatus> openStatuses() {
        return OPEN;
    }
}
