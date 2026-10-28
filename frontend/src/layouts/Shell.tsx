import { NavLink, Outlet } from "react-router-dom";
import SettingsDrawer from "../overlays/settings/SettingDrawer";

export default function Shell() {
  return (
    <div className="shell" id="shell">
      {/* 左侧边栏 */}
      <aside className="index" id="index">
        <button
          className="project"
          type="button"
          id="mh-project"
          aria-haspopup="true"
          aria-expanded="false"
          aria-label="切换项目"
        >
          <svg className="logo" viewBox="0 0 34 34" aria-hidden="true">
            <rect x="0" y="0" width="15" height="34" fill="#FAFAF7" />
            <rect x="19" y="0" width="15" height="18" fill="#FF5A1F" />
          </svg>
          <span id="proj-name">测试项目 App</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>

        <div className="issues projs" id="projs" hidden>
          <h4>我参与的项目</h4>
          <div id="proj-list" />
          <button type="button" className="pnew" data-form="project">
            新建项目
          </button>
        </div>

        <nav className="grp" aria-label="项目" data-l="// 项目">
          <NavLink to="/overview">概览</NavLink>
          <NavLink to="/board">
            任务<span className="risk" id="risk-count" hidden />
          </NavLink>
          <NavLink to="/progress">进度</NavLink>
          <NavLink to="/reports">统计报表</NavLink>
        </nav>

        <nav className="grp" aria-label="团队" data-l="// 团队">
          <NavLink to="/collab">团队协作</NavLink>
          <NavLink to="/documents">文档</NavLink>
          <NavLink to="/members">成员与权限</NavLink>
          <NavLink to="/settings">系统管理</NavLink>
        </nav>

        <div className="arch-card">
          <i aria-hidden="true" />
          <b>往期日报</b>
          <button type="button" className="open-issues">
            查看往期 <span aria-hidden="true">→</span>
          </button>
        </div>
      </aside>

      {/* 顶部栏 */}
      <header className="masthead" id="masthead">
        <h1 className="sys-title" id="mh-system" hidden>
          系统管理
        </h1>
        <div id="issue-wrap">
          <button
            className="issue"
            type="button"
            id="issue-btn"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <b id="issue-no">第 32 期</b>
            <span id="issue-date">2026 年 10 月 22 日 周四</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M2 4l4 4 4-4" />
            </svg>
          </button>
          <button className="back" type="button" id="back" hidden>
            回到今天
          </button>
          <div className="issues" id="issues" hidden>
            <h4>往期</h4>
            <div id="issue-list" />
          </div>
        </div>

        <div className="slot">
          <div id="mid-weeks" className="weekline">
            <span>9.21</span>
            <div className="weeks" aria-label="项目共 10 周，当前第 5 周">
              <span className="past" />
              <span className="past" />
              <span className="past" />
              <span className="past" />
              <span className="now" />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <span>11.29</span>
          </div>
          <nav className="subtabs" id="mid-subtabs" aria-label="设置" hidden />
        </div>

        <button className="bell" type="button" aria-label="通知">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M4 11V7a4 4 0 018 0v4l1 1.5H3L4 11z" />
            <path d="M6.5 14h3" />
          </svg>
          <i aria-hidden="true" />
        </button>

        <button className="me" type="button" id="me-btn">
          <span>测</span>
          <em>
            测试经理 A<small>pm_a · 项目经理</small>
          </em>
        </button>
      </header>

      {/* 主视图内容区域 */}
      <main>
        <Outlet />
      </main>

      {/* 设置抽屉 */}
      <SettingsDrawer />
    </div>
  );
}
