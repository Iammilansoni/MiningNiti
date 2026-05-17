import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  miningDocsUploader: f({ 
    pdf: { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB" },
    text: { maxFileSize: "16MB" }
  })
    .middleware(async () => {
      try {
        const user = await auth();
        if (!user || !user.userId) throw new Error("Unauthorized");
        return { userId: user.userId };
      } catch (error) {
        console.error("UploadThing auth error:", error);
        throw new Error("Authentication failed");
      }
    })
    .onUploadComplete(async ({ file }) => {
      console.log("File uploaded successfully:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;