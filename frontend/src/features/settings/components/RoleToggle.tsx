import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../components/ui/ToggleGroup";
import type { Role } from "../../../shared/types/settings";

interface RoleToggleProps {
  roles: Role[];
  roleId: number;
  disabled?: boolean;
  onChange: (roleId: number) => void;
}

/** 账号类型单选：系统管理员 / 普通用户 */
export function RoleToggle({
  roles,
  roleId,
  disabled,
  onChange,
}: RoleToggleProps) {
  return (
    <ToggleGroup
      variant="chips"
      type="single"
      aria-label="账号类型"
      value={String(roleId)}
      disabled={disabled}
      // 单选组点已选项会变成空值，忽略它，保持必须选一个
      onValueChange={(v) => v && onChange(Number(v))}
    >
      {roles.map((role) => (
        <ToggleGroupItem key={role.id} value={String(role.id)}>
          {role.name}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
