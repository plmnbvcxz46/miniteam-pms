import { useEffect, useState, type ReactNode } from "react";
import { activityApi, memberApi, projectApi } from "../api/project";
import type {
  Activity,
  MemberPermissions,
  Project,
  ProjectRole,
  ProjectSave,
  ProjectSummary,
} from "../types/global";
import type { Member, MemberAdd } from "../types/members";
import { ProjectContext, type ProjectState } from "./ProjectContext";

const SELECTED_KEY = "pms.project";
/** 权限变更记录一次取多少条 */
const LOG_LIMIT = 100;
const NO_MEMBERS: Member[] = [];
const NO_LOGS: Activity[] = [];

/** 刷新页面后还停在上次看的项目；浏览器不让用 sessionStorage 时就从第一个开始 */
function readSelected(): number | null {
  try {
    const value = Number(sessionStorage.getItem(SELECTED_KEY));
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function saveSelected(id: number) {
  try {
    sessionStorage.setItem(SELECTED_KEY, String(id));
  } catch {
    // 只是刷新后回到第一个项目
  }
}

/** 一个项目的详情、成员和权限变更记录，三样一起取一起换，避免页面上一半新一半旧 */
interface Loaded {
  id: number;
  detail: Project;
  members: Member[];
  logs: Activity[];
}

async function load(id: number): Promise<Loaded> {
  const [detail, members, logs] = await Promise.all([
    projectApi.get(id),
    memberApi.list(id),
    activityApi.list(id, { targetType: "MEMBER", limit: LOG_LIMIT }),
  ]);
  return { id, detail, members, logs };
}

function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : "加载失败，请稍后再试";
}

/** 登录后才会渲染。第一次加载完项目列表和当前项目之前不显示页面 */
export default function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(readSelected);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  // 加一就重新取一遍，失败后点“重试”用
  const [attempt, setAttempt] = useState(0);

  // GET /projects
  useEffect(() => {
    let alive = true;
    projectApi
      .list()
      .then((list) => alive && setProjects(list))
      .catch((e: unknown) => alive && setError(messageOf(e)));
    return () => {
      alive = false;
    };
  }, [attempt]);

  // 记住的项目不在列表里（被移出、已不存在）就退回第一个
  const currentProject = projects?.find((p) => p.id === selectedId) ?? projects?.[0] ?? null;
  const currentId = currentProject?.id ?? null;

  // 当前项目的详情、成员、变更记录；切换项目时重新取
  useEffect(() => {
    if (currentId === null) return;
    let alive = true;
    load(currentId)
      .then((data) => alive && setLoaded(data))
      .catch((e: unknown) => alive && setError(messageOf(e)));
    return () => {
      alive = false;
    };
  }, [currentId, attempt]);

  // 刚切换项目、新数据还没回来时，不把上一个项目的数据当成这个项目的
  const fresh = loaded && loaded.id === currentId ? loaded : null;

  /** 写操作成功后，把当前项目和项目列表重新取一遍 */
  const sync = async (id: number) => {
    const [data, list] = await Promise.all([load(id), projectApi.list()]);
    setLoaded(data);
    setProjects(list);
  };

  const requireId = (): number => {
    if (currentId === null) throw new Error("还没有选中项目");
    return currentId;
  };

  const value: ProjectState = {
    projects: projects ?? [],
    currentProject,
    detail: fresh?.detail ?? null,
    members: fresh?.members ?? NO_MEMBERS,
    permLogs: fresh?.logs ?? NO_LOGS,
    selectProject: (id) => {
      if (projects?.some((p) => p.id === id)) {
        setSelectedId(id);
        saveSelected(id);
      }
    },
    createProject: async (values: ProjectSave) => {
      const created = await projectApi.create(values);
      setProjects(await projectApi.list());
      setSelectedId(created.id);
      saveSelected(created.id);
    },
    saveProject: async (values: ProjectSave) => {
      const id = requireId();
      await projectApi.update(id, values);
      await sync(id);
    },
    archiveProject: async () => {
      const id = requireId();
      await projectApi.archive(id);
      await sync(id);
    },
    inviteMember: async (body: MemberAdd) => {
      const id = requireId();
      await memberApi.add(id, body);
      await sync(id);
    },
    changeMemberRole: async (userId: number, role: ProjectRole) => {
      const id = requireId();
      await memberApi.update(id, userId, { projectRole: role });
      await sync(id);
    },
    setMemberPermissions: async (userId: number, permissions: MemberPermissions) => {
      const id = requireId();
      await memberApi.updatePermissions(id, userId, permissions);
      await sync(id);
    },
  };

  if (error) {
    return (
      <div className="msg err" role="alert" style={{ padding: 24 }}>
        {error}
        <button
          className="btn"
          type="button"
          style={{ marginLeft: 12 }}
          onClick={() => {
            setError("");
            setAttempt((n) => n + 1);
          }}
        >
          重试
        </button>
      </div>
    );
  }
  // 项目列表和第一个项目的数据都回来之前先不渲染；之后切换项目不会再整页空白
  if (projects === null || (currentId !== null && loaded === null)) return null;

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
