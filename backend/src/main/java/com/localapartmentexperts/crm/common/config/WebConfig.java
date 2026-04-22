package com.localapartmentexperts.crm.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * MVC configuration.
 *
 * <p>Serves locally-uploaded files from the configured upload directory at {@code /uploads/**}.
 * In production (with object storage), this handler is still registered but will simply never
 * match any real requests because files will be served from a CDN instead.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.storage.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absoluteDir = Paths.get(uploadDir).toAbsolutePath().normalize().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absoluteDir + "/")
                .setCachePeriod(3600); // 1-hour browser cache for images
    }
}
