// Data/Config
let config = {};
const configPath = "/conf.json";

const fetchConfig = async function () {
  let result = {};
  try {
    const response = await fetch(configPath);

    if (!response.ok) {
      console.error(`Error fetching config: ${response.status}`);
      return;
    }

    result = await response.json();

  }
  catch (err) {
    console.error(err);
  }
  finally 
  {
    return result;
  }
}

// UI
const mainScreen = document.getElementsByClassName("main-screen")[0];

// Desktop Elements
const desktop = document.getElementsByClassName("desktop")[0];
const appGrid = document.getElementsByClassName("app-grid")[0];

// Taskbar Elements
const taskBar = document.getElementsByClassName("task-bar")[0];
const taskBarStartMenu = document.getElementsByClassName("task-bar-menu")[0];
const taskBarControlMenu = document.getElementsByClassName("task-bar-controls")[0];
const taskBarAppRow = document.getElementsByClassName("task-bar-apps")[0];

// Template
const template_content = document.querySelector("template").content;
const template = document.importNode(template_content, true);

// View-related functions
const createTitledAppIcon = async function (svg_src, title) {
  const titledAppTemplate = template.querySelector(".icon-title-card").cloneNode(true);

  // Try to fetch svg
  try 
  {
    const response = await fetch(svg_src);

    if (!response.ok) {
      console.error("Could not fetch icon.");
      return;
    }

    const svgText = await response.text();


    titledAppTemplate.querySelector(".app-title").textContent = title;
    titledAppTemplate.querySelector(".app-icon").innerHTML = svgText;
    titledAppTemplate.title = title;

    return titledAppTemplate;
  } catch (err) 
  {
    console.error(err);
    return;
  }
}

const createAppIcon = async function (svg_src, title = null) {
  const iconAppTemplate = template.querySelector(".icon-card").cloneNode(true);

  // Try to fetch svg
  try 
  {
    const response = await fetch(svg_src);

    if (!response.ok) {
      console.error("Could not fetch svg icon.");
      return;
    }

    const svgText = await response.text();

    iconAppTemplate.querySelector(".app-icon").innerHTML = svgText;

    if (title) iconAppTemplate.title = title;

    return iconAppTemplate;
  } catch (err) 
  {
    console.error(err);
    return;
  }
}

const fetchIcon = async function (svg_src) {
  try 
  {
    const response = await fetch(svg_src);

    if (!response.ok) {
      console.error(`Could not fetch icon: ${response.status}`);
      return;
    }

    const svg_text = await response.text();

    return svg_text;
  }
  catch (err) 
  {
    console.error(err);
  }
}

const populateAllIcons = async function () {
  const iconDivs = document.querySelectorAll(".icon");

  iconDivs.forEach(async (div) => {
    if (!div.dataset.path) return;

    const icon = await fetchIcon(div.dataset.path);

    div.innerHTML = icon;

  });
}

async function init () {
  config = await fetchConfig();

  // Fetch desktop apps
  const desktopApps = config['home_page_apps'] ?? [];

  // Fetch taskbar apps
  const taskBarApps = config['task_bar_apps'] ?? [];

  desktopApps.forEach(async (app) => {
    // Make a titled app and append to desktop's app grid
    const titledApp = await createTitledAppIcon(app.icon, app.title);

    if (!titledApp) return;
    
    appGrid.append(titledApp);
  });

  taskBarApps.forEach(async (app) => {
    // Make an icon app and append to desktop's app grid
    const iconApp = await createAppIcon(app.icon, app.title);

    if (!iconApp) return;

    taskBarAppRow.append(iconApp);
  });
}

init();
populateAllIcons();