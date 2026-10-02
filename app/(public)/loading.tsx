import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function PublicLoading() {
  return (
    <div className="bg-brand-900 pt-40 pb-24">
      <LoadingSpinner label="Loading page…" className="text-white/80" />
    </div>
  );
}
