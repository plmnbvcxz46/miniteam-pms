package org.miniteam.pms.system.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.miniteam.pms.system.entity.SysConfig;

@Mapper
public interface ConfigMapper {

    List<SysConfig> listAll();

    SysConfig findByKey(@Param("key") String key);

    void updateValue(@Param("key") String key, @Param("value") String value);
}
