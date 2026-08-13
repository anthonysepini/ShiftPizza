import { BadRequestException, PipeTransform } from '@nestjs/common';

export class ParseBoundedIntPipe implements PipeTransform<unknown, number> {
  constructor(
    private readonly minimum: number,
    private readonly maximum: number,
    private readonly fieldName: string,
  ) {}

  transform(value: unknown): number {
    if (
      !(
        (typeof value === 'string' && /^-?\d+$/.test(value)) ||
        (typeof value === 'number' && Number.isSafeInteger(value))
      )
    ) {
      throw this.invalidValue();
    }

    const parsed = Number(value);
    if (
      !Number.isSafeInteger(parsed) ||
      parsed < this.minimum ||
      parsed > this.maximum
    ) {
      throw this.invalidValue();
    }

    return parsed;
  }

  private invalidValue(): BadRequestException {
    return new BadRequestException(
      `${this.fieldName} deve ser um inteiro entre ${this.minimum} e ${this.maximum}`,
    );
  }
}
