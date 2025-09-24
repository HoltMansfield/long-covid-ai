"use client";

import NextError from "next/error";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="en">
      <body>
        <NextError statusCode={500} title={error.message} />
      </body>
    </html>
  );
}
