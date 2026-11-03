package org.miniteam.pms.user.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.miniteam.pms.user.entity.SysUser;

@Mapper
public interface UserMapper {

    SysUser findById(@Param("id") Long id);

    SysUser findByUsername(@Param("username") String username);

    long count();

    void insert(SysUser user);

    void updateLastLogin(@Param("id") Long id);

    void updatePassword(@Param("id") Long id, @Param("passwordHash") String passwordHash);

    void updateProfile(
            @Param("id") Long id,
            @Param("realName") String realName,
            @Param("email") String email,
            @Param("skillTags") List<String> skillTags);

    void updateByAdmin(
            @Param("id") Long id,
            @Param("realName") String realName,
            @Param("dept") String dept,
            @Param("roleId") Long roleId,
            @Param("email") String email,
            @Param("skillTags") List<String> skillTags,
            @Param("weeklyCapacity") Integer weeklyCapacity);

    void delete(@Param("id") Long id);

    void updateStatus(@Param("id") Long id, @Param("status") int status);

    List<SysUser> list(
            @Param("keyword") String keyword,
            @Param("dept") String dept,
            @Param("roleId") Long roleId,
            @Param("status") Integer status,
            @Param("offset") int offset,
            @Param("size") int size);

    long countByFilter(
            @Param("keyword") String keyword,
            @Param("dept") String dept,
            @Param("roleId") Long roleId,
            @Param("status") Integer status);

    /** 只在启用的用户里搜，供邀请成员用 */
    List<SysUser> search(@Param("keyword") String keyword, @Param("limit") int limit);
}
