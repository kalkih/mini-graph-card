import { LitElement, html, svg } from 'lit-element';
import localForage from 'localforage/src/localforage';
import { stateIcon } from 'custom-card-helpers';
import SparkMD5 from 'spark-md5';
import interpolateRgb from './interpolateRgb';
import Graph from './graph';
import style from './style';
import handleClick from './handleClick';
import buildConfig from './buildConfig';
import {
  blankBeforePercent,
  formatNumber,
  formatDateTime,
  getDateFormat, getTimeFormat,
} from './locale';
import './initialize';
import { version } from '../package.json';
import {
  ICONS,
  UPDATE_PROPS,
  X, Y, V,
  ONE_HOUR,
} from './const';
import { getFactor } from './others';
import {
  getMin, getAvg, getMax,
  getMilli,
  compress, decompress,
  getFirstDefinedItem,
  compareArray,
  log,
} from './utils';

const isUnavailableState = value => ['unavailable', 'unknown'].includes(value);

class MiniGraphCard extends LitElement {
  constructor() {
    super();
    this.id = Math.random()
      .toString(36)
      .substr(2, 9);
    this.config = {};
    this.bound = [0, 0];
    this.boundSecondary = [0, 0];
    this.length = [];
    this.entity = [];
    this.line = [];
    this.bar = [];
    this.abs = [];
    this.fill = [];
    this.points = [];
    this.gradient = [];
    this.tooltip = {};
    this.updateQueue = [];
    this.updating = false;
    this.stateChanged = false;
    this.initial = true;
    this._md5Config = undefined;

    // update datetime settings periodically
    this.updateHour24 = true;
    this.updateDateTimeFormat = true;
  }

  static get styles() {
    return style;
  }

  set hass(hass) {
    this._hass = hass;
    let updated = false;
    const queue = [];
    this.config.entities.forEach((entity, index) => {
      this.config.entities[index].index = index; // Required for filtered views
      // entityState stands for "stateObj"
      const entityState = hass && hass.states[entity.entity] || undefined;
      if (entityState && this.entity[index] !== entityState) {
        this.entity[index] = entityState;
        queue.push(`${entityState.entity_id}-${index}`);
        updated = true;
      }
    });
    if (updated) {
      this.stateChanged = true;
      this.entity = [...this.entity];
      if (!this.config.update_interval && !this.updating) {
        setTimeout(() => {
          this.updateQueue = [...queue, ...this.updateQueue];
          this.updateData();
        }, this.initial ? 0 : 1000);
      } else {
        this.updateQueue = [...queue, ...this.updateQueue];
      }
    }
  }

  static get properties() {
    return {
      id: String,
      _hass: {},
      config: {},
      entity: [],
      Graph: [],
      line: [],
      shadow: [],
      length: Number,
      bound: [],
      boundSecondary: [],
      abs: [],
      tooltip: {},
      updateQueue: [],
      color: String,
    };
  }

  setConfig(config) {
    this.config = buildConfig(config);
    this._md5Config = SparkMD5.hash(JSON.stringify(this.config));
    const entitiesChanged = !compareArray(this.config.entities || [], config.entities);

    // update datetime settings periodically
    this.updateHour24 = config.hour24 === undefined;
    this.updateDateTimeFormat = config.datetime_format === undefined;

    if (!this.Graph || entitiesChanged) {
      if (this._hass) this.hass = this._hass;
      this.Graph = this.config.entities.map(
        entity => new Graph(
          500,
          this.config.height,
          [this.config.show.fill ? 0 : this.config.line_width, this.config.line_width],
          this.config.hours_to_show,
          this.config.points_per_hour,
          entity.aggregate_func || this.config.aggregate_func,
          this.config.group_by,
          getFirstDefinedItem(
            entity.smoothing,
            this.config.smoothing,
            !entity.entity.startsWith('binary_sensor.'), // turn off for binary sensor by default
          ),
          this.config.logarithmic,
        ),
      );
    }
  }

  /**
  * Automatically update datetime formatting options (when they are not explicitly set by a user)
  * on every render
  */
  updateFormatFromLocale(forced) {
    if (this.updateDateTimeFormat || forced) {
      this.config.date_format = getDateFormat(this.config, this._hass);
    }
    if (this.updateHour24 || this.updateDateTimeFormat || forced) {
      this.config.time_format = getTimeFormat(this.config, this._hass);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.config.update_interval) {
      window.requestAnimationFrame(() => {
        this.updateOnInterval();
      });
      this.interval = setInterval(
        () => this.updateOnInterval(),
        this.config.update_interval * 1000,
      );
    }
  }

