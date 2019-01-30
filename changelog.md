## v0.2.0
- UI redesign
- Added support for multiple entities (**BETA**) #28
- Added support for multiple `line_color` entries
- Added graph data points with information on hover, see `points` option under the `show` option
- Added `animate` option to have the graph animated on initial load
- Added `points_per_hour` option to specify amount of data points that should be rendered for each hour (basically the graph detail/accuracy).
- Added support for multiple color thresholds with new `line_color_above` & `line_color_below` options
- Added allocated space for the graph -> less jerky movements when loading in
- Added graph legend, visible if multiple entities is present
- Added `align_header`, `align_icon` & `align_state` options #27
- Added `show` option, to manage visible/hidden UI elements
- Added `entities` option
- Added `group` option to remove paddings/box-shadow #26 (@iantrich)
- Fixed bug were history data would be fetched when graph was hidden
- Fixed `decimals` option not being applied to labels #19
- Fixed Y-scale based on absolute extrema causing inconsistent results, now based on moving average same as the rest of the graph.
- Deprecated `entity` option, use new `entities`, accepts string or list (**deprecated**)
- Removed `detail` option, use new `points_per_hour` option (**Breaking change**)
- Removed `hide` options, use new `show` option (**Breaking change**)
- Removed `labels` option, use `labels` in new `show` option (**Breaking change**)
- Removed `line_value_above`, `line_color_above`, `line_value_below` & `line_color_below` options (**Breaking change**)

## v0.1.0
- Added `hide` option to hide specific UI elements
- Removed `hide_icon`, use new `hide` option (**Breaking change**)
- Minor UI changes
- Fixed issue causing errors if all available history entries had the exact same state
- Updated dependencies

## v0.0.9
- Added `decimals` option to display specified amount of decimals for the current state #18
- Fixed issue where `line_value_above` and `line_value_below` would not work when set to `0` #13

## v0.0.8
- Major rework of the graph calculation, now taking moving average and timestamps into account
- Added bundle version
- Added `detail` option, to specify the detail level of the graph
- Added `labels` option to display min/max labels
- Removed `accuracy` option in favor for `detail`
- Changed the reported size of the card

## v0.0.7
- Improved responsive design
- Fixed overflow issue when stacking several cards in horizontal-stack #11
- Fixed default font-size when not specified in config

## v0.0.6
- Improved handling of unknown/unavailable history entries #8
- Fixed issue where `<path>` error would appear in some scenarios
- Refactored code responsible for building the line graph #9

## v0.0.5
- Added `hide_icon` option #5
- Fixed issue where unknown/unavailable history would make the graph not render #6
- Fixed issue where graph line would rendering outside svg boundary and get clipped
- Made graph line ends rounded
- Adjusted line Y-scale
- Updated to lit-element 0.6.2

## v0.0.4
- Added options to have the line change color if the state is above/below specified values
- Fixed graph when setting accuracy option to a higher value than the available data points in history

## v0.0.3
- Added option `font_size` to modify the font size scale of the state #4
- Fixed `<path> attribute d: Expected number` errors.
- Decreased the default font size slightly #4
- Changed default graph height from 150 to 100;
- Improved compatibility with other custom cards like vertical-card-stack #3

## v0.0.2
- Added option to set hours to show

## v0.0.1
- Initial release
