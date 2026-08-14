import {
  expect,
  test,
} from "@playwright/test";
import type {
  ScheduleDay,
  UpdateDayDto,
} from "../src/types";
import {
  employeeFixture,
  installApiMock,
  scheduleFixture,
  seedSession,
} from "./support/mock-api";

function nextPeriod(
  year: number,
  month: number,
) {
  return month === 12
    ? {
        year: year + 1,
        month: 1,
      }
    : {
        year,
        month: month + 1,
      };
}

test(
  "admin navega para o próximo mês sem resposta antiga sobrescrever a nova",
  async ({ page }) => {
    const today =
      new Date();

    const current = {
      year:
        today.getFullYear(),
      month:
        today.getMonth() +
        1,
    };

    const next = nextPeriod(
      current.year,
      current.month,
    );

    await seedSession(
      page,
      "ADMIN",
    );

    await installApiMock(
      page,
      (request) => {
        const url =
          new URL(
            request.url(),
          );

        if (
          url.pathname ===
          "/employees"
        ) {
          return {
            body: [
              employeeFixture,
            ],
          };
        }

        if (
          url.pathname ===
          "/schedules/month"
        ) {
          const year =
            Number(
              url.searchParams.get(
                "year",
              ),
            );

          const month =
            Number(
              url.searchParams.get(
                "month",
              ),
            );

          return {
            body: [
              scheduleFixture(
                year,
                month,
                month ===
                  current.month
                  ? "Escala atual"
                  : "Escala seguinte",
              ),
            ],
          };
        }

        return {
          body: [],
        };
      },
    );

    await page.goto(
      "/admin/schedule",
    );

    await expect(
      page.getByText(
        "Escala atual",
      ),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Próximo mês",
      })
      .click();

    await expect(
      page.getByText(
        "Escala seguinte",
      ),
    ).toBeVisible();

    await expect(
      page.getByText(
        new Date(
          next.year,
          next.month - 1,
        ).toLocaleDateString(
          "pt-BR",
          {
            month: "long",
            year: "numeric",
          },
        ),
      ).first(),
    ).toBeVisible();
  },
);

test(
  "admin filtra escala por funcionário",
  async ({ page }) => {
    let requestedEmployeeId:
      | string
      | null = null;

    const today =
      new Date();

    await seedSession(
      page,
      "ADMIN",
    );

    await installApiMock(
      page,
      (request) => {
        const url =
          new URL(
            request.url(),
          );

        if (
          url.pathname ===
          "/employees"
        ) {
          return {
            body: [
              employeeFixture,
            ],
          };
        }

        if (
          url.pathname ===
          "/schedules/month"
        ) {
          requestedEmployeeId =
            url.searchParams.get(
              "employeeId",
            );

          return {
            body: [
              scheduleFixture(
                today.getFullYear(),
                today.getMonth() +
                  1,
              ),
            ],
          };
        }

        return {
          body: [],
        };
      },
    );

    await page.goto(
      "/admin/schedule",
    );

    await page
      .getByLabel(
        "Filtrar funcionário",
      )
      .selectOption(
        employeeFixture.id,
      );

    await expect
      .poll(
        () =>
          requestedEmployeeId,
      )
      .toBe(
        employeeFixture.id,
      );
  },
);

test(
  "admin altera status e observação de um dia",
  async ({ page }) => {
    const today =
      new Date();

    let schedule:
      ScheduleDay = {
      ...scheduleFixture(
        today.getFullYear(),
        today.getMonth() +
          1,
      ),
    };

    let lastUpdate:
      | UpdateDayDto
      | null = null;

    await seedSession(
      page,
      "ADMIN",
    );

    await installApiMock(
      page,
      (request) => {
        const url =
          new URL(
            request.url(),
          );

        const method =
          request.method();

        if (
          url.pathname ===
          "/employees"
        ) {
          return {
            body: [
              employeeFixture,
            ],
          };
        }

        if (
          url.pathname ===
            "/schedules/month" &&
          method === "GET"
        ) {
          return {
            body: [
              schedule,
            ],
          };
        }

        if (
          url.pathname.startsWith(
            "/schedules/day/",
          ) &&
          method === "PATCH"
        ) {
          lastUpdate =
            request.postDataJSON() as UpdateDayDto;

          schedule = {
            ...schedule,
            ...lastUpdate,
            updatedAt:
              new Date().toISOString(),
          };

          return {
            body: schedule,
          };
        }

        return {
          body: [],
        };
      },
    );

    await page.goto(
      "/admin/schedule",
    );

    await page
      .getByRole("button", {
        name: /Editar Maria Operadora/i,
      })
      .click();

    const dialog =
      page.getByRole(
        "dialog",
        {
          name: "Editar dia",
        },
      );

    await dialog
      .getByLabel(
        "Novo status",
      )
      .selectOption("ABSENT");

    await dialog
      .getByLabel(
        "Observação (opcional)",
      )
      .fill(
        "Atestado E2E",
      );

    await dialog
      .getByRole("button", {
        name: "Salvar alteração",
      })
      .click();

    await expect
      .poll(
        () =>
          lastUpdate?.status,
      )
      .toBe("ABSENT");

    expect(
      lastUpdate?.note,
    ).toBe("Atestado E2E");

    await expect(
      page.getByText(
        "Dia atualizado com sucesso!",
      ),
    ).toBeVisible();
  },
);

test(
  "funcionário visualiza a alteração na própria escala",
  async ({ page }) => {
    const today =
      new Date();

    const schedule = {
      ...scheduleFixture(
        today.getFullYear(),
        today.getMonth() +
          1,
      ),
      status:
        "ABSENT" as const,
      note: "Atestado E2E visível ao funcionário",
    };

    await seedSession(
      page,
      "EMPLOYEE",
    );

    await installApiMock(
      page,
      (request) => {
        const url =
          new URL(
            request.url(),
          );

        if (
          url.pathname.startsWith(
            "/schedules/my/",
          )
        ) {
          return {
            body: [
              schedule,
            ],
          };
        }

        return {
          body: [],
        };
      },
    );

    await page.goto(
      "/employee/calendar",
    );

    await expect(
      page.getByRole(
        "heading",
        {
          name: "Minha Escala",
          level: 1,
        },
      ),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Atestado E2E visível ao funcionário",
      ),
    ).toBeVisible();
  },
);
