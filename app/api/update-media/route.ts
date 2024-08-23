import { currentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

    // Atualiza os metadados do arquivo no banco de dados
    const updatedFile = await prisma.file.update({
      where: {
        id: file.id,
      },
      data: {
        fileName: newFileName || file.fileName,
        fileType: newFileType || file.fileType,
      },
    });

    return NextResponse.json({
      message: 'File metadata updated successfully',
      updatedFile,
    });
  } catch (error) {
    console.error('Error updating file metadata:', error);
    return NextResponse.json(
      { error: 'Failed to update file metadata' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
