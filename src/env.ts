import * as yup from "yup";

// Define the environment schema
const envSchema = yup.object({
  // Application environment
  APP_ENV: yup
    .string()
    .oneOf([
      "LOCAL",
      "DEPLOY_PREVIEW",
      "BRANCH_PREVIEW",
      "PREVIEW_SERVER",
      "PRODUCTION",
      "E2E",
      "CI",
    ])
    .default("LOCAL"),

  // Server configuration
  PORT: yup.number().default(3000),

  // Database configuration
  DB_URL: yup.string().when("APP_ENV", {
    is: (env: string) => env === "E2E" || env === "CI",
    then: () => yup.string().default("noDB_URLForThis_APP_ENV"),
    otherwise: () => yup.string().required("Database URL is required"),
  }),

  MIGRATIONS_PATH: yup.string().default("./drizzle/migrations"),

  // Email service
  RESEND_API_KEY: yup.string().when("APP_ENV", {
    is: (env: string) => env === "E2E" || env === "CI",
    then: () => yup.string().default("noEmailsForThis_APP_ENV"),
    otherwise: () =>
      yup
        .string()
        .required("Resend API key is required for non-E2E/CI environments"),
  }),

  // Error tracking
  HIGHLIGHT_API_KEY: yup.string().when("APP_ENV", {
    is: "PRODUCTION",
    then: () =>
      yup.string().required("Highlight API key is required for production"),
    otherwise: () => yup.string().optional(),
  }),

  // Testing
  E2E_URL: yup.string().when("APP_ENV", {
    is: "E2E",
    then: () => yup.string().default("http://localhost:3001"),
    otherwise: () => yup.string().optional(),
  }),

  // Debugging
  DEBUG: yup.boolean().default(false),

  // Logging
  LOG_LEVEL: yup
    .string()
    .oneOf(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
});

// Function to validate and parse environment variables
function validateEnv() {
  try {
    // Cast and validate environment variables
    const validatedEnv = envSchema.validateSync(process.env, {
      abortEarly: false,
      stripUnknown: true,
    });

    return validatedEnv;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      console.error("❌ Invalid environment variables:");
      error.errors.forEach((err) => {
        console.error(`  - ${err}`);
      });
    } else {
      console.error(
        "❌ Unknown error validating environment variables:",
        error
      );
    }

    console.error("process.env:", process.env);

    process.exit(1);
  }
}

// Export the validated environment
export const env = validateEnv();

// Export type for type safety
export type EnvVars = yup.InferType<typeof envSchema>;
