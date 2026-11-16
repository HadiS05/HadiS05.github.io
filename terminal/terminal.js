!async function () {
  const screen = document.querySelector(".terminal-screen");
  const delay = ms => new Promise(res => setTimeout(res, ms));
  
  const data = await async function () {
    try {
      const response = await fetch("/terminal/data.json");
      
      if (!response.ok) {
        console.error("Error fetching data.", response.status);
        return {};
      }

      const json = await response.json();

      return json || {};
    }
    catch (e) {
      console.error(e);
      return {};
    }
  }();

  const cmds = {
    'about' : (option) => {
      const about = data.about ?? {};

      const options = {
        "--help": () => {
          createText("View Information About Hadi.");
          createText("-v: Show verbose information.");
          createText("-h: View hobbies.");
          createText("-w: View work information.");
          createText("-a: View academic information.");
        },
        "-v": () => {
          createText("Hadi Shaheryar");
          createText(about.description);
          createText("===");
          createText("Hobbies:");

          for (const [heading, info] of Object.entries(about.hobbies)) {
            createText(`* ${heading}`);
            createText(`- ${info.description}`);
          }

          createText("===");
          createText("Academics:");

          for (const [academic, info] of Object.entries(about.academics)) {
            createText(`==${academic}==`);
            createText(info.date);
            createText(`GPA: ${info.gpa}`);
            createText(info.description);

            createText("Relevant Courses:");
            info.relevant_courses.forEach((course) => createText(`- ${course}`));

          }

          createText("===");
          createText("Work Experience:");

          for (const [work, info] of Object.entries(about.work_experience)) {
            createText(`* ${work}`);
            createText(`Company: ${info.company}`);
            createText(`Date: ${info.date}`);
            createText(`Location: ${info.location}`);
          }
        },
        "-h": () => {
          createText("Hobbies:");

          for (const [heading, info] of Object.entries(about.hobbies)) {
            createText(`* ${heading}`);
            createText(`- ${info.description}`);
          }
        },
        "-w" : () => {
          createText("Work Experience:");

          for (const [work, info] of Object.entries(about.work_experience)) {
            createText(`* ${work}`);
            createText(`Company: ${info.company}`);
            createText(`Date: ${info.date}`);
            createText(`Location: ${info.location}`);
          }
        },
        "-a" : () => {
          createText("Academics:");

          for (const [academic, info] of Object.entries(about.academics)) {
            createText(`==${academic}==`);
            createText(info.date);
            createText(`GPA: ${info.gpa}`);
            createText(info.description);

            createText("Relevant Courses:");
            info.relevant_courses.forEach((course) => createText(`- ${course}`));

          }
        }
      }

      if (option && options[option]) options[option]();
      else {
        createText("Invalid command structure identified.", 'error');
      }
    },
    'contact' : (option) => {
      const contact = data.contact ?? {};

      const options = {
        "--help": () => {
          createText("View Hadi's Contact Information.");
          createText("-a: Show all contact info.");
          createText("-e: Show e-mail.");
          createText("-p: Show phone.");
        },
        "-a": () => {
          createText("Hadi Shaheryar");
          createText(contact.email ?? "E-mail N/A");
          createText(contact.phone ?? "Phone N/A");
        },
        "-e": () => {
          createText(`E-mail: <i>${contact.email ?? "N/A"}</i>`);
        },
        "-p" : () => {
          createText(`Phone Number: <i>${contact.phone ?? "N/A"}</i>`);
        }
      }

      if (option && options[option]) options[option]();
      else {
        createText("Invalid command structure identified.", 'error');
      }
    },
    'resume' : (option) => {
      const resume = data.resume ?? {};

      const options = {
        "--help": () => {
          createText("View Hadi's resume.");
          createText("-d: Download resume.");
        },
        "-d": () => {
          createText("Downloading resume...");
          createText("===");

          const a = document.createElement('a');
          a.href = resume.file ?? "";
          a.download = "Hadi_Shaheryar_Resume_" + Date.now();
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }

      if (option && options[option]) options[option]();
      else {
        createText("Invalid command structure identified.", 'error');
      }
    },
    'projects': (option) => {

      const projects = data.projects ?? {};

      const options = {
        "--help": () => {
          createText("View Hadi's projects.");
          createText("-a: Show all projects.");
          createText("-g: View GitHub projects.");
          createText("-v: Verbose projects list.");
        },
        "-a": () => {
          createText("All projects:");
          createText("===");

          for (const [project, data] of Object.entries(projects)) {
            createText(`* Project: ${project}`);
            createText(`Date: ${data.date}`);
            createText(`Role: ${data.role}`);
            createText("====")
          }

        },
        "-g": () => {
          createText("GitHub projects:");
          createText("===");
          
          for (const [project, data] of Object.entries(projects)) {
            if (!data.github) continue;

            createText(`* Project: ${project}`);
            createText(`GitHub: <a href="${data.github}" target="_blank">${data.github}</a>`);
            createText("====")
          }
        },
        "-v" : () => {
          createText("Verbose projects list:");
          createText("===");

          for (const [project, data] of Object.entries(projects)) {
            createText(`* Project: ${project}`);
            createText(`Date: ${data.date}`);
            createText(`Role: ${data.role}`);
            createText(`Description: ${data.description}`);
            createText(`GitHub: <a href="${data.github}" target="_blank">${data.github}</a>`);
            data.points.forEach(point => createText(`- ${point}`));
            createText("====")
          }
        }
      }

      if (option && options[option]) options[option]();
      else {
        createText("Invalid command structure identified.", 'error');
      }
    },
    'clear' : (option = null) => {

      if (option && option === "--help") {
        createText("Simply type 'clear' to clear the terminal screen.");
        return;
      }

      screen.replaceChildren();
    },
    'help': async () => {
      await createText("You may run the following commands:");
    
      for (const cmd of Object.keys(cmds)) {
        await createText(cmd);
      }

      await createText("For more information about each command, include --help");
    }
  };
      
  screen.addEventListener("keypress", async function(event){
    if(event.key === "Enter"){
      submitValue();
    }
  });

  screen.addEventListener("click", function(event){
    const input = document.querySelector("input");
    input.focus();
  });

  const createText = async function (text, status = null) {
    await delay(150);
    const textEl = document.createElement("p");
    textEl.classList.add("terminal-text");
    if (status) textEl.classList.add(`terminal-${status}`);
    textEl.innerHTML = text;
    screen.append(textEl);
    refreshInput();
  };

  const createInput = function () {
    const input = document.createElement("input");
    input.classList.add("terminal-input");

    return input;
  };

  const refreshInput = function () {
    screen.querySelector(".t-input")?.remove();

    const username = document.createElement("span");
    username.textContent = "user@hadis05.github.io:~$";

    const input = createInput();

    const inputDiv = document.createElement("div");
    inputDiv.classList.add("t-input");
    inputDiv.append(username);
    inputDiv.append(input);

    screen.append(inputDiv);

    input.focus();
  };

  const submitValue = async function () {
    const input = screen.querySelector(".terminal-input");

    const values = input.value.trim().split(/\s+/);

    const cmd = values[0];

    await createText("user@hadis05.github.io:~$ " + input.value);

    if (!cmds[cmd]) {
      await createText(`${cmd}: command not found`, 'error');
    }
    else cmds[cmd](...values.slice(1));

    refreshInput();
  };

  createText("Hadi's Web Shell");
  createText("v1.0 2026-11-15");

  cmds['help']();
}();