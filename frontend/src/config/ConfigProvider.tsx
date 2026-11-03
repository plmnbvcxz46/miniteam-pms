import { useState, type ReactNode } from "react";
import { configs } from "../data/settings";
import { ConfigContext } from "./ConfigContext";

const initialValues = Object.fromEntries(configs.map((c) => [c.key, c.value]));

export default function ConfigProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  return (
    <ConfigContext.Provider value={{ values, save: setValues }}>
      {children}
    </ConfigContext.Provider>
  );
}
