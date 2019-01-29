import { LitElement, html, svg } from 'https://unpkg.com/@polymer/lit-element@^0.6.3/lit-element.js?module';
import Graph from './mini-graph-lib.js';

const FONT_SIZE = 14;
const ICON = {
  humidity: 'hass:water-percent',
  illuminance: 'hass:brightness-5',
  temperature: 'hass:thermometer',
  battery: 'hass:battery'
};
const DEFAULT_COLORS = ['var(--accent-color)', '#3498db', '#e74c3c', '#9b59b6', '#f1c40f', '#2ecc71'];

const UPDATE_PROPS = ['entity', '_line', 'length', 'shadow'];

const DEFAULT_SHOW = {
  name: true,
  icon: true,
  state: true,
  graph: true,
  labels: false,
  extrema: false,
  legend: true,
  fill: true,
};

const getMin = (arr, val) => {
  return arr.reduce((min, p) => p[val] < min[val] ? p : min, arr[0]);
}
const getMax = (arr, val) => {
  return arr.reduce((max, p) => p[val] > max[val] ? p : max, arr[0]);
}

const getTime = (date) => date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

class MiniGraphCard extends LitElement {
  constructor() {
    super();
    this.bound = [0,0];
    this.abs = [];
    this.length = [];
    this.entity = [];
    this.fill = [];
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
      this.updateGraph();
    }
  }

  set line(line) {
    if (this._line !== line)
      this._line = line;
  }

  get line() {
    return this._line;
  }

  static get properties() {
    return {
      _hass: {},
      config: {},
      entity: [],
      Graph: [],
      _line: [],
      shadow: [],
      length: Number,
      bound: [],
      abs: [],
    };
  }

  setConfig(config) {
    this.style = 'display: flex; flex-direction: column;';
    const conf = {
      detail: 1,
      font_size: FONT_SIZE,
      height: 100,
      hide: [],
      hours_to_show: 24,
      line_color: [...DEFAULT_COLORS],
      line_color_above: [],
      line_color_below: [],
      line_width: 5,
      more_info: true,
      show: {...DEFAULT_SHOW},
      entities: config.entity,
      ...config,
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
    conf.detail = (conf.detail === 1 || conf.detail === 2) ? conf.detail : 1;
    conf.line_color_above.reverse();
    conf.line_color_below.reverse();

    this.line = conf.entities.map(x => ' ');
    const margin = conf.show.shadow ? 0 : conf.line_width;
    if (!this.Graph) {
      this.Graph = [];
      conf.entities.forEach((entity, index) => {
        this.Graph[index] = new Graph(500, conf.height, margin);
      });
    }

    this.config = conf;
  }

  async updateGraph({config} = this) {
    const endTime = new Date();
    const startTime = new Date();
    startTime.setHours(endTime.getHours() - config.hours_to_show);

    const updates = this.entity.map((entity, index) =>
      this.updateLine(entity, index, startTime, endTime));
    await Promise.all(updates);

    this.bound[0] = Math.min(...this.Graph.map(ele => ele.min)) || this.bound[0];
    this.bound[1] = Math.max(...this.Graph.map(ele => ele.max)) || this.bound[1];

    this.entity.map((entity, index) => {
      this.Graph[index].min = this.bound[0];
      this.Graph[index].max = this.bound[1];
      this.line[index] = this.Graph[index].getPath(
        config.hours_to_show,
        config.detail
      );
      if (config.show.fill) {
        this.fill[index] = this.Graph[index].getShadow(this.line[index]);
      }
    });
    this.line = [...this.line];
  }

  async updateLine(entity, index, startTime, endTime) {
    const stateHistory = await this.fetchRecent(entity.entity_id, startTime, endTime);
    if (stateHistory[0].length < 1) return;

    if (entity === this.entity[0]) {
      this.abs[0] = {
        type: 'min',
        ...getMin(stateHistory[0], 'state')
      };
      this.abs[1] = {
        type: 'max',
        ...getMax(stateHistory[0], 'state')
      };
    }

    this.Graph[index].update(
      stateHistory[0],
      this.config.hours_to_show,
      this.config.detail
    );
  }

  shouldUpdate(changedProps) {
    return UPDATE_PROPS.some(prop => changedProps.has(prop));
  }

  updated(changedProperties) {
    if (this.config.animate && changedProperties.has('_line')) {
      if (this.length.length < this.entity.length) {
        this.shadowRoot.querySelectorAll('svg path').forEach(ele => {
          if (ele.set) this.length[ele.id] = ele.getTotalLength();
        });
        this.length = [...this.length];
      }
    }
  }

  render({config, entity} = this) {
    return html`
      ${this._style()}
      <ha-card
        class='flex'
        ?group=${config.group}
        ?fill=${this.config.show.fill}
        ?more-info=${config.more_info}
        style='font-size: ${config.font_size}px;'
        @click='${(e) => this.handleMore()}'>
        ${this.renderHeader()}
        ${this.renderState()}
        ${this.renderGraph()}
        ${this.renderInfo()}
      </ha-card>`;
  }

  renderHeader() {
    const {show, icon_location, header_location} = this.config;
    return show.name || (show.icon && icon_location !== 'state') ? html`
      <div class='header flex' loc=${header_location}>
        ${this.renderName()}
        ${icon_location !== 'state' ? this.renderIcon() : ''}
      </div>` : '';
  }

  renderIcon() {
    return this.config.show.icon ? html`
      <div class='icon' loc=${this.config.icon_location}>
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
    return this.config.show.state ? html`
      <div class='state flex' loc=${this.config.state_location}>
        <div class='flex'>
          <span class='state__value ellipsis'>${this.computeState(this.entity[0].state)}</span>
          <span class='state__uom ellipsis'>${this.computeUom(this.entity[0])}</span>
        </div>
        ${this.config.icon_location === 'state' ? this.renderIcon() : ''}
      </div> `: '';
  }

  renderGraph() {
    return this.config.show.graph ? html`
      <div class='graph'>
        <div class='graph__container'>
          ${this.config.labels ? this.renderLabels() : ''}
          <div class='graph__container__svg'>
            ${this.line ? this.renderLine() : ''}
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
        <div>
          <svg width='10' height='10'>
            <rect width='10' height='10' fill=${this.computeColor(entity, i)} />
          </svg>
          <span>${this.computeName(i)}</span>
        </div>
      `)}
      </div>`;
  }

  renderLine() {
    return svg`
      <svg width='100%' height=${'100%'} viewBox='0 0 500 ${this.config.height}'>
        ${this.fill.map((fill, i) => svg`
          <path
            class='line--fill'
            .id=${i}
            .set=${fill !== ' '}
            ?anim=${this.config.animate}
            ?init=${this.length[i]}
            style="animation-delay: ${i * 0.5 + 's'}"
            fill=${this.computeColor(this.entity[i], i)}
            stroke=${this.computeColor(this.entity[i], i)}
            stroke-width=${this.config.line_width}
            d=${this.fill[i]}
          />`
        )}
        ${this.line.map((line, i) => svg`
          <path
            .id=${i}
            .set=${line !== ' '}
            ?anim=${this.config.animate}
            ?init=${this.length[i]}
            stroke-dasharray=${this.length[i]}
            stroke-dashoffset=${this.length[i]}
            style="animation-delay: ${i * 0.5 + 's'}"
            d=${this.line[i]}
            fill='none'
            stroke=${this.computeColor(this.entity[i], i)}
            stroke-width=${this.config.line_width}
          />`
        )}
      </svg>`;
  }

  renderLabels() {
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
            <span class='info__item__time'>${getTime(new Date(entry.last_changed))}</span>
          </div>`
        )}
      </div>`;
  }

  handleMore({config} = this) {
    if(config.more_info)
      this.fire('hass-more-info', { entityId: config.entities[0].entity });
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
      return state;

    const x = Math.pow(10, dec);
    return (Math.round(state * x) / x).toFixed(dec);
  }

  async fetchRecent(entityId, startTime, endTime) {
    let url = 'history/period';
    if (startTime) url += `/${startTime.toISOString()}`;
    url += `?filter_entity_id=${entityId}`;
    if (endTime) url += `&end_time=${endTime.toISOString()}`;
    return await this._hass.callApi('GET', url);
  }

  _style() {
    return html`
      <style>
        :host {
          display: flex;
          flex: 1;
          flex-direction: column;
        }
        ha-card {
          flex-direction: column;
          flex: 1;
          padding: 16px 0;
          position: relative;
        }
        ha-card[fill] {
          padding-bottom: 0;
        }
        ha-card[fill] .graph {
          padding: 0 0 0 0;
          order: 10;
        }
        ha-card[fill] path {
          stroke-linecap: initial;
          stroke-linejoin: initial;
        }
        ha-card[fill] .graph__legend {
          order: -1;
          padding: 0 16px 8px 16px;
        }
        ha-card[fill] .info {
          padding-bottom: 16px;
        }
        ha-card[group] {
          box-shadow: none;
          padding: 0;
        }
        ha-card[group] > div {
          padding: 0;
        }
        ha-card[group] .graph__legend {
          padding-left: 0;
          padding-right: 0;
        }
        ha-card[more-info] {
          cursor: pointer;
        }
        ha-card > div {
          padding: 0px 16px 16px 16px;
        }
        ha-card > div:last-child {
          padding-bottom: 0;
        }
        .flex {
          display: flex;
          display: -webkit-flex;
          min-width: 0;
        }
        .header {
          justify-content: space-between;
        }
        .header[loc="center"] {
          align-self: center;
        }
        .header[loc="left"] {
          align-self: flex-start;
        }
        .header[loc="right"] {
          align-self: flex-end;
        }
        .name {
          align-items: center;
          min-width: 0;
          opacity: .8;
        }
        .name > span {
          font-size: 1.2rem;
          font-weight: 400;
          max-height: 1.4rem;
          opacity: .75;
        }
        .icon {
          color: var(--paper-item-icon-color, #44739e);
          display: inline-block;
          flex: 0 0 24px;
          text-align: center;
          width: 24px;
          margin-left: auto;
        }
        .icon[loc="left"] {
          order: -1;
          margin-right: 8px;
          margin-left: 0;
        }
        .icon[loc="state"] {
          align-self: center;
        }
        .state {
          flex-wrap: wrap;
          font-weight: 300;
        }
        .state[loc="center"] {
          align-self: center;
        }
        .state[loc="right"] {
          align-self: flex-end;
        }
        .state__value {
          display: inline-block;
          font-size: 2.4em;
          line-height: 1em;
          max-size: 100%;
          margin-right: .25rem;
        }
        .state__uom {
          align-self: flex-end;
          display: inline-block;
          font-size: 1.4em;
          font-weight: 400;
          line-height: 1.2em;
          margin-top: .1em;
          opacity: .6;
          vertical-align: bottom;
        }
        .graph {
          align-self: flex-end;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          margin-top: auto;
          width: 100%;
        }
        .graph__container {
          display: flex;
          flex-direction: row;
        }
        .graph__container__svg {
          flex: 1;
          overflow: hidden;
        }
        path {
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        path[anim] {
          opacity: 0;
        }
        path[anim][init] {
          animation: dash 1s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
        }
        .line--fill[anim][init] {
          animation: reveal .5s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
        }
        .labels {
          flex-direction: column;
          font-size: .8em;
          font-weight: 400;
          justify-content: space-between;
          margin-right: 10px;
          opacity: .75;
        }
        .labels > span {
          align-self: flex-end;
          position: relative;
          width: 100%;
        }
        .labels > span:after {
          position: absolute;
          right: -6px;
          content: ' -';
          opacity: .75;
        }
        .graph__legend {
          display: flex;
          flex-direction: row;
          justify-content: space-evenly;
          padding-top: 16px;
        }
        .graph__legend span {
          opacity: .75;
        }
        .info {
          justify-content: space-between;
          align-items: middle;
        }
        .info__item {
          display: flex;
          flex-flow: column;
          align-items: flex-end
        }
        .info__item:first-child {
          align-items: flex-start;
        }
        .info__item__type {
          text-transform: capitalize;
          font-weight: 500;
          opacity: .9;
        }
        .info__item__time,
        .info__item__value {
          opacity: .75;
        }
        .ellipsis {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @keyframes reveal {
          0% { opacity: 0; }
          100% { opacity: .15; }
        }
        @keyframes dash {
          0% {
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            stroke-dashoffset: 0;
          }
        }
      </style>`;
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('mini-graph-card', MiniGraphCard);
