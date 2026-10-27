package org.miniteam.pms.common.result;

import java.util.List;

/** 分页数据：{total, list}。 */
public record PageResult<T>(long total, List<T> list) {

    public static <T> PageResult<T> of(long total, List<T> list) {
        return new PageResult<>(total, list);
    }

    public static <T> PageResult<T> empty() {
        return new PageResult<>(0, List.of());
    }
}
