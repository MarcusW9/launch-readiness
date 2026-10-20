import { Progress, ProgressLabel } from "@/components/ui/progress";

export function LabelledProgress({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <Progress value={value} min={0} max={Math.max(max, 1)} className="gap-2">
      <ProgressLabel className="font-normal text-muted-foreground">{label}</ProgressLabel>
    </Progress>
  );
}
