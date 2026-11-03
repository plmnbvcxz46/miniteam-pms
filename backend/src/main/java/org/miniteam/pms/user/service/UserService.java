package org.miniteam.pms.user.service;

import java.security.SecureRandom;
import java.util.List;
import org.miniteam.pms.auth.AuthContext;
import org.miniteam.pms.auth.LoginUser;
import org.miniteam.pms.auth.PasswordHasher;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.PageResult;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.system.service.OperationLogService;
import org.miniteam.pms.user.dto.ResetPasswordResult;
import org.miniteam.pms.user.dto.RoleVO;
import org.miniteam.pms.user.dto.UserBriefVO;
import org.miniteam.pms.user.dto.UserCreate;
import org.miniteam.pms.user.dto.UserVO;
import org.miniteam.pms.user.entity.SysUser;
import org.miniteam.pms.user.mapper.RoleMapper;
import org.miniteam.pms.user.mapper.UserMapper;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 用户管理（系统管理员）和用户搜索（邀请成员用）。权限在这里校验，不依赖 Controller。 */
@Service
public class UserService {

    private static final String TARGET_USER = "USER";
    private static final int DEFAULT_WEEKLY_CAPACITY = 40;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_SEARCH_LIMIT = 20;
    private static final int RESET_PASSWORD_LENGTH = 10;
    /** 去掉了 0/O、1/l/I 这类容易看混的字符 */
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final PasswordHasher passwordHasher;
    private final OperationLogService logService;
    private final SecureRandom random = new SecureRandom();

    public UserService(
            UserMapper userMapper,
            RoleMapper roleMapper,
            PasswordHasher passwordHasher,
            OperationLogService logService) {
        this.userMapper = userMapper;
        this.roleMapper = roleMapper;
        this.passwordHasher = passwordHasher;
        this.logService = logService;
    }

    public PageResult<UserVO> list(String keyword, String dept, Long roleId, Integer status, int page, int size) {
        AuthContext.requireAdmin();
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int offset = (Math.max(page, 1) - 1) * safeSize;
        long total = userMapper.countByFilter(keyword, dept, roleId, status);
        List<UserVO> list = userMapper.list(keyword, dept, roleId, status, offset, safeSize).stream()
                .map(UserVO::of)
                .toList();
        return PageResult.of(total, list);
    }

    @Transactional
    public UserVO create(UserCreate request) {
        LoginUser operator = AuthContext.requireAdmin();
        if (roleMapper.findById(request.roleId()) == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "角色不存在");
        }
        SysUser user = new SysUser();
        user.setUsername(request.username().trim());
        user.setPasswordHash(passwordHasher.hash(request.password()));
        user.setRealName(request.realName().trim());
        user.setDept(blankToNull(request.dept()));
        user.setRoleId(request.roleId());
        user.setEmail(blankToNull(request.email()));
        user.setSkillTags(request.skillTags() == null ? List.of() : request.skillTags());
        user.setWeeklyCapacity(request.weeklyCapacity() == null ? DEFAULT_WEEKLY_CAPACITY : request.weeklyCapacity());
        try {
            userMapper.insert(user);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(ResultCode.CONFLICT, "账号已存在");
        }
        logService.record(operator.id(), null, TARGET_USER, user.getId(), "CREATE", "新建用户 " + user.getUsername());
        return UserVO.of(userMapper.findById(user.getId()));
    }

    @Transactional
    public void setStatus(Long userId, int status) {
        LoginUser operator = AuthContext.requireAdmin();
        SysUser target = load(userId);
        if (operator.id().equals(target.getId())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "不能停用自己的账号");
        }
        userMapper.updateStatus(userId, status);
        logService.record(
                operator.id(),
                null,
                TARGET_USER,
                userId,
                status == 1 ? "ENABLE" : "DISABLE",
                (status == 1 ? "启用用户 " : "停用用户 ") + target.getUsername());
    }

    @Transactional
    public ResetPasswordResult resetPassword(Long userId) {
        LoginUser operator = AuthContext.requireAdmin();
        SysUser target = load(userId);
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < RESET_PASSWORD_LENGTH; i++) {
            password.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        }
        userMapper.updatePassword(userId, passwordHasher.hash(password.toString()));
        logService.record(
                operator.id(), null, TARGET_USER, userId, "RESET_PASSWORD", "重置用户 " + target.getUsername() + " 的密码");
        return new ResetPasswordResult(password.toString());
    }

    /** 邀请成员时搜人：任何登录用户可用，只搜启用的账号，只返回最少的字段。 */
    public List<UserBriefVO> search(String keyword, int limit) {
        AuthContext.require();
        String text = keyword == null ? "" : keyword.trim();
        if (text.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "请输入姓名或账号");
        }
        int safeLimit = Math.min(Math.max(limit, 1), MAX_SEARCH_LIMIT);
        return userMapper.search(text, safeLimit).stream()
                .map(u -> new UserBriefVO(u.getId(), u.getUsername(), u.getRealName()))
                .toList();
    }

    public List<RoleVO> listRoles() {
        AuthContext.require();
        return roleMapper.listWithUserCount().stream().map(RoleVO::of).toList();
    }

    private SysUser load(Long userId) {
        SysUser user = userMapper.findById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }
        return user;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
