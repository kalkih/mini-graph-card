import { LitElement, html, svg } from 'lit-element';
import Graph from './graph';
import style from './style';

const URL_DOCS = 'https://github.com/kalkih/mini-graph-card/blob/master/README.md';
const FONT_SIZE = 14;
const ICON = {
  humidity: 'hass:water-percent',
  illuminance: 'hass:brightness-5',
  temperature: 'hass:thermometer',
  battery: 'hass:battery',
};
const DEFAULT_COLORS = ['var(--accent-color)', '#3498db', '#e74c3c', '#9b59b6', '#f1c40f', '#2ecc71'];
const UPDATE_PROPS = ['entity', 'line', 'length', 'fill', 'points', 'tooltip', 'abs'];
const DEFAULT_SHOW = {
  name: true,
  icon: true,
  state: true,
  graph: true,
  labels: 'hover',
  extrema: false,
  legend: true,
  fill: true,
  points: 'hover',
};

const getMin = (arr, val) => {
  arr.reduce((min, p) => (Number(p[val]) < Number(min[val]) ? p : min), arr[0]);
};
const getMax = (arr, val) => {
  arr.reduce((max, p) => (Number(p[val]) > Number(max[val]) ? p : max), arr[0]);
};
const getTime = (date, hour24) => date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: !hour24 });

class MiniGraphCard extends LitElement {
  constructor() {
    super();
    this.bound = [0, 0];
    this.abs = [];
    this.length = [];
    this.entity = [];
    this.line = [];
    this.fill = [];
    this.points = [];
    this.gradient = [];
    this.tooltip = {};
    this.updateQueue = [];
  }

  static get styles() {
    return style;
  }

  set hass(hass) {
    this._hass = hass;
    let update = false;
    this.config.entities.forEach((entity, index) => {
      const entityState = hass.states[entity.entity];
      if (entityState && this.entity[index] !== entityState) {
        this.entity[index] = entityState;
        this.updateQueue.push(entityState.entity_id);
        update = true;
      }
    });
    if (update) {
      this.entity = [...this.entity];
      this.updateData();
    }
  }

  static get properties() {
    return {
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
    };
  }

  setConfig(config) {
    if (config.entity)
      throw new Error(`The "entity" option was removed, please use "entities".\n See ${URL_DOCS}`);
    if (!Array.isArray(config.entities))
      throw new Error(`Please provide the "entities" option as a list.\n See ${URL_DOCS}`);
    if (config.line_color_above || config.line_color_below)
      throw new Error(`"line_color_above/line_color_below" was removed, please use "color_thresholds".\n See ${URL_DOCS}`);

    const conf = {
      animate: false,
      hour24: false,
      font_size: FONT_SIZE,
      height: 100,
      hours_to_show: 24,
      points_per_hour: 1,
      line_color: [...DEFAULT_COLORS],
      color_thresholds: [],
      line_width: 5,
      more_info: true,
      ...config,
      show: { ...DEFAULT_SHOW, ...config.show },
    };

    conf.entities.forEach((entity, i) => {
      if (typeof entity === 'string')
        conf.entities[i] = { entity };
    });
    if (typeof config.line_color === 'string')
      conf.line_color = [config.line_color, ...DEFAULT_COLORS];

    conf.font_size = (config.font_size / 100) * FONT_SIZE || FONT_SIZE;
    conf.hours_to_show = Math.floor(Number(conf.hours_to_show)) || 24;
    conf.color_thresholds.sort((a, b) => b.value - a.value);
    if (!this.Graph) {
      this.Graph = [];
      conf.entities.forEach((entity, index) => {
        this.Graph[index] = new Graph(
          500,
          conf.height,
          [conf.show.fill ? 0 : conf.line_width, conf.line_width],
          conf.hours_to_show,
          conf.points_per_hour,
        );
      });
    }

    this.style = 'display: flex; flex-direction: column;';
    this.config = conf;
  }

