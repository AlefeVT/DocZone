import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { s3Client } from '../s3client-config';
import { currentUser } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { Readable } from 'stream';

export async function GET(req: NextRequest) {
  const user = await currentUser();

  if (!user || !user.id) {
    return NextResponse.redirect('/auth/login');
  }

  const prisma = new PrismaClient();

  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }

  const file = await prisma.file.findUnique({
    where: { id: fileId, userId: user.id },
  });

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_S3!,
      Key: file.key,
    });

    const s3Response = await s3Client.send(command);

    // Converter o stream S3 para um Buffer
    const streamToBuffer = (stream: Readable): Promise<Buffer> => {
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    };

    const buffer = await streamToBuffer(s3Response.Body as Readable);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.fileType,
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    console.error('Error streaming PDF from S3:', error);
    return NextResponse.json(
      { error: 'Failed to stream PDF from S3' },
      { status: 500 }
    );
  }
}
