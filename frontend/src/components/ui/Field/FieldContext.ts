import { createContext, useContext } from "react";

export interface FieldControlContextValue {
  id: string;
  invalid: boolean;
  describedBy?: string;
  required: boolean;
}

export const FieldContext = createContext<FieldControlContextValue | null>(
  null,
);

/** 表单控件消费外层 Field 自动生成的 id / invalid / aria-describedby */
export function useFieldControl(): FieldControlContextValue | null {
  return useContext(FieldContext);
}
