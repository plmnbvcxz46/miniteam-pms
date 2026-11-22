import { useState, type FormEvent } from "react";
import {
  ActionPopover,
  ActionPopoverFooterButton,
} from "../../components/patterns/ActionPopover";
import { BrandMark } from "../../components/patterns/BrandMark";
import { EmptyState } from "../../components/patterns/EmptyState";
import { FormDrawer } from "../../components/patterns/FormDrawer";
import { PageHeader } from "../../components/patterns/PageHeader";
import { PageState } from "../../components/patterns/PageState";
import { Panel } from "../../components/patterns/Panel";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import styles from "../UiShowcasePage.module.css";
import patternStyles from "./PatternsShowcase.module.css";

function BrandAndHeaderSection() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// PATTERNS · BRAND &amp; HEADER</span>
          <h2 className={styles.panelTitle}>BrandMark 与 PageHeader 业务范式</h2>
        </div>
        <p className={styles.panelNote}>
          第 1～2 步新增：双色品牌标 + 60px / 44px 报刊刊头页头
        </p>
      </div>

      <div className={styles.row}>
        <div className={patternStyles.brandChip}>
          <BrandMark size="sm" />
          <span className={styles.code}>sm</span>
        </div>
        <div className={patternStyles.brandChip}>
          <BrandMark size="md" showWordmark />
          <span className={styles.code}>md + wordmark</span>
        </div>
        <div className={patternStyles.brandChipInverse}>
          <BrandMark size="sm" tone="inverse" showWordmark />
          <span className={styles.code}>inverse</span>
        </div>
      </div>

      <div className={patternStyles.headerDemoBox}>
        <PageHeader
          as="div"
          kicker="第 02/10 周 · 进行中 4 项"
          title="项目"
          accentTitle="日报"
          actions={<Button variant="accent">+ 新建任务</Button>}
        />
      </div>

      <div className={patternStyles.headerDemoBox}>
        <PageHeader
          as="div"
          size="compact"
          breadcrumb={<Button size="sm">← 返回看板</Button>}
          kicker="TASK #12"
          title="架构设计评审"
          subtitle="计划周期 11.17 – 11.24"
          actions={<Button size="sm">编辑任务</Button>}
        />
      </div>
    </section>
  );
}

function PanelAndStateSection() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// PATTERNS · PANEL &amp; STATES</span>
          <h2 className={styles.panelTitle}>Panel、EmptyState 与 PageState</h2>
        </div>
        <p className={styles.panelNote}>
          default / flat / dark 三态面板 · 空态与整页加载/无存档/错误态
        </p>
      </div>

      <div className={patternStyles.panelGrid}>
        <Panel
          kicker="// TODAY"
          title="标准面板（default）"
          headerRight={<Badge size="sm">02</Badge>}
        >
          <EmptyState
            variant="dashed"
            title="暂无待办项"
            description="EmptyState(dashed)：用于空列表或未选择项时的虚线占位提示。"
          />
        </Panel>

        <Panel
          variant="flat"
          kicker="// FLAT"
          title="无内边距面板（flat）"
          headerRight={<span className={styles.code}>共 3 条</span>}
        >
          <div className={patternStyles.flatRow}>列表行贴边铺满示例</div>
        </Panel>

        <Panel
          variant="dark"
          kicker="// CHAIN"
          title="反色面板（dark）"
          headerRight={<Badge size="sm" variant="accent">关键路径</Badge>}
        >
          <p className={patternStyles.darkCopy}>
            反色深底面板正文与次要文字自动切换高对比暖纸色。
          </p>
        </Panel>
      </div>

      <div className={patternStyles.stateStack}>
        <PageState status="loading" description="正在同步项目数据…" />
        <PageState status="missing" description="这一期没有存档，看不到当时的日报。" />
        <PageState
          status="error"
          description="接口请求失败（500），请稍后重试。"
          onRetry={() => undefined}
        />
      </div>
    </section>
  );
}

function OverlayPatternsSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [popoverNote, setPopoverNote] = useState("尚未点击浮层操作");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setErrorMsg("填写项目名称后才能提交");
      return;
    }
    setErrorMsg("");
    setDrawerOpen(false);
    setPopoverNote(`已提交 FormDrawer 示例：${projectName.trim()}`);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// PATTERNS · FORM &amp; POPOVER</span>
          <h2 className={styles.panelTitle}>FormDrawer 与 ActionPopover</h2>
        </div>
        <p className={styles.panelNote}>
          基于 ui/Drawer(md) 的标准表单抽屉与基于 ui/Popover(none) 的刊头列表浮层
        </p>
      </div>

      <div className={styles.row}>
        <Button variant="accent" onClick={() => setDrawerOpen(true)}>
          打开 FormDrawer 示例
        </Button>

        <ActionPopover
          title="PROJECTS"
          meta="2"
          width="sm"
          trigger={<Button variant="default">展开 ActionPopover ▾</Button>}
          footer={
            <ActionPopoverFooterButton
              onClick={() => setPopoverNote("点击了底部动作：新建项目")}
            >
              新建项目
            </ActionPopoverFooterButton>
          }
        >
          <div className={patternStyles.popItem}>
            <span className={styles.code}>test1</span>
            <span className={styles.desc}>进行中 · 第 6 期</span>
          </div>
          <div className={patternStyles.popItem}>
            <span className={styles.code}>校园二手交易平台</span>
            <span className={styles.desc}>进行中 · 第 42 期</span>
          </div>
        </ActionPopover>

        <span className={styles.desc}>{popoverNote}</span>
      </div>

      <FormDrawer
        open={drawerOpen}
        onOpenChange={(next) => {
          setDrawerOpen(next);
          if (!next) setErrorMsg("");
        }}
        title="新建项目"
        submitLabel="提交示例"
        submitError={errorMsg}
        onSubmit={handleSubmit}
      >
        <Field label="项目名称" required error={errorMsg || undefined}>
          <Input
            value={projectName}
            placeholder="留空点击提交可预览行内报错"
            onChange={(e) => {
              setProjectName(e.target.value);
              setErrorMsg("");
            }}
          />
        </Field>
      </FormDrawer>
    </section>
  );
}

export function PatternsShowcase() {
  return (
    <>
      <BrandAndHeaderSection />
      <PanelAndStateSection />
      <OverlayPatternsSection />
    </>
  );
}
