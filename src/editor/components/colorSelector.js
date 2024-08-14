import { mdiClose } from '@mdi/js';
import { fireEvent } from 'custom-card-helpers';
import { css, html, LitElement } from 'lit-element';

export const colorSelector = {
  hex_color: {},
};

export class CustomColorSelector extends LitElement {
  static get properties() {
    return {
      hass: { attribute: false },
      selector: { attribute: false },
      value: {},
      label: {},
    };
  }

  render() {
    return html`
    <div class="color-container">
      <label id="hex" for="color-input">
        <span class="label">${this.label}</span>
        <span class="input-wrapper">
          <div class="overflow">
            <input class=${this.value ? '' : 'empty'}
              id="color-input"
              @input=${this.valueChanged}
              type="color"
              .value=${this.value ? this.value : '#000000'}>
          </div>
        </span>
        </label>
        ${this.selector.hex_color.clearable ? html`
          <ha-icon-button
          class="clear-button"
          .label=${this.hass.localize('ui.common.clear')}
          .path=${mdiClose}
          @click=${this.clearValue}
          ><ha-icon-button>
        ` : html``}
    </div>
    `;
  }

  valueChanged(ev) {
    const value = (ev.target).value || '#000000';
    fireEvent(this, 'value-changed', { value });
  }

  clearValue() {
    fireEvent(this, 'value-changed', { undefined });
  }

  static get styles() {
    return css`
      #hex {
        display: flex;
        align-items: center;
        margin: 4px 0px;
        flex: 1;
      }

      .input-wrapper {
        width: 48px;
        height: 48px;
        box-sizing: border-box;
        border: 1px solid var(--outline-color);
        position: relative;
        border-radius: 50%;
      }

      #hex:hover .input-wrapper {
        border: 2px solid var(--outline-color);
      }

      .label {
        font-family: var(--mdc-typography-body2-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));
        color: var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, .87));
        font-size: 1em;
        line-height: var(--mdc-typography-body2-line-height, 1.25rem);
        font-weight: var(--mdc-typography-body2-font-weight, 400);
        flex-grow: 1;
        padding-inline-start: 4px;
      }

      .overflow {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: inherit;
      }

      #hex input {
        min-width: 200%;
        min-height: 200%;
      }

      #hex .empty::before {
        background:
          repeating-conic-gradient(
           var(--secondary-background-color) 0 90deg,
          var(--disabled-text-color) 0 180deg)
          0 0/40px 40px round;
        content: '';
        min-width: 200%;
        min-height: 200%;
        display: block;
      }

      .color-container {
        display: flex;
        align-items: center;
      }

      .clear-button {
        --mdc-icon-size: 20px;
        color: var(--input-dropdown-icon-color);
      }
    `;
  }
}

customElements.define('ha-selector-hex_color', CustomColorSelector);
