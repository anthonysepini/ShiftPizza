import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogParams {
  actorUserId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    params: AuditLogParams,
    client: Pick<Prisma.TransactionClient, 'auditLog'> = this.prisma,
  ) {
    return client.auditLog.create({
      data: {
        actorUserId: params.actorUserId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata ?? {},
      },
    });
  }

  async findAll(limit = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        actorUserId: true,
        action: true,
        entity: true,
        entityId: true,
        metadata: true,
        createdAt: true,
        actor: {
          select: {
            id: true,
            role: true,
            employee: { select: { fullName: true } },
          },
        },
      },
    });
  }
}
