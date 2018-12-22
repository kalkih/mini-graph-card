import { LitElement, html, svg } from 'https://unpkg.com/@polymer/lit-element@^0.6.3/lit-element.js?module';
import Graph from './mini-graph-lib.js';

const FONT_SIZE = 14;
const ICON = {
  humidity: 'hass:water-percent',
  illuminance: 'hass:brightness-5',
  temperature: 'hass:thermometer',
  battery: 'hass:battery'
};

const UPDATE_PROPS = ['entity', 'line'];

class MiniGraphCard extends LitElement {
  constructor() {
    super();
  }

  createRenderRoot() {
    return this;
  }

  set hass(hass) {
    this._hass = hass;
    const entity = hass.states[this.config.entity];
    if (entity && this.entity !== entity) {
      this.entity = entity;
      if (!this.hide_graph)
        this.updateGraph();
    }
  }

  static get properties() {
    return {
      _hass: {},
      config: {},
      entity: {},
      Graph: {},
      line: String
    };
  }

  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'sensor')
      throw new Error('Specify an entity from within the sensor domain.');

    this.style = 'display: flex; flex-direction: column;';
    const conf = {
      detail: 1,
      font_size: FONT_SIZE,
      height: 100,
      hide: [],
      hours_to_show: 24,
      line_color: 'var(--accent-color)',
      line_width: 5,
      more_info: true,
      ...config
    };
    conf.font_size = (config.font_size / 100) * FONT_SIZE || FONT_SIZE;
    conf.hours_to_show = Math.floor(Number(conf.hours_to_show)) || 24;
    conf.detail = (conf.detail === 1 || conf.detail === 2) ? conf.detail : 1;

    if (!this.Graph)
      this.Graph = new Graph(500, conf.height, conf.line_width);

    this.config = conf;
  }

  async updateGraph({config} = this) {
    const endTime = new Date();
    const startTime = new Date();
    startTime.setHours(endTime.getHours() - config.hours_to_show);
    const stateHistory = await this.fetchRecent(config.entity, startTime, endTime);

    if (stateHistory[0].length < 1) return;

    const coords = this.Graph.coordinates(
      stateHistory[0],
      config.hours_to_show,
      config.detail
    );
    this.line = this.Graph.getPath(coords);
  }

  shouldUpdate(changedProps) {
    return UPDATE_PROPS.some(prop => changedProps.has(prop));
  }

  render({config, entity} = this) {
    return html`
      ${this._style()}
      <ha-card
        class='flex'
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
        <ha-icon .icon=${this.computeIcon()}></ha-icon>
      </div>` : '';
  }

  renderName() {
    return !(this.config.hide.includes('name')) ? html`
      <div class='name flex'>
        <span class='ellipsis'>${this.computeName()}</span>
      </div>` : '';
  }

  renderState() {
    return !(this.config.hide.includes('state')) ? html`
      <div class='info flex'>
        <span class='state ellipsis'>${this.computeState()}</span>
        <span class='uom ellipsis'>${this.computeUom()}</span>
      </div> `: '';
  }

  renderGraph() {
    return !(this.config.hide.includes('graph'))  ? html`
      <div class='graph'>
        ${this.config.labels ? this.renderLabels() : ''}
        <div class='line'>
          ${this.line ? this.renderLine() : ''}
        </div>
      </div>` : '';
  }

  renderLine() {
    return svg`
      <svg width='100%' viewBox='0 0 500 ${this.config.height}'>
        <path
          d=${this.line}
          fill='none'
          stroke=${this.computeColor()}
          stroke-width=${this.config.line_width}
          stroke-linecap='round'
          stroke-linejoin='round'
        />
      </svg>`;
  }

  renderLabels() {
    return html`
      <div class='label flex'>
        <span class='label--max'>${this.Graph.max}</span>
        <span class='label--min'>${this.Graph.min}</span>
      </div>`;
  }

  handleMore({config} = this) {
    if(config.more_info)
      this.fire('hass-more-info', { entityId: config.entity });
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

  computeColor() {
    const state = Number(this.entity.state) || 0;
    const above = this.config.line_value_above;
    const below = this.config.line_value_below;
    if (above !== null && state > above) return this.config.line_color_above
    if (below !== null && state < below) return this.config.line_color_below
    return this.config.line_color;
  }

  computeName() {
    return this.config.name || this.entity.attributes.friendly_name;
  }

  computeIcon() {
    return this.config.icon
      || this.entity.attributes.icon
      || ICON[this.entity.attributes.device_class]
      || ICON.temperature;
  }

  computeUom() {
    return this.config.unit || this.entity.attributes.unit_of_measurement || '';
  }

  computeState() {
    const dec = this.config.decimals;
    if (dec === null || isNaN(dec) || Number.isNaN(this.entity.state))
      return this.entity.state;

    const x = Math.pow(10, dec);
    return (Math.round(this.entity.state * x) / x).toFixed(dec);
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
          margin-top: auto;
          padding-right: 8px;
          width: 100%;
        }
        .graph > .line {
          flex: 1;
        }
        svg {
          overflow: visible;
        }
        .label {
          flex-direction: column;
          font-size: .8em;
          font-weight: 400;
          justify-content: space-between;
          margin-right: 8px;
          opacity: .75;
        }
        .label > span {
          align-self: flex-end;
        }
        .label > span:after {
          content: ' -';
          opacity: .75;
        }
        .ellipsis {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      </style>`;
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('mini-graph-card', MiniGraphCard);
