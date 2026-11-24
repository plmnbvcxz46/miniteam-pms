import { Badge } from "../components/ui/Badge";
import { ButtonShowcase } from "./sections/ButtonShowcase";
import { DisplayShowcase } from "./sections/DisplayShowcase";
import { FormShowcase } from "./sections/FormShowcase";
import { OverlayShowcase } from "./sections/OverlayShowcase";
import { MemberPatternsShowcase } from "./sections/MemberPatternsShowcase";
import { PatternsShowcase } from "./sections/PatternsShowcase";
import { ReportPatternsShowcase } from "./sections/ReportPatternsShowcase";
import { SearchConfirmShowcase } from "./sections/SearchConfirmShowcase";
import { TimelinePatternsShowcase } from "./sections/TimelinePatternsShowcase";
import { RoadmapSection } from "./sections/RoadmapSection";
import styles from "./UiShowcasePage.module.css";

export default function UiShowcasePage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.kicker}>// STYLE GUIDE · PHASE 3 COMPLETE</span>
            <h1 className={styles.title}>
              组件样式<em className={styles.titleAccent}>手册</em>
            </h1>
            <p className={styles.subtitle}>
              仅开发环境可见（import.meta.env.DEV），阶段 3 全部 19 项 components/ui
              基础组件已就绪。
            </p>
          </div>
          <Badge variant="solid">DEV ONLY · /dev/ui · 19/19 已就绪</Badge>
        </header>

        <ButtonShowcase />
        <FormShowcase />
        <OverlayShowcase />
        <DisplayShowcase />
        <PatternsShowcase />
        <SearchConfirmShowcase />
        <ReportPatternsShowcase />
        <MemberPatternsShowcase />
        <TimelinePatternsShowcase />
        <RoadmapSection />
      </div>
    </div>
  );
}
