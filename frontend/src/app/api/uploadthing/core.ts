import { createUploadthing, type FileRouter } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
  miningDocsUploader: f({ 
    pdf: { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB" },
    text: { maxFileSize: "16MB" }
  })
    .middleware(async ({ req }) => {
      // Auth is already enforced by Clerk's Next.js middleware (middleware.ts).
      // UploadThing v7 passes a raw Web API Request, which is incompatible
      // with Clerk's auth()/getAuth() helpers that expect NextRequest.
      // So we trust the middleware gate and just return metadata.
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log("File uploaded successfully:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;