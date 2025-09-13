import { NavigationBlockerContext } from "@/components/providers/navigation-blocker-provider";
import { use } from "react";

export function useNavigationBlocker() {
  return use(NavigationBlockerContext)
}