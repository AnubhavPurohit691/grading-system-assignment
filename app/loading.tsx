import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-10 rounded-none" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
