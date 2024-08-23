import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface iAppProps {
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

export function DocumentEditForm({ data }: iAppProps) {

    return (
        <div>

            <Button variant={'outline'} size={'icon'} asChild>
                <Link href={'/dashboard/document'}>
                    <ChevronLeft className="w-4 h-4" />
                </Link>
            </Button>

            <h1>Edit Document</h1>
            <p>File Name: {data.fileName}</p>
            <p>File Type: {data.fileType}</p>
            <p>Created At: {new Date(data.createdAt).toLocaleString()}</p>
            {data.container && (
                <div>
                    <h2>Container Details</h2>
                    <p>Container Name: {data.container.name}</p>
                    <p>Container Description: {data.container.description}</p>
                </div>
            )}
            {data.user && (
                <div>
                    <h2>Uploaded By</h2>
                    <p>User Name: {data.user.name}</p>
                    <p>User Email: {data.user.email}</p>
                </div>
            )}
            {data.signatures && data.signatures.length > 0 && (
                <div>
                    <h2>Signatures</h2>
                    {data.signatures.map(signature => (
                        <div key={signature.id}>
                            <p>Signature ID: {signature.id}</p>
                            <p>Signed By: {signature.userId}</p>
                            <p>Signature Type: {signature.signatureType}</p>
                            <p>Signed At: {new Date(signature.signedAt).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}