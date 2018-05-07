import test from 'tape-catch';

import PropOverrides from 'deck.gl/core/lifecycle/prop-overrides';

test('PropOverrides#import', t => {
  t.ok(PropOverrides, 'PropOverrides imported OK');
  t.end();
});


test('PropOverrides#constructor', t => {
  const asyncProps = new PropOverrides();
  t.ok(asyncProps, 'PropOverrides created');
  t.end();
});


// test('PropOverrides#tests', t => {
//   for (const tc of TEST_CASES) {
//     const {propTypes, defaultProps} = PropOverrides(tc.props);
//     t.deepEqual(propTypes, tc.propTypes, `PropOverrides ${tc.title} returned expected prop types`);
//     t.deepEqual(
//       defaultProps,
//       tc.defaultProps,
//       `PropOverrides ${tc.title} returned expected default props`
//     );
//   }
//   t.end();
// });
