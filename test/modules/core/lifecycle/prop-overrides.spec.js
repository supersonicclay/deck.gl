import test from 'tape-catch';

import PropOverrides from 'deck.gl/core/lifecycle/prop-overrides';

// const ARRAY = [1, 2, 3];
// const TYPED_ARRAY = new Float32Array(3);
// const OBJECT = {a: 1, b: 2};
// const FUNCTION = x => x.position;

// const TEST_CASES = [
//   {
//     title: 'boolean default prop',
//     props: {prop: true},
//     propTypes: {prop: {name: 'prop', type: 'boolean', value: true}},
//     defaultProps: {prop: true}
//   }
// ];

test('PropOverrides#import', t => {
  t.ok(PropOverrides, 'PropOverrides imported OK');
  t.end();
});


test('PropOverrides#constructor', t => {
  const asyncProps = new PropOverrides();
  
  t.ok(PropOverrides, 'PropOverrides imported OK');
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
