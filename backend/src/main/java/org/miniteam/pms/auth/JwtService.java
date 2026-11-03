package org.miniteam.pms.auth;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * JWT（HS256）签发与校验，只用 JDK 实现。token 里只放用户 id 和过期时间，
 * 其余身份信息每次请求从数据库读，所以停用账号、改角色立即生效。
 */
@Component
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private static final String HMAC = "HmacSHA256";
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private static final String HEADER =
            ENCODER.encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
    private static final Pattern SUB = Pattern.compile("\"sub\":\"(\\d+)\"");
    private static final Pattern EXP = Pattern.compile("\"exp\":(\\d+)");

    private final byte[] secret;
    private final long expiresIn;

    public JwtService(
            @Value("${app.jwt.secret:}") String secret, @Value("${app.jwt.expires-in:604800}") long expiresIn) {
        if (secret == null || secret.isBlank()) {
            // 没配密钥时每次启动随机生成：安全，但重启后所有人要重新登录
            byte[] random = new byte[32];
            new SecureRandom().nextBytes(random);
            this.secret = random;
            log.warn("未配置 JWT_SECRET，已随机生成临时密钥，重启后所有登录失效");
        } else {
            this.secret = secret.getBytes(StandardCharsets.UTF_8);
        }
        this.expiresIn = expiresIn;
    }

    /** token 有效期（秒） */
    public long getExpiresIn() {
        return expiresIn;
    }

    public String issue(long userId) {
        long now = Instant.now().getEpochSecond();
        String payload = "{\"sub\":\"" + userId + "\",\"iat\":" + now + ",\"exp\":" + (now + expiresIn) + "}";
        String signingInput = HEADER + "." + ENCODER.encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        return signingInput + "." + ENCODER.encodeToString(sign(signingInput));
    }

    /** 校验签名和过期时间，通过则返回用户 id。 */
    public Optional<Long> parse(String token) {
        if (token == null) {
            return Optional.empty();
        }
        String[] parts = token.split("\\.", -1);
        // 头部必须是我们自己签发的固定值，避免 alg 被替换
        if (parts.length != 3 || !HEADER.equals(parts[0])) {
            return Optional.empty();
        }
        try {
            byte[] expected = sign(parts[0] + "." + parts[1]);
            if (!MessageDigest.isEqual(expected, DECODER.decode(parts[2]))) {
                return Optional.empty();
            }
            String payload = new String(DECODER.decode(parts[1]), StandardCharsets.UTF_8);
            Matcher sub = SUB.matcher(payload);
            Matcher exp = EXP.matcher(payload);
            if (!sub.find()
                    || !exp.find()
                    || Long.parseLong(exp.group(1)) <= Instant.now().getEpochSecond()) {
                return Optional.empty();
            }
            return Optional.of(Long.parseLong(sub.group(1)));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    private byte[] sign(String signingInput) {
        try {
            Mac mac = Mac.getInstance(HMAC);
            mac.init(new SecretKeySpec(secret, HMAC));
            return mac.doFinal(signingInput.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("JWT 签名失败", e);
        }
    }
}
