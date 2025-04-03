package com.zalo.auth.model;

import lombok.Data;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import java.time.Instant;

@Data
@DynamoDbBean
public class RefreshToken {

    private String id;
    private String token;
    private String phoneNumber;
    private Instant expiryDate;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }
}
