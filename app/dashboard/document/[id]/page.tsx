import { DocumentEditForm } from './_components/documentEditForm';
import getDocumentEdit from './actions';

export default async function DocumentEditRoute({
  params,
}: {
  params: { id: string };
}) {
  const data = await getDocumentEdit(params.id);

  return <DocumentEditForm data={data} />;
}
