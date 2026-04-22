package com.localapartmentexperts.crm.property.image;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;

/**
 * S3-compatible storage implementation — active only in the {@code prod} profile.
 * Works with AWS S3 and any S3-compatible provider (Cloudflare R2, MinIO, etc.).
 *
 * Set STORAGE_ENDPOINT_URL for non-AWS providers (e.g. Cloudflare R2 account endpoint).
 * Leave it unset to use the default AWS regional endpoint.
 */
@Slf4j
@Service
@Profile("prod")
public class S3StorageService implements StorageService {

    private final S3Client s3;
    private final String bucket;
    private final String baseUrl;

    public S3StorageService(
            @Value("${app.storage.bucket}") String bucket,
            @Value("${app.storage.base-url}") String baseUrl,
            @Value("${app.storage.region:auto}") String region,
            @Value("${app.storage.endpoint-url:}") String endpointUrl,
            @Value("${app.storage.access-key-id}") String accessKeyId,
            @Value("${app.storage.secret-access-key}") String secretAccessKey) {

        this.bucket = bucket;
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;

        var credentials = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKeyId, secretAccessKey));

        var builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentials);

        if (!endpointUrl.isBlank()) {
            builder.endpointOverride(URI.create(endpointUrl));
        }

        this.s3 = builder.build();
        log.info("S3StorageService: bucket={}, baseUrl={}, endpoint={}",
                bucket, this.baseUrl, endpointUrl.isBlank() ? "AWS default" : endpointUrl);
    }

    @Override
    public String store(String key, InputStream data, String contentType) throws IOException {
        byte[] bytes = data.readAllBytes();

        s3.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(contentType)
                        .contentLength((long) bytes.length)
                        .build(),
                RequestBody.fromBytes(bytes));

        log.debug("Stored s3://{}/{}", bucket, key);
        return getPublicUrl(key);
    }

    @Override
    public void delete(String key) throws IOException {
        try {
            s3.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build());
            log.debug("Deleted s3://{}/{}", bucket, key);
        } catch (NoSuchKeyException ignored) {
            // contract: silent no-op when key does not exist
        }
    }

    @Override
    public String getPublicUrl(String key) {
        return baseUrl + "/" + key;
    }
}
