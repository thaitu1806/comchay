const BADGE_LABELS: Record<string, string> = {
  best_seller: "Best Seller",
  ban_chay: "Bán chạy",
  yeu_thich: "Yêu thích",
};

interface ProductBadgeProps {
  badge: string | null | undefined;
}

export default function ProductBadge({ badge }: ProductBadgeProps) {
  if (!badge) return null;

  const label = BADGE_LABELS[badge];
  if (!label) return null;

  return (
    <span className="absolute top-2 left-2 z-10 rounded-md bg-cam-chay px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
      {label}
    </span>
  );
}
