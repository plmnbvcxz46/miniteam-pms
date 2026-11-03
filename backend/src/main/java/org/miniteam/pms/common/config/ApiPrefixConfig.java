package org.miniteam.pms.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 所有 @RestController 的路径自动加 /api 前缀，Controller 里只写接口文档里的路径，如 /auth/login。 */
@Configuration
public class ApiPrefixConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix("/api", type -> type.isAnnotationPresent(RestController.class));
    }
}
