package org.miniteam.pms.auth;

import java.util.List;
import org.miniteam.pms.user.entity.SysRole;
import org.miniteam.pms.user.entity.SysUser;
import org.miniteam.pms.user.mapper.RoleMapper;
import org.miniteam.pms.user.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/** 启动时如果一个用户都没有，按配置建出第一个系统管理员（默认 admin / 123456，线上用环境变量覆盖）。 */
@Component
public class AdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final PasswordHasher passwordHasher;
    private final String username;
    private final String password;

    public AdminInitializer(
            UserMapper userMapper,
            RoleMapper roleMapper,
            PasswordHasher passwordHasher,
            @Value("${app.admin.username:admin}") String username,
            @Value("${app.admin.password:123456}") String password) {
        this.userMapper = userMapper;
        this.roleMapper = roleMapper;
        this.passwordHasher = passwordHasher;
        this.username = username;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userMapper.count() > 0) {
            return;
        }
        SysRole role = roleMapper.findByCode(LoginUser.ADMIN_ROLE);
        if (role == null) {
            throw new IllegalStateException("缺少系统角色 " + LoginUser.ADMIN_ROLE);
        }
        SysUser admin = new SysUser();
        admin.setUsername(username);
        admin.setPasswordHash(passwordHasher.hash(password));
        admin.setRealName("系统管理员");
        admin.setRoleId(role.getId());
        admin.setWeeklyCapacity(40);
        admin.setSkillTags(List.of());
        userMapper.insert(admin);
        log.info("用户表为空，已创建初始管理员 {}", username);
    }
}
