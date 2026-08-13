import { describe, expect, it } from 'vitest';
import {
  MAX_EMPLOYEE_PHOTO_BYTES,
  validateEmployeePhoto,
} from './photo';

describe('validateEmployeePhoto', () => {
  it('accepts an image at the 2 MiB limit', () => {
    expect(
      validateEmployeePhoto({ type: 'image/png', size: MAX_EMPLOYEE_PHOTO_BYTES }),
    ).toBeNull();
  });

  it('rejects non-image files', () => {
    expect(validateEmployeePhoto({ type: 'text/plain', size: 100 })).toBe(
      'Selecione um arquivo de imagem.',
    );
  });

  it('rejects images larger than 2 MiB', () => {
    expect(
      validateEmployeePhoto({
        type: 'image/jpeg',
        size: MAX_EMPLOYEE_PHOTO_BYTES + 1,
      }),
    ).toBe('A foto deve ter no máximo 2 MiB.');
  });
});
