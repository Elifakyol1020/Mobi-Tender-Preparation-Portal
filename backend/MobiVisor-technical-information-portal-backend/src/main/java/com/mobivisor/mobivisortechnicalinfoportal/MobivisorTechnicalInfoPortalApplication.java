package com.mobivisor.mobivisortechnicalinfoportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableJpaRepositories(basePackages = "com.mobivisor.mobivisortechnicalinfoportal.repository.jpa")
public class MobivisorTechnicalInfoPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(MobivisorTechnicalInfoPortalApplication.class, args);
    }

}
