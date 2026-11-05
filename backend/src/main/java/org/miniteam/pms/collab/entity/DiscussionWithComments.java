package org.miniteam.pms.collab.entity;

import java.util.List;

/** 一个讨论和它的全部评论（旧的在前），往期存档里存的就是这个。 */
public record DiscussionWithComments(Discussion discussion, List<Comment> comments) {}
