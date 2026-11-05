package org.miniteam.pms.collab.entity;

import lombok.Data;

/** 评论里 @ 到的用户的基本信息。 */
@Data
public class UserName {

    private Long id;
    private String username;
    private String realName;
}
