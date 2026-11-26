import {
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { activityApi, memberApi, projectApi } from "../../services/projects";
import type {
  Activity,
  MemberPermissions,
  Project,
  ProjectRole,
  ProjectSave,
  ProjectSummary,
} from "../../shared/types/global";
import type { Member, MemberAdd } from "../../shared/types/members";
import { ProviderError } from "../ProviderError";
import { ProjectContext, type ProjectState } from "./ProjectContext";

const SELECTED_KEY = "pms.project";
const LOG_LIMIT = 100;
const NO_MEMBERS: Member[] = [];
const NO_LOGS: Activity[] = [];

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

function buildProjectActions(params: {
  projects: ProjectSummary[] | null;
  currentId: number | null;
  setProjects: Dispatch<SetStateAction<ProjectSummary[] | null>>;
  setSelectedId: Dispatch<SetStateAction<number | null>>;
  setLoaded: Dispatch<SetStateAction<Loaded | null>>;
}) {
  const { projects, currentId, setProjects, setSelectedId, setLoaded } = params;
  const requireId = (): number => {
    if (currentId === null) throw new Error("还没有选中项目");
    return currentId;
  };
  const sync = async (id: number) => {
    const [data, list] = await Promise.all([load(id), projectApi.list()]);
    setLoaded(data);
    setProjects(list);
  };

  return {
    selectProject: (id: number) => {
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
}

/** 登录后才会渲染。第一次加载完项目列表和当前项目之前不显示页面 */
export default function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(readSelected);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

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

  const currentProject =
    projects?.find((p) => p.id === selectedId) ?? projects?.[0] ?? null;
  const currentId = currentProject?.id ?? null;

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

  if (error) {
    return (
      <ProviderError
        description={error}
        onRetry={() => {
          setError("");
          setAttempt((n) => n + 1);
        }}
      />
    );
  }
  if (projects === null || (currentId !== null && loaded === null)) return null;

  const fresh = loaded && loaded.id === currentId ? loaded : null;
  const actions = buildProjectActions({
    projects,
    currentId,
    setProjects,
    setSelectedId,
    setLoaded,
  });

  const value: ProjectState = {
    projects,
    currentProject,
    detail: fresh?.detail ?? null,
    members: fresh?.members ?? NO_MEMBERS,
    permLogs: fresh?.logs ?? NO_LOGS,
    ...actions,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
