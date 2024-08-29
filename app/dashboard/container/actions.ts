'use server';

import { PrismaClient } from '@prisma/client';

export async function listContainers() {
  const prisma = new PrismaClient();

  const containers = await prisma.container.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      files: {
        select: {
          id: true,
        },
      },
    },
  });

  const containerData = containers.map((container) => ({
    ...container,
    filesCount: container.files.length,
  }));

  return containerData;
}