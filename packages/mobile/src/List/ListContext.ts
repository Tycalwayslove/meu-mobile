import { createContext, useContext } from "react";

import type { ListDivider } from "./types";

type ListContextValue = {
  divider: ListDivider;
  insideList: boolean;
};

export const ListContext = createContext<ListContextValue>({
  divider: "none",
  insideList: false
});

export function useListContext(): ListContextValue {
  return useContext(ListContext);
}
