declare namespace NodeJS {
  interface ProcessEnv {
    APP_ENV?:
      | "LOCAL"
      | "DEPLOY_PREVIEW"
      | "BRANCH_PREVIEW"
      | "PREVIEW_SERVER"
      | "PRODUCTION"
      | "E2E"
      | "CI";
    PORT?: string;
    DB_URL?: string;
    MIGRATIONS_PATH?: string;
    RESEND_API_KEY?: string;
    HIGHLIGHT_API_KEY?: string;
    E2E_URL?: string;
    DEBUG?: string;
    LOG_LEVEL?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  }
}
