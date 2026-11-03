package org.miniteam.pms.system.service;

import java.util.List;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.system.dto.ConfigItemVO;
import org.miniteam.pms.system.mapper.ConfigMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConfigService {

    private static final String WEIGHT_PREFIX = "priority.weight.";

    private final ConfigMapper mapper;

    public ConfigService(ConfigMapper mapper) {
        this.mapper = mapper;
    }

    public List<ConfigItemVO> list() {
        return mapper.listAll().stream().map(ConfigItemVO::of).toList();
    }

    @Transactional
    public ConfigItemVO update(String key, String value) {
        if (mapper.findByKey(key) == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "参数不存在");
        }
        String normalized = value.trim();
        validate(key, normalized);
        mapper.updateValue(key, normalized);
        return ConfigItemVO.of(mapper.findByKey(key));
    }

    /**
     * 按参数类型校验取值。优先级权重是逐个保存的，没法在单次请求里校验“四个之和为 1”，
     * 这里只保证每个权重在 0~1 之间，合计由前端保存前校验。
     */
    private static void validate(String key, String value) {
        if (key.startsWith(WEIGHT_PREFIX)) {
            double v = parseNumber(value, "须为数字");
            if (v < 0 || v > 1) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "取值须在 0 到 1 之间");
            }
        } else if (key.equals("priority.alpha")) {
            if (parseNumber(value, "须为数字") < 0) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "不能小于 0");
            }
        } else if (key.equals("priority.top_n") || key.equals("member.weekly_capacity")) {
            double v = parseNumber(value, "须为整数");
            if (v != Math.rint(v) || v < 1 || v > 1000) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "须为 1 到 1000 的整数");
            }
        }
    }

    private static double parseNumber(String value, String message) {
        try {
            double v = Double.parseDouble(value);
            if (Double.isNaN(v) || Double.isInfinite(v)) {
                throw new NumberFormatException();
            }
            return v;
        } catch (NumberFormatException e) {
            throw new BusinessException(ResultCode.BAD_REQUEST, message);
        }
    }
}
