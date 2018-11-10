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
