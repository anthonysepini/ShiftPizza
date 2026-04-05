import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

function isValidCpf(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, '');

  if (!/^\d{11}$/.test(cleanCpf)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cleanCpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cleanCpf[i]) * (10 - i);
  }

  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) {
    firstDigit = 0;
  }

  if (firstDigit !== Number(cleanCpf[9])) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cleanCpf[i]) * (11 - i);
  }

  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) {
    secondDigit = 0;
  }

  if (secondDigit !== Number(cleanCpf[10])) {
    return false;
  }

  return true;
}

@ValidatorConstraint({ name: 'cpfValidator', async: false })
export class CpfValidator implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    return isValidCpf(value);
  }

  defaultMessage(): string {
    return 'CPF inválido.';
  }
}
