import { fireEvent } from 'custom-card-helpers';
import { LitElement, html } from 'lit-element';
import './components/entitiesEditor';
import './components/entityEditor';
import './components/mgc_list';
import { setupTranslations } from '../localize/localize';
import { MAINSCHEMA, BOOLEANS } from './editorConst';
import { booleanToString, stringToBoolean } from './editorUtils';

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
    setupTranslations(this.hass);
  }

  valueChanged(ev) {
    ev.stopPropagation();
    const newConfig = ev.detail.value || '';
    const newShow = {};

    if (typeof newConfig.show !== 'undefined') {
      Object.keys(newConfig.show).forEach((key) => {
        if (typeof newConfig.show[key] !== 'undefined') {
          newShow[key] = stringToBoolean(newConfig.show[key]);
        }
      });
    }

    if (!this._config || !this.hass) {
      return;
    }

    fireEvent(this, 'config-changed', {
      config:
      {
        ...newConfig,
        show: Object.keys(newShow).length !== 0 ? newShow : undefined,
      },
    });
  }

  buildShowObject(showObject) {
    if (typeof showObject === 'undefined') {
      return undefined;
    }
    const show = {};
    Object.keys(showObject).forEach((key) => {
      if (!BOOLEANS.includes(key)) {
        show[key] = booleanToString(showObject[key]);
      } else {
        show[key] = showObject[key];
      }
    });
    return show;
  }

  entitiesChanged(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    fireEvent(this, 'config-changed', { config: { ...this._config, entities: ev.detail } });
  }

  computeLabel(schema) {
    let localized = this.hass.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    if (localized !== '') {
      return localized;
    }
    localized = this.hass.localize(`ui.panel.lovelace.editor.card.mgc.${schema.name}`);
    if (localized !== '') {
      return localized;
    }
    return schema.name;
  }

  localizeValue(key) {
    const localized = this.hass.localize(`ui.panel.lovelace.editor.card.mgc.values.${key}`);
    if (localized !== '') {
      return localized;
    }
    return key;
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    if (this.subElementEditorConfig !== undefined) {
      return this.renderSubElement();
    }

    const SHOW = this._config.show;
    const DATA = {
      ...this._config,
      show: this.buildShowObject(SHOW),
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
        .data=${DATA}
        .schema=${MAINSCHEMA}
        .computeLabel=${this.computeLabel}
        .localizeValue=${this.localizeValue}
        @value-changed=${this.valueChanged}
      ></ha-form>
    </div>
    `;
  }

  goBack() {
    this.subElementEditorConfig = undefined;
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

  editRow(ev) {
    ev.stopPropagation();
    if (!this._config || !this.hass) {
      return;
    }
    const id = ev.detail;
    this.subElementEditorConfig = { type: 'entity', index: id };
  }
}

customElements.define('mini-graph-card-editor', MiniGraphCardEditor);
