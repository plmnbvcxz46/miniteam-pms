import { useState } from "react";
import { ConfirmDialog } from "../../components/patterns/ConfirmDialog";
import {
  SearchDropdown,
  SearchDropdownRow,
} from "../../components/patterns/SearchDropdown";
import { ToastHost, useToast } from "../../components/patterns/ToastHost";
import { Button } from "../../components/ui/Button";
import styles from "../UiShowcasePage.module.css";
import patternStyles from "./PatternsShowcase.module.css";

interface Person {
  id: number;
  name: string;
  account: string;
  role: string;
}

const PEOPLE: Person[] = [
  { id: 1, name: "系统管理员", account: "admin", role: "系统管理员" },
  { id: 2, name: "张三", account: "zhangsan", role: "普通用户" },
  { id: 3, name: "李四", account: "lisi", role: "普通用户" },
  { id: 4, name: "王五", account: "wangwu", role: "普通用户" },
];

function SearchDemos() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState("");
  const [lineQuery, setLineQuery] = useState("");
  const [lineLoading, setLineLoading] = useState(false);
  const matched = PEOPLE.filter(
    (p) => p.name.includes(query) || p.account.includes(query.toLowerCase()),
  );
  const lineMatched = PEOPLE.filter((p) => p.name.includes(lineQuery));

  return (
    <div className={patternStyles.searchDemos}>
      <div className={patternStyles.searchCell}>
        <span className={styles.code}>variant=&quot;box&quot;（工具栏）</span>
        <SearchDropdown
          variant="box"
          boxLabel="搜索"
          ariaLabel="搜索人员"
          items={matched}
          getKey={(p) => p.id}
          value={query}
          onChange={setQuery}
          onPick={(p) => setPicked(p.name)}
          placeholder="姓名或账号"
          headWord="PEOPLE"
          emptyText="没有匹配的人员"
          minWidth={300}
          renderItem={(p) => (
            <SearchDropdownRow name={p.name} sub={p.account} end={p.role} />
          )}
        />
        <span className={styles.desc}>已选：{picked || "—"}</span>
      </div>

      <div className={patternStyles.searchCell}>
        <span className={styles.code}>variant=&quot;line&quot; + loading + footer</span>
        <SearchDropdown
          ariaLabel="选择负责人"
          items={lineMatched}
          getKey={(p) => p.id}
          value={lineQuery}
          onChange={(next) => {
            setLineQuery(next);
            setLineLoading(true);
            window.setTimeout(() => setLineLoading(false), 500);
          }}
          onPick={(p) => setLineQuery(p.name)}
          loading={lineLoading}
          placeholder="输入姓名，模拟异步搜索"
          headWord="ASSIGNEE"
          footer={{ content: "未分配", onPick: () => setLineQuery("") }}
          renderItem={(p) => <SearchDropdownRow name={p.name} end={p.role} />}
        />
      </div>
    </div>
  );
}

function ConfirmDemos() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const confirm = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setOpen(false);
      toast("账号已删除");
    }, 600);
  };

  return (
    <div className={styles.row}>
      <Button variant="danger" onClick={() => setOpen(true)}>
        打开 ConfirmDialog
      </Button>
      <Button onClick={() => toast("已保存")}>Toast（neutral）</Button>
      <Button onClick={() => toast("保存失败", { tone: "danger" })}>
        Toast（danger）
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="删除账号？"
        description="删除后这个账号不能再登录，且无法恢复。"
        confirmLabel="确认删除"
        loading={loading}
        onConfirm={confirm}
      />
    </div>
  );
}

export function SearchConfirmShowcase() {
  return (
    <ToastHost>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// PATTERNS · SEARCH &amp; CONFIRM</span>
            <h2 className={styles.panelTitle}>
              SearchDropdown、ConfirmDialog 与 ToastHost
            </h2>
          </div>
          <p className={styles.panelNote}>
            第 3 步新增：下拉搜索（combobox 键盘 ↑↓/Enter/Esc）· 破坏性操作二次确认 ·
            全局轻提示队列
          </p>
        </div>
        <SearchDemos />
        <ConfirmDemos />
      </section>
    </ToastHost>
  );
}
