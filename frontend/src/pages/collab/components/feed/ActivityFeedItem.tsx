import { Fragment } from "react";
import type { Activity } from "../../../../types/global";
import { formatMessageTime, parseRichInline } from "../../utils";

interface ActivityFeedItemProps {
  activity: Activity;
}

export default function ActivityFeedItem({ activity }: ActivityFeedItemProps) {
  const segments = parseRichInline(activity.detail);

  return (
    <div className="ev">
      <time>{formatMessageTime(activity.createdAt)}</time>
      <p>
        {segments.map((seg, idx) => {
          if (seg.type === "b") return <b key={idx}>{seg.content}</b>;
          if (seg.type === "em") return <em key={idx}>{seg.content}</em>;
          return <Fragment key={idx}>{seg.content}</Fragment>;
        })}
      </p>
    </div>
  );
}
