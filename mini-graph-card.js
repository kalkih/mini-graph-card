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

  connectedCallback() {
    this.entity = this._hass.states[this.config.entity];
    this.conf.unit = this.config.unit || this._getAttribute('unit_of_measurement');
    this.conf.icon = this.config.icon || this._getIcon();
  }

  static get properties() {
    return {
      _hass: Object,
      config: Object,
      entity: Object,
      line: String,
      conf: {
        unit: String,
        icon: String
      }
    };
  }

  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'sensor') {
      throw new Error('Specify an entity from within the sensor domain.');
    }

    config.icon = config.icon || false;
    config.more_info = (config.more_info !== false ? true : false);
    config.accuracy = Number(config.accuracy) || 10;
    config.height = Number(config.height) || 150;
    config.line_color = config.line_color || 'var(--accent-color)';
    config.line_width = Number(config.line_width) || 5;

    this.config = config;
  }

  async getHistory() {
    let url = 'history/period';
    url += '?filter_entity_id=' + this.config.entity;
    this._hass.callApi('GET', url).then( data => {
      data = data[0];
      let newData = [data[data.length -1]];
      newData.unshift();
      let pos = data.length -1;
      let increment = Math.ceil(data.length / this.config.accuracy);
      increment = (increment <= 0) ? 1 : increment;
      for (let i = this.config.accuracy; i >= 0 + 2; i--) {
        pos -= increment;
        newData.unshift(pos >= 0 ? data[pos] : data[0]);
      }
      this.line = Graph(newData, 500, this.config.height);
    });
  }

  shouldUpdate(changedProps) {
    const change = (
      changedProps.has('entity') ||
      changedProps.has('line') ||
      changedProps.has('conf')
    );
    if (change) return true;
  }

  render({config, entity} = this) {
    const active = (entity.state !== 'off' && entity.state !== 'unavailable');
    const name = config.name || this._getAttribute('friendly_name');

    return html`
      ${this._style()}
      <ha-card ?group=${config.group} @click='${(e) => this._handleMore()}'
        ?more-info=${config.more_info}>
        <div class='flex'>
          <div class='icon'><ha-icon icon='${this.conf.icon}'></ha-icon></div>
          <div class='header'>
            <span class='name'>${name}</span>
          </div>
        </div>
        <div class='flex info'>
          <span id='value'>${entity.state}</span>
          <span id='measurement'>${this.conf.unit}</span>
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

  _handleMore({config} = this) {
    if(config.more_info)
      this._fire('hass-more-info', { entityId: config.entity });
  }

  _fire(type, detail, options) {
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

  _getAttribute(attr, {entity} = this) {
    return entity.attributes[attr] || '';
  }

  _getIcon({entity} = this) {
    return entity.attributes.icon || this._icons[entity.attributes.device_class];
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
