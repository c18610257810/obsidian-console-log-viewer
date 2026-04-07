/**
 * Mock Obsidian HTMLElement extensions for testing
 */

/**
 * Setup mock for Obsidian HTMLElement methods
 */
export function setupObsidianMock(): void {
	// Cast to any to avoid TypeScript issues with extending prototype
	const proto = HTMLElement.prototype as any;

	proto.createDiv = function(options?: { cls?: string; text?: string }): HTMLElement {
		const div = document.createElement('div');
		if (options?.cls) {
			div.className = options.cls;
		}
		if (options?.text) {
			div.textContent = options.text;
		}
		this.appendChild(div);
		return div;
	};

	proto.createEl = function(tag: string, options?: { cls?: string; text?: string }): HTMLElement {
		const el = document.createElement(tag);
		if (options?.cls) {
			el.className = options.cls;
		}
		if (options?.text) {
			el.textContent = options.text;
		}
		this.appendChild(el);
		return el;
	};

	proto.addClass = function(cls: string): void {
		this.classList.add(cls);
	};

	proto.removeClass = function(cls: string): void {
		this.classList.remove(cls);
	};
}

/**
 * Cleanup mock
 */
export function cleanupObsidianMock(): void {
	// Cast to any to avoid TypeScript issues with delete
	const proto = HTMLElement.prototype as any;

	delete proto.createDiv;
	delete proto.createEl;
	delete proto.addClass;
	delete proto.removeClass;
}