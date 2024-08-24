interface DocumentData {
  data: {
    id: string;
    containerId: string | null;
    userId: string;
    key: string;
    fileName: string;
    fileType: string;
    createdAt: Date;
    container?: {
      id: string;
      name: string;
      description?: string | null;
    } | null;
    user?: {
      id: string;
      name: string | null;
      email: string | null;
    };
    signatures?: Array<{
      id: string;
      userId: string;
      fileId: string;
      signatureType: string;
      signedAt: Date;
    }>;
  };
}
