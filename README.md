
# jQuery Paginatable Plugin

A powerful and feature-rich jQuery pagination plugin that provides table pagination, sorting, filtering, and export functionality with state persistence.

## Features

- 📑 Dynamic pagination with configurable page sizes
- 🔍 Real-time search filtering
- ↕️ Column sorting (including date, number, and currency formats)
- 💾 State persistence using localStorage
- 📊 Export to Excel, CSV, and Print
- 🎨 Customizable styling
- 🔧 Configurable filters
- 📱 Responsive design
## Screenshots

![Screenshot 2025-05-01 003715](https://github.com/user-attachments/assets/0b8657d9-0c8e-4c3e-b9df-c775c4a833e9)

## Installation

1. Include jQuery in your project:

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

2. Include the paginatable plugin:

```html
<script src="path/to/paginatable.min.js"></script>
```

## Basic Usage

```javascript
// Initialize with default options
$("#myTable").paginatable();

// Initialize with custom options
$("#myTable").paginatable({
  perPage: 25,
  persistState: true,
  showFilter: true,
});
```

## Configuration Options

| Option           | Type    | Default                     | Description                                     |
| ---------------- | ------- | --------------------------- | ----------------------------------------------- |
| perPage          | number  | 10                          | Number of items to display per page             |
| showPrevNext     | boolean | true                        | Show previous/next navigation buttons           |
| showFilter       | boolean | true                        | Show search and filter controls                 |
| filters          | array   | null                        | Custom filter options                           |
| sorting          | boolean | true                        | Enable column sorting                           |
| sortBy           | number  | 0                           | Default column index to sort by                 |
| order            | string  | "asc"                       | Default sort order ("asc" or "desc")            |
| hidePageNumbers  | boolean | false                       | Hide page number buttons                        |
| paginationSize   | number  | 7                           | Number of page buttons to show                  |
| isTable          | boolean | true                        | Whether the element is a table                  |
| nonSortCol       | array   | []                          | Array of column indexes to exclude from sorting |
| buttons          | boolean | true                        | Show export buttons                             |
| nonSortPrintable | boolean | true                        | Hide non-sortable columns in print view         |
| currencies       | array   | ["USD",...]                 | Currency symbols for sorting                    |
| emptyRecordsMsg  | string  | "No Matching Records found" | Message when no records match                   |
| persistState     | boolean | true                        | Enable state persistence                        |

## State Persistence

The plugin automatically saves the following state to localStorage:

- Current page
- Items per page
- Sort column and order
- Search term
- Filter selections

To disable state persistence:

```javascript
$("#myTable").paginatable({
  persistState: false,
});
```

## Export Options

The plugin supports exporting data in multiple formats:

- Excel (.xlsx)
- CSV
- Print-friendly view

Export buttons are automatically added when `buttons: true`.

## Styling

The plugin includes default styling but can be customized using CSS. Key classes:

- `.paginatable_el` - Main container
- `.paginatable-container` - Pagination container
- `.paginatable-pagingBox` - Page number buttons
- `.paginatable-rows` - Rows per page selector
- `.search-box` - Search input container

## Methods

### dispose()

Removes pagination and restores the original table state:

```javascript
const paginator = $("#myTable").paginatable();
paginator.dispose();
```

## Events

The plugin triggers standard DOM events that you can listen to:

```javascript
$("#myTable").on("click", ".next_link", function () {
  // Handle next page click
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11+

## License

MIT License

## Credits

Created by Arnold Samhungu
http://www.nativesystemsllc.com

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
