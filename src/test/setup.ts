import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

class TestResizeObserver {
	private readonly callback: ResizeObserverCallback

	constructor(callback: ResizeObserverCallback) {
		this.callback = callback
	}

	observe(target: Element) {
		this.callback(
			[{ target, contentRect: testRect(target) } as ResizeObserverEntry],
			this as unknown as ResizeObserver,
		)
	}

	unobserve() {}

	disconnect() {}
}

globalThis.ResizeObserver = TestResizeObserver

class TestDOMMatrixReadOnly {
	m22 = 1
}

globalThis.DOMMatrixReadOnly = TestDOMMatrixReadOnly as unknown as typeof DOMMatrixReadOnly

const testRect = (element: Element): DOMRect => {
	const isNode = element.classList.contains('react-flow__node')
	const isHandle = element.classList.contains('react-flow__handle')
	const width = isNode ? 148 : isHandle ? 16 : 0
	const height = isNode ? 88 : isHandle ? 16 : 0

	return {
		x: 0,
		y: 0,
		width,
		height,
		top: 0,
		right: width,
		bottom: height,
		left: 0,
		toJSON: () => ({}),
	}
}

Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
	configurable: true,
	value(this: HTMLElement) {
		return testRect(this)
	},
})

Object.defineProperties(HTMLElement.prototype, {
	offsetWidth: {
		configurable: true,
		get(this: HTMLElement) {
			return testRect(this).width
		},
	},
	offsetHeight: {
		configurable: true,
		get(this: HTMLElement) {
			return testRect(this).height
		},
	},
})

Object.defineProperty(SVGElement.prototype, 'getBBox', {
	configurable: true,
	value() {
		return { x: 0, y: 0, width: 32, height: 16 }
	},
})

afterEach(cleanup)
