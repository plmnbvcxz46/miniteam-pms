import { useState, type FormEvent } from "react";
import { useToast } from "../../../components/patterns/ToastHost";
import type { ProfileUpdate } from "../../../shared/types/settings";
import { useAuth, useMe } from "../../../stores/auth/useAuth";
import { addSkillTag, validateEmail, validateName } from "../validation";

/** 个人资料：姓名、邮箱、技能标签；保存走 PUT /auth/me（由 AuthProvider 提供） */
export function useProfileForm() {
  const me = useMe();
  const { updateProfile } = useAuth();
  const toast = useToast();
  const profile: ProfileUpdate = {
    realName: me.user.realName,
    email: me.email ?? "",
    skillTags: me.skillTags,
  };
  const [realName, setRealName] = useState(profile.realName);
  const [email, setEmail] = useState(profile.email);
  const [skillTags, setSkillTags] = useState(profile.skillTags);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    tag: "",
    save: "",
  });
  const [saving, setSaving] = useState(false);

  const dirty =
    realName !== profile.realName ||
    email !== profile.email ||
    skillTags.join("\n") !== profile.skillTags.join("\n");
  const setError = (patch: Partial<typeof errors>) =>
    setErrors((prev) => ({ ...prev, ...patch }));

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return setTagInput("");
    const result = addSkillTag(skillTags, tag);
    setSkillTags(result.tags);
    setError({ tag: result.error });
    if (!result.error) setTagInput("");
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const name = realName.trim();
    const mail = email.trim();
    const next = {
      name: validateName(name),
      email: validateEmail(mail),
      tag: "",
      save: "",
    };
    setErrors(next);
    if (next.name || next.email) return;
    setSaving(true);
    try {
      await updateProfile({ realName: name, email: mail, skillTags });
      setRealName(name);
      setEmail(mail);
      toast("资料已保存");
    } catch (error) {
      setError({ save: error instanceof Error ? error.message : "保存失败" });
    } finally {
      setSaving(false);
    }
  };

  return {
    username: me.user.username,
    realName,
    email,
    skillTags,
    tagInput,
    errors,
    saving,
    dirty,
    setRealName: (v: string) => (
      setRealName(v),
      setError({ name: "", save: "" })
    ),
    setEmail: (v: string) => (setEmail(v), setError({ email: "", save: "" })),
    setTagInput: (v: string) => (setTagInput(v), setError({ tag: "" })),
    removeTag: (tag: string) =>
      setSkillTags(skillTags.filter((t) => t !== tag)),
    addTag,
    handleSave,
  };
}
