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
const desktop = mainScreen.querySelector(".desktop");
const appGrid = desktop.querySelector(".app-grid");

// Taskbar Elements
const taskBar = mainScreen.querySelector(".task-bar");
const taskBarStartMenu = taskBar.querySelector(".task-bar-menu");
const taskBarControlMenu = taskBar.querySelector(".task-bar-controls");
const taskBarAppRow = taskBar.querySelector(".task-bar-apps");

// Template
const template_content = document.querySelector("template").content;
const template = document.importNode(template_content, true);

// View-related functions
const createTitledAppIcon = async function (src, title) {
  const titledAppTemplate = template.querySelector(".icon-title-card").cloneNode(true);

  let iconHtml = `<img src="${src}">`;

  if (src.endsWith(".svg")) {
    iconHtml = await fetchIcon(src);
  }
  // Try to fetch image
  titledAppTemplate.querySelector(".app-title").textContent = title;
  titledAppTemplate.querySelector(".app-icon").innerHTML = iconHtml;
  titledAppTemplate.title = title;

  return titledAppTemplate;
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

  for (const [key, app] of Object.entries(desktopApps)) {
    // Make a titled app and append to desktop's app grid
    const titledApp = await createTitledAppIcon(app.icon, app.title);

    if (!titledApp) return;
    
    titledApp.dataset.app = key;
    appGrid.append(titledApp);
  }

  for (const [key, app] of Object.entries(taskBarApps)) {

    // Skip apps not slated for start menu
    if (!app.start) continue;

    // Make an icon app and append to desktop's app grid
    const iconApp = await createAppIcon(app.icon, app.title);

    if (!iconApp) return;

    iconApp.dataset.app = key;
    taskBarAppRow.append(iconApp);
  }

  populateAllIcons();
}

!async function () {
  await init();

  // Register event listeners

  for (const app of appGrid.children) {
    const program = app.dataset.app;
    const taskBarApps = config["task_bar_apps"];

    // Find the corresponding taskbar app
    let taskApp = taskBar.querySelector(`[data-app=${program}]`);

    if (!taskApp) {
      // Create app icon
      const iconApp = await createAppIcon(taskBarApps[program].icon, app.title);

      if (iconApp) {
        iconApp.dataset.app = program;
        taskApp = iconApp;
      }

    }

    const appClick = async (e) => {

      if (!app.window) {
        app.window = await loadView(app, desktop);
      }

      if (app.window?.minimized) {
        app.window.minimize(false);
      }

      app.dispatchEvent(new Event('update'));
    }

    app.addEventListener('click', appClick);

    app.addEventListener('update', async () => {

      const removeIcon = !app.window && taskApp && !taskBarApps[program].start;
      if (removeIcon) {
        taskApp.remove();
        return;
      }

      if (app.window && !taskApp.isConnected) {
        taskBarAppRow.append(taskApp);
      }

      if (app.window) taskApp.classList.add("bg-white/10");
      else taskApp.classList.remove("bg-white/10");

    });

    taskApp?.addEventListener('click', async (e) => {

      do {
        if (!app.window) {
          app.window = await loadView(app, desktop);
          break;
        }

        if (app.window?.minimized) {
          app.window.minimize(false);
        }
        else {
          app.window.minimize();
        }
      } while (false);

      app.dispatchEvent(new Event('update'));
    });
  }
}();