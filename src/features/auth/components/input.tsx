import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

interface Props extends ComponentProps<"input"> {
  icon: LucideIcon;
}

function Input({ className, type, icon: Icon, ...props }: Props) {
  return (
    // 'group' klassini shu yerga qo'shamiz
    <div className="relative group">
      <Icon
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:border-primary transition-colors duration-200"
      />
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-white/50 selection:bg-primary selection:text-primary-foreground rounded-[4px] border border-white/50 text-white/50 flex h-9 w-full min-w-0 bg-white/10 px-3 py-2 pl-9 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-white focus-visible:text-white",
          "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",

          className
        )}
        {...props}
      />
    </div>
  );
}

export { Input };
