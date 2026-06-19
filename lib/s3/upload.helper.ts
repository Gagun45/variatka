import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3";

export const uploadHelper = {
  image: async ({
    entity,
    id,
    file,
  }: {
    entity: "ingredients" | "recipes";
    id: number;
    file: File;
  }) => {
    const buffer = Buffer.from(await file.arrayBuffer());

    const key = `${entity}/${id}/image.webp`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    return key;
  },
};
