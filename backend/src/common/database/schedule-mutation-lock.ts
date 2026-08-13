import { Prisma } from '@prisma/client';

type ScheduleMutationClient = Pick<Prisma.TransactionClient, '$queryRaw'>;

/**
 * Serializes operations that derive schedule rows from weekly rules.
 * The transaction-scoped PostgreSQL advisory lock works across API instances.
 */
export async function acquireScheduleMutationLock(
  client: ScheduleMutationClient,
): Promise<void> {
  await client.$queryRaw`SELECT pg_advisory_xact_lock(7217510606575683)`;
}
