export const MAX_EMPLOYEE_PHOTO_BYTES = 2 * 1024 * 1024;

type PhotoCandidate = Pick<File, 'size' | 'type'>;

export function validateEmployeePhoto(file: PhotoCandidate): string | null {
  if (!file.type.toLowerCase().startsWith('image/')) {
    return 'Selecione um arquivo de imagem.';
  }

  if (file.size > MAX_EMPLOYEE_PHOTO_BYTES) {
    return 'A foto deve ter no máximo 2 MiB.';
  }

  return null;
}