  shouldUpdate(changedProps) {
    return UPDATE_PROPS.some(prop => changedProps.has(prop));
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
        class='flex'
        ?group=${config.group}
        ?fill=${config.show.graph && config.show.fill}
        ?points=${config.show.points === 'hover'}
        ?labels=${config.show.labels === 'hover'}
        ?gradient=${config.color_thresholds.length > 0}
        ?more-info=${config.more_info}
        style='font-size: ${config.font_size}px;'
        @click=${e => this.handlePopup(e, this.entity[0])}>
        ${this.renderHeader()}
        ${this.renderStates()}
        ${this.renderGraph()}
        ${this.renderInfo()}
      </ha-card>`;
  }

  renderHeader() {
    const { show, align_icon, align_header } = this.config;
    return show.name || (show.icon && align_icon !== 'state') ? html`
      <div class='header flex' loc=${align_header}>
        ${this.renderName()}
        ${align_icon !== 'state' ? this.renderIcon() : ''}
      </div>` : '';
  }

  renderIcon() {
    return this.config.show.icon ? html`
      <div class='icon' loc=${this.config.align_icon}>
        <ha-icon .icon=${this.computeIcon(this.entity[0])}></ha-icon>
      </div>` : '';
  }

  renderName() {
    if (!this.config.show.name) return;
    const name = this.tooltip.entity !== undefined
      ? this.computeName(this.tooltip.entity)
      : this.config.name || this.computeName(0);

    return html`
      <div class='name flex'>
        <span class='ellipsis'>${name}</span>
      </div>`;
  }

  renderStates() {
    const state = this.tooltip.value !== undefined ? this.tooltip.value : this.entity[0].state;
    if (this.config.show.state)
      return html`
        <div class='states flex' loc=${this.config.align_state}>
          <div class='state'>
            <span class='state__value ellipsis'>
              ${this.computeState(state)}
            </span>
            <span class='state__uom ellipsis'>
              ${this.computeUom(this.entity[this.tooltip.entity || 0])}
            </span>
            ${this.renderStateTime()}
          </div>
          <div class='states--secondary'>${this.config.entities.map((entity, i) => this.renderState(entity, i))}</div>
          ${this.config.align_icon === 'state' ? this.renderIcon() : ''}
        </div>`;
  }

  renderState(config, id) {
    if (config.show_state && id !== 0)
      return html`
        <div class='state state--small'>
          <span class='state__value ellipsis'>
            ${this.computeState(this.entity[id].state)}
          </span>
          <span class='state__uom ellipsis'>
            ${this.computeUom(this.entity[id])}
          </span>
        </div>`;
  }

  renderStateTime() {
    if (this.tooltip.value === undefined) return;
    return html`
      <div class='state__time'>
        <span>${this.tooltip.time[0]}</span> - <span>${this.tooltip.time[1]}</span>
      </div>`;
  }

  renderGraph() {
    return this.config.show.graph ? html`
      <div class='graph'>
        <div class='graph__container'>
          ${this.renderLabels()}
          <div class='graph__container__svg'>
            ${this.renderSvg()}
          </div>
        </div>
        ${this.renderLegend()}
      </div>` : '';
  }

  renderLegend() {
    if (this.config.entities.length <= 1 || !this.config.show.legend) return;
    return html`
      <div class='graph__legend'>
      ${this.entity.map((entity, i) => html`
        <div class='graph__legend__item' @click=${e => this.handlePopup(e, entity)}>
          <svg width='10' height='10'>
            <rect width='10' height='10' fill=${this.computeColor(entity.state, i)} />
          </svg>
          <span class='ellipsis'>${this.computeName(i)}</span>
        </div>
      `)}
      </div>`;
  }

  renderSvgFill(fill, i) {
    if (!fill) return;
    const color = this.computeColor(this.entity[i].state, i);
    return svg`
      <path
        class='line--fill'
        .id=${i} anim=${this.config.animate} ?init=${this.length[i]}
        style="animation-delay: ${this.config.animate ? `${i * 0.5}s` : '0s'}"
        fill=${color}
        stroke=${color}
        stroke-width=${this.config.line_width}
        d=${this.fill[i]}
      />`;
  }

  renderSvgLine(line, i) {
    if (!line) return;
    return svg`
      <path
        class='line'
        .id=${i} anim=${this.config.animate} ?init=${this.length[i]}
        style="animation-delay: ${this.config.animate ? `${i * 0.5}s` : '0s'}"
        fill='none'
        stroke-dasharray=${this.length[i] || 'none'} stroke-dashoffset=${this.length[i] || 'none'}
        stroke=${this.gradient[i] ? `url(#grad-${i})` : this.computeColor(this.entity[i].state, i)}
        stroke-width=${this.config.line_width}
        d=${this.line[i]}
      />`;
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
        ${points.map((point, num) => svg`
          <circle
            class='line--point' .id=${point[3]} .value=${point[2]} .entity=${i}
            stroke=${this.gradient[i] ? this.gradient[i][num].color : 'inherit'}
            fill=${this.gradient[i] ? this.gradient[i][num].color : 'inherit'}
            cx=${point[0]} cy=${point[1]} r=${this.config.line_width}
            @mouseover=${e => this.openTooltip(e)}
            @mouseout=${() => this.tooltip = {}}
          />`)}
      </g>`;
  }

  renderSvgGradient(gradients) {
    if (!gradients) return;
    const items = gradients.map((gradient, i) => {
      if (!gradient) return;
      return svg`
        <linearGradient id=${`grad-${i}`}>
          ${gradient.map(stop => svg`
            <stop stop-color=${stop.color}
              offset=${`${stop.offset}%`}
            />
          `)}
        </linearGradient>`;
    });
    return svg`<defs>${items}</defs>`;
  }

