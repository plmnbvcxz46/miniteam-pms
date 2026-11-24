import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import {
  ActivityFeed,
  type ActivityFeedItem,
} from "../../components/patterns/ActivityFeed";
import { ListRow } from "../../components/patterns/ListRow";
import { Panel } from "../../components/patterns/Panel";
import { Badge } from "../../components/ui/Badge";
import styles from "../UiShowcasePage.module.css";
import demoStyles from "./MemberPatternsShowcase.module.css";

const LIGHT_ITEMS: readonly ActivityFeedItem[] = [
  { id: 1, time: "11.24", content: "林晓宇 授予 赵鹏 编辑任务权限", title: "林晓宇 授予 赵鹏 编辑任务权限" },
  { id: 2, time: "11.23", content: "林晓宇 修改 周敏 角色为 测试人员", title: "林晓宇 修改 周敏 角色为 测试人员" },
  { id: 3, time: "11.20", content: "系统管理员 邀请 王婷 加入项目", title: "系统管理员 邀请 王婷 加入项目" },
  { id: 4, time: "11.18", content: "林晓宇 调整 陈佳伟 编辑文档权限", title: "林晓宇 调整 陈佳伟 编辑文档权限" },
];

const DARK_ITEMS: readonly ActivityFeedItem[] = [
  { id: 101, time: "今天 09:42", content: "赵鹏 把 任务看板拖拽 重启为进行中" },
  { id: 102, time: "昨天 16:10", content: "王婷 上传了 界面规范_v2.md 并请求评审" },
  { id: 103, time: "11.20", content: "林晓宇 在 权限模型讨论 中 @了 陈佳伟" },
];

function ListRowDemo() {
  const [selectedId, setSelectedId] = useState<number>(2);
  const [clickedNote, setClickedNote] = useState("点击按钮行可查看选中态切换");

  return (
    <div className={demoStyles.block}>
      <span className={styles.code}>
        ListRow · compact / comfortable · 跳转 Link / 按钮选中 / 告警 / 只读
      </span>
      <div className={demoStyles.listBox}>
        <MemoryRouter>
          <ListRow
            to="/board/task?id=12"
            density="compact"
            tone="alert"
            leading={<span className={demoStyles.monoTag}>T-12</span>}
            title="商品发布与图片云存储上传（Link 跳转 + 告警态）"
            meta="赵鹏"
            trailing={
              <>
                <Badge variant="solid" size="sm">
                  关键
                </Badge>
                <span>逾期 2 天</span>
              </>
            }
          />
        </MemoryRouter>
        <ListRow
          density="comfortable"
          selected={selectedId === 2}
          onClick={() => {
            setSelectedId(2);
            setClickedNote("已选中第 2 行（comfortable）");
          }}
          leading={<span className={demoStyles.monoTag}>#24</span>}
          title="架构设计评审与接口对齐（原生 button 可选中）"
          meta="林晓宇 · 11.24"
          trailing="3 条回复"
        />
        <ListRow
          density="comfortable"
          selected={selectedId === 3}
          onClick={() => {
            setSelectedId(3);
            setClickedNote("已选中第 3 行（comfortable）");
          }}
          leading={<span className={demoStyles.monoTag}>#25</span>}
          title="测试环境部署流水线配置"
          meta="周敏 · 11.22"
          trailing="进行中"
        />
        <ListRow
          density="compact"
          title="还有 3 项未展示任务（只读 div 语义）"
          trailing="查看全部"
        />
      </div>
      <span className={styles.desc}>{clickedNote}</span>
    </div>
  );
}

function ActivityFeedDemo() {
  const [activeId, setActiveId] = useState<number | string>(101);

  return (
    <div className={demoStyles.feedGrid}>
      <Panel kicker="// LOGS" title="ActivityFeed · 浅面双列截断">
        <ActivityFeed
          items={LIGHT_ITEMS}
          surface="light"
          columns={2}
          truncate
          className={demoStyles.lightFeed}
        />
      </Panel>

      <Panel variant="flat" kicker="// ACTIVITY" title="ActivityFeed · 深面可选中">
        <ActivityFeed
          items={DARK_ITEMS}
          surface="dark"
          activeId={activeId}
          onSelect={setActiveId}
          className={demoStyles.darkFeed}
        />
      </Panel>
    </div>
  );
}

export function MemberPatternsShowcase() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// PATTERNS · MEMBERS</span>
          <h2 className={styles.panelTitle}>ListRow 与 ActivityFeed</h2>
        </div>
        <p className={styles.panelNote}>
          第 5 步新增：原生语义跳转/选中列表行 · 浅/深面单双列时间线动态流
        </p>
      </div>
      <ListRowDemo />
      <ActivityFeedDemo />
    </section>
  );
}
