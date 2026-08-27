import type { HTMLAttributes } from "react";

export type SafeAreaProps = HTMLAttributes<HTMLDivElement> & { position?: "top" | "bottom" };
