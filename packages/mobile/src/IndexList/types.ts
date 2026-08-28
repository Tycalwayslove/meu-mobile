import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, Ref } from "react";

export type IndexListSection = {
  brief?: ReactNode;
  content: ReactNode;
  key: string;
  title?: ReactNode;
};

export type IndexListChangeSource = "index" | "scroll";

export type IndexListChangeDetails = {
  event?: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>;
  source: IndexListChangeSource;
};

export type IndexListScrollOptions = {
  behavior?: ScrollBehavior;
  focusIndex?: boolean;
};

export type IndexListRef = {
  scrollTo: (key: string, options?: IndexListScrollOptions) => boolean;
};

export type IndexListProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
  indexAriaLabel?: string;
  onIndexChange?: (key: string, details: IndexListChangeDetails) => void;
  ref?: Ref<IndexListRef>;
  sections: readonly IndexListSection[];
  sticky?: boolean;
};
