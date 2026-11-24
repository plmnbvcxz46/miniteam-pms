import { HeroCard } from "../../../components/patterns/HeroCard";
import { Badge } from "../../../components/ui/Badge";
import type { DocumentItem } from "../../../shared/types/documents";
import { pad2 } from "../../../shared/utils/date";
import styles from "./DocumentDetail.module.css";

interface DocumentDetailHeroProps {
  doc: DocumentItem;
  status: string;
  isLate: boolean;
  lateDays: number;
}

export default function DocumentDetailHero({
  doc,
  status,
  isLate,
  lateDays,
}: DocumentDetailHeroProps) {
  return (
    <HeroCard
      tone={isLate ? "alert" : "surface"}
      kicker={doc.n}
      badge={
        isLate ? (
          <Badge variant="solid" size="sm">
            风险
          </Badge>
        ) : undefined
      }
    >
      <div className={styles.heroRow}>
        <b className={styles.heroFigure}>{isLate ? pad2(lateDays) : doc.v}</b>
        <span className={styles.heroSub}>
          {isLate ? (
            <>
              天 逾期
              <br />
              截止 {doc.due}
            </>
          ) : doc.final ? (
            <>
              定稿
              <br />
              {doc.up}
            </>
          ) : (
            <>
              {status}
              {doc.due && (
                <>
                  <br />
                  截止 {doc.due}
                </>
              )}
            </>
          )}
        </span>
      </div>
    </HeroCard>
  );
}
