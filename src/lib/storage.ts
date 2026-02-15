import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

function getClient(): S3Client {
  const endpoint = process.env.STORAGE_ENDPOINT;
  const region = process.env.STORAGE_REGION || "auto";
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY || "";

  return new S3Client({
    endpoint: endpoint || undefined,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

function getBucket(): string {
  return process.env.STORAGE_BUCKET || "";
}

function getBasePath(): string {
  return process.env.STORAGE_BASE_PATH || "mdnuais";
}

function fullKey(path: string): string {
  const base = getBasePath();
  return base ? `${base}/${path}` : path;
}

export async function getObject(path: string): Promise<string | null> {
  const client = getClient();
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: getBucket(),
        Key: fullKey(path),
      })
    );
    return (await response.Body?.transformToString("utf-8")) || null;
  } catch {
    return null;
  }
}

export async function putObject(
  path: string,
  content: string,
  contentType = "text/plain"
): Promise<void> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: fullKey(path),
      Body: content,
      ContentType: contentType,
    })
  );
}

export async function deleteObject(path: string): Promise<void> {
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: fullKey(path),
    })
  );
}

export async function listObjects(
  prefix: string
): Promise<string[]> {
  const client = getClient();
  const fullPrefix = fullKey(prefix);
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: getBucket(),
        Prefix: fullPrefix,
        ContinuationToken: continuationToken,
      })
    );

    if (response.Contents) {
      const base = getBasePath();
      for (const obj of response.Contents) {
        if (obj.Key) {
          const relative = base ? obj.Key.replace(`${base}/`, "") : obj.Key;
          keys.push(relative);
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

export async function uploadImage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const client = getClient();
  const key = fullKey(`assets/images/${filename}`);

  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `/api/assets/images/${filename}`;
}

export async function getObjectBuffer(
  path: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const client = getClient();
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: getBucket(),
        Key: fullKey(path),
      })
    );
    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) return null;
    return {
      buffer: Buffer.from(bytes),
      contentType: response.ContentType || "application/octet-stream",
    };
  } catch {
    return null;
  }
}
