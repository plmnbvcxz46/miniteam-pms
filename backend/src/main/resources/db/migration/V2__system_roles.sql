-- 系统角色只保留两个：系统管理员、普通用户。
-- 项目内的角色（项目经理、普通成员、测试人员）在 project_member.project_role，不属于系统角色。
-- 此时还没有任何用户，删除多余角色不会被外键拦住。

UPDATE sys_role SET permissions = JSON_ARRAY('system:view') WHERE code = 'ADMIN';

UPDATE sys_role SET code = 'USER', name = '普通用户', sort = 2, permissions = JSON_ARRAY() WHERE code = 'MEMBER';

DELETE FROM sys_role WHERE code IN ('PM', 'TESTER', 'GUEST');
