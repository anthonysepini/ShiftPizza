import {
  expect,
  test,
  type Page,
} from "@playwright/test";
import type {
  CreateEmployeeDto,
  Employee,
  ScheduleDay,
  UpdateDayDto,
  UpdateEmployeeDto,
} from "../src/types";
import {
  civilDate,
  employeeFixture,
  installApiMock,
  scheduleFixture,
  seedSession,
} from "./support/mock-api";

function createInitialEmployee(): Employee {
  return {
    ...employeeFixture,
    user: {
      ...employeeFixture.user,
    },
    weeklyRules:
      employeeFixture.weeklyRules.map(
        (rule) => ({
          ...rule,
        }),
      ),
  };
}

async function installEmployeeCrudMock(
  page: Page,
) {
  let employees: Employee[] = [
    createInitialEmployee(),
  ];

  const today = new Date();

  let scheduleDays: ScheduleDay[] = [
    {
      ...scheduleFixture(
        today.getFullYear(),
        today.getMonth() + 1,
      ),
      date: civilDate(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate(),
      ),
    },
  ];

  await installApiMock(
    page,
    (request) => {
      const url = new URL(
        request.url(),
      );

      const {
        pathname,
      } = url;

      const method =
        request.method();

      if (
        pathname ===
          "/employees" &&
        method === "GET"
      ) {
        return {
          body: employees,
        };
      }

      if (
        pathname ===
          "/employees" &&
        method === "POST"
      ) {
        const dto =
          request.postDataJSON() as CreateEmployeeDto;

        const employee: Employee =
          {
            id: `employee-${employees.length + 1}`,
            fullName:
              dto.fullName,
            cpf: dto.cpf,
            phone: dto.phone,
            position:
              dto.position,
            isActive: true,
            createdAt:
              new Date().toISOString(),
            updatedAt:
              new Date().toISOString(),

            user: {
              id: `user-${employees.length + 1}`,
              role: "EMPLOYEE",
            },

            weeklyRules:
              dto.workDays.map(
                (
                  weekday,
                  index,
                ) => ({
                  id: `rule-${employees.length + 1}-${index}`,
                  employeeId: `employee-${employees.length + 1}`,
                  weekday,
                  shouldWork: true,
                }),
              ),
          };

        employees = [
          ...employees,
          employee,
        ];

        return {
          body: employee,
        };
      }

      if (
        pathname.endsWith(
          "/active",
        ) &&
        method === "PATCH"
      ) {
        const employeeId =
          pathname
            .split("/")[2];

        const body =
          request.postDataJSON() as {
            isActive: boolean;
          };

        employees =
          employees.map(
            (employee) =>
              employee.id ===
              employeeId
                ? {
                    ...employee,
                    isActive:
                      body.isActive,
                  }
                : employee,
          );

        return {
          body: employees.find(
            (employee) =>
              employee.id ===
              employeeId,
          ),
        };
      }

      if (
        pathname.startsWith(
          "/employees/",
        ) &&
        method === "PATCH"
      ) {
        const employeeId =
          pathname
            .split("/")[2];

        const dto =
          request.postDataJSON() as UpdateEmployeeDto;

        employees =
          employees.map(
            (employee) => {
              if (
                employee.id !==
                employeeId
              ) {
                return employee;
              }

              return {
                ...employee,
                fullName:
                  dto.fullName ??
                  employee.fullName,
                phone:
                  dto.phone ??
                  employee.phone,
                position:
                  dto.position ??
                  employee.position,

                weeklyRules:
                  dto.workDays
                    ? dto.workDays.map(
                        (
                          weekday,
                          index,
                        ) => ({
                          id: `updated-rule-${index}`,
                          employeeId:
                            employee.id,
                          weekday,
                          shouldWork:
                            true,
                        }),
                      )
                    : employee.weeklyRules,

                updatedAt:
                  new Date().toISOString(),
              };
            },
          );

        return {
          body: employees.find(
            (employee) =>
              employee.id ===
              employeeId,
          ),
        };
      }

      if (
        pathname ===
          "/schedules/generate" &&
        method === "POST"
      ) {
        const body =
          request.postDataJSON() as {
            year: number;
            month: number;
          };

        return {
          body: {
            message: "generated",
            year: body.year,
            month: body.month,
            created:
              scheduleDays.length,
          },
        };
      }

      if (
        pathname ===
          "/schedules/month" &&
        method === "GET"
      ) {
        return {
          body: scheduleDays,
        };
      }

      if (
        pathname.startsWith(
          "/schedules/day/",
        ) &&
        method === "PATCH"
      ) {
        const scheduleId =
          pathname
            .split("/")
            .at(-1);

        const dto =
          request.postDataJSON() as UpdateDayDto;

        scheduleDays =
          scheduleDays.map(
            (schedule) =>
              schedule.id ===
              scheduleId
                ? {
                    ...schedule,
                    status:
                      dto.status,
                    note:
                      dto.note,
                    updatedAt:
                      new Date().toISOString(),
                  }
                : schedule,
          );

        return {
          body: scheduleDays.find(
            (schedule) =>
              schedule.id ===
              scheduleId,
          ),
        };
      }

      return {
        body: [],
      };
    },
  );

  return {
    getEmployees: () =>
      employees,

    getScheduleDays: () =>
      scheduleDays,
  };
}

