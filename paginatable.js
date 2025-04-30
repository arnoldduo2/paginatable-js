/**
 * jQuery Paginate Plugin
 * @version: 2.2.3
 * @author: Arnold Samhungu  http://www.nativesystemsllc.com
 * credits: https://stackoverflow.com, & @Trincot,
 * @licence: MIT
 * @desciption: jQuery pagination plugin.
 */
const ps = `
<style native-label='paginatable'>
.paginatable_el .sorting{
  position:relative;
  cursor:pointer;
  transition: all .3s
}
.paginatable_el .sorting:hover{
  filter: brightness(150%);

}
.paginatable_el .sorting:before,
.paginatable_el .sorting:after{
  position: absolute;
  display: block;
  opacity: 0.125;
  right: 10px;
  line-height: 9px;
  font-size: 0.8em;
}
.paginatable_el .sorting:before{
  top: 50%;
  content: "▼";
  content: "▼"/"";
 
}
.paginatable_el .sorting:after{
  bottom: 50%;
  content: "▲";
  content: "▲"/"";
}
.paginatable_el .sorting.asc.sorted:after{
  opacity: 0.8;
}
.paginatable_el .sorting:not(.asc).sorted:before{
  opacity: 0.8;
}
.paginatable-container, 
.paginatable_filter_container {
  padding: 5px 1px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
}
.paginatable-buttons {
}
.export-btn{
    display: inline-block;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    background-color: transparent;
    border: 1px solid transparent;
    padding: .375rem .75rem;
    font-size: 1rem;
    border-radius: .25rem;    
    color: #6c757d;
    border-color: #6c757d;
    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}
.search-box {
  min-width: 15%;
}
.search-box.has-filter {
  display:flex;
  min-width:35%;
}
.filter-table{
  display:flex;
  margin: 0 5px;
  min-width: 55%;
}
.filter-table label {
  width: 30%;
  margin-right: 1px;
  text-wrap: no-wrap;
  overflow: hidden;
}
.filter-table > div, .filter-table > select {
  width: 70%; 
}
.paginatable-pagingBox {
  max-width: 40%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.paginatable-pagingBox li {
  padding: 5px 10px;
}
.paginatable-pagingBox li.active {
  background-color: #0d6efd;
  font-weight: bold;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.375);
}
.paginatable-pagingBox li.active a {
  color: #fff;
}

.paginatable-pagingBox li a.disabled {
  color: #707070;
  cursor: default;
}
.paginatable-rows {
  display: flex;
  justify-content: center;
  align-items: center;
}
.paginatable-rows  select{
  margin: 0 5px;
}
</style>
`;

/**
 * Pagination JQuery plugin
 * @param {object} opts Settings object.
 */
