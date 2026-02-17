// Basic page configuration
// For Task 1 we only display images; later we'll connect doors and animations.

const TOTAL_PAGES = 100;
const FIRST_SINGLE_PAGES = 6; // from 1 to 6 we show a single page

let currentPage = 1;

const singlePageView = document.getElementById("single-page-view");
const singlePageImage = document.getElementById("single-page-image");

const spreadView = document.getElementById("spread-view");
const leftPageImage = document.getElementById("left-page-image");
const rightPageImage = document.getElementById("right-page-image");

const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const pageIndicator = document.getElementById("page-indicator");
const pageJumpSelect = document.getElementById("page-jump");

function buildUiUnits() {
  /** @type {{ key: string; label: string; page: number }[]} */
  const units = [
    { key: "cover", label: "cover", page: 1 },
    { key: "cover2", label: "cover2", page: 2 },
    { key: "cover3", label: "cover3", page: 3 },
    { key: "cover4", label: "cover4", page: 4 },
    { key: "contest-rules", label: "contest rules", page: 5 },
    { key: "directions", label: "directions", page: 6 },
    { key: "prologue", label: "prologue", page: 7 }, // pages 7–8
  ];

  // Spreads:
  // 9–10 => page 1
  // 11–12 => page 2
  // ...
  // Up to the last story spread (e.g. 97–98). 99 and 100 are credits.
  let index = 1;
  for (let left = 9; left <= TOTAL_PAGES - 3; left += 2) {
    const key = `page-${index}`;
    const label = `page ${index}`;
    units.push({ key, label, page: left });
    index += 1;
  }

  // Final single pages: credits
  units.push({ key: "credits-1", label: "credits", page: TOTAL_PAGES - 1 });
  units.push({ key: "credits-2", label: "back cover", page: TOTAL_PAGES });

  return units;
}

const UI_UNITS = buildUiUnits();

function getUiUnitForPage(pageNumber) {
  if (pageNumber === 1) return UI_UNITS.find((u) => u.key === "cover");
  if (pageNumber === 2) return UI_UNITS.find((u) => u.key === "cover2");
  if (pageNumber === 3) return UI_UNITS.find((u) => u.key === "cover3");
  if (pageNumber === 4) return UI_UNITS.find((u) => u.key === "cover4");
  if (pageNumber === 5) return UI_UNITS.find((u) => u.key === "contest-rules");
  if (pageNumber === 6) return UI_UNITS.find((u) => u.key === "directions");
  if (pageNumber === 7 || pageNumber === 8)
    return UI_UNITS.find((u) => u.key === "prologue");

  if (pageNumber === TOTAL_PAGES - 1)
    return UI_UNITS.find((u) => u.key === "credits-1");
  if (pageNumber === TOTAL_PAGES)
    return UI_UNITS.find((u) => u.key === "credits-2");

  // For everything after the prologue (and before credits),
  // derive the UI page index from the spread.
  let left = pageNumber;
  if (left % 2 === 0) left -= 1;

  // Clamp to the last story spread's left page (e.g. 97).
  left = Math.min(left, TOTAL_PAGES - 3);

  if (left >= 9) {
    const index = 1 + Math.floor((left - 9) / 2);
    return UI_UNITS.find((u) => u.key === `page-${index}`);
  }

  return undefined;
}

function pageNumberToFilename(pageNumber) {
  const padded = String(pageNumber).padStart(4, "0");
  return `pages/page-${padded}.jpg`;
}

function isSinglePage(pageNumber) {
  // Single pages are:
  // - the first ones (1 to FIRST_SINGLE_PAGES)
  // - and the last ones (99 and 100)
  return pageNumber <= FIRST_SINGLE_PAGES || pageNumber >= TOTAL_PAGES - 1;
}

function isValidPage(pageNumber) {
  return pageNumber >= 1 && pageNumber <= TOTAL_PAGES;
}

function render() {
  if (isSinglePage(currentPage)) {
    // Single page mode (Task 1: we start at page 1)
    singlePageView.classList.remove("hidden");
    spreadView.classList.add("hidden");

    singlePageImage.src = pageNumberToFilename(currentPage);
    singlePageImage.alt = `MAZE book page ${currentPage}`;

    const unit = getUiUnitForPage(currentPage);
    pageIndicator.textContent = unit ? unit.label : `Page ${currentPage}`;
  } else {
    // Two-page spread mode
    singlePageView.classList.add("hidden");
    spreadView.classList.remove("hidden");

    let leftPage = currentPage;
    let rightPage = currentPage + 1;

    // Ensure we always have an odd page number on the left
    if (leftPage % 2 === 0) {
      leftPage -= 1;
      rightPage = leftPage + 1;
    }

    if (!isValidPage(leftPage)) {
      leftPage = FIRST_SINGLE_PAGES + 1;
      rightPage = leftPage + 1;
    }
    if (!isValidPage(rightPage)) {
      rightPage = leftPage; // simple fallback
    }

    leftPageImage.src = pageNumberToFilename(leftPage);
    leftPageImage.alt = `MAZE book page ${leftPage}`;

    rightPageImage.src = pageNumberToFilename(rightPage);
    rightPageImage.alt = `MAZE book page ${rightPage}`;

    const unit = getUiUnitForPage(leftPage);
    pageIndicator.textContent = unit ? unit.label : `Pages ${leftPage}–${rightPage}`;

    // Keep currentPage coherent (left side of the spread)
    currentPage = leftPage;
  }

  prevButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= TOTAL_PAGES;

  // Hide navigation buttons when they cannot be used
  prevButton.style.display = prevButton.disabled ? "none" : "";
  nextButton.style.display = nextButton.disabled ? "none" : "";

  if (pageJumpSelect) {
    const unit = getUiUnitForPage(currentPage);
    if (unit) pageJumpSelect.value = unit.key;
  }
}

function goToPrevious() {
  if (currentPage <= 1) return;

  if (isSinglePage(currentPage)) {
    currentPage -= 1;
  } else {
    // Go back two pages (one spread)
    currentPage -= 2;
    if (isSinglePage(currentPage)) {
      // When crossing the boundary, land on page 6
      currentPage = FIRST_SINGLE_PAGES;
    }
  }

  render();
}

function goToNext() {
  if (currentPage >= TOTAL_PAGES) return;

  if (isSinglePage(currentPage)) {
    const next = currentPage + 1;
    if (isSinglePage(next)) {
      currentPage = next;
    } else {
      // Ao sair das páginas únicas, vamos para o primeiro spread (7–8)
      currentPage = FIRST_SINGLE_PAGES + 1;
    }
  } else {
    // Advance two pages (one spread)
    const next = currentPage + 2;
    currentPage = Math.min(next, TOTAL_PAGES);
  }

  render();
}

prevButton.addEventListener("click", goToPrevious);
nextButton.addEventListener("click", goToNext);

if (pageJumpSelect) {
  for (const unit of UI_UNITS) {
    const option = document.createElement("option");
    option.value = unit.key;
    option.textContent = unit.label;
    pageJumpSelect.appendChild(option);
  }

  pageJumpSelect.addEventListener("change", () => {
    const unit = UI_UNITS.find((u) => u.key === pageJumpSelect.value);
    if (!unit) return;
    currentPage = unit.page;
    render();
  });
}

// Initial render
render();

