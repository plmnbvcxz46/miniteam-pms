import { useId } from "react";
import { FormDrawer } from "../../../components/patterns/FormDrawer";
import {
  SearchDropdown,
  SearchDropdownRow,
} from "../../../components/patterns/SearchDropdown";
import { Checkbox } from "../../../components/ui/Checkbox";
import { Field } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { Separator } from "../../../components/ui/Separator";
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/ToggleGroup";
import type { ProjectRole } from "../../../shared/types/global";
import type { MemberAdd, PermDef } from "../../../shared/types/members";
import { useInviteMemberForm } from "../hooks/useInviteMemberForm";
import styles from "./InviteMemberDrawer.module.css";

interface InviteMemberDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  memberIds: number[];
  permDefs: PermDef[];
  onSubmit: (body: MemberAdd) => Promise<void>;
}

const ROLE_OPTIONS: { value: ProjectRole; label: string }[] = [
  { value: "MEMBER", label: "普通成员" },
  { value: "TESTER", label: "测试人员" },
  { value: "PM", label: "项目经理" },
];

function InviteMemberFields({
  form,
  permDefs,
  userInputId,
}: {
  form: ReturnType<typeof useInviteMemberForm>;
  permDefs: PermDef[];
  userInputId: string;
}) {
  return (
    <>
      <Field
        label="选择用户"
        required
        align="top"
        htmlFor={userInputId}
        error={form.userError || undefined}
      >
        <SearchDropdown
          inputId={userInputId}
          items={form.candidates}
          getKey={(u) => u.id}
          onPick={form.handlePickUser}
          isSelected={(u) => u.id === form.selectedUserId}
          value={form.keyword}
          onChange={form.handleKeywordChange}
          placeholder="输入姓名或账号搜索"
          ariaLabel="选择用户"
          headWord="USERS"
          loading={form.searching}
          emptyText="没有可邀请的用户"
          renderItem={(u) => (
            <SearchDropdownRow name={u.realName} sub={u.username} />
          )}
        />
      </Field>

      <Separator variant="dashed" />

      <Field label="项目角色" required align="top">
        <ToggleGroup
          type="single"
          variant="chips"
          aria-label="项目角色"
          value={form.role}
          onValueChange={(next) => {
            if (next) form.handleRoleChange(next as ProjectRole);
          }}
        >
          {ROLE_OPTIONS.map((opt) => (
            <ToggleGroupItem key={opt.value} value={opt.value}>
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <Separator variant="dashed" />

      <Field label="岗位名称">
        <Input
          variant="underline"
          placeholder="例如：后端开发、前端开发、测试"
          value={form.position}
          onChange={(e) => form.setPosition(e.target.value)}
        />
      </Field>

      <Separator variant="dashed" />

      <Field label="初始权限" align="top">
        <div className={styles.permChecklist}>
          {permDefs.map((def) => (
            <Checkbox
              key={def.key}
              label={def.label}
              checked={form.perms[def.key]}
              disabled={form.role === "PM"}
              onCheckedChange={() => form.handlePermToggle(def.key)}
            />
          ))}
        </div>
      </Field>
    </>
  );
}

export default function InviteMemberDrawer({
  isOpen,
  onClose,
  memberIds,
  permDefs,
  onSubmit,
}: InviteMemberDrawerProps) {
  const userInputId = useId();
  const form = useInviteMemberForm({ memberIds, onSubmit, onClose });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset();
      onClose();
    }
  };

  return (
    <FormDrawer
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="邀请"
      accentTitle="成员"
      submitLabel={form.submitting ? "邀请中…" : "确认邀请"}
      submitting={form.submitting}
      submitError={form.submitError || undefined}
      onSubmit={form.handleSubmit}
    >
      <InviteMemberFields
        form={form}
        permDefs={permDefs}
        userInputId={userInputId}
      />
    </FormDrawer>
  );
}
