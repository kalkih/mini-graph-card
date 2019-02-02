import { LitElement, html, svg } from '@polymer/lit-element';
import Graph from './mini-graph-lib';
import { style } from './style'

const FONT_SIZE = 14;
const ICON = {
  humidity: 'hass:water-percent',
  illuminance: 'hass:brightness-5',
  temperature: 'hass:thermometer',
  battery: 'hass:battery'
};
const DEFAULT_COLORS = ['var(--accent-color)', '#3498db', '#e74c3c', '#9b59b6', '#f1c40f', '#2ecc71'];
const UPDATE_PROPS = ['entity', 'line', 'length', 'fill', 'points', 'tooltip', 'abs'];
const DEFAULT_SHOW = {
  name: true,
  icon: true,
  state: true,
  graph: true,
  labels: false,
  extrema: false,
  legend: true,
  fill: true,
  points: 'hover',
};

const getMin = (arr, val) => {
  return arr.reduce((min, p) => p[val] < min[val] ? p : min, arr[0]);
}
const getMax = (arr, val) => {
  return arr.reduce((max, p) => p[val] > max[val] ? p : max, arr[0]);
}
const getTime = (date, hour24) => date.toLocaleString('se-SV', { hour: 'numeric', minute: 'numeric', hour12: !hour24 });

class MiniGraphCard extends LitElement {
  constructor() {
    super();
    this.bound = [0,0];
    this.abs = [];
    this.length = [];
    this.entity = [];
    this.line = [];
    this.fill = [];
    this.points = [];
    this.tooltip = {};
  }

