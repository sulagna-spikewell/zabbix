/*
** Zabbix
** Copyright (C) 2001-2023 Zabbix SIA
**
** This program is free software; you can redistribute it and/or modify
** it under the terms of the GNU General Public License as published by
** the Free Software Foundation; either version 2 of the License, or
** (at your option) any later version.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
**/

class CSVGGauge {

	static ZBX_STYLE_CLASS =						'svg-gauge';
	static ZBX_STYLE_DESCRIPTION =					'svg-gauge-description';
	static ZBX_STYLE_ARCS =							'svg-gauge-arcs';
	static ZBX_STYLE_THRESHOLDS_ARC_SECTOR =		'svg-gauge-thresholds-arc-sector';
	static ZBX_STYLE_VALUE_ARC_SECTOR =				'svg-gauge-value-arc-sector';
	static ZBX_STYLE_EMPTY_ARC_SECTOR =				'svg-gauge-empty-arc-sector';
	static ZBX_STYLE_NEEDLE =						'svg-gauge-needle';
	static ZBX_STYLE_LABEL =						'svg-gauge-label';
	static ZBX_STYLE_LABEL_TOP_LEFT =				'svg-gauge-label-top-left';
	static ZBX_STYLE_LABEL_TOP_RIGHT =				'svg-gauge-label-top-right';
	static ZBX_STYLE_LABEL_TOP_CENTER =				'svg-gauge-label-top-center';
	static ZBX_STYLE_LABEL_BOTTOM_LEFT =			'svg-gauge-label-bottom-left';
	static ZBX_STYLE_LABEL_BOTTOM_RIGHT =			'svg-gauge-label-bottom-right';
	static ZBX_STYLE_VALUE_AND_UNITS =				'svg-gauge-value-and-units';
	static ZBX_STYLE_VALUE_AND_UNITS_NO_DATA =		'svg-gauge-value-and-units-no-data';
	static ZBX_STYLE_VALUE =						'svg-gauge-value';
	static ZBX_STYLE_UNITS =						'svg-gauge-units';

	static SVG_NS = 'http://www.w3.org/2000/svg';

	static LINE_HEIGHT = 1.14;
	static CAPITAL_HEIGHT = 0.72;

	static DESC_V_POSITION_TOP = 0;
	static DESC_V_POSITION_BOTTOM = 1;

	static UNITS_POSITION_BEFORE = 0;
	static UNITS_POSITION_ABOVE = 1;
	static UNITS_POSITION_AFTER = 2;
	static UNITS_POSITION_BELOW = 3;

	static MINMAX_SIZE_DEFAULT = 10;

	static ARCS_GAP = 2;

	static DESCRIPTION_GAP = 4;

	static LABEL_GAP = 40;

	static NEEDLE_RADIUS = 6.5;

	static NEEDLE_GAP = 20;

	static ANIMATE_DURATION = 500;

	/**
	 * Widget configuration.
	 *
	 * @type {Object}
	 */
	#config;

	/**
	 * Inner padding of the root SVG element.
	 *
	 * @type {Object}
	 */
	#padding;

	/**
	 * Root SVG element.
	 *
	 * @type {SVGSVGElement}
	 */
	#svg;

	/**
	 * SVG group element implementing padding inside the root SVG element.
	 *
	 * @type {SVGGElement}
	 */
	#g;

	/**
	 * SVG group element implementing scaling and fitting of its contents inside the root SVG element.
	 *
	 * @type {SVGGElement}
	 */
	#g_scalable;

	/**
	 * Created SVG child elements and related data.
	 *
	 * @type {Object}
	 */
	#elements = {};

	/**
	 * Usable width of widget without padding.
	 *
	 * @type {number}
	 */
	#width;

	/**
	 * Usable height of widget without padding.
	 *
	 * @type {number}
	 */
	#height;

	/**
	 * Current needle (and value arc) position in 0..1 range.
	 *
	 * @type {number}
	 */
	#pos_current = 0;

