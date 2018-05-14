import { assert } from 'chai';
import { prayersCalc, dayCalc } from '../src';

import timetable from './timetable'

describe('Awesome test.', () => {
  it('should test prayersCalc function', () => {
    const expectedVal = 'Success!'
    assert(prayersCalc(0, {jamaahmethods: ["afterthis","","fixed","afterthis","afterthis","afterthis"], jamaahoffsets: [[0,30],[],[13,50],[0,15],[0,10],[0,10]]}, timetable, true, '0', false, true) === expectedVal,'Default not awesome :(');
  });

  it('should test dayCalc function', () => {
    const expectedVal = 'Success!'
    assert(dayCalc(0, { hijrioffset: 0 }, true) === expectedVal,'Default not awesome :(');
  });
});
