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
            style.textContent = appCss;
            document.head.appendChild(style);
        }

        const appWindow = apploaderHtml.querySelector(".window");
        const resizeBtn = appWindow.querySelector(".resize-btn");
        const minimizeBtn = appWindow.querySelector(".minimize-btn");
        const closeBtn = appWindow.querySelector(".close-btn");

        resizeBtn.addEventListener('click', (e) => {
            appWindow.classList.toggle("resize");
            
            // Remove any inline styling
            appWindow.style = "";
        });

        const minimize = function (state = true) {
            appWindow.style = "";

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
            appWindow.style = "";

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
        // const statusBar = appWindow.querySelector(".status-bar");

        // const getTranslateCoordinates = function (element) {
        //     const style = getComputedStyle(element);
        //     const matrix = new DOMMatrix(style.transform);

        //     return {
        //         x: matrix.m41,
        //         y: matrix.m42
        //     };
        // }

        // const appWindowCoords = getTranslateCoordinates(appWindow);

        // let currentX = appWindowCoords.x;
        // let currentY = appWindowCoords.y;
        // let startX = 0;
        // let startY = 0;
        // let ticking = false;

        // const onPointerMove = function (e) {
        //     currentX = e.clientX - startX;
        //     currentY = e.clientY - startY;

        //     // Only schedule one visual update per screen refresh frame
        //     if (!ticking) {
        //     requestAnimationFrame(() => {
        //         appWindow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        //         ticking = false;
        //     });
        //     ticking = true;
        //     }
        // }

        // statusBar.addEventListener("pointerdown", (e) => {
        //     // Record starting pointer position relative to current translation
        //     startX = e.clientX - currentX;
        //     startY = e.clientY - currentY;

        //     statusBar.setPointerCapture(e.pointerId);
        //     statusBar.addEventListener("pointermove", onPointerMove);
        // });

        // statusBar.addEventListener("pointerup", (e) => {
        //     statusBar.releasePointerCapture(e.pointerId);
        //     statusBar.removeEventListener("pointermove", onPointerMove);
        // });

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

  const response = await fetch(url);
  const htmlString = await response.text();

  const div = document.createElement("div");

  div.innerHTML = htmlString;

  return div;
}

/* Load a CSS stylesheet as a string */
window.loadDetachedStylesheet = async function (url) {

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load CSS: ${response.status}`);
  }
  const cssText = await response.text();

  return cssText;
}