package org.miniteam.pms.auth;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class PasswordHasherTest {

    private final PasswordHasher hasher = new PasswordHasher();

    @Test
    void correctPasswordMatchesWrongOneDoesNot() {
        String stored = hasher.hash("123456");
        assertTrue(hasher.matches("123456", stored));
        assertFalse(hasher.matches("1234567", stored));
    }

    @Test
    void sameePasswordGetsDifferentSalt() {
        assertNotEquals(hasher.hash("123456"), hasher.hash("123456"));
    }

    @Test
    void hashFitsColumnLength() {
        assertTrue(hasher.hash("a".repeat(64)).length() <= 100);
    }

    @Test
    void malformedStoredValueNeverMatches() {
        assertFalse(hasher.matches("123456", "123456"));
        assertFalse(hasher.matches("123456", "pbkdf2_sha256$x$y$z"));
        assertFalse(hasher.matches("123456", null));
    }
}
