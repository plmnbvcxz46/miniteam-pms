interface CollabHeaderProps {
  kicker: string;
}

export default function CollabHeader({ kicker }: CollabHeaderProps) {
  return (
    <div className="vh">
      <div className="vl">
        <div className="k" id="tm-kicker">
          {kicker}
        </div>
        <h1 className="vt">
          团队<em>协作</em>
        </h1>
      </div>
    </div>
  );
}