  set hass(hass) {
    this._hass = hass;
    let update = false;
    this.config.entities.forEach((entity, index) => {
      const entityState = hass.states[entity.entity];
      if (entityState && this.entity[index] !== entityState) {
        this.entity[index] = entityState;
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
    };
  }

  setConfig(config) {
    this.style = 'display: flex; flex-direction: column;';
    const conf = {
      animate: false,
      clock24: false,
      font_size: FONT_SIZE,
      height: 100,
      hours_to_show: 24,
      points_per_hour: 1,
      line_color: [...DEFAULT_COLORS],
      line_color_above: [],
      line_color_below: [],
      line_width: 5,
      more_info: true,
      entities: config.entity,
      ...config,
      show: {...DEFAULT_SHOW, ...config.show},
    };

    if (typeof conf.entities === 'string')
      conf.entities = [{entity: conf.entities}];
    conf.entities.forEach((entity, i) => {
      if (typeof entity === 'string')
        conf.entities[i] = { entity: entity };
    });
    if (typeof config.line_color === 'string')
      conf.line_color = [config.line_color, ...DEFAULT_COLORS];

    conf.font_size = (config.font_size / 100) * FONT_SIZE || FONT_SIZE;
    conf.hours_to_show = Math.floor(Number(conf.hours_to_show)) || 24;
    conf.line_color_above.reverse();
    conf.line_color_below.reverse();
    if (!this.Graph) {
      this.Graph = [];
      conf.entities.forEach((entity, index) => {
        this.Graph[index] = new Graph(
          500,
          conf.height,
          [conf.show.fill ? 0 : conf.line_width, conf.line_width],
          conf.hours_to_show,
          conf.points_per_hour
        );
      });
    }

    this.config = conf;
  }

  async updateData({config} = this) {
    const endTime = new Date();
    const startTime = new Date();
    startTime.setHours(endTime.getHours() - config.hours_to_show);

    const promise = this.entity.map((entity, index) =>
      this.updateEntity(entity, index, startTime, endTime));
    await Promise.all(promise);

    this.bound = [
      Math.min(...this.Graph.map(ele => ele.min)) || this.bound[0],
      Math.max(...this.Graph.map(ele => ele.max)) || this.bound[1],
    ];

    if (config.show.graph) {
      this.entity.map((entity, index) => {
        if (!entity) return;
        this.Graph[index].min = this.bound[0];
        this.Graph[index].max = this.bound[1];
        this.line[index] = this.Graph[index].getPath();
        if (config.show.fill)
          this.fill[index] = this.Graph[index].getFill(this.line[index]);
        if (config.show.points)
          this.points[index] = this.Graph[index].getPoints();
      });
      this.line = [...this.line];
    }
  }

  async updateEntity(entity, index, start, end) {
    if (!entity) return;
    const stateHistory = await this.fetchRecent(entity.entity_id, start, end);
    if (stateHistory[0].length < 1) return;

    if (entity.entity_id === this.entity[0].entity_id) {
      this.abs = [{
        type: 'min',
        ...getMin(stateHistory[0], 'state'),
      }, {
        type: 'max',
        ...getMax(stateHistory[0], 'state'),
      }];
    }

    this.Graph[index].update(stateHistory[0]);
  }

  shouldUpdate(changedProps) {
    return UPDATE_PROPS.some(prop => changedProps.has(prop));
  }

  updated(changedProperties) {
    if (this.config.animate && changedProperties.has('line')) {
      if (this.length.length < this.entity.length) {
        this.shadowRoot.querySelectorAll('svg path.line').forEach(ele => {
          this.length[ele.id] = ele.getTotalLength();
        });
        this.length = [...this.length];
      }
    }
  }

  render({config, entity} = this) {
    return html`
      ${style()}
      <ha-card
        class='flex'
        ?group=${config.group}
        ?fill=${this.config.show.fill}
        ?points=${this.config.show.points === 'hover'}
        ?more-info=${config.more_info}
        style='font-size: ${config.font_size}px;'
        @click=${e => this.handlePopup(e, this.entity[0])}>
        ${this.renderHeader()}
        ${this.renderState()}
        ${this.renderGraph()}
        ${this.renderInfo()}
      </ha-card>`;
  }

  renderHeader() {
    const {show, align_icon, align_header} = this.config;
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
    return this.config.show.name ? html`
      <div class='name flex'>
        <span class='ellipsis'>${this.config.name || this.computeName(0)}</span>
      </div>` : '';
  }

  renderState() {
    if (!this.config.show.state) return;
    return html`
      <div class='state flex' loc=${this.config.align_state}>
        <div class='flex'>
          <span class='state__value ellipsis'>
            ${this.computeState(this.tooltip.value || this.entity[0].state)}
          </span>
          <span class='state__uom ellipsis'>
            ${this.computeUom(this.entity[this.tooltip.entity || 0])}
          </span>
          ${this.renderStateTime()}
        </div>
        ${this.config.align_icon === 'state' ? this.renderIcon() : ''}
      </div>`;
  }

  renderStateTime() {
    if (!this.tooltip.value) return;
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
            <rect width='10' height='10' fill=${this.computeColor(entity, i)} />
          </svg>
          <span>${this.computeName(i)}</span>
        </div>
      `)}
      </div>`;
  }

  renderSvgFill(fill, i) {
    if (!fill) return;
    return svg`
      <path
        class='line--fill'
        .id=${i} anim=${this.config.animate} ?init=${this.length[i]}
        style="animation-delay: ${this.config.animate ? i * 0.5 + 's' : '0s'}"
        fill=${this.computeColor(this.entity[i], i)}
        stroke=${this.computeColor(this.entity[i], i)}
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
        style="animation-delay: ${this.config.animate ? i * 0.5 + 's' : '0s'}"
        fill='none'
        stroke-dasharray=${this.length[i]} stroke-dashoffset=${this.length[i]}
        stroke=${this.computeColor(this.entity[i], i)}
        stroke-width=${this.config.line_width}
        d=${this.line[i]}
      />`;
  }

  renderSvgPoints(points, i) {
    if (!points) return;
    return svg`
      <g class='line--points'
        anim=${this.config.animate && this.config.show.points !== 'hover'}
        style="animation-delay: ${this.config.animate ? i * 0.5 + 0.5 + 's' : '0s'}"
        ?init=${this.length[i]} fill=${this.computeColor(this.config.entities[i], i)}>
        ${points.map((point, index) => svg`
          <circle
            class='line--point' .id=${index} .value=${point[2]} .entity=${i}
            @mouseover=${e => this.openTooltip(e)}
            @mouseout=${e => this.tooltip = {}}
            cx=${point[0]} cy=${point[1]} r=${this.config.line_width}
            stroke=${this.computeColor(this.config.entities[i], i)}
            stroke-width=${this.config.line_width / 2 }
          />`
        )}
      </g>`;
  }

  renderSvg() {
    return svg`
      <svg width='100%' height='100%' viewBox='0 0 500 ${this.config.height}'
        @click=${e => e.stopPropagation()}>
        <g>
          ${this.fill.map((fill, i) => this.renderSvgFill(fill, i))}
          ${this.line.map((line, i) => this.renderSvgLine(line, i))}
        </g>
        ${this.points.map((points, i) => this.renderSvgPoints(points, i))}
      </svg>`;
  }

  openTooltip(e) {
    const {points_per_hour, hours_to_show} = this.config;
    const offset = 60 / points_per_hour * 0.5;
    const id = Math.abs((Number(e.target.id) + 1) - hours_to_show * points_per_hour);
    const now = new Date();
    now.setHours(now.getHours() - id);
    now.setMinutes(now.getMinutes() - offset);
    const start = getTime(now, this.config.clock24);
    now.setMinutes(now.getMinutes() + offset * 2);
    const end = getTime(now, this.config.clock24);

    this.tooltip = {
      value: Number(e.target.value),
      id: id,
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
            <div>
              <span class='info__item__value'>
                ${this.computeState(entry.state)}
                ${this.computeUom(entry)}
              </span>
            </div>
            <span class='info__item__time'>
              ${getTime(new Date(entry.last_changed), this.config.clock24)}
            </span>
          </div>`
        )}
      </div>`;
  }

  handlePopup(e, entity) {
    e.stopPropagation();
    if (this.config.more_info)
      this.fire('hass-more-info', { entityId: entity.entity_id });
  }

  fire(type, detail, options) {
    options = options || {};
    detail = (detail === null || detail === undefined) ? {} : detail;
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed
    });
    e.detail = detail;
    this.dispatchEvent(e);
    return e;
  }

  computeColor(entity, i) {
    const state = Number(entity.state) || 0;
    for (const item of this.config.line_color_above)
      if (state > item.value) return item.color;
    for (const item of this.config.line_color_below)
      if (state < item.value) return item.color;
    return this.config.line_color[i] || this.config.line_color[0];
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

  computeState(state) {
    const dec = this.config.decimals;
    if (dec === null || isNaN(dec) || Number.isNaN(state))
      return Math.round(state * 100) / 100

    const x = Math.pow(10, dec);
    return (Math.round(state * x) / x).toFixed(dec);
  }

  async fetchRecent(entityId, start, end) {
    let url = 'history/period';
    if (start) url += `/${start.toISOString()}`;
    url += `?filter_entity_id=${entityId}`;
    if (end) url += `&end_time=${end.toISOString()}`;
    return await this._hass.callApi('GET', url);
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('mini-graph-card', MiniGraphCard);
