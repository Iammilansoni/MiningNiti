import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    callbackUrl: `${appUrl}/api/uploadthing`,
  },
});