  renderSvg() {
    return svg`
      <svg width='100%' height='100%' viewBox='0 0 500 ${this.config.height}'
        @click=${e => e.stopPropagation()}>
        <g>
          ${this.renderSvgGradient(this.gradient)}
          ${this.fill.map((fill, i) => this.renderSvgFill(fill, i))}
          ${this.line.map((line, i) => this.renderSvgLine(line, i))}
        </g>
        ${this.points.map((points, i) => this.renderSvgPoints(points, i))}
      </svg>`;
  }

  openTooltip(e) {
    const { points_per_hour, hours_to_show } = this.config;
    const offset = 60 / points_per_hour * 0.5;
    const id = Math.abs((Number(e.target.id) + 1) - hours_to_show * points_per_hour);
    const now = new Date();
    now.setMinutes(now.getMinutes() - (offset * 2 * id) - offset);
    const start = getTime(now, this.config.hour24);
    now.setMinutes(now.getMinutes() + offset * 2);
    const end = getTime(now, this.config.hour24);

    this.tooltip = {
      value: Number(e.target.value),
      id,
      entity: e.target.entity,
      time: [start, end],
    };
  }

  renderLabels() {
    if (!this.config.show.labels) return;
    return html`
      <div class='graph__labels flex'>
        <span class='label--max'>${this.computeState(this.bound[1])}</span>
        <span class='label--min'>${this.computeState(this.bound[0])}</span>
      </div>`;
  }

  renderInfo() {
    if (!this.config.show.extrema) return;
    return html`
      <div class='info flex'>
        ${this.abs.map(entry => html`
          <div class='info__item'>
            <span class='info__item__type'>${entry.type}</span>
            <span class='info__item__value'>
              ${this.computeState(entry.state)}
              ${this.computeUom(entry)}
            </span>
            <span class='info__item__time'>
              ${getTime(new Date(entry.last_changed), this.config.hour24)}
            </span>
          </div>`)}
      </div>`;
  }

  handlePopup(e, entity) {
    e.stopPropagation();
    if (this.config.more_info)
      this.fire('hass-more-info', { entityId: entity.entity_id });
  }

  fire(type, inDetail, inOptions) {
    const options = inOptions || {};
    const detail = (inDetail === null || inDetail === undefined) ? {} : inDetail;
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
      color: line_color[i],
      ...color_thresholds.find(ele => ele.value < state),
    };
    return threshold.color || line_color[0];
  }

  computeName(index) {
    return this.config.entities[index].name
      || this.entity[index].attributes.friendly_name;
  }

  computeIcon(entity) {
    return this.config.icon
      || entity.attributes.icon
      || ICON[entity.attributes.device_class]
      || ICON.temperature;
  }

  computeUom(entity) {
    return this.config.unit || entity.attributes.unit_of_measurement || '';
  }

  computeState(inState) {
    const state = Number(inState);
    const dec = this.config.decimals;
    if (dec === undefined || Number.isNaN(dec) || Number.isNaN(state))
      return Math.round(state * 100) / 100;

    const x = 10 ** dec;
    return (Math.round(state * x) / x).toFixed(dec);
  }

  async updateData({ config } = this) {
    const end = new Date();
    const start = new Date();
    start.setHours(end.getHours() - config.hours_to_show);

    const promise = this.entity.map((entity, i) => this.updateEntity(entity, i, start, end));
    await Promise.all(promise);
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
      this.entity.forEach((entity, index) => {
        if (!entity || this.Graph[index].coords.length === 0) return;
        [this.Graph[index].min, this.Graph[index].max] = [this.bound[0], this.bound[1]];
        this.line[index] = this.Graph[index].getPath();
        if (config.show.fill)
          this.fill[index] = this.Graph[index].getFill(this.line[index]);
        if (config.show.points)
          this.points[index] = this.Graph[index].getPoints();

        if (config.color_thresholds.length > 0)
          this.gradient[index] = this.Graph[index].computeGradient(
            config.color_thresholds,
            config.line_color[index] || config.line_color[0],
          );
      });
      this.line = [...this.line];
    }
  }

  async updateEntity(entity, index, start, end) {
    if (!entity || !this.updateQueue.includes(entity.entity_id)) return;
    let stateHistory = await this.fetchRecent(entity.entity_id, start, end);
    if (!stateHistory[0]) return;
    stateHistory = stateHistory[0].filter(item => !Number.isNaN(Number(item.state)));
    if (stateHistory.length < 1) return;

    if (entity.entity_id === this.entity[0].entity_id) {
      this.abs = [{
        type: 'min',
        ...getMin(stateHistory, 'state'),
      }, {
        type: 'max',
        ...getMax(stateHistory, 'state'),
      }];
    }

    this.Graph[index].update(stateHistory);
  }

  async fetchRecent(entityId, start, end) {
    let url = 'history/period';
    if (start) url += `/${start.toISOString()}`;
    url += `?filter_entity_id=${entityId}`;
    if (end) url += `&end_time=${end.toISOString()}`;
    return this._hass.callApi('GET', url);
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('mini-graph-card', MiniGraphCard);
