import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function ContactSection() {
  return (
    <section
      id="contact"
      className="py-16 px-4 md:py-24 md:px-8 lg:px-16 bg-gray-50"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Entre em Contato
          </h2>
          <p className="text-lg text-gray-600">
            Preencha o formulário abaixo e entraremos em contato com você.
          </p>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-lg font-medium text-gray-700">
              Nome
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite seu nome"
              className="border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="space-y-3">
            <Label
              htmlFor="email"
              className="text-lg font-medium text-gray-700"
            >
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              className="border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="space-y-3 md:col-span-2">
            <Label
              htmlFor="message"
              className="text-lg font-medium text-gray-700"
            >
              Mensagem
            </Label>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem"
              rows={6}
              className="border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="md:col-span-2 text-center">
            <Button type="submit" variant={'default'} className="w-full">
              Enviar
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
