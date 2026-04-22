package com.localapartmentexperts.crm.property.image;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Local-filesystem implementation of {@link StorageService}.
 *
 * <p>Files are written to {@code app.storage.upload-dir} (default: {@code ./uploads}) and served
 * by Spring MVC's static-resource handler at {@code /uploads/**} (configured in
 * {@link com.localapartmentexperts.crm.common.config.WebConfig}).
 *
 * <p><strong>Dev/staging only.</strong>  Replace this bean with an S3StorageService
 * (or equivalent) for production.  The swap requires zero changes to callers — just provide a
 * different bean that implements {@link StorageService} and remove this one.
 *
 * <p>To switch in production, set {@code SPRING_PROFILES_ACTIVE=prod} and register a
 * {@code @Profile("prod")} S3 bean.  This bean is active on all profiles except {@code prod}.
 */
@Slf4j
@Service
@Profile({"dev", "docker", "test"})
public class LocalStorageService implements StorageService {

    private final Path uploadRoot;
    private final String baseUrl;

    public LocalStorageService(
            @Value("${app.storage.upload-dir:./uploads}") String uploadDir,
            @Value("${app.storage.base-url:http://localhost:8080/uploads}") String baseUrl) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        String trimmedBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.baseUrl = trimmedBase + "/";
        log.info("LocalStorageService: upload root = {}, base URL = {}", this.uploadRoot, this.baseUrl);
    }

    @Override
    public String store(String key, InputStream data, String contentType) throws IOException {
        Path target = resolve(key);
        Files.createDirectories(target.getParent());
        Files.copy(data, target, StandardCopyOption.REPLACE_EXISTING);
        log.debug("Stored file: {}", target);
        return getPublicUrl(key);
    }

    @Override
    public void delete(String key) throws IOException {
        Path target = resolve(key);
        boolean deleted = Files.deleteIfExists(target);
        if (deleted) {
            log.debug("Deleted file: {}", target);
        }
        // Remove empty parent directories up to uploadRoot (best-effort, silent on failure)
        try {
            Path parent = target.getParent();
            while (parent != null && !parent.equals(uploadRoot)) {
                try (var stream = Files.list(parent)) {
                    if (stream.findAny().isPresent()) break;
                }
                Files.deleteIfExists(parent);
                parent = parent.getParent();
            }
        } catch (IOException ignored) { /* best-effort cleanup */ }
    }

    @Override
    public String getPublicUrl(String key) {
        return baseUrl + key;
    }

    /** Resolve a relative key to an absolute path, preventing directory traversal. */
    private Path resolve(String key) {
        Path resolved = uploadRoot.resolve(key).normalize();
        if (!resolved.startsWith(uploadRoot)) {
            throw new IllegalArgumentException("Path traversal attempt: " + key);
        }
        return resolved;
    }
}
