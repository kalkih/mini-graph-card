# Lovelace Mini Graph Card
A minimalistic sensor with graph lovelace card for [Home Assistant](https://github.com/home-assistant/home-assistant).

The card works with entities from within the **sensor** domain and displays the sensors current state as well as a line graph of the sensors state history.

![Preview](https://user-images.githubusercontent.com/457678/48304689-d975fa00-e51d-11e8-9cd6-620a17e3d244.png)

## Install

### Simple install

1. Download and copy `mini-graph-card-bundle.js` from the [latest release](https://github.com/kalkih/mini-graph-card/releases/latest) into your `config/www` directory.

- Add a reference to `mini-graph-card-bundle.js` inside your `ui-lovelace.yaml`.

  ```yaml
  resources:
    - url: /local/mini-graph-card-bundle.js?v=0.1.0
      type: module
  ```

### CLI install

1. Move into your `config/www` directory

- Grab `mini-graph-card-bundle.js`

  ```
  $ wget https://github.com/kalkih/mini-graph-card/releases/download/v0.1.0/mini-graph-card-bundle.js
  ```

- Add a reference to `mini-graph-card-bundle.js` inside your `ui-lovelace.yaml`.

  ```yaml
  resources:
    - url: /local/mini-graph-card-bundle.js?v=0.1.0
      type: module
  ```

### *(Optional)* Add to custom updater

1. Make sure you've the [custom_updater](https://github.com/custom-components/custom_updater) component installed and working.

- Add a new reference under `card_urls` in your `custom_updater` configuration in `configuration.yaml`.

  ```yaml
  custom_updater:
    card_urls:
      - https://raw.githubusercontent.com/kalkih/mini-graph-card/master/tracker.json
  ```

## Updating
**If you have a version older than v0.0.8 installed, please delete the current files and follow the installation instructions again.**

1. Find your `mini-graph-card-bundle.js` file in `config/www` or wherever you ended up storing it.

- Replace the local file with the latest one attached in the [latest release](https://github.com/kalkih/mini-graph-card/releases/latest).

- Add the new version number to the end of the cards reference url in your `ui-lovelace.yaml` like below.

  ```yaml
  resources:
    - url: /local/mini-graph-card-bundle.js?v=0.1.0
      type: module
  ```

*You may need to empty the browsers cache if you have problems loading the updated card.*

## Using the card

### Options

| Name | Type | Default | Since | Description |
|------|:----:|:-------:|:-----:|-------------|
| type | string | **required** | v0.0.1 | `custom:mini-graph-card`.
| entity | string | **required** | v0.0.1 | Entity id of the sensor.
| icon | string | optional | v0.0.1 | Set a custom icon from any of the available mdi icons.
| name | string | optional | v0.0.1 | Set a custom name which is displayed beside the icon.
| unit | string | optional | v0.0.1 | Set a custom unit of measurement.
| height | number | 150 | v0.0.1 | Set a custom height of the line graph.
| line_width | number | 5 | v0.0.1 | Set the thickness of the line.
| line_color | string | 'var(accent-color)' | v0.0.1 | Set a custom color for the line in the graph.
| more_info | boolean | true | v0.0.1 | Set to `false` to disable the "more info" dialog when pressing the card.
| hours_to_show | integer | 24 | v0.0.2 | Specify how many hours the line graph should render.
| font_size | number | 100 | v0.0.3 | Adjust the font size of the state value, as percentage of the original size.
| line_value_above | number | optional | v0.0.4 | Set a threshold, if current state is above this value, the line color will change to color specified in `line_value_above`.
| line_color_above | string | optional | v0.0.4 | Set the line color for `line_value_above`
| line_value_below | number | optional | v0.0.4 | Set a threshold, if current state is below this value, the line color will change to color specified in `line_value_below`.
| line_color_below | string | optional | v0.0.4 | Set the line color for `line_value_below`.
| detail | integer | 1 | v0.0.8 | `1` or `2`, 1 equals ONE data point per hour, 2 equals SIX data points per hour.
| labels | boolean | false | v0.0.8 | Set to `true` to display min/max labels.
| decimals | integer | optional | v0.0.9 | Specify the exact number of decimals to show for the current state.
| hide | list | optional | v0.1.0 | List containing UI elements to hide, available items are (`icon`, `name`, `state`, `graph`)

### Example usage

#### Single card
```yaml
- type: custom:mini-graph-card
  entity: sensor.sensor_illumination
  height: 100
  line_width: 4
  font_size: 75
  color: '#3498db'
```

#### Show data from the last week
```yaml
- type: custom:mini-graph-card
  entity: sensor.sensor_illumination
  hours_to_show: 168
```

#### Hide everything except the graph
```yaml
- type: custom:mini-graph-card
  entity: sensor.sensor_illumination
  hide:
    - icon
    - name
    - state
```

#### Stacking horizontally

```yaml
- type: horizontal-stack
  cards:
    - type: custom:mini-graph-card
      entity: sensor.sensor_temperature
      name: Temperature
      line_color: '#3498db'
      line_width: 8
    - type: custom:mini-graph-card
      entity: sensor.sensor_humidity
      name: Humidity
      line_color: '#e74c3c'
      line_width: 8
    - type: custom:mini-graph-card
      entity: sensor.sensor_pressure
      name: Pressure
      line_width: 8
```

## Develop

**Clone this repository into your `config/www` folder using git.**

```
$ git clone https://github.com/kalkih/mini-graph-card.git
```

**Add a reference to the card in your `ui-lovelace.yaml`.**

```yaml
resources:
  - url: /local/mini-graph-card/mini-graph-card.js
    type: module
```

### Generate the bundle

*Requires `nodejs` & `npm`*

**Move into the `mini-graph-card` repo & install dependencies.**

```
$ npm install
```

**Edit the source file `mini-graph-card.js`, build by running**
```
$ npm run build
```

The `mini-graph-card-bundle.js` will be rebuilt and ready.



## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest versions of `mini-graph-card.js` & `mini-graph-lib.js`.

If you have issues after updating the card, try clearing your browser cache.

If you have issues displaying the card in older browsers, try changing `type: module` to `type: js` at the card reference in `ui-lovelace.yaml`.

## License
This project is under the MIT license.
