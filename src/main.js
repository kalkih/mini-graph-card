import { LitElement, html, svg } from 'lit-element';
import localForage from 'localforage/src/localforage';
import Graph from './graph';
import style from './style';
import {
  URL_DOCS,
  FONT_SIZE,
  FONT_SIZE_HEADER,
  MAX_BARS,
  ICONS,
  DEFAULT_COLORS,
  UPDATE_PROPS,
  DEFAULT_SHOW,
  X,
  Y,
  V,
} from './const';
import {
  getMin, getMax, getTime, getMilli, compress, uncompress
} from './utils';

localForage.config({
  name: 'mini-graph-card',
  version: 1.0,
  storeName: 'entity_history_cache',
  description: 'Mini graph card uses caching for the entity history',
});

localForage.iterate(function(value, key, iterationNumber) {
  value = uncompress(value);
  const start = new Date();
  start.setHours(start.getHours() - value.hours_to_show);
  if (new Date(value.last_fetched) < start) {
    localForage.removeItem(key);
  }
}).catch(function(err) {
  console.log('Purging has errored:', err);
});

class MiniGraphCard extends LitElement {
  constructor() {
    super();
    this.id = Math.random()
      .toString(36)
      .substr(2, 9);
    this.bound = [0, 0];
    this.abs = [];
    this.length = [];
    this.entity = [];
    this.line = [];
    this.bar = [];
    this.fill = [];
    this.points = [];
    this.gradient = [];
    this.tooltip = {};
    this.updateQueue = [];
    this.updating = false;
    this.stateChanged = false;
  }

  static get styles() {
    return style;
  }

