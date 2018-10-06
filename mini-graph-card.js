import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@^0.6.1/lit-element.js?module';
import Graph from './mini-graph-lib.js';

class MiniGraphCard extends LitElement {
  constructor() {
    super();
    this.conf = {};
    this._icons = {
      humidity: 'hass:water-percent',
      illuminance: 'hass:brightness-5',
      temperature: 'hass:thermometer',
      battery: 'hass:battery'
    };
  }

  set hass(hass) {
    this._hass = hass;
    const entity = hass.states[this.config.entity];
    if (entity && this.entity !== entity) {
      this.entity = entity;
      this.getHistory();
    }
  }

  static get properties() {
    return {
      _hass: Object,
      config: Object,
      entity: Object,
      line: String
    };
  }

  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'sensor')
      throw new Error('Specify an entity from within the sensor domain.');

    config.icon = config.icon || false;
    config.more_info = (config.more_info !== false ? true : false);
    config.hours_to_show = config.hours_to_show || 24;
    config.accuracy = Number(config.accuracy) || 10;
    config.height = Number(config.height) || 150;
    config.line_color = config.line_color || 'var(--accent-color)';
    config.line_width = Number(config.line_width) || 5;

    this.config = config;
  }

  async getHistory({config} = this) {
    const endTime = new Date();
    const startTime = new Date();
    startTime.setHours(endTime.getHours() - config.hours_to_show);
    const stateHistory = await this.fetchRecent(config.entity, startTime, endTime);
    const history = stateHistory[0];
    const values = [history[history.length - 1]];

    let pos = history.length - 1;
    let increment = Math.ceil(history.length / config.accuracy);
    increment = (increment <= 0) ? 1 : increment;
    for (let i = config.accuracy; i >= 2; i--) {
      pos -= increment;
      values.unshift(pos >= 0 ? history[pos] : history[0]);
    }
    this.line = Graph(values, 500, config.height, config.line_width);
  }

  shouldUpdate(changedProps) {
    return (
      changedProps.has('entity') ||
      changedProps.has('line')
    );
  }

  render({config, entity} = this) {
    return html`
      ${this._style()}
      <ha-card ?group=${config.group} @click='${(e) => this.handleMore()}'
        ?more-info=${config.more_info}>
        <div class='flex'>
          <div class='icon'><ha-icon icon=${this.computeIcon(entity)}></ha-icon></div>
          <div class='header'>
            <span class='name'>${this.computeName(entity)}</span>
          </div>
        </div>
        <div class='flex info'>
          <span id='value'>${entity.state}</span>
          <span id='measurement'>${this.computeUom(entity)}</span>
        </div>
        <div class='graph'>
          <div>
            ${this.line ? html`
            <svg width='100%' height='100%' viewBox='0 0 500 ${this.config.height}'>
              <path d=${this.line} fill='none' stroke=${config.line_color} stroke-width=${config.line_width} />
            </svg>` : '' }
          </div>
        </div>
      </ha-card>`;
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

  computeName() {
    return this.config.name || this.getAttribute('friendly_name');
  }

  computeIcon(entity) {
    return this.config.icon ||
      entity.attributes.icon ||
      this._icons[entity.attributes.device_class];
  }

  computeUom(entity) {
    return this.config.unit || entity.attributes.unit_of_measurement || '';
  }

  async fetchRecent(entityId, startTime, endTime) {
    let url = 'history/period';
    if (startTime)
      url += '/' + startTime.toISOString();

    url += '?filter_entity_id=' + entityId;
    if (endTime)
        url += '&end_time=' + endTime.toISOString();

    return await this._hass.callApi('GET', url);
  }

  _style() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
        }
        ha-card {
          position: relative;
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        ha-card[group] {
          background: none;
          box-shadow: none;
          padding: 0;
        }
        ha-card[more-info] {
          cursor: pointer;
        }
        .flex {
          display: flex;
          display: -webkit-flex;
        }
        .justify {
          justify-content: space-between;
          -webkit-justify-content: space-between;
        }
        .header {
          display: flex;
          min-width: 0;
          align-items: center;
          position: relative;
          opacity: .8;
          overflow: hidden;
        }
        .name {
          display: inline-block;
          flex: 1 0 60px;
          font-size: 1.2rem;
          font-weight: bold;
          max-height: 40px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          opacity: .8;
          word-wrap: break-word;
          word-break: break-all;
        }
        .icon {
          display: inline-block;
          position: relative;
          flex: 0 0 40px;
          width: 40px;
          line-height: 40px;
          text-align: center;
          color: var(--paper-item-icon-color, #44739e);
        }
        .info {
          margin: 20px 0 20px 8px;
          flex-wrap: wrap;
        }
        .info[small] {
          font-size: 1.2rem;
        }
        #value {
          font-size: 2.4rem;
          line-height: 2.4rem;
          margin-bottom: .2rem;
          display: inline-block;
          margin-right: 4px;
        }
        #measurement {
          display: inline-block;
          font-size: 1.4rem;
          line-height: 2rem;
          align-self: flex-end;
          opacity: .6;
        }
        .graph {
          position: relative;
          align-self: flex-end;
          margin: auto;
          width: 100%;
          margin-bottom: 0px;
        }
        .graph > div {
          align-self: flex-end;
          margin: auto 8px;
        }
      </style>`;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('mini-graph-card', MiniGraphCard);
