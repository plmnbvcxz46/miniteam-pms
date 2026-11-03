import { useOutletContext } from "react-router-dom";
import type { ProjectPeriod } from "../types/global";

/** Shell 通过 <Outlet context> 交给各页面的内容 */
export interface ShellContext {
  /** 当前项目的起止日期 */
  period: ProjectPeriod;
}

/** 当前项目的起止日期，随项目切换和“项目信息”里的修改变化 */
export function useProjectPeriod(): ProjectPeriod {
  return useOutletContext<ShellContext>().period;
}
