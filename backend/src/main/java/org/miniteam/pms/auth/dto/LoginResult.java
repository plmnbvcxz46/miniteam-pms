package org.miniteam.pms.auth.dto;

public record LoginResult(String token, long expiresIn, CurrentUserVO me) {}
