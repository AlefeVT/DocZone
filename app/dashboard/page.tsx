import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function Dashboard() {

  return (
    <>
      <div className="grid gap4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 mt-10">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Transações</CardTitle>
            <CardDescription>
              Transações recentes dos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>

          </CardContent>
        </Card>

      </div>
    </>
  );
}
