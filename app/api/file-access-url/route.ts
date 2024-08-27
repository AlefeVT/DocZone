import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';
import { s3Client } from '../s3client-config';
import { currentUser } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';

export async function GET(req: NextRequest) {
  const user = await currentUser();

  if (!user || !user.id) {
    redirect('/auth/login');
  }

  const prisma = new PrismaClient();

  const files = await prisma.file.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      key: true,
      fileName: true,
      fileType: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!files || files.length === 0) {
    return NextResponse.json({ files: [] }, { status: 200 });
  }

  try {
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const command = new GetObjectCommand({
          Bucket: process.env.BUCKET_S3!,
          Key: file.key,
          ResponseContentDisposition: 'inline', // Configuração para exibir o arquivo no navegador
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hora

        return {
          id: file.id,
          fileName: file.fileName,
          fileType: file.fileType,
          createdAt: file.createdAt,
          url,
        };
      })
    );

    return NextResponse.json({ files: filesWithUrls });
  } catch (error) {
    console.error('Error generating access URLs:', error);
    return NextResponse.json(
      { error: 'Failed to generate access URLs' },
      { status: 500 }
    );
  }
}