  set hass(hass) {
    this._hass = hass;
    let updated = false;
    this.config.entities.forEach((entity, index) => {
      const entityState = hass.states[entity.entity];
      if (entityState && this.entity[index] !== entityState) {
        this.entity[index] = entityState;
        this.updateQueue.push(entityState.entity_id);
        updated = true;
      }
    });
    if (updated) {
      this.entity = [...this.entity];
      if (!this.config.update_interval && !this.updating) {
        this.updateData();
      } else {
        this.stateChanged = true;
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
      abs: [],
      tooltip: {},
      updateQueue: [],
      color: String,
    };
  }

  setConfig(config) {
    if (config.entity)
      throw new Error(`The "entity" option was removed, please use "entities".\n See ${URL_DOCS}`);
    if (!Array.isArray(config.entities))
      throw new Error(`Please provide the "entities" option as a list.\n See ${URL_DOCS}`);
    if (config.line_color_above || config.line_color_below)
      throw new Error(
        `"line_color_above/line_color_below" was removed, please use "color_thresholds".\n See ${URL_DOCS}`,
      );

    const conf = {
      animate: false,
      hour24: false,
      font_size: FONT_SIZE,
      font_size_header: FONT_SIZE_HEADER,
      height: 100,
      hours_to_show: 24,
      points_per_hour: 0.5,
      line_color: [...DEFAULT_COLORS],
      color_thresholds: [],
      line_width: 5,
      more_info: true,
      ...config,
      show: { ...DEFAULT_SHOW, ...config.show },
    };

    conf.entities.forEach((entity, i) => {
      if (typeof entity === 'string') conf.entities[i] = { entity };
    });
    if (typeof config.line_color === 'string')
      conf.line_color = [config.line_color, ...DEFAULT_COLORS];

    conf.font_size = (config.font_size / 100) * FONT_SIZE || FONT_SIZE;
    conf.color_thresholds.sort((a, b) => b.value - a.value);
    const additional = conf.hours_to_show > 24 ? { day: 'numeric', weekday: 'short' } : {};
    conf.format = { hour12: !conf.hour24, ...additional };

    if (conf.show.graph === 'bar') {
      const entities = conf.entities.length;
      if (conf.hours_to_show * conf.points_per_hour * entities > MAX_BARS) {
        conf.points_per_hour = MAX_BARS / (conf.hours_to_show * entities);
        // eslint-disable-next-line no-console
        console.warn(
          'mini-graph-card: Not enough space, adjusting points_per_hour to ',
          conf.points_per_hour,
        );
      }
    }
    if (!this.Graph) {
      this.Graph = conf.entities.map(
        () => new Graph(
          500,
          conf.height,
          [conf.show.fill ? 0 : conf.line_width, conf.line_width],
          conf.hours_to_show,
          conf.points_per_hour,
        ),
      );
    }

    this.config = conf;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.config.update_interval) {
      this.updateOnInterval();
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
    if (!this.entity[0]) return false;
    if (UPDATE_PROPS.some(prop => changedProps.has(prop))) {
      this.color = this.computeColor(
        this.tooltip.value || this.entity[0].state,
        this.tooltip.entity || 0,
      );
      return true;
    }
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
    return html`
      <ha-card
        class="flex"
        ?group=${config.group}
        ?fill=${config.show.graph && config.show.fill}
        ?points=${config.show.points === 'hover'}
        ?labels=${config.show.labels === 'hover'}
        ?gradient=${config.color_thresholds.length > 0}
        ?more-info=${config.more_info}
        style="font-size: ${config.font_size}px;"
        @click=${e => this.handlePopup(e, this.entity[0])}
      >
        ${this.renderHeader()} ${this.renderStates()} ${this.renderGraph()} ${this.renderInfo()}
      </ha-card>
    `;
  }

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

  renderIcon() {
    const { icon, icon_adaptive_color } = this.config.show;
    return icon ? html`
      <div class="icon" loc=${this.config.align_icon}
        style=${icon_adaptive_color ? `color: ${this.color};` : ''}>
        <ha-icon .icon=${this.computeIcon(this.entity[0])}></ha-icon>
      </div>
    ` : '';
  }

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

  renderStates() {
    const { entity, value } = this.tooltip;
    const state = value !== undefined ? value : this.entity[0].state;
    const color = this.config.entities[0].state_adaptive_color ? `color: ${this.color};` : '';
    if (this.config.show.state)
      return html`
        <div class="states flex" loc=${this.config.align_state}>
          <div class="state">
            <span class="state__value ellipsis" style=${color}>
              ${this.computeState(state)}
            </span>
            <span class="state__uom ellipsis" style=${color}>
              ${this.computeUom(entity || 0)}
            </span>
            ${this.renderStateTime()}
          </div>
          <div class="states--secondary">
            ${this.config.entities.map((ent, i) => this.renderState(ent, i))}
          </div>
          ${this.config.align_icon === 'state' ? this.renderIcon() : ''}
        </div>
      `;
  }

  renderState(entity, id) {
    if (entity.show_state && id !== 0) {
      const { state } = this.entity[id];
      return html`
        <div
          class="state state--small"
          style=${entity.state_adaptive_color ? `color: ${this.computeColor(state, id)};` : ''}>
          ${entity.show_indicator ? this.renderIndicator(state, id) : ''}
          <span class="state__value ellipsis">
            ${this.computeState(state)}
          </span>
          <span class="state__uom ellipsis">
            ${this.computeUom(id)}
          </span>
        </div>
      `;
    }
  }

  renderStateTime() {
    if (this.tooltip.value === undefined) return;
    return html`
      <div class="state__time">
        <span>${this.tooltip.time[0]}</span> -
        <span>${this.tooltip.time[1]}</span>
      </div>
    `;
  }

  renderGraph() {
    return this.config.show.graph ? html`
      <div class="graph">
        <div class="graph__container">
          ${this.renderLabels()}
          <div class="graph__container__svg">
            ${this.renderSvg()}
          </div>
        </div>
        ${this.renderLegend()}
      </div>` : '';
  }

  renderLegend() {
    if (this.config.entities.length <= 1 || !this.config.show.legend) return;
    return html`
      <div class="graph__legend">
        ${this.entity.map((entity, i) => html`
          <div class="graph__legend__item" @click=${e => this.handlePopup(e, entity)}>
            ${this.renderIndicator(entity.state, i)}
            <span class="ellipsis">${this.computeName(i)}</span>
          </div>
        `)}
      </div>
    `;
  }

  renderIndicator(state, index) {
    return svg`
      <svg width='10' height='10'>
        <rect width='10' height='10' fill=${this.computeColor(state, index)} />
      </svg>
    `;
  }

  renderSvgFill(fill, i) {
    if (!fill) return;
    const color = this.computeColor(this.entity[i].state, i);
    const fade = this.config.show.fill === 'fade';
    const mask = fade
      ? `url(#fill-grad-${this.id}-${i})`
      : color;
    return svg`
      <defs>
        <linearGradient id=${`fill-grad-${this.id}-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop stop-color=${color} offset='0%' stop-opacity='1'/>
          <stop stop-color=${color} offset='100%' stop-opacity='.15'/>
        </linearGradient>
      </defs>
      <path
        class='line--fill'
        type=${this.config.show.fill}
        .id=${i} anim=${this.config.animate} ?init=${this.length[i]}
        style="animation-delay: ${this.config.animate ? `${i * 0.5}s` : '0s'}"
        fill=${mask}
        stroke=${mask}
        stroke-width=${this.config.line_width}
        d=${this.fill[i]}
      />`;
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

  renderSvgPoints(points, i) {
    if (!points) return;
    const color = this.computeColor(this.entity[i].state, i);
    return svg`
      <g class='line--points'
        ?init=${this.length[i]}
        anim=${this.config.animate && this.config.show.points !== 'hover'}
        style="animation-delay: ${this.config.animate ? `${i * 0.5 + 0.5}s` : '0s'}"
        fill=${color}
        stroke=${color}
        stroke-width=${this.config.line_width / 2}>
        ${points.map(point => svg`
          <circle
            class='line--point'
            stroke=${this.gradient[i] ? this.computeColor(point[V], i) : 'inherit'}
            fill=${this.gradient[i] ? this.computeColor(point[V], i) : 'inherit'}
            cx=${point[X]} cy=${point[Y]} r=${this.config.line_width}
            @mouseover=${() => this.setTooltip(i, point[3], point[V])}
            @mouseout=${() => (this.tooltip = {})}
          />
        `)}
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

  renderSvgRect(line, i) {
    if (!line) return;
    const fill = this.gradient[i]
      ? `url(#grad-${this.id}-${i})`
      : this.computeColor(this.entity[i].state, i);
    return svg`
      <rect id=${`rect-${this.id}-${i}`}
        fill=${fill} height="100%" width="100%"
        mask=${`url(#line-${this.id}-${i})`}
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
          ${this.line.map((line, i) => this.renderSvgLine(line, i))}
          ${this.fill.map((fill, i) => this.renderSvgFill(fill, i))}
          ${this.line.map((line, i) => this.renderSvgRect(line, i))}
          ${this.bar.map((bars, i) => this.renderSvgBars(bars, i))}
        </g>
        ${this.points.map((points, i) => this.renderSvgPoints(points, i))}
      </svg>`;
  }

  setTooltip(entity, index, value) {
    const { points_per_hour, hours_to_show, format } = this.config;
    const offset = hours_to_show < 1 && points_per_hour < 1
      ? points_per_hour * hours_to_show
      : 1 / points_per_hour;

    const id = Math.abs(index + 1 - Math.ceil(hours_to_show * points_per_hour));

    const now = new Date();
    now.setMilliseconds(now.getMilliseconds() - getMilli(offset * id));
    const end = getTime(now, { hour12: !this.config.hour24 }, this._hass.language);
    now.setMilliseconds(now.getMilliseconds() - getMilli(offset));
    const start = getTime(now, format, this._hass.language);

    this.tooltip = {
      value,
      id,
      entity,
      time: [start, end],
    };
  }

  renderLabels() {
    if (!this.config.show.labels) return;
    return html`
      <div class="graph__labels flex">
        <span class="label--max">${this.computeState(this.bound[1])}</span>
        <span class="label--min">${this.computeState(this.bound[0])}</span>
      </div>
    `;
  }

  renderInfo() {
    if (!this.config.show.extrema) return;
    return html`
      <div class="info flex">
        ${this.abs.map(entry => html`
          <div class="info__item">
            <span class="info__item__type">${entry.type}</span>
            <span class="info__item__value">
              ${this.computeState(entry.state)} ${this.computeUom(0)}
            </span>
            <span class="info__item__time">
              ${getTime(new Date(entry.last_changed), this.config.format, this._hass.language)}
            </span>
          </div>
        `)}
      </div>
    `;
  }

  handlePopup(e, entity) {
    e.stopPropagation();
    if (this.config.more_info) this.fire('hass-more-info', { entityId: entity.entity_id });
  }

  fire(type, inDetail, inOptions) {
    const options = inOptions || {};
    const detail = inDetail === null || inDetail === undefined ? {} : inDetail;
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed,
    });
    e.detail = detail;
    this.dispatchEvent(e);
    return e;
  }

  computeColor(inState, i) {
    const { color_thresholds, line_color } = this.config;
    const state = Number(inState) || 0;
    const threshold = {
      color: line_color[i] || line_color[0],
      ...color_thresholds.slice(-1)[0],
      ...color_thresholds.find(ele => ele.value < state),
    };
    return this.config.entities[i].color || threshold.color;
  }

  computeName(index) {
    return this.config.entities[index].name || this.entity[index].attributes.friendly_name;
  }

  computeIcon(entity) {
    return (
      this.config.icon
      || entity.attributes.icon
      || ICONS[entity.attributes.device_class]
      || ICONS.temperature
    );
  }

  computeUom(index) {
    return (
      this.config.entities[index].unit
      || this.config.unit
      || this.entity[index].attributes.unit_of_measurement
      || ''
    );
  }

  computeState(inState) {
    const state = Number(inState);
    const dec = this.config.decimals;
    if (dec === undefined || Number.isNaN(dec) || Number.isNaN(state))
      return Math.round(state * 100) / 100;

    const x = 10 ** dec;
    return (Math.round(state * x) / x).toFixed(dec);
  }

  updateOnInterval() {
    if (this.stateChanged && !this.updating) {
      this.stateChanged = false;
      this.updateData();
    }
  }

  async updateData({ config } = this) {
    this.updating = true;

    const end = new Date();
    const start = new Date();
    start.setHours(end.getHours() - config.hours_to_show);

    try {
      const promise = this.entity.map((entity, i) => this.updateEntity(entity, i, start, end));
      await Promise.all(promise);
    } finally {
      this.updating = false;
    }

    this.updateQueue = [];

    this.bound = [
      config.lower_bound !== undefined
        ? config.lower_bound
        : Math.min(...this.Graph.map(ele => ele.min)) || this.bound[0],
      config.upper_bound !== undefined
        ? config.upper_bound
        : Math.max(...this.Graph.map(ele => ele.max)) || this.bound[1],
    ];

    if (config.show.graph) {
      this.entity.forEach((entity, i) => {
        if (!entity || this.Graph[i].coords.length === 0) return;
        [this.Graph[i].min, this.Graph[i].max] = [this.bound[0], this.bound[1]];
        if (config.show.graph === 'bar') {
          this.bar[i] = this.Graph[i].getBars(i, config.entities.length);
        } else {
          this.line[i] = this.Graph[i].getPath();
          if (config.show.fill) this.fill[i] = this.Graph[i].getFill(this.line[i]);
          if (config.show.points) this.points[i] = this.Graph[i].getPoints();
          if (config.color_thresholds.length > 0 && !config.entities[i].color)
            this.gradient[i] = this.Graph[i].computeGradient(config.color_thresholds);
        }
      });
      this.line = [...this.line];
    }
  }

  async getCache(key) {
    const data = await localForage.getItem(key);
    return data ? uncompress(data) : null;
  }

  async setCache(key, data) {
    return localForage.setItem(key, compress(data));
  }

  async updateEntity(entity, index, initStart, end) {
    if (!entity || !this.updateQueue.includes(entity.entity_id)) return;
    let stateHistory = [];
    let start = initStart;
    let skipInitialState = false;

    const history = await this.getCache(entity.entity_id);
    if (history && history.hours_to_show === this.config.hours_to_show) {
      stateHistory = history.data;
      stateHistory = stateHistory.filter(item => new Date(item.last_changed) > initStart);
      if (stateHistory.length > 0) {
        skipInitialState = true;
      }
      const lastFetched = new Date(history.last_fetched);
      if (lastFetched > start) {
        start = new Date(lastFetched - 1);
      }
    }

    let newStateHistory = await this.fetchRecent(entity.entity_id, start, end, skipInitialState);
    if (newStateHistory[0] && newStateHistory[0].length > 0) {
      newStateHistory = newStateHistory[0].filter(item => !Number.isNaN(parseFloat(item.state)));
      newStateHistory = newStateHistory.map(item => {delete item.last_updated; delete item.entity_id; delete item.attributes; delete item.context; return item;});
      stateHistory = [...stateHistory, ...newStateHistory];

      this
        .setCache(entity.entity_id, {
          hours_to_show: this.config.hours_to_show,
          last_fetched: end,
          data: stateHistory,
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('mini-graph-card: Failed to cache: ', err);
          localForage.clear();
        });
    }

    if (stateHistory.length === 0) return;

    if (entity.entity_id === this.entity[0].entity_id) {
      this.abs = [
        {
          type: 'min',
          ...getMin(stateHistory, 'state'),
        },
        {
          type: 'max',
          ...getMax(stateHistory, 'state'),
        },
      ];
    }

    this.Graph[index].update(stateHistory);
  }

  async fetchRecent(entityId, start, end, skipInitialState) {
    let url = 'history/period';
    if (start) url += `/${start.toISOString()}`;
    url += `?filter_entity_id=${entityId}`;
    if (end) url += `&end_time=${end.toISOString()}`;
    if (skipInitialState) url += '&skip_initial_state';
    return this._hass.callApi('GET', url);
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('mini-graph-card', MiniGraphCard);
