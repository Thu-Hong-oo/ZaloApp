// package com.zalo.auth.config;

// import org.socialsignin.spring.data.dynamodb.repository.config.EnableDynamoDBRepositories;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
// import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
// import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
// import software.amazon.awssdk.regions.Region;
// import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

// import java.net.URI;

// @Configuration
// @EnableDynamoDBRepositories(basePackages = "com.zalo.auth.repository")
// public class DynamoDBConfig {

//     @Value("${spring.data.dynamodb.endpoint}")
//     private String dynamoDBEndpoint;

//     @Value("${spring.data.dynamodb.region}")
//     private String awsRegion;

//     @Value("${spring.data.dynamodb.access-key}")
//     private String awsAccessKey;

//     @Value("${spring.data.dynamodb.secret-key}")
//     private String awsSecretKey;

//     @Bean
//     public DynamoDbClient dynamoDbClient() {
//         return DynamoDbClient.builder()
//                 .endpointOverride(URI.create(dynamoDBEndpoint))
//                 .region(Region.of(awsRegion))
//                 .credentialsProvider(StaticCredentialsProvider.create(
//                         AwsBasicCredentials.create(awsAccessKey, awsSecretKey)))
//                 .build();
//     }

//     @Bean
//     public DynamoDbEnhancedClient dynamoDbEnhancedClient(DynamoDbClient dynamoDbClient) {
//         return DynamoDbEnhancedClient.builder()
//                 .dynamoDbClient(dynamoDbClient)
//                 .build();
//     }
// } 