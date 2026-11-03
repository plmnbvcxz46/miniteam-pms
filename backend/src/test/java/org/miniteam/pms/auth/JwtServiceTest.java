package org.miniteam.pms.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private final JwtService jwt = new JwtService("test-secret-test-secret-test-secret", 3600);

    @Test
    void issuedTokenParsesBackToUserId() {
        assertEquals(Optional.of(42L), jwt.parse(jwt.issue(42)));
    }

    @Test
    void tamperedPayloadIsRejected() {
        String[] parts = jwt.issue(42).split("\\.");
        String forged = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString("{\"sub\":\"1\",\"iat\":0,\"exp\":9999999999}".getBytes(StandardCharsets.UTF_8));
        assertTrue(jwt.parse(parts[0] + "." + forged + "." + parts[2]).isEmpty());
    }

    @Test
    void tokenSignedWithOtherSecretIsRejected() {
        JwtService other = new JwtService("another-secret-another-secret-another", 3600);
        assertTrue(jwt.parse(other.issue(42)).isEmpty());
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService shortLived = new JwtService("test-secret-test-secret-test-secret", -10);
        assertTrue(jwt.parse(shortLived.issue(42)).isEmpty());
    }

    @Test
    void noneAlgorithmAndGarbageAreRejected() {
        Base64.Encoder enc = Base64.getUrlEncoder().withoutPadding();
        String header = enc.encodeToString("{\"alg\":\"none\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String payload = enc.encodeToString("{\"sub\":\"1\",\"exp\":9999999999}".getBytes(StandardCharsets.UTF_8));
        assertTrue(jwt.parse(header + "." + payload + ".").isEmpty());
        assertTrue(jwt.parse("abc").isEmpty());
        assertTrue(jwt.parse("a.b.c").isEmpty());
        assertTrue(jwt.parse(null).isEmpty());
    }

    @Test
    void missingSecretFallsBackToRandomKey() {
        JwtService a = new JwtService("", 3600);
        JwtService b = new JwtService("", 3600);
        assertEquals(Optional.of(7L), a.parse(a.issue(7)));
        assertTrue(a.parse(b.issue(7)).isEmpty());
    }
}
