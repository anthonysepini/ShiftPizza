import type { AuditLog } from "../../types";

export interface ActionConfig {
  label: string;
  icon: string;
  color: string;
  pillClass: string;
  iconClass: string;
  description: (
    log: AuditLog,
  ) => string;
}

export const ACTION_CONFIG: Record<
  string,
  ActionConfig
> = {
  GENERATE_MONTH: {
    label: "Escala gerada",
    icon: "📅",
    color: "text-orange-300",
    pillClass:
      "border-orange-500/20 bg-orange-500/10 text-orange-200",
    iconClass:
      "border-orange-500/15 bg-orange-500/10 text-orange-200",

    description: (log) => {
      const metadata =
        log.metadata as {
          year?: number;
          month?: number;
          created?: number;
        } | null;

      if (
        metadata?.year &&
        metadata?.month
      ) {
        const monthName =
          new Date(
            metadata.year,
            metadata.month - 1,
          ).toLocaleDateString(
            "pt-BR",
            {
              month: "long",
              year: "numeric",
            },
          );

        return `${metadata.created ?? 0} dias criados para ${monthName}`;
      }

      return "Escala mensal gerada automaticamente";
    },
  },

  UPDATE_DAY: {
    label: "Dia alterado",
    icon: "✏️",
    color: "text-amber-300",
    pillClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-200",
    iconClass:
      "border-amber-500/15 bg-amber-500/10 text-amber-200",

    description: (log) => {
      const metadata =
        log.metadata as {
          from?: string;
          to?: string;
          note?: string;
        } | null;

      const statusLabel: Record<
        string,
        string
      > = {
        SCHEDULED:
          "Agendado",
        ABSENT: "Falta",
        EXTRA_SHIFT:
          "Turno Extra",
        DAY_OFF: "Folga",
        REMOVED_SHIFT:
          "Removido",
      };

      if (
        metadata?.from &&
        metadata?.to
      ) {
        const from =
          statusLabel[
            metadata.from
          ] ?? metadata.from;

        const to =
          statusLabel[
            metadata.to
          ] ?? metadata.to;

        return `Status alterado de ${from} para ${to}${
          metadata.note
            ? ` · ${metadata.note}`
            : ""
        }`;
      }

      return "Status de um dia foi alterado";
    },
  },

  CREATE_EMPLOYEE: {
    label:
      "Funcionário cadastrado",
    icon: "👤",
    color:
      "text-emerald-300",
    pillClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    iconClass:
      "border-emerald-500/15 bg-emerald-500/10 text-emerald-200",

    description: () =>
      "Novo funcionário adicionado ao sistema",
  },

  UPDATE_EMPLOYEE: {
    label:
      "Funcionário atualizado",
    icon: "✏️",
    color: "text-amber-300",
    pillClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-200",
    iconClass:
      "border-amber-500/15 bg-amber-500/10 text-amber-200",

    description: (log) => {
      const metadata =
        log.metadata as {
          changedFields?: string[];
        } | null;

      return metadata
        ?.changedFields
        ?.length
        ? `Campos atualizados: ${metadata.changedFields.join(", ")}`
        : "Dados do funcionário atualizados";
    },
  },

  TOGGLE_EMPLOYEE_ACTIVE: {
    label:
      "Status do funcionário alterado",
    icon: "🔄",
    color:
      "text-orange-300",
    pillClass:
      "border-orange-500/20 bg-orange-500/10 text-orange-200",
    iconClass:
      "border-orange-500/15 bg-orange-500/10 text-orange-200",

    description: (log) => {
      const metadata =
        log.metadata as {
          isActive?: boolean;
        } | null;

      if (
        metadata?.isActive ===
        true
      ) {
        return "Funcionário ativado";
      }

      if (
        metadata?.isActive ===
        false
      ) {
        return "Funcionário desativado";
      }

      return "Status de acesso do funcionário alterado";
    },
  },

  DELETE_EMPLOYEE: {
    label:
      "Funcionário removido",
    icon: "🗑️",
    color: "text-red-300",
    pillClass:
      "border-red-500/20 bg-red-500/10 text-red-200",
    iconClass:
      "border-red-500/15 bg-red-500/10 text-red-200",

    description: (log) => {
      const metadata =
        log.metadata as {
          fullName?: string;
        } | null;

      return metadata
        ?.fullName
        ? `${metadata.fullName} foi removido do sistema`
        : "Funcionário removido do sistema";
    },
  },
};

export const FALLBACK_ACTION_CONFIG: ActionConfig =
  {
    label: "Ação do sistema",
    icon: "⚙️",
    color: "text-slate-300",
    pillClass:
      "border-white/10 bg-white/[0.04] text-slate-200",
    iconClass:
      "border-white/10 bg-white/[0.04] text-slate-200",
    description: () =>
      "Ação do sistema",
  };

export function getAuditActionConfig(
  log: AuditLog,
): ActionConfig {
  return (
    ACTION_CONFIG[
      log.action
    ] ?? {
      ...FALLBACK_ACTION_CONFIG,
      label: log.action,
    }
  );
}

export function formatShortDate(
  value: string,
): string {
  return new Date(
    value,
  ).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
    },
  );
}

export function formatTime(
  value: string,
): string {
  return new Date(
    value,
  ).toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export function formatFullDateTime(
  value: string,
): string {
  return new Date(
    value,
  ).toLocaleString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export function isAuditToday(
  value: string,
): boolean {
  const date =
    new Date(value);

  const today =
    new Date();

  return (
    date.getDate() ===
      today.getDate() &&
    date.getMonth() ===
      today.getMonth() &&
    date.getFullYear() ===
      today.getFullYear()
  );
}
