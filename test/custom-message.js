import test from 'ava';
import ow, {Predicate} from '../source/index.js';

class CustomPredicate extends Predicate {
	constructor() {
		super('string');
	}

	get unicorn() {
		return this.addValidator({
			message: (value, label) => `Expected ${label} to be \`🦄\`, got \`${value}\``,
			validator: value => value === '🦄'
		});
	}
}

test('custom validate message', t => {
	t.throws(() => {
		ow('🌈', 'unicorn', new CustomPredicate().unicorn.message('Expect unicorn, got rainbow'));
	}, {
		message: 'Expect unicorn, got rainbow'
	});

	t.throws(() => {
		ow('🌈', 'unicorn', new CustomPredicate().unicorn.message((value, label) => `Expected ${label}, to be \`🦄\` got \`${value}\``));
	}, {
		message: 'Expected string `unicorn`, to be `🦄` got `🌈`'
	});

	t.throws(() => {
		ow('🌈', ow.string.minLength(5).message((value, label) => `Expected ${label}, to be have a minimum length of 5, got \`${value}\``));
	}, {
		message: 'Expected string, to be have a minimum length of 5, got `🌈`'
	});

	const error = t.throws(() => {
		ow('1234', ow.string.minLength(5).message((value, label) => `Expected ${label}, to be have a minimum length of 5, got \`${value}\``).url.message('This is no url'));
	}, {
		message: [
			'Expected string, to be have a minimum length of 5, got `1234`',
			'This is no url'
		].join('\n')
	});

	t.is(error.validationErrors.size, 1, 'There is one item in the `validationErrors` map');
	t.true(error.validationErrors.has('string'), 'Validation errors map has key `string`');

	const result1_ = error.validationErrors.get('string');

	t.is(result1_.size, 2, 'There are two reported errors for this input');
	t.deepEqual(result1_, new Set([
		'Expected string, to be have a minimum length of 5, got `1234`',
		'This is no url'
	]), 'There is an error for the string length, and one for invalid URL');

	t.throws(() => {
		ow('12345', ow.string.minLength(5).message((value, label) => `Expected ${label}, to be have a minimum length of 5, got \`${value}\``).url.message('This is no url'));
	}, {
		message: 'This is no url'
	});
});
