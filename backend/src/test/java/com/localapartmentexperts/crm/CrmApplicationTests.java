package com.localapartmentexperts.crm;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class CrmApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the Spring context starts without errors.
        // Requires a running PostgreSQL instance (docker compose up).
    }
}
