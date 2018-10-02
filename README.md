# Lovelace Mini Graph Card
A minimalistic sensor with graph lovelace card for [Home Assistant](https://github.com/home-assistant/home-assistant).

The card works with entities from within the **sensor** domain and displays the sensors current state as well as a line graph of the sensor state during the past 24 hours (accuracy may vary).

| Example dark | Example light |
|:----:|:----:|
| <img src="https://user-images.githubusercontent.com/457678/46361353-abbfaa80-c66d-11e8-9599-70c4d0a155ae.png" alt="Preview 1" > | <img src="https://user-images.githubusercontent.com/457678/46361355-ac584100-c66d-11e8-8bdd-34b1bfbcaa16.png" alt="Preview 2" > |

## Install

### Simple install

- Copy `mini-graph-card.js` and `mini-graph-lib.js` into your `config/www` folder.
- Add a reference to the `mini-graph-card.js` inside your `ui-lovelace.yaml`.

```yaml
resources:
  - url: /local/mini-graph-card.js?v=0.0.1
    type: module
```

### Install using git

- Clone this repository into your `config/www` folder using git.

```bash
git clone https://github.com/kalkih/mini-graph-card.git
```

- Add a reference to the card in your `ui-lovelace.yaml`.

```yaml
resources:
  - url: /local/mini-graph-card/mini-graph-card.js?v=0.0.1
    type: module
```

### *(Optional)* Add to custom updater

- Make sure you got the [custom_updater](https://github.com/custom-components/custom_updater) component installed.
- Add a reference under `card_urls` in your `custom_updater` configuration in `configuration.yaml`.

```yaml
custom_updater:
  card_urls:
    - https://raw.githubusercontent.com/kalkih/mini-graph-card/master/tracker.json
```

## Updating

- Find your `mini-graph-card.js` & `mini-graph-lib.js` files in `config/www` or wherever you ended up storing them.
- Replace the files with the latest versions of [mini-graph-card.js](mini-graph-card.js). [mini-graph-lib.js](mini-graph-lib.js).
- Add the new version number to the end of the cards reference url in your `ui-lovelace.yaml` like below.

```yaml
resources:
  - url: /local/mini-graph-card.js?v=0.0.1
    type: module
```

If you went the `git clone` route, just run `git pull` from inside your `config/www/mini-graph-card/` directory, to get the latest version of the code. Then add the new version number to the end of the card reference url in your `ui-lovelace.yaml` like below.

```yaml
resources:
  - url: /local/mini-graph-card/mini-graph-card.js?v=0.1
    type: module
```

## Using the card

### Options

| Name | Type | Default | Since | Description |
|------|:----:|:-------:|:-----:|-------------|
| type | string | **required** | v0.0.1 | `custom:mini-graph-card`.
| entity | string | **required** | v0.0.1 | An entity_id from an entity within the `sensor` domain.
| icon | string | optional | v0.0.1 | set a custom icon from any of the available mdi icons.
| name | string | optional | v0.0.1 | Set a custom `friendly_name` which is displayed beside the icon.
| unit | string | optional | v0.0.1 | Set a custom unit of measurement.
| accuracy | number | 10 | v0.0.1 | Specify how many data points should be used to render the graph, higher number equals higher detailed graph. Results can vary depending on how often your sensor updates. *(Recommended to keep between 5 & 25).*
| height | number | 150 | v0.0.1 | Set a custom height of the line graph.
| line_color | string | 'var(accent-color)' | v0.0.1 | Set a custom color for the line in the graph.
| line_width | number | 5 | v0.0.1 | Set a custom width of the line.
| more_info | boolean | true | v0.0.1 | Set to `false` to disable the "more info" dialog when clicking on the card.

### Example usage

#### Single card
```yaml
- type: "custom:mini-graph-card"
  entity: sensor.sensor_illumination
  height: 100
  line_width: 4
  color: '#3498db'
```

#### Stacking horizontally

```yaml
- type: horizontal-stack
  cards:
    - type: "custom:mini-graph-card"
      entity: sensor.sensor_temperature
      name: Temperature
      line_color: '#3498db'
      line_width: 8
    - type: "custom:mini-graph-card"
      entity: sensor.sensor_humidity
      name: Humidity
      line_color: '#e74c3c'
      line_width: 8
    - type: "custom:mini-graph-card"
      entity: sensor.sensor_pressure
      name: Pressure
      accuracy: 8
      line_width: 8
```

## Known issues
- Spitting out `Error: <path> attribute d: Expected number` in the developer console.

## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest versions of `mini-graph-card.js` & `mini-graph-lib.js`.

If you have issues after updating the card, try clearing your browser cache.

## License
This project is under the MIT license.
