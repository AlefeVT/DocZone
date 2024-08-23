import { currentUser } from '@/lib/auth';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { s3Client } from '../s3client-config';
import { PrismaClient } from '@prisma/client';

export async function DELETE(req: NextRequest) {
  // Extrair o fileId dos parâmetros de consulta
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('fileId');

  if (!fileId || typeof fileId !== 'string') {
    console.error('Invalid fileId:', fileId);
    return NextResponse.json(
      { error: 'fileId is required and must be a string' },
      { status: 400 }
    );
  }

  const user = await currentUser();

  if (!user || !user.id) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const prisma = new PrismaClient();

  // Verifica se o arquivo existe no banco de dados e pertence ao usuário
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId: user.id,
    },
  });

  if (!file) {
    return NextResponse.json(
      { error: 'File not found or does not belong to the user' },
      { status: 404 }
    );
  }

  const s3Params = {
    Bucket: process.env.BUCKET_S3!,
    Key: file.key,
  };

  try {
    const command = new DeleteObjectCommand(s3Params);
    await s3Client.send(command);

    // Remove o registro do arquivo do banco de dados
    await prisma.file.delete({
      where: {
        id: file.id,
      },
    });

    return NextResponse.json({
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file from S3 or database:', error);
    return NextResponse.json(
      { error: 'Failed to delete file from S3 or database' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
