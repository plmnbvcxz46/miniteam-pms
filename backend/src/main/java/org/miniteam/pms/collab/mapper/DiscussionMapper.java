package org.miniteam.pms.collab.mapper;

import java.util.Collection;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.miniteam.pms.collab.entity.Comment;
import org.miniteam.pms.collab.entity.Discussion;
import org.miniteam.pms.collab.entity.UserName;

@Mapper
public interface DiscussionMapper {

    Discussion findById(@Param("id") Long id);

    /** 项目里的讨论，最近有回复的在前；taskId 不为空时只取这个任务的 */
    List<Discussion> listByProject(@Param("projectId") Long projectId, @Param("taskId") Long taskId);

    void insert(Discussion discussion);

    /** 评论数加 1，最后评论时间改成现在 */
    void bump(@Param("id") Long id);

    List<Comment> listComments(@Param("discussionId") Long discussionId);

    /** 项目里全部讨论的全部评论，往期存档和协作页快照用 */
    List<Comment> listCommentsByProject(@Param("projectId") Long projectId);

    Comment findComment(@Param("id") Long id);

    void insertComment(Comment comment);

    List<UserName> listUsers(@Param("ids") Collection<Long> ids);
}
