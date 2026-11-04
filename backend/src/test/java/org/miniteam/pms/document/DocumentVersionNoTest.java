package org.miniteam.pms.document;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class DocumentVersionNoTest {

    @Test
    void firstVersionIsV01AndMinorGoesUp() {
        assertEquals("v0.1", DocumentVersionNo.next(null));
        assertEquals("v0.7", DocumentVersionNo.next("v0.6"));
        assertEquals("v1.10", DocumentVersionNo.next("v1.9"));
    }

    @Test
    void unreadableCurrentVersionRestartsFromV01() {
        assertEquals("v0.1", DocumentVersionNo.next("final"));
    }

    @Test
    void validFormatIsVMajorDotMinor() {
        assertTrue(DocumentVersionNo.valid("v0.1"));
        assertTrue(DocumentVersionNo.valid("v12.345"));
        assertFalse(DocumentVersionNo.valid("0.1"));
        assertFalse(DocumentVersionNo.valid("v1"));
        assertFalse(DocumentVersionNo.valid("v1.2.3"));
        assertFalse(DocumentVersionNo.valid("v1.a"));
        assertFalse(DocumentVersionNo.valid(null));
    }
}
