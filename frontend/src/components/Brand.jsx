// Brand mark: MunimJi wordmark logo (public/MunimJi-logo.png, exact 2:1).
export function BrandTile({ size = 36 }) {
  return (
    <img
      src="/MunimJi-logo.png"
      alt="MunimJi"
      width={size * 2}
      height={size}
      draggable={false}
      className="block select-none"
    />
  );
}

export default function Brand({ compact = false }) {
  return <BrandTile size={compact ? 26 : 32} />;
}
