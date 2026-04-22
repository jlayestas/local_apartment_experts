-- Drop the no-self-assign check on lead_assignments.
-- In a small team an agent routinely creates and assigns leads to themselves,
-- making this constraint a hard blocker with no real-world value.
ALTER TABLE lead_assignments
    DROP CONSTRAINT chk_assignments_no_self_assign;
