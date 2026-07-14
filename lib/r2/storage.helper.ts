import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "./r2";

const bucket = process.env.R2_BUCKET_NAME!;

export const storageHelper = {
  image: async ({
    entity,
    id,
    file,
  }: {
    entity: "ingredients" | "recipes";
    id: number;
    file: File;
  }) => {
    const key = `${entity}/${id}/image.webp`;

    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
      }),
    );

    return key;
  },

  delete: async (key: string) => {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  },
};