	/**
	 * @param {HTMLElement} container           HTML container to append the root SVG element to.
	 *
	 * @param {Object}      padding             Inner padding of the root SVG element.
	 *        {number}      padding.horizontal
	 *        {number}      padding.vertical
	 *
	 * @param {Object}      config              Widget configuration.
	 */
	constructor(container, padding, config) {
		this.#config = config;
		this.#padding = padding;

		this.#svg = document.createElementNS(CSVGGauge.SVG_NS, 'svg');

		container.appendChild(this.#svg);

		this.#svg.classList.add(CSVGGauge.ZBX_STYLE_CLASS);

		if (this.#config.bg_color !== '') {
			this.#svg.style.backgroundColor = `#${this.#config.bg_color}`;
		}

		this.#g = document.createElementNS(CSVGGauge.SVG_NS, 'g');

		this.#svg.appendChild(this.#g);

		this.#g.setAttribute('transform', `translate(${this.#padding.horizontal} ${this.#padding.vertical})`);

		this.#g_scalable = document.createElementNS(CSVGGauge.SVG_NS, 'g');

		this.#g.appendChild(this.#g_scalable);

		this.#createDescription();

		if (this.#config.thresholds.arc.show || this.#config.value.arc.show) {
			this.#createArcs();

			if (this.#config.needle.show) {
				this.#createNeedle();
			}

			if (this.#config.minmax.show || this.#config.thresholds.show_labels) {
				this.#createLabels();
			}
		}

		this.#createValueAndUnits();
	}

	/**
	 * Get the root SVG element.
	 *
	 * @returns {SVGSVGElement}
	 */
	getSVGElement() {
		return this.#svg;
	}

	/**
	 * Set size of the root SVG element and re-position the elements.
	 *
	 * @param {number} width
	 * @param {number} height
	 */
	setSize({width, height}) {
		requestAnimationFrame(() => {
			this.#setSizeOnAnimationFrame({width, height});
		});
	}

	/**
	 * Set value of the gauge. Null value will reset the needle to the min position.
	 *
	 * @param {number|null} value       Numeric value of the gauge.
	 * @param {string}      value_text  Text representation of the value.
	 * @param {string}      units_text  Text representation of the units of the value.
	 */
	setValue({value, value_text, units_text}) {
		this.#elements.value_and_units.container.classList.toggle(CSVGGauge.ZBX_STYLE_VALUE_AND_UNITS_NO_DATA,
			value === null
		);

		this.#elements.value_and_units.value.container.textContent = value_text;

		if (this.#config.units.show) {
			this.#elements.value_and_units.units.container.textContent = units_text;
		}

		if (this.#config.value.arc.show || this.#config.needle.show) {
			let pos_new = 0;

			if (value !== null) {
				const value_in_range = Math.min(this.#config.max, Math.max(this.#config.min, value));

				pos_new = (value_in_range - this.#config.min) / (this.#config.max - this.#config.min);
			}

			let color_new = '';
			let threshold_pos_start = 0;

			for (const {color: color_next, value} of this.#config.thresholds.data) {
				const threshold_pos_end = (value - this.#config.min) / (this.#config.max - this.#config.min);

				if (pos_new >= threshold_pos_start && pos_new < threshold_pos_end) {
					break;
				}

				threshold_pos_start = threshold_pos_end;
				color_new = color_next;
			}

			if (this.#config.value.arc.show) {
				this.#elements.value_arcs.value_arc.style.fill = color_new !== '' ? `#${color_new}` : '';
			}

			if (this.#config.needle.show && this.#config.needle.color === '') {
				this.#elements.needle.container.style.fill = color_new !== '' ? `#${color_new}` : '';
			}

			this.#animate(this.#pos_current, pos_new,
				(pos) => {
					const angle = (pos - 0.5) * this.#config.angle;

					if (this.#config.value.arc.show) {
						this.#elements.value_arcs.value_arc.setAttribute('d',
							this.#defineArc(-this.#config.angle / 2, angle, this.#elements.value_arcs.data.radius,
								this.#elements.value_arcs.data.size
							)
						);

						this.#elements.value_arcs.empty_arc.setAttribute('d',
							this.#defineArc(angle, this.#config.angle / 2, this.#elements.value_arcs.data.radius,
								this.#elements.value_arcs.data.size
							)
						);
					}

					if (this.#config.needle.show) {
						this.#elements.needle.container.setAttribute('transform', `rotate(${angle}, 0, 1)`);
					}
				}
			);

