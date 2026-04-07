/**
 * Mock for obsidian module
 */

export class App {
	workspace = {
		activeLeaf: null as any
	};
}

export class Modal {
	app: App;
	contentEl: HTMLElement;

	constructor(app: App) {
		this.app = app;
		this.contentEl = document.createElement('div');
	}

	onOpen() {}
	onClose() {}

	open() {
		this.onOpen();
	}

	close() {
		this.onClose();
	}
}

export class ButtonComponent {
	buttonEl: HTMLElement;
	private icon: string = '';
	private text: string = '';
	private tooltip: string = '';
	private clickHandler: (() => void) | null = null;

	constructor(container: HTMLElement) {
		this.buttonEl = document.createElement('button');
		container.appendChild(this.buttonEl);
	}

	setIcon(icon: string): this {
		this.icon = icon;
		return this;
	}

	setButtonText(text: string): this {
		this.text = text;
		this.buttonEl.textContent = text;
		return this;
	}

	setTooltip(tooltip: string): this {
		this.tooltip = tooltip;
		return this;
	}

	setClass(cls: string): this {
		this.buttonEl.className = cls;
		return this;
	}

	onClick(handler: () => void): this {
		this.clickHandler = handler;
		this.buttonEl.addEventListener('click', handler);
		return this;
	}
}

export class Setting {
	nameEl: HTMLElement;
	descEl: HTMLElement;

	constructor(container: HTMLElement) {
		const wrapper = document.createElement('div');
		wrapper.className = 'setting-item';
		
		this.nameEl = document.createElement('div');
		this.nameEl.className = 'setting-item-name';
		wrapper.appendChild(this.nameEl);
		
		this.descEl = document.createElement('div');
		this.descEl.className = 'setting-item-description';
		wrapper.appendChild(this.descEl);
		
		container.appendChild(wrapper);
	}

	setName(name: string): this {
		this.nameEl.textContent = name;
		return this;
	}

	setDesc(desc: string): this {
		this.descEl.textContent = desc;
		return this;
	}

	addText(cb: (text: any) => this): this {
		return this;
	}
}

export class ItemView {
	app: App = new App();
	containerEl: HTMLElement;

	constructor(leaf: any) {
		this.containerEl = document.createElement('div');
	}

	getViewType(): string {
		return '';
	}

	getDisplayText(): string {
		return '';
	}

	getIcon(): string {
		return '';
	}

	onOpen(): Promise<void> {
		return Promise.resolve();
	}

	onClose(): Promise<void> {
		return Promise.resolve();
	}
}

export class WorkspaceLeaf {
	view: ItemView | null = null;
}

export const VIEW_TYPE_CONSOLE_LOG = 'console-log-viewer';