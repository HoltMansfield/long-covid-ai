import { H } from "@highlight-run/node";
import { env } from "@/env";

H.init({
  projectID: "d0oevl36hees769uqvl0",
  serviceName: "long-covid-ai-server",
  environment: env.APP_ENV,
});

export function withHighlightError<Args extends unknown[], R>(
  fn: (...params: Args) => Promise<R>
):
  (...params: Args) => Promise<R> {
  return async (...params: Args): Promise<R> => {
    if (env.APP_ENV === "E2E") {
      return await fn(...params);
    }
    try {
      const result = await fn(...params);
      return result;
    } catch (error) {
      H.consumeError(error as Error);
      throw error;
    }
  };
}
