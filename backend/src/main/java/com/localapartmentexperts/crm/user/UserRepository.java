package com.localapartmentexperts.crm.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findAllByActiveTrue();

    List<User> findAllByActiveTrueOrderByFirstNameAscLastNameAsc();

    List<User> findAllByOrderByFirstNameAscLastNameAsc();

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.lastLoginAt = :loginAt WHERE u.id = :id")
    void updateLastLoginAt(@Param("id") UUID id, @Param("loginAt") Instant loginAt);
}
