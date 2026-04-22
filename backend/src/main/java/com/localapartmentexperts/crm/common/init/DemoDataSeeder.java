package com.localapartmentexperts.crm.common.init;

import com.localapartmentexperts.crm.activity.ActivityService;
import com.localapartmentexperts.crm.common.enums.ContactMethod;
import com.localapartmentexperts.crm.common.enums.LeadSource;
import com.localapartmentexperts.crm.common.enums.LeadStatus;
import com.localapartmentexperts.crm.common.enums.UrgencyLevel;
import com.localapartmentexperts.crm.common.enums.UserRole;
import com.localapartmentexperts.crm.lead.Lead;
import com.localapartmentexperts.crm.lead.LeadAssignment;
import com.localapartmentexperts.crm.lead.LeadAssignmentRepository;
import com.localapartmentexperts.crm.lead.LeadNote;
import com.localapartmentexperts.crm.lead.LeadNoteRepository;
import com.localapartmentexperts.crm.lead.LeadRepository;
import com.localapartmentexperts.crm.lead.LeadStatusHistory;
import com.localapartmentexperts.crm.lead.LeadStatusHistoryRepository;
import com.localapartmentexperts.crm.user.User;
import com.localapartmentexperts.crm.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Seeds realistic demo data when the "docker" profile is active.
 * Runs after {@link DataInitializer} (which creates the admin user).
 * Idempotent: skips if any leads already exist.
 */
