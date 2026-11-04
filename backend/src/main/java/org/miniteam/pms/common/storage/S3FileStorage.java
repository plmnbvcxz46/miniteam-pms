package org.miniteam.pms.common.storage;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

/**
 * 用 S3 协议存取文件。连哪个服务只看配置 app.storage.*（环境变量 OSS_*），
 * 自建 MinIO、阿里云 OSS、腾讯 COS 都不用改代码。客户端不会在启动时连接，存储服务没起来时只有存取文件的接口出错。
 */
@Component
public class S3FileStorage implements FileStorage {

    private final S3Client client;
    private final String bucket;

    public S3FileStorage(
            @Value("${app.storage.endpoint}") String endpoint,
            @Value("${app.storage.bucket}") String bucket,
            @Value("${app.storage.access-key}") String accessKey,
            @Value("${app.storage.secret-key}") String secretKey,
            @Value("${app.storage.region:us-east-1}") String region,
            @Value("${app.storage.path-style:true}") boolean pathStyle) {
        this.bucket = bucket;
        this.client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(pathStyle)
                        .build())
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .build();
    }

    @Override
    public void save(String key, InputStream content, long size, String contentType) throws IOException {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();
        try {
            client.putObject(request, RequestBody.fromInputStream(content, size));
        } catch (SdkException e) {
            throw new IOException("上传到对象存储失败：" + e.getMessage(), e);
        }
    }

    @Override
    public InputStream open(String key) throws IOException {
        try {
            return client.getObject(
                    GetObjectRequest.builder().bucket(bucket).key(key).build());
        } catch (NoSuchKeyException e) {
            throw new FileNotFoundException(key);
        } catch (SdkException e) {
            throw new IOException("从对象存储读取失败：" + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String key) throws IOException {
        try {
            client.deleteObject(
                    DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        } catch (SdkException e) {
            throw new IOException("从对象存储删除失败：" + e.getMessage(), e);
        }
    }
}
