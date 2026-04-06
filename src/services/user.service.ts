import { hashPassword } from '../utils/password';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/prisma';
import { parsePagination, buildMeta } from '../utils/pagination';
import type { CreateUserInput, UpdateUserInput } from '../validators/user.validators';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listUsers(rawPage: unknown, rawLimit: unknown) {
  const { page, limit, skip } = parsePagination(rawPage, rawLimit, 100);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  return { users, meta: buildMeta(page, limit, total) };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  if (!user) throw AppError.notFound('User');
  return user;
}

export async function createUser(data: CreateUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw AppError.conflict(`An account with email '${data.email}' already exists`);
  }

  const passwordHash = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role ?? 'VIEWER',
    },
    select: USER_SELECT,
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  // Ensure user exists
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('User');

  return prisma.user.update({
    where: { id },
    data,
    select: USER_SELECT,
  });
}

export async function deleteUser(id: string): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('User');

  await prisma.user.delete({ where: { id } });
}