$.fn.paginatable = function (opts) {
  "use strict";
  const parentEl = this,
    defaults = {
      perPage: 10,
      showPrevNext: true,
      showFilter: true,
      filters: null,
      sorting: true,
      sortBy: 0,
      order: "asc",
      hidePageNumbers: false,
      paginationSize: 7,
      isTable: true,
      nonSortCol: [],
      buttons: true,
      nonSortPrintable: true,
      selectClass: "form-control",
      inputClass: "form-control",
      btnClass: "btn btn-sm btn-outline-secondary",
      currencies: ["USD", "US$", "GBP", "$", "£", "P", "ZAR", "R", "ZWL", "Z$"],
      empty: false,
      emptyRecordsMsg: "No Matching Records found",
      persistState: true,
    };
  const pid = Math.random().toString(16).slice(2);
  const settings = $.extend(defaults, opts);

  // Generate unique ID if not present
  const generateUniqueId = () => {
    return "paginatable_" + Math.random().toString(36).substr(2, 9);
  };

  // Ensure table has an ID
  if (!parentEl.attr("id")) {
    parentEl.attr("id", generateUniqueId());
  }

  if (undefined === typeof window.jQuery) {
    throw new Error(
      "JQuery was not found. This plugin requires JQuery v1.xx + to be loaded before this plugin can be used!"
    );
  }
  if (settings.empty) return false; //Just Return here and do not attempt to run the plugin.
  //Check if the plugin is already initialized on the element
  if (parentEl.hasClass("paginatable_el")) return false;
  //Add the necessary styles to the document
  if ($(document).find("style[native-label=paginatable]").length === 0)
    $(document).find("head meta:last").after(ps);
  //Add the necessary classes to the element
  parentEl.addClass("paginatable_el");
  parentEl.parent().addClass(`paginatable_wrapper`);
  parentEl.parent().attr(`paginatable_wrapper_id`, pid);
  parentEl.attr("paginatable_id", pid);

  //Load State from Local Storage
  const loadState = (apply = false) => {
    // Only load state if persistState is enabled
    if (!settings.persistState) {
      return {
        currentPage: 1,
        perPage: settings.perPage,
        sortBy: settings.sortBy,
        order: settings.order,
      };
    }

    const savedState = localStorage.getItem(
      "paginatable_" + parentEl.attr("id")
    );
    if (savedState && apply) {
      const state = JSON.parse(savedState);
      settings.perPage = state.perPage;
      settings.sortBy = state.sortBy;
      settings.order = state.order;
      settings.currentPage = state.currentPage;
      settings.searchTerm = state.searchTerm;
      console.log("Loaded State", state);
    } else if (savedState && !apply) return JSON.parse(savedState);
    else
      return {
        //Where no state is found, use the default settings
        currentPage: 1,
        perPage: settings.perPage,
        sortBy: settings.sortBy,
        order: settings.order,
        searchTerm: "",
      };
  };
  //Save State to Local Storage
  const saveState = (params, key) => {
    // Only save state if persistState is enabled
    if (!settings.persistState) return;

    //Get the current State
    const currentState = loadState();
    const state = {
      currentPage: currentState.currentPage,
      perPage: currentState.perPage,
      sortBy: currentState.sortBy,
      order: currentState.order,
      searchTerm: currentState.searchTerm,
      ...params,
    };
    localStorage.setItem(
      "paginatable_" + parentEl.attr("id"),
      JSON.stringify(state)
    );
    console.log("Saved State: ", key, state);
  };

  loadState(true);
  console.log(settings);
  //Add the sorting classes to the table
  if (settings.sorting) {
    settings.isTable ? parentEl.find("thead th").addClass("sorting") : "";
    $.each(settings.nonSortCol, function (s, g) {
      parentEl.find(`thead th:nth-child(${g + 1})`).removeClass("sorting");
      if (settings.nonSortPrintable) {
        parentEl.find(`thead th:nth-child(${g + 1})`).addClass("d-print-none");
        parentEl.find(`tbody td:nth-child(${g + 1})`).addClass("d-print-none");
      }
    });
    sortTable(settings.sortBy, settings.order === "asc", true);
  }
  const children = settings.isTable
      ? parentEl.find("tbody:not(.empty)").children()
      : parentEl.children(),
    perPage = settings.perPage;

  let expTable = {};
  function getPageList(totalPages, page, maxLength) {
    if (maxLength < 5) maxLength = 5;

    function range(start, end) {
      start = isNaN(start) ? 0 : start;
      end = isNaN(end) ? 0 : end;
      return Array.from(Array(end - start + 1), (_, i) => i + start);
    }

    const sideWidth = maxLength < 9 ? 1 : 2;
    const leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
    const rightWidth = (maxLength - sideWidth * 2 - 2) >> 1;
    if (totalPages <= maxLength) {
      // no breaks in list
      return range(1, totalPages);
    }
    if (page <= maxLength - sideWidth - 1 - rightWidth) {
      // no break on left of page
      return range(1, maxLength - sideWidth - 1).concat(
        0,
        range(totalPages - sideWidth + 1, totalPages)
      );
    }
    if (page >= totalPages - sideWidth - 1 - rightWidth) {
      // no break on right of page
      return range(1, sideWidth).concat(
        0,
        range(totalPages - sideWidth - 1 - rightWidth - leftWidth, totalPages)
      );
    }
    // Breaks on both sides
    return range(1, sideWidth).concat(
      0,
      range(page - leftWidth, page + rightWidth),
      0,
      range(totalPages - sideWidth + 1, totalPages)
    );
  }

  let filteredData =
    settings?.searchTerm && settings?.searchTerm.length > 0
      ? searchData(settings?.searchTerm, true)
      : children;

  const wrapper = $(`div[paginatable_wrapper_id=${pid}]`),
    filterHt = `
      <div class="paginatable_filter_container">
        <div class="paginatable-rows">
          Showing
          <select class="${settings.selectClass}">
            <option ${perPage == 5 ? "selected" : ""} value="5">5</option>
            <option ${perPage == 10 ? "selected" : ""} value="10">10</option>
            <option ${perPage == 25 ? "selected" : ""} value="25">25</option>
            <option ${perPage == 50 ? "selected" : ""} value="50">50</option>
            <option ${perPage == 100 ? "selected" : ""} value="100">100</option>
            <option ${
              perPage == "All" ? "selected" : ""
            } value="All">All</option>
          </select>
          rows
        </div>
        ${
          settings.buttons
            ? `
            <div class="paginatable-buttons">
              <button type="button" id="xlsx" class="export-btn ${settings.btnClass}">Excel</button>            
              <button type="button" id="csv" class="export-btn ${settings.btnClass}">CSV</button>            
              <button type="button" id="pdf" class="export-btn ${settings.btnClass}">Print</button>           
            </div>`
            : ""
        } 
        <div class="search-box ${settings.filters ? "has-filter" : ""}">
        ${
          settings.filters
            ? `
          <div class="filter-table">
            <label class="${settings.selectClass}">Filter</label>
            <select data-filter="optionFilter" class="${
              settings.selectClass
            } table-filter">
                    ${filterOptions()}
            </select>
          </div>`
            : ""
        }
        <input type="text" id="paginatable_filter" class="${
          settings.inputClass
        }" placeholder="Search"/>
        </div>
      </div>
    `;
  wrapper.find(".paginatable_filter_container").remove();
  if (settings.showFilter) parentEl.before(filterHt);
  //Filter Data on search Input
  $(document).on(
    "keyup",
    `[paginatable_wrapper_id=${pid}] #paginatable_filter`,
    function () {
      const value = $(this).val();
      const rowsPerPage = $(this)
        .parents(".paginatable_filter_container")
        .find("select")
        .val();
      saveState({ searchTerm: value }, "search");
      computeRows(rowsPerPage ?? perPage, searchData(value), true);
    }
  );
  function searchData(value, setInputState = false) {
    let searchData = [];
    $.each(children, function (i, tr) {
      let td = $(tr).children();
      let match = false;
      $.each(td, function (j, data) {
        let text = $(data).text();
        if (text.toLowerCase().includes(value.toLowerCase())) match = true;
      });
      if (match) searchData.push(tr);
    });
    if (setInputState)
      setTimeout(() => {
        $(`[paginatable_wrapper_id=${pid}] #paginatable_filter`).val(value);
      }, 100);
    return $(searchData);
  }
  function sortTable(col, order, load = false) {
    const tbody = parentEl.find("tbody"),
      sortedTbody = tbody.find("tr").sort(function (a, b) {
        let valueA = $(`td:nth-child(${col + 1})`, a).text(),
          valueB = $(`td:nth-child(${col + 1})`, b).text(),
          isMoney = false;
        settings.currencies.forEach((c) => {
          if (valueA.includes(c)) {
            isMoney = true;
          }
        });

        if (isMoney) {
          let A = valueA.replace(/[^\d.-]/g, ""),
            B = valueB.replace(/[^\d.-]/g, "");
          if (A)
            if (order) return A.localeCompare(B, undefined, { numeric: true });
            else return B.localeCompare(A, undefined, { numeric: true });
        }
        if (isNumeric(valueA)) {
          if (order)
            return valueA.localeCompare(valueB, undefined, { numeric: true });
          else
            return valueB.localeCompare(valueA, undefined, { numeric: true });
        }
        if (Date.parse(valueA)) {
          let dA = Date.parse(valueA).toString(),
            dB = Date.parse(valueB).toString();
          if (order) return dA.localeCompare(dB, undefined, { numeric: true });
          else return dB.localeCompare(dA, undefined, { numeric: true });
        }
        if (order) return valueA.localeCompare(valueB);
        else return valueB.localeCompare(valueA);
      });
    if (load) {
      parentEl.find("th").removeClass("sorted");
      parentEl
        .find("thead tr")
        .children()
        .eq(col)
        .addClass(`sorted ${settings.order}`);
    }
    tbody.html(sortedTbody);
  }
  $(document).on("click", `[paginatable_id=${pid}] th.sorting`, function () {
    if (!settings.sorting) return;
    const column = $(this).index();
    parentEl.find("th").removeClass("sorted");
    if ($(this).hasClass("asc")) {
      parentEl.find("th").removeClass("asc");
      $(this).addClass("asc");
    }
    $(this).toggleClass("asc");
    $(this).addClass("sorted");
    sortTable(column, $(this).hasClass("asc"));
  });

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  function filterOptions() {
    let filterOptions = "";
    settings.filters.forEach((f, i) => {
      filterOptions += `<option value="${f.value}" ${
        f.selected ? "selected" : ""
      }>${f.label}</option>`;
    });
    return filterOptions;
  }
  // Below is an example use of the above function.
  function computeRows(itemsPerPage, dataList, noDataMsg = false) {
    // Number of items and limits the number of items per page
    const numberOfItems = dataList.length;

    const limitPerPage = itemsPerPage == "All" ? numberOfItems : itemsPerPage;
    // Total pages rounded upwards
    const totalPages = Math.ceil(numberOfItems / limitPerPage);
    // Number of buttons at the top, not counting prev/next,
    // but including the dotted buttons.
    // Must be at least 5:
    const paginationSize = settings.paginationSize;
    let currentPage;

    wrapper.find(".paginatable-container").remove();

    const paginateHt = `
      <div class="paginatable-container">
        <div class="paginatable-pageInfo"></div>
        ${
          settings.showFilter
            ? ""
            : `<div class="paginatable-rows">
        Showing
        <select class="${settings.selectClass}">
          <option ${itemsPerPage == 5 ? "selected" : ""} value="5">5</option>
          <option ${itemsPerPage == 10 ? "selected" : ""} value="10">10</option>
          <option ${itemsPerPage == 25 ? "selected" : ""} value="25">25</option>
          <option ${itemsPerPage == 50 ? "selected" : ""} value="50">50</option>
          <option ${
            itemsPerPage == 100 ? "selected" : ""
          } value="100">100</option>
          <option ${
            itemsPerPage == "All" ? "selected" : ""
          } value="All">All</option>
        </select>
        rows
      </div>`
        } 
        <ul class="paginatable-pagingBox"></ul>
      </div>
    `;
    parentEl.after(paginateHt);
    const pagingBox = wrapper.find(".paginatable-pagingBox");

    function showPage(whichPage) {
      if (whichPage < 1 || whichPage > totalPages) {
        wrapper
          .find(".paginatable-pageInfo")
          .text(`Showing 0 to 0 of 0 entries`);
        const noData = noDataMsg
          ? `<div class="container mt-4">${settings.emptyRecordsMsg}</div>`
          : "";
        settings.isTable
          ? parentEl.find("tbody").html(noData)
          : parentEl.html(noData);
        saveState({ currentPage: 1 }, "page: no data");
        return false;
      } else {
        currentPage = whichPage;
        let start = (currentPage - 1) * limitPerPage;
        let end = currentPage * limitPerPage;

        if (dataList.length > 0) dataList.remove();
        settings.isTable
          ? parentEl.find("tbody").html(dataList.slice(start, end))
          : parentEl.html(dataList.slice(start, end));
        // Replace the navigation items (not prev/next):
        settings.showPrevNext
          ? pagingBox.find("li").slice(1, -1).remove()
          : pagingBox.find("li").remove();
        getPageList(totalPages, currentPage, paginationSize).forEach((item) => {
          const li = $("<li>")
            .addClass(item ? "current-page" : "")
            .toggleClass("active", item === currentPage)
            .append(
              $("<a>")
                .addClass(item ? "" : "disabled")
                .attr({
                  href: "javascript:void(0)",
                })
                .text(item || "...")
            );
          settings.showPrevNext
            ? li.insertBefore(wrapper.find(".next_item"))
            : li.appendTo(pagingBox);
        });
        wrapper
          .find(".paginatable-pageInfo")
          .text(
            `Showing ${start + 1} to ${
              end > numberOfItems ? numberOfItems : end
            } of ${numberOfItems} entries`
          );
        // Disable prev/next when at first/last page:
        wrapper.find(".prev_link").toggleClass("disabled", currentPage === 1);
        wrapper
          .find(".next_link")
          .toggleClass("disabled", currentPage === totalPages);
        saveState({ currentPage: currentPage }, "page: show");
        return true;
      }
    }

    // Include the prev/next buttons:
    if (settings.showPrevNext && showPage(settings?.currentPage ?? 1)) {
      pagingBox.append(
        $("<li>")
          .addClass("prev_item")
          .append(
            $("<a>")
              .addClass("prev_link")
              .attr({
                href: "javascript:void(0)",
              })
              .text("Prev")
          ),
        $("<li>")
          .addClass("next_item")
          .append(
            $("<a>")
              .addClass("next_link")
              .attr({
                href: "javascript:void(0)",
              })
              .text("Next")
          )
      );
    }
    // Show the page links
    showPage(settings?.currentPage ?? 1);

    // Use event delegation, as these items are recreated later
    $(document).on(
      "click",
      `[paginatable_wrapper_id=${pid}] .paginatable-pagingBox li.current-page:not(.active)`,
      function () {
        return showPage(+$(this).text());
      }
    );
    $(wrapper).on("click", ".next_link:not(.disabled)", function () {
      return showPage(currentPage + 1);
    });

    $(wrapper).on("click", ".prev_link:not(.disabled)", function () {
      return showPage(currentPage - 1);
    });
    if (children.length > 0) {
      expTable = parentEl.tableExport({
        formats: ["xlsx", "csv"],
        filename: "id",
        exportButtons: false,
        sheetname: "id",
      });
    }
  }
  //Compute the rows for the first time
  computeRows(perPage, filteredData);

  $(wrapper).on("click", ".export-btn", function () {
    let btn = $(this).attr("id");
    if (btn === "pdf") {
      parentEl.print({
        // Use Global styles
        globalStyles: true,
        // Add link with attrbute media=print
        mediaPrint: false,
        //Custom stylesheet
        stylesheet: "http://fonts.googleapis.com/css?family=Inconsolata",
        //Print in a hidden iframe
        iframe: false,
        // Don't print this
        noPrintSelector: ".d-print-none",
        // Add this at top
        prepend: $(parentEl).attr("id").toUpperCase() ?? "Table",
        // Add this on bottom
        append:
          '<small style="position: absolute; bottom: 0; right:0; font-size: 7px;">Native Systems Enterprise &copy2022. All Rights Reserved</small><br/>',
        // Manually add form values
        manuallyCopyFormValues: true,
        // resolves after print and restructure the code for better maintainability
        deferred: $.Deferred(),
        // timeout
        timeout: 250,
        // Custom title
        title: null,
        // Custom document type
        doctype: "<!doctype html>",
      });
    } else {
      /* get export data */
      const exportData = expTable.getExportData()[parentEl.attr("id")][btn]; // useful for creating custom export buttons, i.e. when (exportButtons: false)
      expTable.export2file(
        exportData.data,
        exportData.mimeType,
        exportData.filename,
        exportData.fileExtension
      );
    }
  });
  $(document).on(
    "change",
    `[paginatable_wrapper_id=${pid}] .paginatable-rows select`,
    function () {
      let rowlen = $(this).val();
      settings.currentPage = 1;
      computeRows(rowlen, $(filteredData));
      saveState({ perPage: rowlen }, "rows");
    }
  );
  //Dispose Clear all modification done to element
  const dispose = () => {
    const pagingContainer = parentEl.nextAll(
      wrapper.find(".paginatable-container")
    );
    if (pagingContainer.length > 0) {
      settings.isTable
        ? parentEl.find("tbody").html(children)
        : parentEl.html(children);
      pagingContainer.remove();
      wrapper.find(".paginatable_filter_container").remove();
    }
  };
  return {
    dispose,
  };
};
