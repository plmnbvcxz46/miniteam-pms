import {
  Alert,
  type AlertProps,
  type AlertTone,
  type AlertVariant,
} from "../../components/ui/Alert";
import {
  Badge,
  type BadgeProps,
  type BadgeSize,
  type BadgeVariant,
} from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type TabsContentProps,
  type TabsListProps,
  type TabsProps,
  type TabsTriggerProps,
} from "../../components/ui/Tabs";
import styles from "../UiShowcasePage.module.css";

function DemoBadge(props: BadgeProps) {
  return <Badge {...props} />;
}

function DemoAlert(props: AlertProps) {
  return <Alert {...props} />;
}

function DemoTabs(props: TabsProps) {
  return <Tabs {...props} />;
}

function DemoTabsList(props: TabsListProps) {
  return <TabsList {...props} />;
}

function DemoTabsTrigger(props: TabsTriggerProps) {
  return <TabsTrigger {...props} />;
}

function DemoTabsContent(props: TabsContentProps) {
  return <TabsContent {...props} />;
}

const BADGE_ITEMS: {
  variant: BadgeVariant;
  label: string;
  note: string;
}[] = [
  {
    variant: "solid",
    label: "已完成 / 已就绪",
    note: "墨底反白（常态强标识：完成、定稿、已就绪）",
  },
  {
    variant: "outline",
    label: "V3 · 架构设计",
    note: "墨框暖纸底（常规角色、任务编号、版本标签）",
  },
  {
    variant: "muted",
    label: "规划中 / 归档",
    note: "弱化描边与次要字（待办、归档、次要说明）",
  },
  {
    variant: "accent",
    label: "逾期 +2D / 阻塞",
    note: "信号橙（仅用于逾期、阻塞、关键路径等需注意状态）",
  },
];

const BADGE_SIZES: BadgeSize[] = ["sm", "md"];

const ALERT_TONES: {
  tone: AlertTone;
  variant: AlertVariant;
  title: string;
  body: string;
}[] = [
  {
    tone: "info",
    variant: "inline",
    title: "INFO · 中性色常规提示",
    body: "进度和报表数据由后端实时计算，看往期快照时页面自动切换为只读。",
  },
  {
    tone: "warning",
    variant: "banner",
    title: "WARNING · 历史快照只读横幅",
    body: "当前正在浏览第 28 期（2026-11-18）历史存档，所有新建与编辑操作已锁定。",
  },
  {
    tone: "danger",
    variant: "inline",
    title: "DANGER · 校验或权限拦截",
    body: "关联文档尚未定稿（409 Conflict），无法将当前任务流转至已完成状态。",
  },
];

export function DisplayShowcase() {
  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// BADGE</span>
            <h2 className={styles.panelTitle}>Badge 状态与分类徽标</h2>
          </div>
          <p className={styles.panelNote}>
            solid（墨底常态）/ outline（墨框）/ muted（弱化）/ accent（信号橙，仅用于需注意状态）
          </p>
        </div>

        <div className={styles.formGrid}>
          {BADGE_ITEMS.map((item) => (
            <div key={item.variant} className={styles.formCell}>
              <span className={styles.code}>{item.variant}</span>
              <div className={styles.row}>
                {BADGE_SIZES.map((sz) => (
                  <DemoBadge key={sz} variant={item.variant} size={sz}>
                    {item.label} · {sz}
                  </DemoBadge>
                ))}
              </div>
              <span className={styles.desc}>{item.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// ALERT</span>
            <h2 className={styles.panelTitle}>Alert 行内与横幅提示</h2>
          </div>
          <p className={styles.panelNote}>
            inline / banner × info（中性色）/ warning（信号橙）/ danger（信号橙）
          </p>
        </div>

        <div className={styles.fieldStack}>
          {ALERT_TONES.map((item) => (
            <DemoAlert
              key={item.tone}
              variant={item.variant}
              tone={item.tone}
              title={item.title}
              action={
                item.variant === "banner" ? (
                  <Button size="sm" variant="default">
                    返回当期
                  </Button>
                ) : undefined
              }
            >
              {item.body}
            </DemoAlert>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelHeading}>
            <span className={styles.kicker}>// TABS · RADIX UI</span>
            <h2 className={styles.panelTitle}>Tabs 平铺报刊风标签页</h2>
          </div>
          <p className={styles.panelNote}>
            基于 radix-ui Tabs · 墨底反白激活态 · 支持方向键切换与单项禁用
          </p>
        </div>

        <DemoTabs defaultValue="me">
          <DemoTabsList aria-label="系统设置面板切换">
            <DemoTabsTrigger value="me">01 个人资料</DemoTabsTrigger>
            <DemoTabsTrigger value="people">02 人员管理</DemoTabsTrigger>
            <DemoTabsTrigger value="params">03 系统参数</DemoTabsTrigger>
            <DemoTabsTrigger value="logs">04 操作日志</DemoTabsTrigger>
            <DemoTabsTrigger value="sso" disabled>
              05 外部集成（已禁用）
            </DemoTabsTrigger>
          </DemoTabsList>
          <DemoTabsContent value="me">
            <div className={styles.sandboxControls}>
              <span className={styles.code}>PANEL 01 · 个人资料与密码</span>
              <span className={styles.desc}>
                当前登录身份：ADMIN · 支持修改显示名、联系方式与登录密码。
              </span>
            </div>
          </DemoTabsContent>
          <DemoTabsContent value="people">
            <div className={styles.sandboxControls}>
              <span className={styles.code}>PANEL 02 · 人员与系统角色</span>
              <span className={styles.desc}>
                管理系统管理员（ADMIN）与普通用户（USER）账号状态及初始密码重置。
              </span>
            </div>
          </DemoTabsContent>
          <DemoTabsContent value="params">
            <div className={styles.sandboxControls}>
              <span className={styles.code}>PANEL 03 · 全局系统参数</span>
              <span className={styles.desc}>
                配置项目最大成员数、默认归档阈值及文档上传大小上限。
              </span>
            </div>
          </DemoTabsContent>
          <DemoTabsContent value="logs">
            <div className={styles.sandboxControls}>
              <span className={styles.code}>PANEL 04 · 审计操作日志</span>
              <span className={styles.desc}>
                按时间倒序查阅全站写操作记录与操作人 IP。
              </span>
            </div>
          </DemoTabsContent>
        </DemoTabs>
      </section>
    </>
  );
}
