package com.localapartmentexperts.crm.user;

import com.localapartmentexperts.crm.common.exception.BusinessException;
import com.localapartmentexperts.crm.common.exception.ResourceNotFoundException;
import com.localapartmentexperts.crm.user.dto.CreateUserRequest;
import com.localapartmentexperts.crm.user.dto.ResetPasswordRequest;
import com.localapartmentexperts.crm.user.dto.UpdateUserRequest;
import com.localapartmentexperts.crm.user.dto.UserDetailDTO;
import com.localapartmentexperts.crm.user.dto.UserSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserSummaryDTO> getAssignableUsers() {
        return userRepository.findAllByActiveTrueOrderByFirstNameAscLastNameAsc()
                .stream()
                .map(UserSummaryDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserDetailDTO> listAllUsers() {
        return userRepository.findAllByOrderByFirstNameAscLastNameAsc()
                .stream()
                .map(UserDetailDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserDetailDTO getUserById(UUID id) {
        return UserDetailDTO.from(findOrThrow(id));
    }

    @Transactional
    public UserDetailDTO createUser(CreateUserRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new BusinessException("Ya existe un usuario con ese correo electrónico", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .firstName(req.firstName().trim())
                .lastName(req.lastName().trim())
                .email(req.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(req.role())
                .language(req.language() != null ? req.language() : "es")
                .active(true)
                .build();

        return UserDetailDTO.from(userRepository.save(user));
    }

    @Transactional
    public UserDetailDTO updateUser(UUID id, UpdateUserRequest req, String currentUserEmail) {
        User user = findOrThrow(id);

        if (req.firstName() != null) user.setFirstName(req.firstName().trim());
        if (req.lastName() != null)  user.setLastName(req.lastName().trim());

        if (req.email() != null) {
            String newEmail = req.email().trim().toLowerCase();
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new BusinessException("Ya existe un usuario con ese correo electrónico", HttpStatus.CONFLICT);
            }
            user.setEmail(newEmail);
        }

        if (req.language() != null) user.setLanguage(req.language());

        if (req.role() != null) {
            if (user.getEmail().equals(currentUserEmail)) {
                throw new BusinessException("No puedes cambiar tu propio rol", HttpStatus.UNPROCESSABLE_ENTITY);
            }
            user.setRole(req.role());
        }

        if (req.active() != null) {
            if (!req.active() && user.getEmail().equals(currentUserEmail)) {
                throw new BusinessException("No puedes desactivar tu propia cuenta", HttpStatus.UNPROCESSABLE_ENTITY);
            }
            user.setActive(req.active());
        }

        return UserDetailDTO.from(userRepository.save(user));
    }

    @Transactional
    public void resetPassword(UUID id, ResetPasswordRequest req) {
        User user = findOrThrow(id);
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }

    private User findOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
