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
    <div>
      <label id="hex" for="color-input">
        <span class="label">${this.label}</span>
        <span class="input-wrapper">
          <div class="overflow">
            <input
              id="color-input"
              @input=${this.valueChanged}
              type="color"
              .value=${this.value}>
          </div>
        </span>
      </label>
    </div>
    `;
  }

  valueChanged(ev) {
    const value = (ev.target).value || '#000000';
    fireEvent(this, 'value-changed', { value });
  }

  static get styles() {
    return css`
      #hex {
        display: flex;
        align-items: center;
        padding: 0px 16px;
        margin: 4px 0px;
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
    `;
  }
}

customElements.define('ha-selector-hex_color', CustomColorSelector);
