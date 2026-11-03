package org.miniteam.pms.user.dto;

/** 重置后的新密码，只在这一次响应里出现。 */
public record ResetPasswordResult(String password) {}
