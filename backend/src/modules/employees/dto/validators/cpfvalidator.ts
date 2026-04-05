import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { validateCPF } from 'validations-br';

@ValidatorConstraint({ name: 'isCpfValid', async: false })
export class IsCpfValidConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return validateCPF(value);
  }

  defaultMessage(): string {
    return 'CPF inválido.';
  }
}
