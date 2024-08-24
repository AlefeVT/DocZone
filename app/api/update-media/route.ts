import { currentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { s3Client } from '../s3client-config';
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileKey = searchParams.get('fileKey');
  const newFileName = searchParams.get('newFileName');
  const newFileType = searchParams.get('newFileType');

  const user = await currentUser();

  if (!fileKey || typeof fileKey !== 'string') {
    console.error('Invalid fileKey:', fileKey);
    return NextResponse.json(
      { error: 'fileKey is required and must be a string' },
      { status: 400 }
    );
  }

  if (!newFileName && !newFileType) {
    return NextResponse.json(
      { error: 'At least one of newFileName or newFileType must be provided' },
      { status: 400 }
    );
  }

  if (!user || !user.id) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const prisma = new PrismaClient();

  try {
    // Verifica se o arquivo existe no banco de dados e pertence ao usuário
    const file = await prisma.file.findFirst({
      where: {
        key: fileKey,
        userId: user.id,
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found or does not belong to the user' },
        { status: 404 }
      );
    }

    // Gerar novo key se o nome do arquivo ou tipo for alterado
    const newKey = newFileName
      ? `${user.id}/${randomUUID()}.${newFileType?.split('/')[1] || file.fileType.split('/')[1]}`
      : fileKey;

    if (newKey !== fileKey) {
      // Copiar o arquivo para a nova chave (renomear no S3)
      const copyParams = {
        Bucket: process.env.BUCKET_S3!,
        CopySource: `${process.env.BUCKET_S3!}/${fileKey}`,
        Key: newKey,
        ContentType: newFileType || file.fileType,
      };
      await s3Client.send(new CopyObjectCommand(copyParams));

      // Deletar o arquivo antigo
      const deleteParams = {
        Bucket: process.env.BUCKET_S3!,
        Key: fileKey,
      };
      await s3Client.send(new DeleteObjectCommand(deleteParams));
    }

    // Atualiza os metadados do arquivo no banco de dados
    const updatedFile = await prisma.file.update({
      where: {
        id: file.id,
      },
      data: {
        key: newKey,
        fileName: newFileName || file.fileName,
        fileType: newFileType || file.fileType,
      },
    });

    return NextResponse.json({
      message: 'File metadata and S3 object updated successfully',
      updatedFile,
    });
  } catch (error) {
    console.error('Error updating file metadata or S3 object:', error);
    return NextResponse.json(
      { error: 'Failed to update file metadata or S3 object' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
