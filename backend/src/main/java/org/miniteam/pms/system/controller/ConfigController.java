package org.miniteam.pms.system.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.miniteam.pms.auth.AuthContext;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.system.dto.ConfigItemVO;
import org.miniteam.pms.system.dto.ConfigUpdate;
import org.miniteam.pms.system.service.ConfigService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/configs")
public class ConfigController {

    private final ConfigService configService;

    public ConfigController(ConfigService configService) {
        this.configService = configService;
    }

    /** 所有登录用户可读：看板的优先级得分要用权重 */
    @GetMapping
    public Result<List<ConfigItemVO>> list() {
        AuthContext.require();
        return Result.ok(configService.list());
    }

    @PutMapping("/{key}")
    public Result<ConfigItemVO> update(@PathVariable String key, @Valid @RequestBody ConfigUpdate request) {
        AuthContext.requireAdmin();
        return Result.ok(configService.update(key, request.value()));
    }
}
