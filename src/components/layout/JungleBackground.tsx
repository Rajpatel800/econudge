/** Renders the two SVG jungle silhouette layers behind all content. */
export default function JungleBackground() {
  return (
    <div aria-hidden="true">
      <div className="jungle-bg" />
      <div className="jungle-layer-1" />
      <div className="jungle-layer-2" />
    </div>
  );
}
