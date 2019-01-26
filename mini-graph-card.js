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

const UPDATE_PROPS = ['entity', '_line', 'length'];

class MiniGraphCard extends LitElement {
  constructor() {
    super();
    this.length = [];
    this.entity = [];
    this.max = 0;
    this.min = 0;
  }

  set hass(hass) {
    this._hass = hass;
    let update = false;
    this.config.entity.forEach((name, index) => {
      const entity = hass.states[name];
      if (entity && this.entity[index] !== entity) {
        this.entity[index] = entity;
        update = true;
      }
    });
    if (update && !this.config.hide.includes('graph')) {
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
      length: Number,
      min: Number,
      max: Number
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
      ...config
    };

    if (typeof config.entity === 'string')
      conf.entity = [config.entity];
    if (typeof config.line_color === 'string')
      conf.line_color = [config.line_color, ...DEFAULT_COLORS];

    conf.font_size = (config.font_size / 100) * FONT_SIZE || FONT_SIZE;
    conf.hours_to_show = Math.floor(Number(conf.hours_to_show)) || 24;
    conf.detail = (conf.detail === 1 || conf.detail === 2) ? conf.detail : 1;
    conf.line_color_above.reverse();
    conf.line_color_below.reverse();

    this.line = conf.entity.map(x => ' ');
    if (!this.Graph) {
      this.Graph = [];
      conf.entity.forEach((entity, index) => {
        this.Graph[index] = new Graph(500, conf.height, conf.line_width);
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

    this.max = Math.max.apply(Math, this.Graph.map(ele => ele.max )) || this.max;
    this.min = Math.min.apply(Math, this.Graph.map(ele => ele.min )) || this.min;

    this.entity.map((entity, index) => {
      this.Graph[index].max = this.max;
      this.Graph[index].min = this.min;
      this.line[index] = this.Graph[index].getPath(
        config.hours_to_show,
        config.detail
      );
    });
    this.line = [...this.line];
  }

  async updateLine(entity, index, startTime, endTime) {
    const stateHistory = await this.fetchRecent(entity.entity_id, startTime, endTime);
    if (stateHistory[0].length < 1) return;

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
        ?more-info=${config.more_info}
        style='font-size: ${config.font_size}px;'
        @click='${(e) => this.handleMore()}'>
        ${this.renderHeader()}
        ${this.renderState()}
        ${this.renderGraph()}
      </ha-card>`;
  }

  renderHeader() {
    const items = ['icon', 'name'];
    return !(items.every(el => this.config.hide.includes(el))) ? html`
      <div class='header flex'>
        ${this.renderIcon()}
        ${this.renderName()}
      </div>` : '';
  }

  renderIcon() {
    return !(this.config.hide.includes('icon')) ? html`
      <div class='icon'>
        <ha-icon .icon=${this.computeIcon(this.entity[0])}></ha-icon>
      </div>` : '';
  }

  renderName() {
    return !(this.config.hide.includes('name')) ? html`
      <div class='name flex'>
        <span class='ellipsis'>${this.config.name || this.computeName(this.entity[0])}</span>
      </div>` : '';
  }

  renderState() {
    return !(this.config.hide.includes('state')) ? html`
      <div class='info flex'>
        <span class='state ellipsis'>${this.computeState(this.entity[0])}</span>
        <span class='uom ellipsis'>${this.computeUom(this.entity[0])}</span>
      </div> `: '';
  }

  renderGraph() {
    return !(this.config.hide.includes('graph')) ? html`
      <div class='graph'>
        <div class='upper'>
          ${this.config.labels ? this.renderLabels() : ''}
          <div class='line'>
            ${this.line ? this.renderLine() : ''}
          </div>
        </div>
        ${this.config.entity.length > 1 ? this.renderLegend() : ''}
      </div>` : '';
  }

  renderLegend() {
    return !(this.config.hide.includes('legend')) ? html`
      <div class='legend'>
      ${this.entity.map((entity, i) => html`
        <div>
          <svg width='10' height='10'>
            <rect width='10' height='10' fill=${this.computeColor(entity, i)} />
          </svg>
          <span>${this.computeName(entity)}</span>
        </div>
      `)}
      </div>
    ` : '';
  }

  renderLine() {
    return svg`
      <svg width='100%' height=${'100%'} viewBox='0 0 500 ${this.config.height}'>
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
            stroke-linecap='round'
            stroke-linejoin='round'
          />`
        )}
      </svg>`;
  }

  renderLabels() {
    const dec = this.config.decimals;
    return html`
      <div class='label flex'>
        <span class='label--max'>${this.max.toFixed(dec)}</span>
        <span class='label--min'>${this.min.toFixed(dec)}</span>
      </div>`;
  }

  handleMore({config} = this) {
    if(config.more_info)
      this.fire('hass-more-info', { entityId: config.entity[0] });
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

  computeName(entity) {
    return entity.attributes.friendly_name;
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

  computeState(entity) {
    const dec = this.config.decimals;
    if (dec === null || isNaN(dec) || Number.isNaN(entity.state))
      return entity.state;

    const x = Math.pow(10, dec);
    return (Math.round(entity.state * x) / x).toFixed(dec);
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
          padding: 16px;
          position: relative;
        }
        ha-card[group] {
          box-shadow: none;
          padding: 0;
        }
        ha-card[more-info] {
          cursor: pointer;
        }
        ha-card > div {
          padding: 20px 0 0 8px;
        }
        ha-card > div:first-child {
          padding-top: 0;
        }
        .flex {
          display: flex;
          display: -webkit-flex;
          min-width: 0;
        }
        .name {
          align-items: center;
          min-width: 0;
          opacity: .8;
        }
        .name > span {
          font-size: 1.2rem;
          font-weight: 500;
          max-height: 1.4rem;
          opacity: .75;
        }
        .icon {
          color: var(--paper-item-icon-color, #44739e);
          display: inline-block;
          flex: 0 0 24px;
          margin-right: 8px;
          text-align: center;
          width: 24px;
        }
        .info {
          flex-wrap: wrap;
          font-weight: 300;
        }
        .state {
          display: inline-block;
          font-size: 2.4em;
          line-height: 1em;
          margin-right: 4px;
          max-size: 100%;
        }
        .uom {
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
          padding-right: 8px;
          width: 100%;
        }
        .graph .upper {
          display: flex;
          flex-direction: row;
        }
        .graph .line {
          flex: 1;
        }
        svg {
          overflow: hidden;
        }
        path[anim] {
          opacity: 0;
        }
        path[anim][init] {
          animation: dash 1s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
        }
        .label {
          flex-direction: column;
          font-size: .8em;
          font-weight: 400;
          justify-content: space-between;
          margin-right: 10px;
          opacity: .75;
        }
        .label > span {
          align-self: flex-end;
          position: relative;
          width: 100%;
        }
        .label > span:after {
          position: absolute;
          right: -6px;
          content: ' -';
          opacity: .75;
        }
        .legend {
          display: flex;
          flex-direction: row;
          justify-content: space-evenly;
        }
        .ellipsis {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @keyframes dash {
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
