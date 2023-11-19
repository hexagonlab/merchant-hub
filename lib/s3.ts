import {
  ObjectCannedACL,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';

export const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!!,
  },
});

export async function uploadFile(key: string, arrayBuffer: ArrayBuffer) {
  const params: PutObjectCommandInput = {
    ACL: ObjectCannedACL.public_read,
    Bucket: 'merchanhub',
    Key: key,
    Body: Buffer.from(arrayBuffer),
    Tagging: 'public=yes',
  };

  try {
    const data = await client.send(new PutObjectCommand(params));
    console.log('File uploaded successfully', data);
    return data;
  } catch (err) {
    console.error('Error uploading file to S3', err);
    throw err;
  }
}
