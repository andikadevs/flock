import { useEffect, useState } from "react";
import { botsApi, type HandlerInfo } from "./api.ts";

/** The bot types the server can run, for the add-bot form. */
export function useHandlers(): HandlerInfo[] {
  const [handlers, setHandlers] = useState<HandlerInfo[]>([]);

  useEffect(() => {
    void botsApi.listHandlers().then(setHandlers);
  }, []);

  return handlers;
}
