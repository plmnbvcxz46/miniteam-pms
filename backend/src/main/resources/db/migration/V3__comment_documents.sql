-- 评论里 @ 的文档：只存文档 ID，读的时候再取文档名。和 mentions（@ 的用户 ID）并列。
ALTER TABLE comment
    ADD COLUMN documents JSON NULL COMMENT '@ 到的文档 ID' AFTER mentions;
