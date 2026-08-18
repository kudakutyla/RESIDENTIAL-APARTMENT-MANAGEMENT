import { House } from "lucide-react";

export function BrandMark() {
  return (
    <div className="flex items-center gap-3 text-brand-charcoal">
      <div className="relative h-10 w-10 rounded-md bg-brand-sand/50 p-2">
        <House className="h-full w-full text-brand-olive" strokeWidth={2.2} />
      </div>
      <div>
        <p className="font-serif text-2xl leading-none">HomeNest</p>
      </div>
    </div>
  );
}
