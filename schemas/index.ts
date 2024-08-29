import * as z from 'zod';

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum(['ADMIN', 'USER']),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: 'Nova Senha é obrigatória!',
      path: ['newPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: 'Senha é obrigatória!',
      path: ['password'],
    }
  );

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: 'Mínimo de 6 caracteres necessários',
  }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: 'Email é obrigatório',
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Email é obrigatório',
  }),
  password: z.string().min(1, {
    message: 'Senha é obrigatória!',
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: 'Email é obrigatório',
  }),
  password: z.string().min(6, {
    message: 'Mínimo de 6 caracteres necessários',
  }),
  name: z.string().min(1, {
    message: 'O nome é obrigatório',
  }),
});

export const fileUploadSchema = z.object({
  customFileName: z.string().min(1, 'O nome do documento é obrigatório'),
  selectedFile: z.any().refine((file) => file !== null, {
    message: 'Um documento válido deve ser selecionado',
  }),
});

export const containerSchema = z.object({
  name: z.string().min(1, 'O nome da caixa é obrigatório'),
  description: z.string().optional(),
  userId: z.string().min(1, 'Usuário não autenticado.'),
});