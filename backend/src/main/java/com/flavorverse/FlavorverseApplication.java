package com.flavorverse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FlavorverseApplication {
    public static void main(String[] args) {
        SpringApplication.run(FlavorverseApplication.class, args);
    }
}