test(
  "admin cadastra um funcionário e a lista é atualizada",
  async ({ page }) => {
    await seedSession(
      page,
      "ADMIN",
    );

    await installEmployeeCrudMock(
      page,
    );

    await page.goto(
      "/admin/employees",
    );

    await page
      .getByRole("button", {
        name: "Novo funcionário",
      })
      .first()
      .click();

    const dialog =
      page.getByRole(
        "dialog",
        {
          name: "Novo funcionário",
        },
      );

    await dialog
      .getByLabel(
        "Nome completo",
      )
      .fill("Ana Teste");

    await dialog
      .getByLabel("CPF")
      .fill("12345678901");

    await dialog
      .getByLabel("Cargo")
      .fill("Atendente");

    await dialog
      .getByLabel(
        "Senha inicial",
      )
      .fill("senha123");

    await dialog
      .getByRole("button", {
        name: "Segunda",
      })
      .click();

    await dialog
      .getByRole("button", {
        name: "Cadastrar funcionário",
      })
      .click();

    await expect(
      page.getByText(
        "Ana Teste",
      ).first(),
    ).toBeVisible();

    await expect(
      page.getByText(
        /Funcionário cadastrado/i,
      ),
    ).toBeVisible();
  },
);

test(
  "admin edita um funcionário",
  async ({ page }) => {
    await seedSession(
      page,
      "ADMIN",
    );

    await installEmployeeCrudMock(
      page,
    );

    await page.goto(
      "/admin/employees",
    );

    await page
      .getByRole("button", {
        name: "Editar Maria Operadora",
      })
      .click();

    const dialog =
      page.getByRole(
        "dialog",
        {
          name: /Editar — Maria Operadora/i,
        },
      );

    await dialog
      .getByLabel(
        "Nome completo",
      )
      .fill(
        "Maria Operadora Sênior",
      );

    await dialog
      .getByRole("button", {
        name: "Salvar alterações",
      })
      .click();

    await expect(
      page.getByText(
        "Maria Operadora Sênior",
      ).first(),
    ).toBeVisible();
  },
);

test(
  "admin desativa um funcionário",
  async ({ page }) => {
    await seedSession(
      page,
      "ADMIN",
    );

    await installEmployeeCrudMock(
      page,
    );

    await page.goto(
      "/admin/employees",
    );

    const toggle =
      page.getByRole(
        "switch",
        {
          name: "Desativar Maria Operadora",
        },
      );

    await expect(
      toggle,
    ).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await toggle.click();

    const activatedToggle =
      page.getByRole(
        "switch",
        {
          name: "Ativar Maria Operadora",
        },
      );

    await expect(
      activatedToggle,
    ).toHaveAttribute(
      "aria-checked",
      "false",
    );
  },
);

test(
  "admin registra falta de um funcionário",
  async ({ page }) => {
    await seedSession(
      page,
      "ADMIN",
    );

    const mock =
      await installEmployeeCrudMock(
        page,
      );

    await page.goto(
      "/admin/employees",
    );

    await page
      .getByRole("button", {
        name: "Marcar falta de Maria Operadora",
      })
      .click();

    const dialog =
      page.getByRole(
        "dialog",
        {
          name: "Marcar falta",
        },
      );

    await dialog
      .getByLabel(
        "Observação (opcional)",
      )
      .fill(
        "Atestado médico E2E",
      );

    await dialog
      .getByRole("button", {
        name: "Registrar falta",
      })
      .click();

    await expect(
      page.getByText(
        "Falta registrada para Maria Operadora",
      ),
    ).toBeVisible();

    expect(
      mock.getScheduleDays()[0]
        ?.status,
    ).toBe("ABSENT");

    expect(
      mock.getScheduleDays()[0]
        ?.note,
    ).toBe(
      "Atestado médico E2E",
    );
  },
);
