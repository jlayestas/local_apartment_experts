package com.localapartmentexperts.crm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.localapartmentexperts.crm.auth.dto.LoginRequest;
import com.localapartmentexperts.crm.common.enums.UserRole;
import com.localapartmentexperts.crm.user.User;
import com.localapartmentexperts.crm.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
public abstract class BaseIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("crm_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    // Fast encoder only for seeding test users — not injected into the app context.
    private static final PasswordEncoder FAST_ENCODER = new BCryptPasswordEncoder(4);

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepository;

    protected static final String ADMIN_EMAIL    = "admin@test.local";
    protected static final String ADMIN_PASSWORD = "TestAdmin1!";
    protected static final String AGENT_EMAIL    = "agent@test.local";
    protected static final String AGENT_PASSWORD = "TestAgent1!";

    @BeforeEach
    void ensureTestUsersExist() {
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            userRepository.saveAndFlush(User.builder()
                    .firstName("Test").lastName("Admin")
                    .email(ADMIN_EMAIL)
                    .passwordHash(FAST_ENCODER.encode(ADMIN_PASSWORD))
                    .role(UserRole.ADMIN).language("es").active(true).build());
        }
        if (!userRepository.existsByEmail(AGENT_EMAIL)) {
            userRepository.saveAndFlush(User.builder()
                    .firstName("Test").lastName("Agent")
                    .email(AGENT_EMAIL)
                    .passwordHash(FAST_ENCODER.encode(AGENT_PASSWORD))
                    .role(UserRole.AGENT).language("es").active(true).build());
        }
    }

    protected MockHttpSession loginAs(String email, String password) throws Exception {
        String body = objectMapper.writeValueAsString(new LoginRequest(email, password));
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    protected MockHttpSession adminSession() throws Exception {
        return loginAs(ADMIN_EMAIL, ADMIN_PASSWORD);
    }

    protected String json(Object o) throws Exception {
        return objectMapper.writeValueAsString(o);
    }
}
