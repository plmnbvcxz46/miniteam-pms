package org.miniteam.pms.auth;

import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;

/** 当前请求的登录身份。Service 里统一从这里取，不要信请求里传的用户 id。 */
public final class AuthContext {

    private static final ThreadLocal<LoginUser> HOLDER = new ThreadLocal<>();

    private AuthContext() {}

    static void set(LoginUser user) {
        HOLDER.set(user);
    }

    static void clear() {
        HOLDER.remove();
    }

    /** 当前登录用户；未登录抛 401 */
    public static LoginUser require() {
        LoginUser user = HOLDER.get();
        if (user == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        return user;
    }

    /** 要求当前用户是系统管理员，否则 403 */
    public static LoginUser requireAdmin() {
        LoginUser user = require();
        if (!user.isAdmin()) {
            throw new BusinessException(ResultCode.FORBIDDEN);
        }
        return user;
    }
}
