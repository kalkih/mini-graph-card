import { mdiPencil, mdiDrag } from '@mdi/js';
import { fireEvent } from 'custom-card-helpers';
import { LitElement, html, css } from 'lit-element';

const SCHEMA = [
  {
    name: 'entity',
    selector: { entity: {} },
  },
];

class EntitiesEditor extends LitElement {
  constructor() {
    super();
    this.newEntity = {};
  }

  static get properties() {
    return {
      hass: { attribute: false },
      entities: { attribute: false },
      newEntity: {},
    };
  }

  computeLabel(schema) {
    return this.hass.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
  }

  render() {
    if (!this.entities || !this.hass) {
      return;
    }

    return html`
    <ha-sortable handle-selector=".handle" @item-moved=${this.rowMoved}>
    <div class="entities">
      ${this.entities.map((entity, index) => html`
        <div class="entity">
          <div class="handle">
            <ha-svg-icon .path=${mdiDrag}></ha-svg-icon>
          </div>
          <ha-form
            .hass=${this.hass}
            .data=${typeof entity === 'object' ? entity : { entity }}
            .schema=${SCHEMA}
            .index=${index}
            .computeLabel=${this.computeLabel}
            @value-changed=${this.valueChanged}
          ></ha-form>
          <ha-icon-button
            .label=${this.hass.localize('ui.components.entity.entity-picker.edit')}
            .path=${mdiPencil}
            .index=${index}
            @click=${this.editRow}
          ></ha-icon-button>
        </div>
      `)}
      </div>
    </div>
    </ha-sortable>
    <div class="entity add-item">
    <ha-form
      .hass=${this.hass}
      .data=${this.newEntity}
      .schema=${SCHEMA}
      .computeLabel=${this.computeLabel}
      @value-changed=${this.addEntity}
    ></ha-form>
    `;
  }

  rowMoved(ev) {
    ev.stopPropagation();
    if (!this.entities || !this.hass) {
      return;
    }
    const { oldIndex, newIndex } = ev.detail;
    const newEntities = this.entities.concat();

    newEntities.splice(newIndex, 0, newEntities.splice(oldIndex, 1)[0]);

    fireEvent(this, 'config-changed', newEntities);
  }

  addEntity(ev) {
    ev.stopPropagation();
    const value = ev.detail.value || '';
    if (value === '' || value.entity === undefined) {
      return;
    }
    fireEvent(this, 'config-changed', [...this.entities, value]);
  }

  editRow(ev) {
    const index = (ev.currentTarget).index || 0;
    fireEvent(this, 'edit-row', index);
  }

  valueChanged(ev) {
    if (!this.entities || !this.hass) {
      return;
    }
    const value = ev.detail.value.entity || '';
    const index = (ev.target).index || 0;
    const newConfigEntities = this.entities.concat();

    if (value === '' || value === undefined) {
      newConfigEntities.splice(index, 1);
    } else if (typeof newConfigEntities[index] === 'object') {
      newConfigEntities[index] = {
        ...newConfigEntities[index],
        entity: value || '',
      };
    } else {
      newConfigEntities[index] = {
        entity: value || '',
      };
    }

    fireEvent(this, 'config-changed', newConfigEntities);
  }

  static get styles() {
    return css`
      .entity {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }

      .entity > ha-form {
        flex-grow: 1;
      }

      .handle {
        cursor: grab;
        padding-inline-end: 8px;
      }

      .add-item {
        margin-bottom: 24px;
      }
    `;
  }
}

customElements.define('mini-graph-card-entities-editor', EntitiesEditor);
