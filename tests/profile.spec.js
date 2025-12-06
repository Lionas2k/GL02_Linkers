const { buildProfile, printHistogram, compareProfiles } = require('../src/services/profileService');

describe('profileService', () => {
  test('buildProfile counts types', () => {
    const questions = [
      {id:1,type:'MC'}, {id:2,type:'MC'}, {id:3,type:'SA'}, {id:4,type:'essay'}
    ];
    const p = buildProfile(questions);
    expect(p.total).toBe(4);
    expect(p.counts.MC).toBe(2);
    expect(p.counts.SA).toBe(1);
    expect(p.counts.OTHER).toBe(1);
  });

  test('buildProfile compute percentages', () => {
    const questions = [
      {id:1,type:'MC'}, {id:2,type:'MC'}, {id:3,type:'SA'}, {id:4,type:'essay'}
    ];
    const p = buildProfile(questions);
    expect(p.total).toBe(4);
    expect(p.percents.MC).toBe(50);
    expect(p.percents.SA).toBe(25);
    expect(p.percents.OTHER).toBe(25);
  });

  test('printHistogram returns a string', () => {
    const p = buildProfile([{id:1,type:'MC'}]);
    const out = printHistogram(p);
    expect(typeof out).toBe('string');
    expect(out).toContain('MC       ██████████████████████████████ 1');
  });

  test('printHistogram returns an accurate histogram', () => {
    const p = buildProfile([{id:1,type:'MC'}, {id:2,type:'MC'}, {id:3,type:'SA'}, {id:4,type:'essay'}]);
    const out = printHistogram(p);
    expect(typeof out).toBe('string');
    expect(out).toContain('MC       ██████████████████████████████ 2');
    expect(out).toContain('SA       ███████████████ 1');
    expect(out).toContain('OTHER    ███████████████ 1');
  });

  test('compareProfiles similarity 100 for identical', () => {
    const qs = [{id:1,type:'MC'},{id:2,type:'TF'}];
    const a = buildProfile(qs);
    const b = buildProfile(qs);
    const res = compareProfiles(a,b);
    expect(res.similarity).toBe(100);
  });

  test('compareProfiles similarity decreases for different distributions', () => {
    // First test: completely different profiles
    const a = buildProfile([{id:1,type:'MC'},{id:2,type:'MC'},{id:3,type:'MC'}]);
    const b = buildProfile([{id:1,type:'SA'},{id:2,type:'SA'},{id:3,type:'SA'}]);
    const res1 = compareProfiles(a,b);
    expect(res1.similarity).toBe(0);

    // Second test: 2/3 vs 1/3 overlap
    const c = buildProfile([{id:1,type:'MC'},{id:2,type:'SA'},{id:3,type:'SA'}]);
    const d = buildProfile([{id:1,type:'MC'},{id:2,type:'MC'},{id:3,type:'SA'}]);
    const res2 = compareProfiles(c,d);
    expect(res2.similarity).toBe(66.67);
  });
});
