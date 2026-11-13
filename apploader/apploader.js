/*
 * App Loader
 * Create a container for an inner app to function
 * Display error message if app is not found
 * 
 * @param app : String (required): name of app
 * @param desktop: HTML element (required): Parent container
 * @param options : Object (optional) : specify appWindow options
 *                  (fullscreen, resize) 
 */

!async function($) {
    $.loadView = async function (app, desktop, options) {
        if (!app) {
            console.error("app must be an html element");
        }

        const apploaderHtml = await loadDetachedHTML("/apploader/apploader.html");
        const apploaderCssRaw = await loadDetachedStylesheet("/apploader/apploader.css");

        if (!apploaderHtml) {
            console.error("Could not fetch apploader files!");
            return;
        }

        app.dataset.showing = true;

        const program = app.dataset.app;

        // Assign a unique id to this component's parent
        const uniqueId = 'id-'+crypto.randomUUID();

        apploaderHtml.id = uniqueId;
        const appCss = apploaderCssRaw.replaceAll('this', `#${uniqueId}`);

        if (appCss) {
            const style = document.createElement("style");
            style.classList.add(uniqueId);
            style.textContent = appCss;
            document.head.appendChild(style);
        }

        const appWindow = apploaderHtml.querySelector(".window");
        const resizeBtn = appWindow.querySelector(".resize-btn");
        const minimizeBtn = appWindow.querySelector(".minimize-btn");
        const closeBtn = appWindow.querySelector(".close-btn");

        resizeBtn.addEventListener('click', (e) => {
            appWindow.classList.add('transition-[width,height]');
            appWindow.classList.toggle("resize");
            
            // Remove any inline styling
            appWindow.style = "";
            appWindow.classList.add("center-window");
            
            setTimeout(() => {
                appWindow.classList.remove('transition-[width,height]');
                appWindow.parentElement.appendChild(appWindow);

            }, 500);
        });

        const minimize = function (state = true) {

            if (state) 
            {
                appWindow.classList.add(
                    "opacity-0",
                    "scale-75",
                    "translate-y-32",
                    "pointer-events-none"
                );
                app.window.minimized = true;
            }
            else 
            {
                appWindow.classList.remove(
                    "opacity-0",
                    "scale-75",
                    "translate-y-32",
                    "pointer-events-none"
                );
                app.window.minimized = false;
            }
            app.dispatchEvent(new Event('update'));
        }

        minimizeBtn.addEventListener('click', minimize);

        const close = function () {
            appWindow.classList.add(
                "opacity-0"
            );

            setTimeout(() => {
                delete app.window;
                apploaderHtml.remove();
                app.dispatchEvent(new Event('update'));
            }, 300);
        }

        closeBtn.addEventListener('click', () => { 
            close();
        });


        // Allow appWindow to be dragged by status bar
        const statusBar = appWindow.querySelector(".status-bar");

        const getCoordinates = (el) => {
            const rect = el.getBoundingClientRect();
            return [rect.left, rect.top];
        };

        const [currentX, currentY] = getCoordinates(appWindow);

        let offsetX = currentX;
        let offsetY = currentY;

        const onPointerMove = (e) => {
            const currentX = e.clientX - offsetX;
            const currentY = e.clientY - offsetY;

            console.log("pointermove clientX clientY", e.clientX, e.clientY);
            console.log("pointermove currentX currentY", currentX, currentY);

            appWindow.style.top = currentY + 'px';
            appWindow.style.left = currentX + 'px';
        };
        
        statusBar.addEventListener("pointerdown", (e) => {
            if (e.target.closest('button')) return;

            const wasMaximized = !appWindow.classList.contains("resize");

            appWindow.classList.add("resize");
            appWindow.classList.add("dragging");

            const [currentX, currentY] = getCoordinates(appWindow);
            const parentRect = appWindow.offsetParent.getBoundingClientRect();

            if (wasMaximized) {
                offsetX = appWindow.offsetWidth / 2;
                offsetY = e.clientY - currentY;
            } else {
                offsetX = e.clientX - currentX;
                offsetY = e.clientY - currentY;
            }

            const startLeft = wasMaximized ? (e.clientX - offsetX - parentRect.left) : (currentX - parentRect.left);
            const startTop = currentY - parentRect.top;

            appWindow.style.left = `${startLeft}px`;
            appWindow.style.top = `${startTop}px`;

            appWindow.classList.remove("center-window");

            statusBar.setPointerCapture(e.pointerId);
            statusBar.addEventListener("pointermove", onPointerMove);
        });


        statusBar.addEventListener("pointerup", (e) => {
            appWindow.classList.remove("dragging");
            statusBar.releasePointerCapture(e.pointerId);
            statusBar.removeEventListener("pointermove", onPointerMove);
        });

        // Fetch and set content
        programPackage = await loadProgram(program);

        if (programPackage.html) {

            if (programPackage.js) {
                const script = document.createElement("script");
                script.textContent = programPackage.js;
                programPackage.html.append(script);
            }

            if (programPackage.css) {
                document.head.appendChild(programPackage.css);
            }

            appWindow.querySelector(".content").replaceChildren(programPackage.html);       
        }

        desktop.append(apploaderHtml);
        // Fade in
        appWindow.animate(
            [
                { opacity: 0 },
                { opacity: 1 }
            ],
            {
                duration: 500,
                easing: 'ease-out',
            }
        );
        
        return {html: apploaderHtml, minimize, close};
    }
}(window);

/* Load an HTML document into memory */
window.loadDetachedHTML = async function (url) {

 try {
    const response = await fetch(url);

    if (!response.ok) { 
        throw new Error(`Failed to load HTML: ${response.status}`);
    }

    const htmlString = await response.text();

    const div = document.createElement("div");

    div.innerHTML = htmlString;

    return div;
 } catch (e) {
    console.error(e);
    return null;
 }

}

/* Load a CSS stylesheet as a string */
window.loadDetachedStylesheet = async function (url) {

  try {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to load CSS: ${response.status}`);
    }
    const cssText = await response.text();

    return cssText;
  } catch (e) {
    console.error(e);
    return "";
  }
}

/* Load a JS file as a string */
window.loadDetachedJS = async function (url) {

  try {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to load JS: ${response.status}`);
    }
    const jsText = await response.text();

    return jsText;
  } catch (e) {
    console.error(e);
    return "";
  }
}

const loadProgram = async function (program) {
    let result = {};

    if (!program) return result;

    const programHtml = await loadDetachedHTML(`/${program}/${program}.html`);
    const programCssRaw = await loadDetachedStylesheet(`/${program}/${program}.css`);
    const programJs = await loadDetachedJS(`/${program}/${program}.js`);

    if (!programHtml) return result;

    const programId = "c-"+crypto.randomUUID();

    programHtml.id = programId;
    result.html = programHtml;

    const programCss = programCssRaw.replaceAll('this', `#${programId}`);

    if (programCss) {
        const style = document.createElement("style");
        style.classList.add(programId);
        style.textContent = programCss;
        result.css = style;
    }

    if (programJs) result.js = programJs;

    return result;
}