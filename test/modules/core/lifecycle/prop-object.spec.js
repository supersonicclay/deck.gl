import test from 'tape-catch';

import PropObject from 'deck.gl/core/lifecycle/prop-object';

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

test('PropObject#import', t => {
  t.ok(PropObject, 'PropObject imported OK');
  t.end();
});

// test('PropObject#tests', t => {
//   for (const tc of TEST_CASES) {
//     const {propTypes, defaultProps} = PropObject(tc.props);
//     t.deepEqual(propTypes, tc.propTypes, `PropObject ${tc.title} returned expected prop types`);
//     t.deepEqual(
//       defaultProps,
//       tc.defaultProps,
//       `PropObject ${tc.title} returned expected default props`
//     );
//   }
//   t.end();
// });
