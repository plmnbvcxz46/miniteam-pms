package org.miniteam.pms.auth;

import java.util.List;
import org.miniteam.pms.auth.dto.CurrentUserVO;
import org.miniteam.pms.auth.dto.LoginRequest;
import org.miniteam.pms.auth.dto.LoginResult;
import org.miniteam.pms.auth.dto.PasswordChange;
import org.miniteam.pms.auth.dto.ProfileUpdate;
import org.miniteam.pms.auth.dto.RegisterRequest;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.system.service.OperationLogService;
import org.miniteam.pms.user.dto.UserVO;
import org.miniteam.pms.user.entity.SysRole;
import org.miniteam.pms.user.entity.SysUser;
import org.miniteam.pms.user.mapper.RoleMapper;
import org.miniteam.pms.user.mapper.UserMapper;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    /** 注册用户的系统角色 */
    static final String DEFAULT_ROLE = "USER";

    private static final String TARGET_AUTH = "AUTH";
    private static final int DEFAULT_WEEKLY_CAPACITY = 40;

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final PasswordHasher passwordHasher;
    private final JwtService jwtService;
    private final OperationLogService logService;
    /** 账号不存在时也比对一次，让“账号不存在”和“密码错误”耗时接近 */
    private final String dummyHash;

    public AuthService(
            UserMapper userMapper,
            RoleMapper roleMapper,
            PasswordHasher passwordHasher,
            JwtService jwtService,
            OperationLogService logService) {
        this.userMapper = userMapper;
        this.roleMapper = roleMapper;
        this.passwordHasher = passwordHasher;
        this.jwtService = jwtService;
        this.logService = logService;
        this.dummyHash = passwordHasher.hash("dummy-password");
    }

    public LoginResult login(LoginRequest request) {
        String username = request.username().trim();
        SysUser user = userMapper.findByUsername(username);
        String hash = user == null ? dummyHash : user.getPasswordHash();
        boolean passwordOk = passwordHasher.matches(request.password(), hash);
        if (user == null || !passwordOk) {
            logService.record(
                    user == null ? null : user.getId(), null, TARGET_AUTH, null, "LOGIN_FAIL", "账号或密码错误：" + username);
            throw new BusinessException(ResultCode.BAD_REQUEST, "账号或密码错误");
        }
        if (user.getStatus() == null || user.getStatus() != 1) {
            logService.record(user.getId(), null, TARGET_AUTH, null, "LOGIN_FAIL", "账号已停用");
            throw new BusinessException(ResultCode.FORBIDDEN, "账号已停用");
        }
        userMapper.updateLastLogin(user.getId());
        logService.record(user.getId(), null, TARGET_AUTH, null, "LOGIN", null);
        return new LoginResult(
                jwtService.issue(user.getId()),
                jwtService.getExpiresIn(),
                CurrentUserVO.of(userMapper.findById(user.getId())));
    }

    @Transactional
    public UserVO register(RegisterRequest request) {
        SysRole role = roleMapper.findByCode(DEFAULT_ROLE);
        if (role == null) {
            throw new IllegalStateException("缺少系统角色 " + DEFAULT_ROLE);
        }
        SysUser user = new SysUser();
        user.setUsername(request.username().trim());
        user.setPasswordHash(passwordHasher.hash(request.password()));
        user.setRealName(request.realName().trim());
        user.setRoleId(role.getId());
        user.setWeeklyCapacity(DEFAULT_WEEKLY_CAPACITY);
        user.setSkillTags(List.of());
        try {
            userMapper.insert(user);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(ResultCode.CONFLICT, "账号已存在");
        }
        logService.record(user.getId(), null, "USER", user.getId(), "REGISTER", "注册账号 " + user.getUsername());
        return UserVO.of(userMapper.findById(user.getId()));
    }

    public CurrentUserVO me() {
        return CurrentUserVO.of(load(AuthContext.require().id()));
    }

    @Transactional
    public UserVO updateMe(ProfileUpdate request) {
        SysUser user = load(AuthContext.require().id());
        String realName = request.realName() == null
                ? user.getRealName()
                : request.realName().trim();
        String email = request.email() == null ? user.getEmail() : blankToNull(request.email());
        var skillTags = request.skillTags() == null ? user.getSkillTags() : request.skillTags();
        userMapper.updateProfile(user.getId(), realName, email, skillTags);
        return UserVO.of(load(user.getId()));
    }

    @Transactional
    public void changePassword(PasswordChange request) {
        SysUser user = load(AuthContext.require().id());
        if (!passwordHasher.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "原密码错误");
        }
        userMapper.updatePassword(user.getId(), passwordHasher.hash(request.newPassword()));
    }

    private SysUser load(Long id) {
        SysUser user = userMapper.findById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        return user;
    }

    private static String blankToNull(String s) {
        return s.isBlank() ? null : s.trim();
    }
}
