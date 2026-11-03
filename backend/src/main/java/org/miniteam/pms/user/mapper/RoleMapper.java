package org.miniteam.pms.user.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.miniteam.pms.user.entity.SysRole;

@Mapper
public interface RoleMapper {

    SysRole findByCode(@Param("code") String code);

    SysRole findById(@Param("id") Long id);

    /** 全部角色，带各自的用户数 */
    List<SysRole> listWithUserCount();
}