@Slf4j
@Component
@Profile("docker")
@Order(2)
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final LeadStatusHistoryRepository statusHistoryRepository;
    private final LeadAssignmentRepository assignmentRepository;
    private final LeadNoteRepository leadNoteRepository;
    private final ActivityService activityService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (leadRepository.count() > 0) {
            log.info("Demo data already present — skipping seed.");
            return;
        }

        log.info("Seeding demo data...");

        User admin = userRepository.findByEmail("admin@localapartmentexperts.com")
                .orElseThrow(() -> new IllegalStateException("Admin user not found; DataInitializer must run first."));

        User maria = saveAgent("María", "García Hernández", "maria.garcia@crm.com");
        User carlos = saveAgent("Carlos", "López Mendoza", "carlos.lopez@crm.com");

        LocalDate today    = LocalDate.now();
        LocalDate tomorrow = today.plusDays(3);
        LocalDate overdue  = today.minusDays(5);

        // ── NEW ───────────────────────────────────────────────────────────────

        seed(admin, b -> b
                .firstName("Ana").lastName("Martínez Ruiz")
                .email("ana.martinez@gmail.com").phone("5512345001")
                .source(LeadSource.WEBSITE).urgencyLevel(UrgencyLevel.MEDIUM)
                .message("Busco departamento de 2 recámaras en la Condesa. Presupuesto flexible.")
                .budgetMin(bd(18000)).budgetMax(bd(25000))
                .preferredNeighborhoods(new String[]{"Condesa", "Roma Norte"})
                .bedroomCount((short)2).bathroomCount((short)2));

        seed(admin, b -> b
                .firstName("Roberto").lastName("Sánchez García")
                .email("roberto.sg@hotmail.com").phone("5512345002")
                .source(LeadSource.FACEBOOK).urgencyLevel(UrgencyLevel.HIGH)
                .assignedUser(maria).nextFollowUpDate(tomorrow)
                .budgetMin(bd(12000)).budgetMax(bd(18000))
                .preferredNeighborhoods(new String[]{"Nápoles", "Del Valle"})
                .bedroomCount((short)1).bathroomCount((short)1)
                .message("Vio un anuncio en Facebook. Necesita mudarse pronto."));

        seed(admin, b -> b
                .firstName("Arturo").lastName("Nava González")
                .phone("5512345022")
                .source(LeadSource.WALKIN).urgencyLevel(UrgencyLevel.HIGH)
                .nextFollowUpDate(today)
                .budgetMin(bd(20000)).budgetMax(bd(30000))
                .preferredNeighborhoods(new String[]{"Polanco", "Lomas de Chapultepec"})
                .bedroomCount((short)3).bathroomCount((short)2));

        seed(admin, b -> b
                .firstName("Alejandra").lastName("Soto Villanueva")
                .email("alejandra.soto@outlook.com").phone("5512345025")
                .source(LeadSource.WALKIN).urgencyLevel(UrgencyLevel.CRITICAL)
                .budgetMin(bd(25000)).budgetMax(bd(35000))
                .preferredNeighborhoods(new String[]{"Santa Fe", "Interlomas"})
                .bedroomCount((short)3).bathroomCount((short)3)
                .message("Ejecutiva de empresa. Necesita depa amueblado urgente."));

        seed(admin, b -> b
                .firstName("Daniela").lastName("Cabrera Mendoza")
                .email("daniela.cm@gmail.com")
                .source(LeadSource.REFERRAL).urgencyLevel(UrgencyLevel.LOW));

        // ── CONTACT_ATTEMPTED ─────────────────────────────────────────────────

        Lead l6 = seed(admin, b -> b
                .firstName("Laura").lastName("González López")
                .email("laura.gonzalez@gmail.com").phone("5512345003")
                .source(LeadSource.REFERRAL).urgencyLevel(UrgencyLevel.MEDIUM)
                .assignedUser(carlos).nextFollowUpDate(overdue)
                .budgetMin(bd(10000)).budgetMax(bd(15000))
                .preferredNeighborhoods(new String[]{"Satélite", "Echegaray"})
                .bedroomCount((short)2).bathroomCount((short)1));
        advanceStatus(l6, LeadStatus.CONTACT_ATTEMPTED, carlos);

        Lead l7 = seed(admin, b -> b
                .firstName("Miguel").lastName("Rodríguez Pérez")
                .phone("5512345004")
                .source(LeadSource.WALKIN).urgencyLevel(UrgencyLevel.LOW));
        advanceStatus(l7, LeadStatus.CONTACT_ATTEMPTED, admin);

        // ── CONTACTED ─────────────────────────────────────────────────────────

        Lead l8 = seed(admin, b -> b
                .firstName("Patricia").lastName("Flores Torres")
                .email("patricia.flores@gmail.com").phone("5512345005")
                .source(LeadSource.WEBSITE).urgencyLevel(UrgencyLevel.MEDIUM)
                .assignedUser(maria).nextFollowUpDate(tomorrow)
                .preferredContactMethod(ContactMethod.WHATSAPP)
                .budgetMin(bd(14000)).budgetMax(bd(20000))
                .preferredNeighborhoods(new String[]{"Roma Norte", "Juárez"})
                .bedroomCount((short)2).bathroomCount((short)1));
        advanceStatus(l8, LeadStatus.CONTACT_ATTEMPTED, maria);
        advanceStatus(l8, LeadStatus.CONTACTED, maria);

        Lead l9 = seed(admin, b -> b
                .firstName("José").lastName("Ramírez Vargas")
                .email("jose.ramirez@yahoo.com").phone("5512345006")
                .source(LeadSource.FACEBOOK).urgencyLevel(UrgencyLevel.HIGH)
                .assignedUser(carlos)
                .budgetMin(bd(16000)).budgetMax(bd(22000))
                .preferredNeighborhoods(new String[]{"Polanco", "Granada"})
                .bedroomCount((short)2).bathroomCount((short)2)
                .lastContactDate(today.minusDays(2)));
        advanceStatus(l9, LeadStatus.CONTACT_ATTEMPTED, carlos);
        advanceStatus(l9, LeadStatus.CONTACTED, carlos);

        Lead l23 = seed(admin, b -> b
                .firstName("Mónica").lastName("Acosta Beltrán")
                .email("monica.acosta@gmail.com").phone("5512345023")
                .source(LeadSource.REFERRAL).urgencyLevel(UrgencyLevel.LOW)
                .assignedUser(maria).preferredContactMethod(ContactMethod.EMAIL)
                .budgetMin(bd(9000)).budgetMax(bd(13000)));
        advanceStatus(l23, LeadStatus.CONTACT_ATTEMPTED, maria);
        advanceStatus(l23, LeadStatus.CONTACTED, maria);

        // ── QUALIFIED ─────────────────────────────────────────────────────────

        Lead l10 = seed(admin, b -> b
                .firstName("Sandra").lastName("Morales Jiménez")
                .email("sandra.morales@gmail.com").phone("5512345007")
                .source(LeadSource.REFERRAL).urgencyLevel(UrgencyLevel.HIGH)
                .assignedUser(maria).nextFollowUpDate(tomorrow)
                .preferredContactMethod(ContactMethod.PHONE)
                .budgetMin(bd(20000)).budgetMax(bd(28000))
                .preferredNeighborhoods(new String[]{"Polanco", "Anzures"})
                .bedroomCount((short)3).bathroomCount((short)2)
                .moveInDate(today.plusMonths(1)));
        advanceStatus(l10, LeadStatus.CONTACT_ATTEMPTED, maria);
        advanceStatus(l10, LeadStatus.CONTACTED, maria);
        advanceStatus(l10, LeadStatus.QUALIFIED, maria);
        addNote(l10, maria, "Muy interesada. Tiene presupuesto aprobado por su empresa. Prefiere piso alto con vista.");

        Lead l11 = seed(admin, b -> b
                .firstName("Fernando").lastName("Castro Hernández")
                .email("fernando.castro@outlook.com").phone("5512345008")
                .source(LeadSource.WEBSITE).urgencyLevel(UrgencyLevel.MEDIUM)
                .assignedUser(carlos)
                .budgetMin(bd(15000)).budgetMax(bd(20000))
                .preferredNeighborhoods(new String[]{"Condesa", "Hipódromo"})
                .bedroomCount((short)1).bathroomCount((short)1));
        advanceStatus(l11, LeadStatus.CONTACT_ATTEMPTED, carlos);
        advanceStatus(l11, LeadStatus.CONTACTED, carlos);
        advanceStatus(l11, LeadStatus.QUALIFIED, carlos);

        Lead l12 = seed(admin, b -> b
                .firstName("Lucía").lastName("Ortega Méndez")
                .email("lucia.ortega@gmail.com").phone("5512345009")
                .source(LeadSource.WALKIN).urgencyLevel(UrgencyLevel.CRITICAL)
                .assignedUser(maria).nextFollowUpDate(today)
                .budgetMin(bd(22000)).budgetMax(bd(30000))
                .preferredNeighborhoods(new String[]{"Santa Fe", "Cuajimalpa"})
                .bedroomCount((short)3).bathroomCount((short)2)
                .moveInDate(today.plusDays(15))
                .message("Necesita mudarse en menos de 3 semanas. Presupuesto confirmado."));
        advanceStatus(l12, LeadStatus.CONTACT_ATTEMPTED, maria);
        advanceStatus(l12, LeadStatus.CONTACTED, maria);
        advanceStatus(l12, LeadStatus.QUALIFIED, maria);

        Lead l24 = seed(admin, b -> b
                .firstName("Luis").lastName("Rangel Estrada")
                .email("luis.rangel@gmail.com").phone("5512345024")
                .source(LeadSource.OTHER).urgencyLevel(UrgencyLevel.MEDIUM)
                .assignedUser(carlos).nextFollowUpDate(overdue)
                .budgetMin(bd(11000)).budgetMax(bd(16000))
                .preferredNeighborhoods(new String[]{"Del Valle", "Narvarte"})
                .bedroomCount((short)2).bathroomCount((short)1));
        advanceStatus(l24, LeadStatus.CONTACT_ATTEMPTED, carlos);
        advanceStatus(l24, LeadStatus.CONTACTED, carlos);
        advanceStatus(l24, LeadStatus.QUALIFIED, carlos);

        // ── APPOINTMENT_SCHEDULED ─────────────────────────────────────────────

        Lead l13 = seed(admin, b -> b
                .firstName("Diego").lastName("Herrera Romero")
                .email("diego.herrera@gmail.com").phone("5512345010")
                .source(LeadSource.WEBSITE).urgencyLevel(UrgencyLevel.HIGH)
                .assignedUser(maria).nextFollowUpDate(tomorrow)
                .budgetMin(bd(18000)).budgetMax(bd(25000))
                .preferredNeighborhoods(new String[]{"Roma Norte", "Condesa"})
                .bedroomCount((short)2).bathroomCount((short)2)
                .moveInDate(today.plusMonths(2)));
        advanceStatus(l13, LeadStatus.CONTACT_ATTEMPTED, maria);
        advanceStatus(l13, LeadStatus.CONTACTED, maria);
        advanceStatus(l13, LeadStatus.QUALIFIED, maria);
        advanceStatus(l13, LeadStatus.APPOINTMENT_SCHEDULED, maria);
        addNote(l13, maria, "Cita agendada para el viernes a las 11am. Quiere ver dos opciones en Condesa.");
        addNote(l13, admin, "Confirmar disponibilidad de unidad 402 antes de la visita.");

        Lead l14 = seed(admin, b -> b
                .firstName("Carmen").lastName("Reyes Luna")
                .email("carmen.reyes@hotmail.com").phone("5512345011")
                .source(LeadSource.REFERRAL).urgencyLevel(UrgencyLevel.MEDIUM)
                .assignedUser(carlos).nextFollowUpDate(tomorrow)
                .budgetMin(bd(12000)).budgetMax(bd(17000))
                .preferredNeighborhoods(new String[]{"Nápoles", "Insurgentes"})
                .bedroomCount((short)1).bathroomCount((short)1));
        advanceStatus(l14, LeadStatus.CONTACT_ATTEMPTED, carlos);
        advanceStatus(l14, LeadStatus.CONTACTED, carlos);
        advanceStatus(l14, LeadStatus.QUALIFIED, carlos);
        advanceStatus(l14, LeadStatus.APPOINTMENT_SCHEDULED, carlos);

        Lead l15 = seed(admin, b -> b
                .firstName("Alejandro").lastName("Gutiérrez Vázquez")
                .email("alex.gutierrez@gmail.com").phone("5512345012")
                .source(LeadSource.FACEBOOK).urgencyLevel(UrgencyLevel.HIGH)
                .assignedUser(maria).nextFollowUpDate(overdue)
                .budgetMin(bd(16000)).budgetMax(bd(24000))
                .preferredNeighborhoods(new String[]{"Polanco", "Chapultepec"})
                .bedroomCount((short)2).bathroomCount((short)2));
        advanceStatus(l15, LeadStatus.CONTACT_ATTEMPTED, maria);
        advanceStatus(l15, LeadStatus.CONTACTED, maria);
        advanceStatus(l15, LeadStatus.QUALIFIED, maria);
        advanceStatus(l15, LeadStatus.APPOINTMENT_SCHEDULED, maria);

        // ── APPLICATION_IN_PROGRESS ───────────────────────────────────────────

        Lead l16 = seed(admin, b -> b
                .firstName("Sofía").lastName("Díaz Moreno")
                .email("sofia.diaz@gmail.com").phone("5512345013")
                .source(LeadSource.WEBSITE).urgencyLevel(UrgencyLevel.CRITICAL)
                .assignedUser(carlos)
                .budgetMin(bd(20000)).budgetMax(bd(28000))
                .preferredNeighborhoods(new String[]{"Polanco", "Lomas de Chapultepec"})
                .bedroomCount((short)3).bathroomCount((short)3)
                .lastContactDate(today.minusDays(1))
                .moveInDate(today.plusDays(20)));
        advanceStatus(l16, LeadStatus.CONTACT_ATTEMPTED, carlos);
        advanceStatus(l16, LeadStatus.CONTACTED, carlos);
        advanceStatus(l16, LeadStatus.QUALIFIED, carlos);
        advanceStatus(l16, LeadStatus.APPOINTMENT_SCHEDULED, carlos);
        advanceStatus(l16, LeadStatus.APPLICATION_IN_PROGRESS, carlos);
        addNote(l16, carlos, "Documentación completa recibida. Pendiente aprobación del arrendador.");

        Lead l17 = seed(admin, b -> b
                .firstName("Andrés").lastName("Torres Cruz")
                .email("andres.torres@outlook.com").phone("5512345014")
                .source(LeadSource.REFERRAL).urgencyLevel(UrgencyLevel.HIGH)
                .assignedUser(maria).nextFollowUpDate(tomorrow)
                .budgetMin(bd(15000)).budgetMax(bd(20000))
                .preferredNeighborhoods(new String[]{"Del Valle", "Portales"})
                .bedroomCount((short)2).bathroomCount((short)1));
        advanceStatus(l17, LeadStatus.CONTACT_ATTEMPTED, maria);
        advanceStatus(l17, LeadStatus.CONTACTED, maria);
        advanceStatus(l17, LeadStatus.QUALIFIED, maria);
        advanceStatus(l17, LeadStatus.APPOINTMENT_SCHEDULED, maria);
        advanceStatus(l17, LeadStatus.APPLICATION_IN_PROGRESS, maria);

        Lead l18 = seed(admin, b -> b
                .firstName("Valentina").lastName("Ríos Guerrero")
                .email("valentina.rios@gmail.com").phone("5512345015")
                .source(LeadSource.WALKIN).urgencyLevel(UrgencyLevel.MEDIUM)
                .assignedUser(carlos)
                .budgetMin(bd(13000)).budgetMax(bd(18000))
                .preferredNeighborhoods(new String[]{"Coyoacán", "Pedregal"})
                .bedroomCount((short)2).bathroomCount((short)2));
        advanceStatus(l18, LeadStatus.CONTACT_ATTEMPTED, carlos);
        advanceStatus(l18, LeadStatus.CONTACTED, carlos);
        advanceStatus(l18, LeadStatus.QUALIFIED, carlos);
        advanceStatus(l18, LeadStatus.APPOINTMENT_SCHEDULED, carlos);
        advanceStatus(l18, LeadStatus.APPLICATION_IN_PROGRESS, carlos);

        // ── CLOSED_WON ────────────────────────────────────────────────────────

        Lead l19 = seed(admin, b -> b
                .firstName("Pablo").lastName("Peña Delgado")
                .email("pablo.pena@gmail.com").phone("5512345016")
                .source(LeadSource.WEBSITE).urgencyLevel(UrgencyLevel.HIGH)
                .assignedUser(maria)
                .budgetMin(bd(22000)).budgetMax(bd(28000))
                .preferredNeighborhoods(new String[]{"Roma Norte", "Condesa"})
                .bedroomCount((short)2).bathroomCount((short)2)
                .lastContactDate(today.minusDays(3)));
        advanceStatus(l19, LeadStatus.CONTACT_ATTEMPTED, maria);
        advanceStatus(l19, LeadStatus.CONTACTED, maria);
        advanceStatus(l19, LeadStatus.QUALIFIED, maria);
        advanceStatus(l19, LeadStatus.APPOINTMENT_SCHEDULED, maria);
        advanceStatus(l19, LeadStatus.APPLICATION_IN_PROGRESS, maria);
        advanceStatus(l19, LeadStatus.CLOSED_WON, maria);
        addNote(l19, maria, "¡Contrato firmado! Departamento en Condesa. Entrega el 1ro del mes.");

        Lead l20 = seed(admin, b -> b
                .firstName("Natalia").lastName("Vega Salinas")
                .email("natalia.vega@hotmail.com").phone("5512345017")
                .source(LeadSource.REFERRAL).urgencyLevel(UrgencyLevel.MEDIUM)
                .assignedUser(carlos)
                .budgetMin(bd(14000)).budgetMax(bd(18000))
                .preferredNeighborhoods(new String[]{"Satélite", "Perinorte"})
                .bedroomCount((short)2).bathroomCount((short)1)
                .lastContactDate(today.minusDays(7)));
        advanceStatus(l20, LeadStatus.CONTACT_ATTEMPTED, carlos);
        advanceStatus(l20, LeadStatus.CONTACTED, carlos);
        advanceStatus(l20, LeadStatus.QUALIFIED, carlos);
        advanceStatus(l20, LeadStatus.APPOINTMENT_SCHEDULED, carlos);
        advanceStatus(l20, LeadStatus.APPLICATION_IN_PROGRESS, carlos);
        advanceStatus(l20, LeadStatus.CLOSED_WON, carlos);

        // ── CLOSED_LOST ───────────────────────────────────────────────────────

        Lead l21 = seed(admin, b -> b
                .firstName("Eduardo").lastName("Medina Fuentes")
                .email("eduardo.medina@gmail.com").phone("5512345018")
                .source(LeadSource.FACEBOOK).urgencyLevel(UrgencyLevel.LOW));
        advanceStatus(l21, LeadStatus.CONTACT_ATTEMPTED, admin);
        advanceStatus(l21, LeadStatus.CONTACTED, admin);
        advanceStatus(l21, LeadStatus.CLOSED_LOST, admin);
        addNote(l21, admin, "Encontró departamento por su cuenta. Ya no le interesa nuestra oferta.");

        Lead l22 = seed(admin, b -> b
                .firstName("Gabriela").lastName("Ruiz Domínguez")
                .email("gabriela.ruiz@outlook.com").phone("5512345019")
                .source(LeadSource.OTHER).urgencyLevel(UrgencyLevel.MEDIUM)
                .assignedUser(maria)
                .budgetMin(bd(16000)).budgetMax(bd(20000)));
        advanceStatus(l22, LeadStatus.CONTACT_ATTEMPTED, maria);
        advanceStatus(l22, LeadStatus.CONTACTED, maria);
        advanceStatus(l22, LeadStatus.QUALIFIED, maria);
        advanceStatus(l22, LeadStatus.CLOSED_LOST, maria);

        // ── UNRESPONSIVE ──────────────────────────────────────────────────────

        Lead l25 = seed(admin, b -> b
                .firstName("Ricardo").lastName("Espinoza Aguilar")
                .email("ricardo.espinoza@gmail.com").phone("5512345020")
                .source(LeadSource.WEBSITE).urgencyLevel(UrgencyLevel.LOW)
                .assignedUser(carlos).nextFollowUpDate(overdue)
                .budgetMin(bd(10000)).budgetMax(bd(13000)));
        advanceStatus(l25, LeadStatus.CONTACT_ATTEMPTED, carlos);
        advanceStatus(l25, LeadStatus.UNRESPONSIVE, carlos);

        Lead l26 = seed(admin, b -> b
                .firstName("Daniela").lastName("Herrera Blanco")
                .email("daniela.hb@gmail.com").phone("5512345021")
                .source(LeadSource.FACEBOOK).urgencyLevel(UrgencyLevel.MEDIUM));
        advanceStatus(l26, LeadStatus.CONTACT_ATTEMPTED, admin);
        advanceStatus(l26, LeadStatus.UNRESPONSIVE, admin);

        log.info("Demo data seeded: 2 agents, 25 leads.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User saveAgent(String firstName, String lastName, String email) {
        User agent = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .passwordHash(passwordEncoder.encode("Agent1234!"))
                .role(UserRole.AGENT)
                .language("es")
                .active(true)
                .build();
        return userRepository.save(agent);
    }

    /**
     * Creates a lead from a builder configurator, saves it, and writes the
     * initial status history row plus a LEAD_CREATED activity.
     */
    private Lead seed(User actor, java.util.function.Consumer<Lead.LeadBuilder> configurator) {
        Lead.LeadBuilder builder = Lead.builder();
        configurator.accept(builder);
        Lead lead = leadRepository.save(builder.build());

        statusHistoryRepository.save(LeadStatusHistory.builder()
                .lead(lead)
                .fromStatus(null)
                .toStatus(LeadStatus.NEW)
                .changedBy(actor)
                .build());

        if (lead.getAssignedUser() != null) {
            assignmentRepository.save(LeadAssignment.builder()
                    .lead(lead)
                    .assignedTo(lead.getAssignedUser())
                    .assignedBy(actor)
                    .build());
        }

        activityService.recordLeadCreated(lead, actor);

        if (lead.getAssignedUser() != null) {
            activityService.recordAssigned(lead, actor, lead.getAssignedUser());
        }

        return lead;
    }

    /**
     * Advances a lead's status and records the transition in history + activity.
     */
    private void advanceStatus(Lead lead, LeadStatus newStatus, User actor) {
        LeadStatus oldStatus = lead.getStatus();
        lead.setStatus(newStatus);
        leadRepository.save(lead);

        statusHistoryRepository.save(LeadStatusHistory.builder()
                .lead(lead)
                .fromStatus(oldStatus)
                .toStatus(newStatus)
                .changedBy(actor)
                .build());

        activityService.recordStatusChanged(lead, actor, oldStatus, newStatus);
    }

    private void addNote(Lead lead, User author, String body) {
        LeadNote note = LeadNote.builder()
                .lead(lead)
                .author(author)
                .body(body)
                .build();
        leadNoteRepository.save(note);
        activityService.recordNoteAdded(lead, author, note.getId(), body);
    }

    private static BigDecimal bd(int value) {
        return BigDecimal.valueOf(value);
    }
}