			this.#pos_current = pos_new;
		}
	}

	/**
	 * Remove created SVG element from the container.
	 */
	destroy() {
		this.#svg.remove();
	}

	/**
	 * Create multi-line description.
	 */
	#createDescription() {
		const container = document.createElementNS(CSVGGauge.SVG_NS, 'text');

		this.#g.appendChild(container);

		container.classList.add(CSVGGauge.ZBX_STYLE_DESCRIPTION);
		container.style.fontSize = `${this.#config.description.size}%`;

		if (this.#config.description.is_bold) {
			container.style.fontWeight = 'bold';
		}

		if (this.#config.description.color !== '') {
			container.style.fill = `#${this.#config.description.color}`;
		}

		const lines_data = [];

		for (const text of this.#config.description.text.split('\r\n')) {
			let line = null;

			if (text !== '') {
				line = document.createElementNS(CSVGGauge.SVG_NS, 'tspan');

				container.appendChild(line);
			}

			lines_data.push({line, text});
		}

		this.#elements.description = {container, lines_data};
	}

	/**
	 * Create threshold arc, value arc or both whichever required by the widget configuration.
	 */
	#createArcs() {
		const container = document.createElementNS(CSVGGauge.SVG_NS, 'g');

		this.#g_scalable.appendChild(container);

		container.classList.add(CSVGGauge.ZBX_STYLE_ARCS);

		if (this.#config.thresholds.arc.show) {
			const radius = 1;
			const size = this.#config.thresholds.arc.size / 100;

			const thresholds_arc_sectors = [];

			let pos_start = 0;
			let color = this.#config.empty_color;

			for (const {color: color_next, value} of this.#config.thresholds.data) {
				const pos_end = (value - this.#config.min) / (this.#config.max - this.#config.min);

				thresholds_arc_sectors.push({pos_start, pos_end, color});

				pos_start = pos_end;
				color = color_next;
			}

			if (pos_start < 1) {
				const pos_end = 1;

				thresholds_arc_sectors.push({pos_start, pos_end, color});
			}

			for (const {pos_start, pos_end, color} of thresholds_arc_sectors) {
				const angle_start = (pos_start - 0.5) * this.#config.angle;
				const angle_end = (pos_end - 0.5) * this.#config.angle;

				const arc = document.createElementNS(CSVGGauge.SVG_NS, 'path');

				container.appendChild(arc);

				arc.classList.add(CSVGGauge.ZBX_STYLE_THRESHOLDS_ARC_SECTOR);

				arc.setAttribute('d', this.#defineArc(angle_start, angle_end, radius, size));

				if (color !== '') {
					arc.style.fill = `#${color}`;
				}
			}
		}

		if (this.#config.value.arc.show) {
			const radius = this.#config.thresholds.arc.show
				? Math.max(0, 1 - (this.#config.thresholds.arc.size + CSVGGauge.ARCS_GAP) / 100)
				: 1;

			const size = Math.min(radius, this.#config.value.arc.size / 100);

			const value_arc_sectors = [
				{pos_start: 0, pos_end: 0, class_name: CSVGGauge.ZBX_STYLE_VALUE_ARC_SECTOR},
				{pos_start: 0, pos_end: 1, class_name: CSVGGauge.ZBX_STYLE_EMPTY_ARC_SECTOR}
			];

			const value_arcs = [];

			for (const {pos_start, pos_end, class_name} of value_arc_sectors) {
				const angle_start = (pos_start - 0.5) * this.#config.angle;
				const angle_end = (pos_end - 0.5) * this.#config.angle;

				const arc = document.createElementNS(CSVGGauge.SVG_NS, 'path');

				container.appendChild(arc);

				arc.classList.add(class_name);

				arc.setAttribute('d', this.#defineArc(angle_start, angle_end, radius, size));

				value_arcs.push(arc);
			}

			if (this.#config.empty_color !== '') {
				value_arcs[1].style.fill = `#${this.#config.empty_color}`;
			}

			this.#elements.value_arcs = {value_arc: value_arcs[0], empty_arc: value_arcs[1], data: {radius, size}};
		}
	}

	/**
	 * Create and position needle, and point it to the min position.
	 */
	#createNeedle() {
		const radius = CSVGGauge.NEEDLE_RADIUS / 100;

		const length = this.#config.thresholds.arc.show
			? 1 - this.#config.thresholds.arc.size / 2 / 100
			: 1 - this.#config.value.arc.size / 2 / 100;

		const container = document.createElementNS(CSVGGauge.SVG_NS, 'path');

		this.#g_scalable.appendChild(container);

		container.classList.add(CSVGGauge.ZBX_STYLE_NEEDLE);

		container.setAttribute('d', [
			'M', radius, 1,
			'A', radius, radius, 0, 0, 1, -radius, 1,
			'L', 0, 1 - length,
			'Z'
		].join(' '));

		if (this.#config.needle.color !== '') {
			container.style.fill = `#${this.#config.needle.color}`;
		}

		container.setAttribute('transform', `rotate(${-this.#config.angle / 2}, 0, 1)`);

		this.#elements.needle = {container, data: {pos: 0}};
	}

	/**
	 * Create and position min/max and threshold labels.
	 */
	#createLabels() {
		const minmax_size = this.#config.minmax.show ? this.#config.minmax.size : CSVGGauge.MINMAX_SIZE_DEFAULT;
		const font_size = minmax_size / 100;
		const radius = 1 + font_size * CSVGGauge.LABEL_GAP / 100;

		const labels_data = this.#config.thresholds.show_labels ? [...this.#config.thresholds.data] : [];

		if (this.#config.minmax.show) {
			const do_add_min = labels_data.length === 0 || this.#config.min < labels_data[0].value;
			const do_add_max = labels_data.length === 0 || this.#config.max > labels_data[labels_data.length - 1].value;

			if (do_add_min) {
				labels_data.push({value: this.#config.min, text: this.#config.minmax.min_text});
			}

			if (do_add_max) {
				labels_data.push({value: this.#config.max, text: this.#config.minmax.max_text});
			}
		}

		for (const {value, text} of labels_data) {
			const pos = (value - this.#config.min) / (this.#config.max - this.#config.min);
			const angle = Math.round((pos - 0.5) * this.#config.angle * 100) / 100;

			const container = document.createElementNS(CSVGGauge.SVG_NS, 'text');

			this.#g_scalable.appendChild(container);

			container.classList.add(CSVGGauge.ZBX_STYLE_LABEL);

			container.textContent = text;
			container.style.fontSize = `${font_size}px`;

			let {x, y} = this.#polarToCartesian(radius, angle);

			let is_aligned_to_bottom = false;

			if (this.#config.angle === 270 && Math.abs(angle) > 90) {
				const arcs_height = 1 + Math.sqrt(2) / 2;
				const y_max = arcs_height - font_size;

				if (y > y_max) {
					x = Math.sqrt(radius ** 2 - (arcs_height - font_size * CSVGGauge.CAPITAL_HEIGHT - 1) ** 2)
						* Math.sign(angle);

					y = arcs_height;

					is_aligned_to_bottom = true;
				}
			}

			container.setAttribute('x', `${x}`);
			container.setAttribute('y', `${y}`);

			if (angle < -90) {
				container.classList.add(is_aligned_to_bottom
					? CSVGGauge.ZBX_STYLE_LABEL_TOP_LEFT
					: CSVGGauge.ZBX_STYLE_LABEL_BOTTOM_LEFT
				);
			}
			else if (Math.abs(angle) <= 1) {
				container.classList.add(CSVGGauge.ZBX_STYLE_LABEL_TOP_CENTER);
			}
			else if (angle < 1) {
				container.classList.add(CSVGGauge.ZBX_STYLE_LABEL_TOP_LEFT);
			}
			else if (angle <= 90) {
				container.classList.add(CSVGGauge.ZBX_STYLE_LABEL_TOP_RIGHT);
			}
			else {
				container.classList.add(is_aligned_to_bottom
					? CSVGGauge.ZBX_STYLE_LABEL_TOP_RIGHT
					: CSVGGauge.ZBX_STYLE_LABEL_BOTTOM_RIGHT
				);
			}
		}
	}

	/**
	 * Create and position containers for value and units.
	 */
	#createValueAndUnits() {
		const container = document.createElementNS(CSVGGauge.SVG_NS, 'text');

		this.#g_scalable.appendChild(container);

		container.classList.add(CSVGGauge.ZBX_STYLE_VALUE_AND_UNITS);

		const arcs_height = ((this.#config.thresholds.arc.show || this.#config.value.arc.show)
				&& this.#config.angle === 270)
			? 1 + Math.sqrt(2) / 2
			: 1;

		const is_aligned_to_bottom = (this.#config.thresholds.arc.show || this.#config.value.arc.show)
			&& (this.#config.angle === 270 || !this.#config.needle.show);

		const value_font_size = this.#config.value.size / 100;
		const value_container = document.createElementNS(CSVGGauge.SVG_NS, 'tspan');

		value_container.classList.add(CSVGGauge.ZBX_STYLE_VALUE);
		value_container.style.fontSize = `${value_font_size}px`;

		if (this.#config.value.is_bold) {
			value_container.style.fontWeight = 'bold';
		}

		if (this.#config.value.color) {
			value_container.style.fill = `#${this.#config.value.color}`;
		}

		this.#elements.value_and_units = {container, value: {container: value_container}};

		if (this.#config.units.show) {
			const units_font_size = this.#config.units.size / 100;
			const units_container = document.createElementNS(CSVGGauge.SVG_NS, 'tspan');

			units_container.classList.add(CSVGGauge.ZBX_STYLE_UNITS);
			units_container.style.fontSize = `${units_font_size}px`;

			if (this.#config.units.is_bold) {
				units_container.style.fontWeight = 'bold';
			}

			if (this.#config.units.color) {
				units_container.style.fill = `#${this.#config.units.color}`;
			}

			switch (this.#config.units.position) {
				case CSVGGauge.UNITS_POSITION_BEFORE:
				case CSVGGauge.UNITS_POSITION_AFTER:
					const space_font_size = Math.min(value_font_size, units_font_size);
					const space_container = document.createElementNS(CSVGGauge.SVG_NS, 'tspan');

					space_container.style.fontSize = `${space_font_size}px`;
					space_container.textContent = ' ';

					if (this.#config.units.position === CSVGGauge.UNITS_POSITION_BEFORE) {
						container.appendChild(units_container);
						container.appendChild(space_container);
						container.appendChild(value_container);
					}
					else {
						container.appendChild(value_container);
						container.appendChild(space_container);
						container.appendChild(units_container);
					}

					if (is_aligned_to_bottom) {
						container.setAttribute('y', `${arcs_height}`);
					}
					else {
						const max_font_size = Math.max(value_font_size, units_font_size);

						container.setAttribute('y', `${arcs_height + CSVGGauge.NEEDLE_RADIUS / 100 * 2
							+ max_font_size * (CSVGGauge.CAPITAL_HEIGHT + CSVGGauge.NEEDLE_GAP / 100)
						}`);
					}

					break;

				default:
					const parts = this.#config.units.position === CSVGGauge.UNITS_POSITION_BELOW
						? [value_container, units_container]
						: [units_container, value_container];

					const parts_font_size = this.#config.units.position === CSVGGauge.UNITS_POSITION_BELOW
						? [value_font_size, units_font_size]
						: [units_font_size, value_font_size];

					container.appendChild(parts[0]);
					container.appendChild(parts[1]);

					parts[1].setAttribute('x', '0');

					if (is_aligned_to_bottom) {
						parts[0].setAttribute('y', `${arcs_height
							- parts_font_size[1] * CSVGGauge.CAPITAL_HEIGHT
							- parts_font_size[1] * (CSVGGauge.LINE_HEIGHT - CSVGGauge.CAPITAL_HEIGHT) / 2
							- parts_font_size[0] * (CSVGGauge.LINE_HEIGHT - CSVGGauge.CAPITAL_HEIGHT) / 2
						}`);
						parts[1].setAttribute('y', `${arcs_height}`);
					}
					else {
						const y_top = arcs_height + CSVGGauge.NEEDLE_RADIUS / 100 * 2
							+ parts_font_size[0] * (CSVGGauge.CAPITAL_HEIGHT + CSVGGauge.NEEDLE_GAP / 100);

						parts[0].setAttribute('y', `${y_top}`);
						parts[1].setAttribute('y', `${y_top
							+ parts_font_size[1] * CSVGGauge.CAPITAL_HEIGHT
							+ parts_font_size[1] * (CSVGGauge.LINE_HEIGHT - CSVGGauge.CAPITAL_HEIGHT) / 2
							+ parts_font_size[0] * (CSVGGauge.LINE_HEIGHT - CSVGGauge.CAPITAL_HEIGHT) / 2
						}`);
					}

					break;
			}

			this.#elements.value_and_units.units = {container: units_container};
		}
		else {
			container.appendChild(value_container);

			if (is_aligned_to_bottom) {
				container.setAttribute('y', `${arcs_height}`);
			}
			else {
				container.setAttribute('y', `${arcs_height + CSVGGauge.NEEDLE_RADIUS / 100 * 2
					+ value_font_size * (CSVGGauge.CAPITAL_HEIGHT + CSVGGauge.NEEDLE_GAP / 100)
				}`);
			}
		}
	}

	/**
	 * Define arc path.
	 *
	 * @param {number} angle_start  Start angle in degrees, zero pointing to the top.
	 * @param {number} angle_end    Start angle in degrees, zero pointing to the top.
	 * @param {number} radius       Arc outer radius.
	 * @param {number} size         Arc size (thickness).
	 *
	 * @returns {string}
	 */
	#defineArc(angle_start, angle_end, radius, size) {
		const inner_start = this.#polarToCartesian(radius - size, angle_end);
		const inner_end = this.#polarToCartesian(radius - size, angle_start);
		const outer_start = this.#polarToCartesian(radius, angle_end);
		const outer_end = this.#polarToCartesian(radius, angle_start);

		const large_arc_flag = angle_end - angle_start <= 180 ? 0 : 1;

		return [
			'M', outer_start.x, outer_start.y,
			'A', radius, radius, 0, large_arc_flag, 0, outer_end.x, outer_end.y,
			'L', inner_end.x, inner_end.y,
			'A', radius - size, radius - size, 0, large_arc_flag, 1, inner_start.x, inner_start.y,
			'Z'
		].join(' ');
	}

	/**
	 * Get X, Y coordinates out of radius and angle in degrees.
	 *
	 * @param {number} radius
	 * @param {number} angle_in_degrees  Zero pointing to the top.
	 *
	 * @returns {{x: number, y: number}}
	 */
	#polarToCartesian(radius, angle_in_degrees) {
		const angle_in_radians = this.#degreesToRadians(angle_in_degrees);

		return {
			x: radius * Math.cos(angle_in_radians),
			y: 1 + radius * Math.sin(angle_in_radians)
		};
	}

	/**
	 * Get radians out of degrees.
	 *
	 * @param {number} degrees
	 *
	 * @returns {number}
	 */
	#degreesToRadians(degrees) {
		return (degrees - 90) * Math.PI / 180;
	}

	/**
	 * Set size of the root SVG element and re-position the elements.
	 *
	 * This method must be called on animation frame to allow correct calculation of element dimensions.
	 *
	 * @param {number} width
	 * @param {number} height
	 */
	#setSizeOnAnimationFrame({width, height}) {
		this.#svg.setAttribute('width', `${width}`);
		this.#svg.setAttribute('height', `${height}`);

		this.#width = width - this.#padding.horizontal * 2;
		this.#height = height - this.#padding.vertical * 2;

		this.#svg.style.fontSize = `${this.#height / CSVGGauge.LINE_HEIGHT}px`;

		this.#drawDescription();

		const arcs_height = ((this.#config.thresholds.arc.show || this.#config.value.arc.show)
				&& this.#config.angle === 270)
			? 1 + Math.sqrt(2) / 2
			: 1;

		const description_gap = this.#height * CSVGGauge.DESCRIPTION_GAP / 100;
		const description_bbox = this.#elements.description.container.getBBox();

		const max_width = this.#width;
		const max_height = Math.max(0, this.#height - description_bbox.height - description_gap);

		// Fix occasional, imprecise calculation of "this.#g_scalable" dimensions.
		this.#g_scalable.setAttribute('transform', `translate(0 0) scale(1000)`);

		const box = this.#g_scalable.getBBox();
		const box_width = Math.max(1, -box.x, box.width + box.x) * 2;
		const box_height = Math.max(arcs_height, box.height);

		const scale = Math.min(max_width / box_width, max_height / box_height);

		const x = max_width / 2;
		const y = (max_height - box.height * scale) / 2 - box.y * scale
			+ (this.#config.description.position === CSVGGauge.DESC_V_POSITION_TOP
				? description_bbox.height + description_gap
				: 0);

		this.#g_scalable.setAttribute('transform', `translate(${x} ${y}) scale(${scale})`);
	}

	/**
	 * Position description according to the size of widget and truncate the text matching the available width.
	 */
	#drawDescription() {
		const {container, lines_data} = this.#elements.description;

		const line_height = this.#height * this.#config.description.size / 100;

		let offset = 0;

		for (const {line, text} of lines_data) {
			if (text === '') {
				offset++;

				continue;
			}

			line.setAttribute('x', `${this.#width / 2}`);
			line.setAttribute('dy', `${offset * line_height}`);

			line.textContent = text;

			while (line.getComputedTextLength() > this.#width && line.textContent.length >= 4) {
				line.textContent = `${line.textContent.slice(0, -4)}...`;
			}

			offset = 1;
		}

		container.setAttribute('y', this.#config.description.position === CSVGGauge.DESC_V_POSITION_TOP
			? '0'
			: `${this.#height - lines_data.length * line_height}`
		);
	}

	/**
	 * Animate numeric value smoothly within the defined time period, within the given interval.
	 *
	 * @param {number}   from
	 * @param {number}   to
	 * @param {function} callback  Callback function to be called with value transitioning within the interval.
	 */
	#animate(from, to, callback) {
		const start_time = Date.now();
		const end_time = start_time + CSVGGauge.ANIMATE_DURATION;

		const animate = () => {
			const time = Date.now();

			if (time <= end_time) {
				const progress = (time - start_time) / (end_time - start_time);
				const smooth_progress = 0.5 + Math.sin(Math.PI * (progress - 0.5)) / 2;

				callback(from + (to - from) * smooth_progress);

				requestAnimationFrame(animate);
			}
			else {
				callback(to);
			}
		};

		requestAnimationFrame(animate);
	}
}
