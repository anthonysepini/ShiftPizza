export const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export const getEmployeePhoto = (id: string) =>
  localStorage.getItem(`sp_photo_${id}`);
