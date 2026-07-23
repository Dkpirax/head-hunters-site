export function assertDevelopmentDatabase(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);

    const localHost =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1";

    const expectedDatabase =
      url.pathname.replace(/^\//, "") ===
      "headhunters_chatbot_test";

    if (!localHost || !expectedDatabase) {
      throw new Error(
        "Unsafe database target. Development migrations may run only against the local headhunters_chatbot_test database."
      );
    }
  } catch (err: any) {
    if (err.message.includes('Unsafe database target')) {
      throw err;
    }
    throw new Error(`Failed to parse database URL for safety check: ${err.message}`);
  }
}
