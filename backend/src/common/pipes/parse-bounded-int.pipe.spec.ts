import { BadRequestException } from '@nestjs/common';
import { ParseBoundedIntPipe } from './parse-bounded-int.pipe';

describe('ParseBoundedIntPipe', () => {
  const pipe = new ParseBoundedIntPipe(1, 12, 'month');

  it('parses an integer inside the accepted range', () => {
    expect(pipe.transform('6')).toBe(6);
  });

  it.each(['0', '13', '1.5', 'abc', ''])(
    'rejects an invalid value: %s',
    (value) => {
      expect(() => pipe.transform(value)).toThrow(BadRequestException);
    },
  );
});