  disconnectedCallback() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    super.disconnectedCallback();
  }

  shouldUpdate(changedProps) {
    if (UPDATE_PROPS.some(prop => changedProps.has(prop))) {
      this.color = this.computeColor(
        this.tooltip.value !== undefined
          ? this.tooltip.value : this.getEntityState(0),
        this.tooltip.entity || 0,
      );
      return true;
    }
  }

  firstUpdated() {
    this.initial = false;
    this.updateFormatFromLocale(true);
  }

  updated(changedProperties) {
    if (this.config.animate && changedProperties.has('line')) {
      if (this.length.length < this.entity.length) {
        this.shadowRoot.querySelectorAll('svg path.line').forEach((ele) => {
          this.length[ele.id] = ele.getTotalLength();
        });
        this.length = [...this.length];
      } else {
        this.length = Array(this.entity.length).fill('none');
      }
    }
  }

  render({ config } = this) {
    if (!config || !this.entity || !this._hass)
      return html``;
    if (this.config.entities.some((_, index) => this.entity[index] === undefined)) {
      return this.renderWarnings();
    }
    this.updateFormatFromLocale();
    return html`
      <ha-card
        class="flex"
        ?group=${config.group}
        ?fill=${config.show.graph && config.show.fill}
        ?points=${config.show.points === 'hover'}
        ?labels=${config.show.labels === 'hover'}
        ?labels-secondary=${config.show.labels_secondary === 'hover'}
        ?gradient=${config.color_thresholds.length > 0}
        ?hover=${config.tap_action.action !== 'none'}
        style="font-size: ${config.font_size}px;"
        @click=${e => this.handlePopup(e, config.tap_action.entity || this.entity[0])}
      >
        ${this.renderHeader()} ${this.renderStates()} ${this.renderGraph()} ${this.renderInfo()}
      </ha-card>
    `;
  }

  renderWarnings() {
    return html`
      <hui-warning>
        <div>mini-graph-card</div>
        ${this.config.entities.map((_, index) => (!this.entity[index] ? html`
          <div>
            Entity not available: ${this.config.entities[index].entity}
          </div>
        ` : html``))}
      </hui-warning>
    `;
  }

  /**
  * Renders a header containing a name and an icon
  * @returns HTML element
  */
  renderHeader() {
    const {
      show, align_icon, align_header, font_size_header,
    } = this.config;
    return show.name || (show.icon && align_icon !== 'state')
      ? html`
          <div class="header flex" loc=${align_header} style="font-size: ${font_size_header}px;">
            ${this.renderName()} ${align_icon !== 'state' ? this.renderIcon() : ''}
          </div>
        `
      : '';
  }

  /**
  * Renders an icon
  * @returns HTML element
  */
  renderIcon() {
    if (this.config.icon_image !== undefined) {
      return html`
        <div class="icon">
          <img src="${this.config.icon_image}" height="25"/>
        </div>
      `;
    }

    const { icon, icon_adaptive_color } = this.config.show;
    return icon ? html`
      <div class="icon" loc=${this.config.align_icon}
        style=${icon_adaptive_color ? `color: ${this.color};` : ''}>
        <ha-icon .icon=${this.computeIcon(this.entity[0])}></ha-icon>
      </div>
    ` : '';
  }

  /**
  * Renders a name
  * @returns HTML element
  */
  renderName() {
    if (!this.config.show.name) return;
    const name = this.tooltip.entity !== undefined
      ? this.computeName(this.tooltip.entity)
      : this.config.name || this.computeName(0);
    const color = this.config.show.name_adaptive_color ? `opacity: 1; color: ${this.color};` : '';

    return html`
      <div class="name flex">
        <span class="ellipsis" style=${color}>${name}</span>
      </div>
    `;
  }

  /**
  * Renders states
  * @returns HTML element
  */
  renderStates() {
    if (this.config.show.state)
      return html`
        <div class="states flex" loc=${this.config.align_state}>
          ${this.renderState(0)}
          <div class="states--secondary">${this.config.entities.map((entityConfig, i) => i > 0 && this.renderState(i) || '')}</div>
          ${this.config.align_icon === 'state' ? this.renderIcon() : ''}
        </div>
      `;
  }

  /**
  * Returns an object attrubute value
  * @returns {any} Value of an attribute/subattribute
  * @param obj stateObj.attributes
  * @param path Attribute defined as either a singular attribute or a tree-like path
  */
  getObjectAttr(obj, path) {
    return path.split('.').reduce((res, key) => res && res[key], obj);
  }

  /**
  * Check if an attribute represents an object (dictionary or list)
  * @returns {boolean} True if an attribute is an object, false - otherwise
  * @param path Attribute defined as either a singular attribute or a tree-like path
  */
  isObjectAttr(path) {
    return path.includes('.');
  }

  /** Returns a state/attrubute value
  * @returns {any} value of a state/attribute
  * @param {number} index Index of an entity in config.entities
  */
  getEntityState(index) {
    const entityConfig = this.config.entities[index];
    if (this.config.show.state === 'last' && this.config.show.graph === 'bar') {
      // last "bar" value
      return this.bar[index][this.bar[index].length - 1].value;
    } else if (this.config.show.state === 'last' && this.points[index] && this.points[index].length) {
      // last "point" value
      // only if "points" exist (show_points: true)
      return this.points[index][this.points[index].length - 1][V];
    } else if (entityConfig.attribute) {
      // current attribute value
      return this.getObjectAttr(this.entity[index].attributes, entityConfig.attribute);
    } else {
      // current state value
      return this.entity[index].state;
    }
  }

  /**
  * Renders a state/attrubute value (if "show_state: true")
  * @returns HTML element
  * @param {number} index Index of an entity in config.entities
  */
  renderState(index) {
    const isPrimary = index === 0; // rendering main entity state element?
    if (isPrimary || this.config.entities[index].show_state) {
      // get a state/attribute value
      const state = this.getEntityState(index);
      // use tooltip data for main entity state element, if tooltip is active
      // "tooltip" - a selected point/bar
      const { entity: tooltipEntityIndex, value: tooltipValue } = this.tooltip;
      const isTooltip = isPrimary && tooltipEntityIndex !== undefined;
      // either a state/attr for a selected point/bar - or a "native" state/attr
      const value = isTooltip ? tooltipValue : state;
      const entityIndex = isTooltip ? tooltipEntityIndex : index;
      const entityConfig = this.config.entities[entityIndex];
      // check if a unit should precend a value
      const { directOrder } = this.computeStateOrder(entityIndex);
      return html`
        <div
          reversed=${!directOrder}
          class="state ${!isPrimary ? 'state--small' : ''}"
          @click=${e => this.handlePopup(e, this.entity[index])}
          style=${entityConfig.state_adaptive_color ? `color: ${this.computeColor(value, entityIndex)}` : ''}
        >
          ${entityConfig.show_indicator ? this.renderIndicator(value, entityIndex) : ''}
          <span class="state__value ellipsis">
            ${this.computeState(value, entityIndex)}
          </span>
          <span class="state__uom ellipsis">
            ${this.computeUom(entityIndex)}
          </span>
          ${isPrimary && this.renderStateTime() || ''}
        </div>
      `;
    }
  }

  /**
  * Renders a "time interval" element for a selected point/bar
  * @returns HTML element
  */
  renderStateTime() {
    // "tooltip" - a selected point/bar
    if (this.tooltip.value === undefined) return;
    return html`
      <div class="state__time">
        ${this.tooltip.label ? html`
          <span class="tooltip--label">${this.tooltip.label}</span>
        ` : html`
          <span>${this.tooltip.time[0]}</span> -
          <span>${this.tooltip.time[1]}</span>
        `}
      </div>
    `;
  }

  renderGraph() {
    const ready = (this.entity[0] && !this.Graph.some(
      (element, index) => element._history === undefined
      && this.config.entities[index].show_graph !== false,
    ))
    || this.config.show.loading_indicator === false;
    return this.config.show.graph ? html`
      <div class="graph">
        ${ready ? html`
            <div class="graph__container">
              ${this.renderLabels()}
              ${this.renderLabelsSecondary()}
              <div class="graph__container__svg">
                ${this.renderSvg()}
              </div>
            </div>
            ${this.renderLegend()}
        ` : html`<ha-spinner aria-label="Loading" size="small"></ha-spinner>`}
      </div>` : '';
  }

  /**
  * Renders a legend entry for an entity
  * @returns HTML element
  * @param {number} index Index of an entity in config.entities
  */
  computeLegend(index) {
    let legend = this.computeName(index);
    const state = this.getEntityState(index);
    const { show_legend_state = false } = this.config.entities[index];
    if (show_legend_state) {
      legend += ` (${this.computeStateWithUom(state, index)})`;
    }
    return legend;
  }

  /**
  * Renders a whole legend for all entities
  * @returns HTML element
  */
  renderLegend() {
    // do not show a legend for only 1 entity or when a legend is globally disabled
    if (this.visibleLegends.length <= 1 || !this.config.show.legend) return;
    const location = this.config.show.legend === 'below' ? 'below' : 'above';
    /* eslint-disable indent */
    return html`
      <div class="graph__legend" loc=${location}>
        ${this.visibleLegends.map((entity) => {
          const legend = this.computeLegend(entity.index);
          return html`
            <div class="graph__legend__item"
              @click=${e => this.handlePopup(e, this.entity[entity.index])}
              @mouseenter=${() => this.setTooltip(entity.index, -1, this.getEntityState(entity.index), 'Current')}
              @mouseleave=${() => (this.tooltip = {})}>
              ${this.renderIndicator(this.getEntityState(entity.index), entity.index)}
              <span class="ellipsis">${legend}</span>
            </div>
          `;
        })}
      </div>
    `;
    /* eslint-enable indent */
  }

  /**
  * Renders an indicator for an entity
  * @returns HTML element
  * @param {string | number} state Value of a state/attribute
  * @param {number} index Index of an entity in config.entities
  */
  renderIndicator(state, index) {
    return svg`
      <svg width='10' height='10'>
        <rect width='10' height='10' fill=${this.computeColor(state, index)} />
      </svg>
    `;
  }

  renderSvgFill(fill, i) {
    if (!fill) return;
    const fade = this.config.show.fill === 'fade';
    const init = this.length[i] || this.config.entities[i].show_line === false;
    return svg`
      <defs>
        <linearGradient id=${`fill-grad-${this.id}-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop stop-color='white' offset='0%' stop-opacity='1'/>
          <stop stop-color='white' offset='100%' stop-opacity='.15'/>
        </linearGradient>
        <mask id=${`fill-grad-mask-${this.id}-${i}`}>
          <rect width="100%" height="100%" fill=${`url(#fill-grad-${this.id}-${i})`} />
        </mask>
      </defs>
      <mask id=${`fill-${this.id}-${i}`}>
        <path class='fill'
          type=${this.config.show.fill}
          .id=${i} anim=${this.config.animate} ?init=${init}
          style="animation-delay: ${this.config.animate ? `${i * 0.5}s` : '0s'}"
          fill='white'
          mask=${fade ? `url(#fill-grad-mask-${this.id}-${i})` : ''}
          d=${this.fill[i]}
        />
      </mask>`;
  }

  renderSvgLine(line, i) {
    if (!line) return;

    const path = svg`
      <path
        class='line'
        .id=${i}
        anim=${this.config.animate} ?init=${this.length[i]}
        style="animation-delay: ${this.config.animate ? `${i * 0.5}s` : '0s'}"
        fill='none'
        stroke-dasharray=${this.length[i] || 'none'} stroke-dashoffset=${this.length[i] || 'none'}
        stroke=${'white'}
        stroke-width=${this.config.line_width}
        d=${this.line[i]}
      />`;

    return svg`
      <mask id=${`line-${this.id}-${i}`}>
        ${path}
      </mask>
    `;
  }

  renderSvgPoint(point, i) {
    const color = this.gradient[i] ? this.computeColor(point[V], i) : 'inherit';
    return svg`
      <circle
        class='line--point'
        ?inactive=${this.tooltip.index !== point[3]}
        style=${`--mcg-hover: ${color};`}
        stroke=${color}
        fill=${color}
        cx=${point[X]} cy=${point[Y]} r=${this.config.line_width}
        @mouseover=${() => this.setTooltip(i, point[3], point[V])}
        @mouseout=${() => (this.tooltip = {})}
      />
    `;
  }

  renderSvgPoints(points, i) {
    if (!points) return;
    const color = this.computeColor(this.entity[i].state, i);
    return svg`
      <g class='line--points'
        ?tooltip=${this.tooltip.entity === i}
        ?inactive=${this.tooltip.entity !== undefined && this.tooltip.entity !== i}
        ?init=${this.length[i]}
        anim=${this.config.animate && this.config.show.points !== 'hover'}
        style="animation-delay: ${this.config.animate ? `${i * 0.5 + 0.5}s` : '0s'}"
        fill=${color}
        stroke=${color}
        stroke-width=${this.config.line_width / 2}>
        ${points.map(point => this.renderSvgPoint(point, i))}
      </g>`;
  }

  renderSvgGradient(gradients) {
    if (!gradients) return;
    const items = gradients.map((gradient, i) => {
      if (!gradient) return;
      return svg`
        <linearGradient id=${`grad-${this.id}-${i}`} gradientTransform="rotate(90)">
          ${gradient.map(stop => svg`
            <stop stop-color=${stop.color} offset=${`${stop.offset}%`} />
          `)}
        </linearGradient>`;
    });
    return svg`${items}`;
  }

  renderSvgLineRect(line, i) {
    if (!line) return;
    const fill = this.gradient[i]
      ? `url(#grad-${this.id}-${i})`
      : this.computeColor(this.entity[i].state, i);
    return svg`
      <rect class='line--rect'
        ?inactive=${this.tooltip.entity !== undefined && this.tooltip.entity !== i}
        id=${`rect-${this.id}-${i}`}
        fill=${fill} height="100%" width="100%"
        mask=${`url(#line-${this.id}-${i})`}
      />`;
  }

  renderSvgFillRect(fill, i) {
    if (!fill) return;
    const svgFill = this.gradient[i]
      ? `url(#grad-${this.id}-${i})`
      : this.computeColor(this.entity[i].state, i);
    return svg`
      <rect class='fill--rect'
        ?inactive=${this.tooltip.entity !== undefined && this.tooltip.entity !== i}
        id=${`fill-rect-${this.id}-${i}`}
        fill=${svgFill} height="100%" width="100%"
        mask=${`url(#fill-${this.id}-${i})`}
      />`;
  }

  renderSvgBars(bars, index) {
    if (!bars) return;
    const items = bars.map((bar, i) => {
      const animation = this.config.animate
        ? svg`
          <animate attributeName='y' from=${this.config.height} to=${bar.y} dur='1s' fill='remove'
            calcMode='spline' keyTimes='0; 1' keySplines='0.215 0.61 0.355 1'>
          </animate>`
        : '';
      const color = this.computeColor(bar.value, index);
      return svg`
        <rect class='bar' x=${bar.x} y=${bar.y}
          height=${bar.height} width=${bar.width} fill=${color}
          @mouseover=${() => this.setTooltip(index, i, bar.value)}
          @mouseout=${() => (this.tooltip = {})}>
          ${animation}
        </rect>`;
    });
    return svg`<g class='bars' ?anim=${this.config.animate}>${items}</g>`;
  }

  renderSvg() {
    const { height } = this.config;
    return svg`
      <svg width='100%' height=${height !== 0 ? '100%' : 0} viewBox='0 0 500 ${height}'
        @click=${e => e.stopPropagation()}>
        <g>
          <defs>
            ${this.renderSvgGradient(this.gradient)}
          </defs>
          ${this.fill.map((fill, i) => this.renderSvgFill(fill, i))}
          ${this.fill.map((fill, i) => this.renderSvgFillRect(fill, i))}
          ${this.line.map((line, i) => this.renderSvgLine(line, i))}
          ${this.line.map((line, i) => this.renderSvgLineRect(line, i))}
          ${this.bar.map((bars, i) => this.renderSvgBars(bars, i))}
        </g>
        ${this.points.map((points, i) => this.renderSvgPoints(points, i))}
      </svg>`;
  }

  setTooltip(entity, index, value, label = null) {
    const {
      group_by,
      points_per_hour,
      hours_to_show,
    } = this.config;

    // time units in milliseconds in this function
    const interval = getMilli(1 / points_per_hour);
    const n_points = Math.ceil(hours_to_show * points_per_hour);

    // index is 0 (oldest) to n_points-1 (most recent ~= now)
    // count of intervals from now to end of bin
    // count is 0 (now) to n_points-1 (oldest)
    const count = (n_points - 1) - index;

    // offset end by a minute, if grouped by, e.g., date or hour
    const oneMinute = group_by !== 'interval' ? 60000 : 0;

    const now = this.getEndDate();

    now.setMilliseconds(now.getMilliseconds() - oneMinute - interval * count);
    const end = formatDateTime(now, this.config, this._hass);
    now.setMilliseconds(now.getMilliseconds() + oneMinute - interval);
    const start = formatDateTime(now, this.config, this._hass);

    this.tooltip = {
      value,
      count,
      entity,
      time: [start, end],
      index,
      label,
    };
  }

  /**
  * Renders primary Y-axis labels
  * @returns HTML element
  */
  renderLabels() {
    if (!this.config.show.labels || this.primaryYaxisSeries.length === 0) return;
    // index is not passed into computeState() for a primary axis
    return html`
      <div class="graph__labels --primary flex">
        <span class="label--max">${this.computeState(this.bound[1])}</span>
        <span class="label--min">${this.computeState(this.bound[0])}</span>
      </div>
    `;
  }

  /**
  * Renders secondary Y-axis labels
  * @returns HTML element
  */
  renderLabelsSecondary() {
    if (!this.config.show.labels_secondary || this.secondaryYaxisSeries.length === 0) return;
    // index "-1" is passed into computeState() for a secondary axis
    return html`
      <div class="graph__labels --secondary flex">
        <span class="label--max">${this.computeState(this.boundSecondary[1], -1)}</span>
        <span class="label--min">${this.computeState(this.boundSecondary[0], -1)}</span>
      </div>
    `;
  }

  /**
  * Renders extrema & average info
  * @returns HTML element
  */
  renderInfo() {
    const hideUnit = this.config.show.info_hide_unit;
    const { extrema, average } = this.config.show;
    const location = (extrema === 'below' || average === 'below') ? 'below' : 'above';
    // index "0" is passed into computeState() since "info" is shown for the 1st entity
    return this.abs.length > 0 ? html`
      <div class="info flex" loc=${location}>
        ${this.abs.map(entry => html`
          <div class="info__item">
            <span class="info__item__type">${entry.type}</span>
            <span class="info__item__value">
              ${this.computeStateWithUom(entry.state, 0, hideUnit)}
            </span>
            <span class="info__item__time">
              ${entry.type !== 'avg' ? formatDateTime(new Date(entry.last_changed), this.config, this._hass) : ''}
            </span>
          </div>
        `)}
      </div>
    ` : html``;
  }

  handlePopup(e, entity) {
    e.stopPropagation();
    handleClick(this, this._hass, this.config, this.config.tap_action, entity.entity_id || entity);
  }

  get visibleEntities() {
    return this.config.entities.filter(entity => entity.show_graph !== false);
  }

  get primaryYaxisEntities() {
    return this.visibleEntities.filter(entity => entity.y_axis === undefined
      || entity.y_axis === 'primary');
  }

  get secondaryYaxisEntities() {
    return this.visibleEntities.filter(entity => entity.y_axis === 'secondary');
  }

  get visibleLegends() {
    return this.visibleEntities.filter(entity => entity.show_legend !== false);
  }

  get primaryYaxisSeries() {
    return this.primaryYaxisEntities.map(entity => this.Graph[entity.index]);
  }

  get secondaryYaxisSeries() {
    return this.secondaryYaxisEntities.map(entity => this.Graph[entity.index]);
  }

  /**
  * Returns a color for an entity
  * accounting `color_thresholds`, global `line_color` & individual `color` settings
  * @returns Color
  * @param {string | number} inState Value of a state/attribute
  * @param {number} index Index of an entity in config.entities
  */
  computeColor(inState, index) {
    const { color_thresholds, line_color } = this.config;
    const state = Number(inState) || 0;

    let intColor;
    if (color_thresholds.length > 0) {
      const { color } = color_thresholds.find(ele => ele.value < state)
        || color_thresholds.slice(-1)[0];
      intColor = color;
      const indexThreshold = color_thresholds.findIndex(ele => ele.value < state);
      const c1 = color_thresholds[indexThreshold];
      const c2 = color_thresholds[indexThreshold - 1];
      if (c2) {
        const factor = (c2.value - state) / (c2.value - c1.value);
        intColor = interpolateRgb(c2.color, c1.color, factor);
      } else {
        intColor = indexThreshold
          ? color_thresholds[color_thresholds.length - 1].color
          : color_thresholds[0].color;
      }
    }

    return this.config.entities[index].color
      || intColor
      || line_color[index] || line_color[0];
  }

  /**
  * Returns a name of an entity accounting a `name` option
  * @returns {string} Name of an entity
  * @param {number} index Index of an entity in config.entities
  */
  computeName(index) {
    return this.config.entities[index].name
      || this.entity[index].attributes.friendly_name
      || this.entity[index].entity_id;
  }

  /**
  * Returns an icon for an entity
  * accounting an `icon` option, entity's native `icon` attribute,
  * fallback to a standard MDI "temperature" icon
  * @returns {string} mdi:icon
  * @param {object} entity stateObj for an entity
  */
  computeIcon(entity) {
    return (
      this.config.icon
      || entity.attributes.icon
      || stateIcon(entity)
      || ICONS.temperature
    );
  }

  /**
  * Returns a unit
  * @returns {string} Unit
  * @param {number} index Index of an entity in config.entities
  */
  computeUom(index) {
    const entityId = this.entity[index].entity_id;
    const stateObj = this._hass.states[entityId];
    let unit;
    if (!stateObj || isUnavailableState(stateObj.state)) {
      unit = '';
    } else if (this.config.entities[index].unit !== undefined) {
      // eslint-disable-next-line prefer-destructuring
      unit = this.config.entities[index].unit;
    } else if (this.config.unit !== undefined) {
      // eslint-disable-next-line prefer-destructuring
      unit = this.config.unit;
    } else {
      // retrieving a native unit
      const { attribute } = this.config.entities[index];
      if (!attribute || !this.isObjectAttr(attribute)) {
        // any cases except an object attribute
        let parts;
        if (attribute) {
          parts = this._hass.formatEntityAttributeValueToParts(
            stateObj,
            attribute,
          );
        } else {
          parts = this._hass.formatEntityStateToParts(
            stateObj,
          );
        }
        const unitPart = parts.find(part => part.type === 'unit');
        unit = unitPart && unitPart.value;
      } else {
        // object attribute - considered as unitless
        unit = '';
      }
    }
    return (unit || '');
  }

  /**
  * Returns a string value for a state/attrubute:
  * localized, following locale settings,
  * accounting possible individual accuracy settings & possible "decimals" options
  * @returns {string} value of a state/attribute
  * @param {number|string} inState Value of a state/attribute ("unformatted")
  * @param {number} index Index of an entity in config.entities
  */
  computeState(inState, index) {
    if (this.config.state_map.length > 0) {
      const stateMap = Number.isInteger(inState)
        ? this.config.state_map[inState]
        : this.config.state_map.find(state => state.value === inState);

      if (stateMap) {
        return stateMap.label;
      } else {
        log(`value [${inState}] not found in state_map`);
      }
    }

    let state;
    if (isUnavailableState(inState)) {
      // as is
      state = inState;
    } else if (typeof inState === 'string') {
      // attempt to fix an unexpected number format
      state = parseFloat(inState.replace(/,/g, '.'));
    } else {
      // as is presented as a number
      state = Number(inState);
    }
    const factor = getFactor(this.config, index);
    // safely process with a factor
    state = Number.isNaN(Number(state)) ? state : state * factor;

    let dec;
    // attempting to get "decimals" settings
    if (index === undefined) {
      // for a primary Y-axis
      dec = this.config.decimals_primary_labels !== undefined
        ? this.config.decimals_primary_labels
        : this.config.decimals;
    } else if (index === -1) {
      // for a secondary Y-axis
      dec = this.config.decimals_secondary_labels !== undefined
        ? this.config.decimals_secondary_labels
        : this.config.decimals;
    } else {
      // for a state or attribute value
      dec = this.config.entities[index].decimals !== undefined
        ? this.config.entities[index].decimals
        : this.config.decimals;
    }

    let value;

    if (dec === undefined || Number.isNaN(Number(dec)) || Number.isNaN(Number(state))) {
      // no valid "decimals" settings defined, use a default accuracy
      if (index >= 0) {
        // formatting a state or attribute
        const entityId = this.config.entities[index].entity;
        const { attribute } = this.config.entities[index];
        const stateObj = this._hass.states[entityId];
        if (attribute && !this.isObjectAttr(attribute)) {
          // formatting not-object attribute
          const attrParts = this._hass.formatEntityAttributeValueToParts(
            stateObj,
            attribute,
            state,
          );
          const partValue = attrParts.find(part => part.type === 'value');
          value = partValue && partValue.value;
          return value;
        } else if (attribute && this.isObjectAttr(attribute)) {
          // formatting object attribute - similar to Y-axis labels
          return formatNumber(
            state,
            this._hass.locale,
          );
        } else {
          // formatting state
          const stateParts = this._hass.formatEntityStateToParts(
            stateObj,
            state,
          );
          const partValue = stateParts.find(part => part.type === 'value');
          value = partValue && partValue.value;
          return value;
        }
      } else {
        // formatting Y-axis (primary, secondary) labels
        // use a default hard-coded accuracy
        return formatNumber(
          state,
          this._hass.locale,
        );
      }
    }

    // use an acuracy defined by "dec" variable
    return formatNumber(
      state,
      this._hass.locale,
      { minimumFractionDigits: dec, maximumFractionDigits: dec },
    );
  }

  updateOnInterval() {
    if (this.stateChanged && !this.updating) {
      this.stateChanged = false;
      this.updateData();
    }
  }

  /**
  * Returns settings defining an order of a state/attrubute value presentation
  * @returns {Object}
  * directOrder - true: "value literal unit", false: "unit literal value";
  *
  * delimiter - an optional literal separator between value & unit
  * @param index Index of an entity in config.entities
  */
  computeStateOrder(index) {
    const entityId = this.config.entities[index].entity;
    const { attribute } = this.config.entities[index];
    if (!attribute || !this.isObjectAttr(attribute)) {
      // any cases except an object attribute
      const stateObj = this._hass.states[entityId];
      let parts;
      if (attribute) {
        parts = this._hass.formatEntityAttributeValueToParts(
          stateObj,
          attribute,
        );
      } else {
        parts = this._hass.formatEntityStateToParts(stateObj);
      }
      const indexUnit = parts.findIndex(part => part.type === 'unit');
      const indexValue = parts.findIndex(part => part.type === 'value');
      const directOrder = indexUnit === -1 || indexUnit > indexValue;
      const delimiterPart = parts.find(part => part.type === 'literal');
      const delimiter = delimiterPart && delimiterPart.value;
      return { directOrder, delimiter: delimiter || '' };
    } else {
      // object attribute
      return { directOrder: true, delimiter: ' ' };
    }
  }

  /**
  * Returns a string state/attrubute value presentation
  * @returns {string} State/attrubute value presentation
  * @param {number|string} inState Value of a state/attribute
  * @param {number} index Index of an entity in config.entities
  * @param {boolean} [hideUnit] Do not show a unit for a value
  */
  computeStateWithUom(inState, index, hideUnit) {
    // get a state/attribute value
    const state = this.computeState(inState, index);

    // get a unit
    const unit = hideUnit ? '' : this.computeUom(index);

    // get native order & delimiter
    const { directOrder, delimiter: nativeDelimiter } = this.computeStateOrder(index);

    let delimiter;
    if (unit === '') {
      delimiter = '';
    } else if (directOrder
      && !delimiter
      && (this.config.unit || this.config.entities[index].unit)
      && (unit !== '%'
        || blankBeforePercent(this._hass.locale) === ' ')) {
      // add a delimiter for a user-defined unit (except for "%" for some locales)
      delimiter = ' ';
    } else {
      delimiter = nativeDelimiter;
    }

    // compose a string
    const composed = directOrder
      ? `${state}${delimiter}${unit}`
      : `${unit}${delimiter}${state}`;
    return composed;
  }

  async updateData({ config } = this) {
    this.updating = true;

    const end = this.getEndDate();
    const start = new Date(end);
    start.setMilliseconds(start.getMilliseconds() - getMilli(config.hours_to_show));

    try {
      const promise = this.entity.map((entity, i) => this.updateEntity(entity, i, start, end));
      await Promise.all(promise);
    } catch (err) {
      log(err);
    }


    if (config.show.graph) {
      this.entity.forEach((entity, i) => {
        if (entity) this.Graph[i].update();
      });
    }

    this.updateBounds();

    if (config.show.graph) {
      let graphPos = 0;
      this.entity.forEach((entity, i) => {
        if (!entity || this.Graph[i].coords.length === 0) return;
        const bound = config.entities[i].y_axis === 'secondary' ? this.boundSecondary : this.bound;
        [this.Graph[i].min, this.Graph[i].max] = [bound[0], bound[1]];
        if (config.show.graph === 'bar') {
          const numVisible = this.visibleEntities.length;
          this.bar[i] = this.Graph[i].getBars(graphPos, numVisible, config.bar_spacing);
          graphPos += 1;
        } else {
          const line = this.Graph[i].getPath();
          if (config.entities[i].show_line !== false) this.line[i] = line;
          if (config.show.fill
            && config.entities[i].show_fill !== false) this.fill[i] = this.Graph[i].getFill(line);
          if (config.show.points && (config.entities[i].show_points !== false)) {
            this.points[i] = this.Graph[i].getPoints();
          }
          if (config.color_thresholds.length > 0 && !config.entities[i].color)
            this.gradient[i] = this.Graph[i].computeGradient(
              config.color_thresholds, this.config.logarithmic,
            );
        }
      });
      this.line = [...this.line];
    }
    this.updating = false;
    this.setNextUpdate();
  }

  getBoundary(type, series, configVal, fallback) {
    if (!(type in Math)) {
      throw new Error(`The type "${type}" is not present on the Math object`);
    }

    if (configVal === undefined) {
      // dynamic boundary depending on values
      return Math[type](...series.map(ele => ele[type])) || fallback;
    }
    if (configVal[0] !== '~') {
      // fixed boundary
      return configVal;
    }
    // soft boundary (respecting out of range values)
    return Math[type](Number(configVal.substr(1)), ...series.map(ele => ele[type]));
  }

  getBoundaries(series, min, max, fallback, minRange) {
    let boundary = [
      this.getBoundary('min', series, min, fallback[0]),
      this.getBoundary('max', series, max, fallback[1]),
    ];

    if (minRange) {
      const currentRange = Math.abs(boundary[0] - boundary[1]);
      const diff = parseFloat(minRange) - currentRange;

      // Doesn't matter if minBoundRange is NaN because this will be false if so
      if (diff > 0) {
        const weights = [
          min !== undefined && min[0] !== '~' || max === undefined ? 0 : 1,
          max !== undefined && max[0] !== '~' || min === undefined ? 0 : 1,
        ];
        const sum = weights[0] + weights[1];
        if (sum > 0) {
          boundary = [
            boundary[0] - diff * weights[0] / sum,
            boundary[1] + diff * weights[1] / sum,
          ];
        } else {
          boundary = [
            boundary[0] - diff / 2,
            boundary[1] + diff / 2,
          ];
        }
      }
    }

    return boundary;
  }

  updateBounds({ config } = this) {
    this.bound = this.getBoundaries(
      this.primaryYaxisSeries,
      config.lower_bound,
      config.upper_bound,
      this.bound,
      config.min_bound_range,
    );

    this.boundSecondary = this.getBoundaries(
      this.secondaryYaxisSeries,
      config.lower_bound_secondary,
      config.upper_bound_secondary,
      this.boundSecondary,
      config.min_bound_range_secondary,
    );
  }

  async getCache(key, compressed) {
    const data = await localForage.getItem(`${key}_${this._md5Config}${(compressed ? '' : '_raw')}`);
    return data ? (compressed ? decompress(data) : data) : null;
  }

  async setCache(key, data, compressed) {
    return compressed
      ? localForage.setItem(`${key}_${this._md5Config}`, compress(data))
      : localForage.setItem(`${key}_${this._md5Config}_raw`, data);
  }

  async updateEntity(entity, index, initStart, end) {
    if (!entity
      || !this.updateQueue.includes(`${entity.entity_id}-${index}`)
      || this.config.entities[index].show_graph === false
    ) return;
    this.updateQueue = this.updateQueue.filter(entry => entry !== `${entity.entity_id}-${index}`);

    let stateHistory = [];
    let start = initStart;
    let skipInitialState = false;

    const history = this.config.cache
      ? await this.getCache(`${entity.entity_id}_${index}`, this.config.useCompress)
      : undefined;
    if (history && history.hours_to_show === this.config.hours_to_show) {
      stateHistory = history.data;

      let currDataIndex = stateHistory.findIndex(item => new Date(item.last_changed) > initStart);
      if (currDataIndex !== -1) {
        if (currDataIndex > 0) {
          // include previous item
          currDataIndex -= 1;
          // but change it's last changed time
          stateHistory[currDataIndex].last_changed = initStart;
        }

        stateHistory = stateHistory.slice(currDataIndex, stateHistory.length);
        // skip initial state when fetching recent/not-cached data
        skipInitialState = true;
      } else {
        // there were no states which could be used in current graph so clearing
        stateHistory = [];
      }

      const lastFetched = new Date(history.last_fetched);
      if (lastFetched > start) {
        start = new Date(lastFetched - 1);
      }
    }

    let newStateHistory = await this.fetchRecent(
      entity.entity_id,
      start,
      end,
      this.config.entities[index].attribute ? false : skipInitialState,
      !!this.config.entities[index].attribute,
    );
    if (newStateHistory[0] && newStateHistory[0].length > 0) {
      /**
      * hack because HA doesn't return anything if skipInitialState is false
      * when retrieving for attributes so we retrieve it and we remove it.*
      */
      if (this.config.entities[index].attribute && skipInitialState) {
        newStateHistory[0].shift();
      }
      // check if we should convert states to numeric values
      if (this.config.state_map.length > 0 || this.config.entities[index].attribute) {
        newStateHistory[0].forEach((item) => {
          if (this.config.entities[index].attribute) {
            // eslint-disable-next-line no-param-reassign
            item.state = this.getObjectAttr(item.attributes, this.config.entities[index].attribute);
            // eslint-disable-next-line no-param-reassign
            delete item.attributes;
          }
          if (this.config.state_map.length > 0)
            this._convertState(item);
        });
      }

      newStateHistory = newStateHistory[0].filter(item => !Number.isNaN(parseFloat(item.state)));
      newStateHistory = newStateHistory.map(item => ({
        last_changed: this.config.entities[index].attribute ? item.last_updated : item.last_changed,
        state: item.state,
      }));
      stateHistory = [...stateHistory, ...newStateHistory];

      if (this.config.cache) {
        this
          .setCache(`${entity.entity_id}_${index}`, {
            hours_to_show: this.config.hours_to_show,
            last_fetched: new Date(),
            data: stateHistory,
            version,
          }, this.config.useCompress)
          .catch((err) => {
            log(err);
            localForage.clear();
          });
      }
    }

    if (stateHistory.length === 0) return;

    if (this.entity[0] && entity.entity_id === this.entity[0].entity_id) {
      this.updateExtrema(stateHistory);
    }

    if (this.config.entities[index].fixed_value === true) {
      const last = stateHistory[stateHistory.length - 1];
      this.Graph[index].history = [last, last];
    } else {
      this.Graph[index].history = stateHistory;
    }
  }

  async fetchRecent(entityId, start, end, skipInitialState, withAttributes) {
    let url = 'history/period';
    if (start) url += `/${start.toISOString()}`;
    url += `?filter_entity_id=${entityId}`;
    if (end) url += `&end_time=${end.toISOString()}`;
    if (skipInitialState) url += '&skip_initial_state';
    if (!withAttributes) url += '&minimal_response&no_attributes';
    if (withAttributes) url += '&significant_changes_only=0';
    return this._hass.callApi('GET', url);
  }

  updateExtrema(history) {
    const { extrema, average } = this.config.show;
    this.abs = [
      ...(extrema ? [{
        type: 'min',
        ...getMin(history, 'state'),
      }] : []),
      ...(average ? [{
        type: 'avg',
        state: getAvg(history, 'state'),
      }] : []),
      ...(extrema ? [{
        type: 'max',
        ...getMax(history, 'state'),
      }] : []),
    ];
  }

  _convertState(res) {
    const resultIndex = this.config.state_map.findIndex(s => s.value === res.state);
    if (resultIndex === -1) {
      return;
    }

    res.state = resultIndex;
  }

  getEndDate() {
    const date = new Date();
    switch (this.config.group_by) {
      case 'date':
        date.setDate(date.getDate() + 1);
        date.setHours(0, 0, 0);
        break;
      case 'hour':
        date.setHours(date.getHours() + 1);
        date.setMinutes(0, 0);
        break;
      default:
        break;
    }
    return date;
  }

  setNextUpdate() {
    if (!this.config.update_interval) {
      const interval = 1 / this.config.points_per_hour;
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        if (!this.updating) this.updateData();
      }, interval * ONE_HOUR);
    }
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('mini-graph-card', MiniGraphCard);

const NUMERIC_DOMAINS = ['counter', 'input_number', 'number'];

const isNumericEntity = (hass, entityId) => {
  const domain = entityId.split('.')[0];
  if (NUMERIC_DOMAINS.includes(domain)) return true;
  if (domain !== 'sensor') return false;

  const stateObj = hass.states[entityId];
  if (!stateObj) return false;
  return !!stateObj.attributes.unit_of_measurement || !!stateObj.attributes.state_class;
};

// Configure the preview in the Lovelace card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'mini-graph-card',
  name: 'Mini Graph Card',
  preview: false,
  description: 'The Mini Graph card is a minimalistic and customizable graph card',
  getEntitySuggestion: (hass, entityId) => {
    if (!isNumericEntity(hass, entityId)) return null;

    return {
      config: {
        type: 'custom:mini-graph-card',
        entities: [{ entity: entityId }],
      },
    };
  },
});
