import { fireEvent } from 'custom-card-helpers';
import { LitElement, html } from 'lit-element';
import './entitiesEditor';
import './entityEditor';

const SCHEMA = [
  {
    name: 'name',
    label: 'Name',
    selector: { text: {} },
  },
  {
    name: 'icon',
    selector: { icon: {} },
  },
  {
    type: 'integer',
    name: 'hours_to_show',
    default: 24,
  },
  {
    type: 'float',
    name: 'points_per_hour',
    default: 0.5,
  },
  {
    name: 'hour24',
    selector: { boolean: {} },
  },
  {
    type: 'select',
    mode: 'dropdown',
    options: [
      ['default', 'Default'],
      ['left', 'Left'],
      ['right', 'Right'],
      ['center', 'Center'],
    ],
    name: 'align_header',
    label: 'Align Header',
    default: 'default',
  },
  {
    type: 'select',
    options: [
      ['left', 'Left'],
      ['right', 'Right'],
      ['state', 'State'],
    ],
    name: 'align_icon',
    default: 'right',
  },
  {
    type: 'select',
    options: [
      ['left', 'Left'],
      ['right', 'Right'],
      ['center', 'Center'],
    ],
    name: 'align_state',
    default: 'left',
  },
];

class MiniGraphCardEditor extends LitElement {
  constructor() {
    super();
    this.subElementEditorConfig = undefined;
  }

  setConfig(config) {
    this._config = config;
    this._entities = config.entities;
  }

  valueChanged(ev) {
    const config = ev.detail.value || '';
    if (!this._config || !this.hass) {
      return;
    }
    // this._config = { config, ...this._entities };
    fireEvent(this, 'config-changed', { config });
  }

  entitiesChanged(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    fireEvent(this, 'config-changed', { config: { ...this._config, entities: ev.detail } });
  }

  render() {
    console.log(this.subElementEditorConfig);
    if (!this.hass || !this._config) {
      return html``;
    }


    if (this.subElementEditorConfig !== undefined) {
      return html`
        <mini-graph-card-entity-editor
          .hass=${this.hass}
          @go-back=${this.goBack}
        >
        </mini-graph-card-entity-editor>
      `;
    }

    const data = {
      ...this._config,
    };

    return html`
    <div>
      <mini-graph-card-entities-editor
        .hass=${this.hass}
        .entities=${this._entities}
        @config-changed=${this.entitiesChanged}
        @edit-row=${this.editRow}
      ></mini-graph-card-entities-editor>
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${SCHEMA}
        @value-changed=${this.valueChanged}
      ></ha-form>
    </div>
    `;
  }

  goBack() {
    this.subElementEditorConfig = undefined;
  }

  editRow(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    const id = ev.detail;
    this.subElementEditorConfig = { type: 'entity', index: id };
    console.log(ev);
    console.log(this.subElementEditorConfig);
  }
}

customElements.define('mini-graph-card-editor', MiniGraphCardEditor);
