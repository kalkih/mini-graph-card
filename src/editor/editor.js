import { fireEvent } from 'custom-card-helpers';
import { LitElement, html, css } from 'lit-element';
import './components/entitiesEditor';
import './components/entityEditor';
import './components/colorThresholdsEditor';
import './components/subPageLink';
import './components/stateMapEditor';
import {
  mdiAlignHorizontalLeft, mdiArrowExpandVertical, mdiEye,
  mdiFormatColorFill,
  mdiPalette,
  mdiStateMachine,
} from '@mdi/js';
import { DEFAULT_SHOW } from '../const';
import { localize } from '../localize/localize';

const SCHEMA = [
  {
    name: '',
    type: 'expandable',
    iconPath: mdiPalette,
    title: 'Appearance',
    schema: [
      {
        name: '',
        type: 'grid',
        schema: [
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
            name: 'unit',
            selector: { text: {} },
          },
          {
            name: 'hour24',
            selector: { boolean: {} },
          },
          {
            name: 'hours_to_show',
            selector: { number: { min: 1 } },
          },
          {
            name: 'points_per_hour',
            selector: { number: { min: 0.1, step: 0.1 } },
          },
          {
            name: 'aggregate_func',
            selector: {
              select: {
                options: [
                  { label: 'Average', value: 'avg' },
                  { label: 'Median', value: 'median' },
                  { label: 'Minimum', value: 'min' },
                  { label: 'Maximum', value: 'max' },
                  { label: 'First', value: 'first' },
                  { label: 'Last', value: 'last' },
                  { label: 'Sum', value: 'sum' },
                ],
                mode: 'dropdown',
              },
            },
          },
          {
            name: 'group_by',
            selector: {
              select: {
                options: [
                  { label: 'Interval', value: 'interval' },
                  { label: 'Date', value: 'date' },
                  { label: 'Hour', value: 'hour' },
                ],
                mode: 'dropdown',
              },
            },
          },
          {
            name: 'value_factor',
            selector: { number: {} },
          },
          {
            name: 'bar_spacing',
            selector: { number: { min: 0.1, step: 0.1 } },
          },
          {
            name: 'line_width',
            selector: { number: { min: 0.1, step: 0.1 } },
          },
          {
            name: 'color_thresholds_transition',
            selector: {
              select: {
                options: [
                  { label: 'Smooth', value: 'smooth' },
                  { label: 'Hard', value: 'hard' },
                ],
                mode: 'dropdown',
              },
            },
          },
          {
            name: 'animate',
            selector: { boolean: {} },
          },
          {
            name: 'logarithmic',
            selector: { boolean: {} },
          },
        ],
      },
      {
        name: '',
        type: 'expandable',
        iconPath: mdiArrowExpandVertical,
        title: 'Bounds',
        schema: [
          {
            name: '',
            type: 'grid',
            schema: [
              {
                name: 'lower_bound',
                selector: { text: {} },
              },
              {
                name: 'upper_bound',
                selector: { text: {} },
              },
              {
                name: 'min_bound_range',
                selector: { number: { step: 0.1 } },
              },
            ],
          },
          {
            name: '',
            type: 'grid',
            schema: [
              {
                name: 'lower_bound_secondary',
                selector: { text: {} },
              },
              {
                name: 'upper_bound_secondary',
                selector: { text: {} },
              },
              {
                name: 'min_bound_range_secondary',
                selector: { number: { step: 0.1 } },
              },
            ],
          },
        ],
      },
      {
        name: '',
        type: 'expandable',
        iconPath: mdiAlignHorizontalLeft,
        title: 'Alignment',
        schema: [
          {
            name: '',
            type: 'grid',
            schema: [
              {
                name: 'align_header',
                selector: {
                  select: {
                    options: [
                      { label: 'Default', value: 'default' },
                      { label: 'Left', value: 'left' },
                      { label: 'Right', value: 'right' },
                      { label: 'Center', value: 'center' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'align_icon',
                selector: {
                  select: {
                    options: [
                      { label: 'Left', value: 'left' },
                      { label: 'Right', value: 'right' },
                      { label: 'State', value: 'state' },
                    ],
                    mode: 'dropdown',
                    default: 'right',
                  },
                },
              },
              {
                name: 'align_state',
                selector: {
                  select: {
                    options: [
                      { label: 'Left', value: 'left' },
                      { label: 'Right', value: 'right' },
                      { label: 'Center', value: 'center' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
            ],
          },
        ],
      },
      {
        name: 'show',
        type: 'expandable',
        iconPath: mdiEye,
        title: 'Display',
        schema: [
          {
            name: '',
            type: 'grid',
            schema: [
              {
                name: 'name',
                selector: { boolean: {} },
              },
              {
                name: 'icon',
                selector: { boolean: {} },
              },
              {
                name: 'state',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: true },
                      { label: 'Hide', value: false },
                      { label: 'Last', value: 'last' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'graph',
                selector: {
                  select: {
                    options: [
                      { label: 'Line', value: 'line' },
                      { label: 'Bar', value: 'bar' },
                      { label: 'Hide', value: false },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'fill',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: true },
                      { label: 'Hide', value: false },
                      { label: 'Fade', value: 'fade' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'points',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: true },
                      { label: 'Hide', value: false },
                      { label: 'Hover', value: 'hover' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'legend',
                selector: { boolean: {} },
              },
              {
                name: 'average',
                selector: { boolean: {} },
              },
              {
                name: 'extrema',
                selector: { boolean: {} },
              },
              {
                name: 'labels',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: true },
                      { label: 'Hide', value: false },
                      { label: 'Hover', value: 'hover' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'labels_secondary',
                selector: {
                  select: {
                    options: [
                      { label: 'Show', value: true },
                      { label: 'Hide', value: false },
                      { label: 'Hover', value: 'hover' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
              {
                name: 'name_adaptive_color',
                selector: { boolean: {} },
              },
              {
                name: 'icon_adaptive_color',
                selector: { boolean: {} },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'tap_action',
    selector: { ui_action: {} },
  },
];

class MiniGraphCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
      subElementEditorConfig: {},
    };
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

  computeLabel(schema) {
    const localized = this.hass.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    if (localized === '') {
      return localize(`editor.form.card.${schema.name}`, this.hass);
    } else {
      return localized;
    }
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }


    if (this.subElementEditorConfig !== undefined) {
      return this.renderSubElement();
      // return html`
      //   <mini-graph-card-entity-editor
      //     .hass=${this.hass}
      //     .config=${this._entities[this.subElementEditorConfig.index]}
      //     @go-back=${this.goBack}
      //     @config-changed=${this.subElementChanged}
      //   >
      //   </mini-graph-card-entity-editor>
      // `;
    }

    const data = {
      hours_to_show: 24,
      points_per_hour: 0.5,
      aggregate_func: 'avg',
      group_by: 'interval',
      bar_spacing: 4,
      line_width: 5,
      color_thresholds_transition: 'smooth',
      align_header: 'default',
      align_icon: 'right',
      align_state: 'left',
      smoothing: true,
      show: DEFAULT_SHOW,
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
        .computeLabel=${this.computeLabel}
        @value-changed=${this.valueChanged}
      ></ha-form>
      <mini-graph-card-subpage-link
        .name=${'Color thresholds'}
        .icon=${mdiFormatColorFill}
        @click=${this.editColorThresholds}
      ></mini-graph-card-subpage-link>
      <mini-graph-card-subpage-link
        .name=${'State map'}
        .icon=${mdiStateMachine}
        @click=${this.editStateMap}
      ></mini-graph-card-subpage-link>
    </div>
    `;
  }

  goBack() {
    this.subElementEditorConfig = undefined;
  }

  editColorThresholds(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    this.subElementEditorConfig = { type: 'thresholds', index: 0 };
  }

  editStateMap(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    this.subElementEditorConfig = { type: 'statemap', index: 0 };
  }

  renderSubElement() {
    switch (this.subElementEditorConfig.type) {
      case 'entity':
        return html`
        <mini-graph-card-entity-editor
          .hass=${this.hass}
          .config=${this._entities[this.subElementEditorConfig.index]}
          @go-back=${this.goBack}
          @config-changed=${this.subElementChanged}
        ></mini-graph-card-entity-editor>
        `;
      case 'thresholds':
        return html`
        <color-thresholds-editor
          .hass=${this.hass}
          .config=${this._config.color_thresholds}
          @go-back=${this.goBack}
          @config-changed=${this.colorThresholdsChanged}
        ></color-thresholds-editor>
        `;
      case 'statemap':
        return html`
        <state-map-editor
          .hass=${this.hass}
          .config=${this._config.state_map}
          @go-back=${this.goBack}
          @config-changed=${this.stateMapChanged}
        ></state-map-editor>
        `;
      default:
        return html``;
    }
  }

  subElementChanged(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    const index = this.subElementEditorConfig.index || 0;
    if (index !== undefined) {
      const configentities = [...this._entities];
      configentities[index] = ev.detail;
      fireEvent(this, 'config-changed', { config: { ...this._config, entities: configentities } });
    }
  }

  colorThresholdsChanged(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    fireEvent(this, 'config-changed', { config: { ...this._config, color_thresholds: ev.detail } });
  }

  stateMapChanged(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }

    fireEvent(this, 'config-changed', { config: { ...this._config, state_map: ev.detail } });
  }

  editRow(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    const id = ev.detail;
    this.subElementEditorConfig = { type: 'entity', index: id };
  }

  static get styles() {
    return css`
      .subElementLink {
        display: flex;
        width: 100%;
        min-height: 48px;
        gap: 1rem;
        align-items: center;
        cursor: pointer;
        margin-top: 24px;
      }

      .subElementLink > .header {
        flex: 1;
      }
    `;
  }
}

customElements.define('mini-graph-card-editor', MiniGraphCardEditor);
