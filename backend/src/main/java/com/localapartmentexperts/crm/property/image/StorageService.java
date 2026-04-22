package com.localapartmentexperts.crm.property.image;

import java.io.IOException;
import java.io.InputStream;

/**
 * Abstraction for binary file storage.
 *
 * <p>The dev implementation ({@link LocalStorageService}) writes files to the local filesystem and
 * serves them via Spring's static resource handler. In production, swap this bean for an
 * S3StorageService (or GCS, Azure Blob, etc.) without touching any other code.
 *
 * <p>Contract:
 * <ul>
 *   <li>{@code store} must be idempotent for the same key (overwrite semantics).
 *   <li>{@code delete} must be silent if the key does not exist.
 *   <li>{@code getPublicUrl} must return a stable URL that browsers can fetch without auth.
 * </ul>
 */
public interface StorageService {

    /**
     * Persist {@code data} at {@code key} and return the public URL for the stored object.
     *
     * @param key         relative path, e.g. {@code "properties/uuid/image.jpg"}
     * @param data        raw bytes (caller must close the stream)
     * @param contentType MIME type, e.g. {@code "image/jpeg"}
     * @return public URL browsers can use to fetch the file
     */
    String store(String key, InputStream data, String contentType) throws IOException;

    /**
     * Remove the object at {@code key}.  No-op if the key does not exist.
     *
     * @param key relative path used in {@link #store}
     */
    void delete(String key) throws IOException;

    /**
     * Derive the public URL for a key without performing any I/O.
     * Useful for reconstructing URLs after a restart.
     */
    String getPublicUrl(String key);
}
