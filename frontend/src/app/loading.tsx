import { MiningNitiMark } from '@/components/product/brand';

export default function Loading() {
  return (
    <div className="flex min-h-[400px] h-full w-full items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="relative">
          <MiningNitiMark className="size-8 opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-8 rounded-md border-2 border-primary border-t-transparent animate-spin" />
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading platform...
        </p>
      </div>
    </div>
  );
}
