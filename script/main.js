const app = document.querySelector("#app");
const delay = ms => new Promise(res => setTimeout(res, ms));
    
    
app.addEventListener("keypress", async function(event){
  if(event.key === "Enter"){
    await delay(150);
   getInputValue();
   
    removeInput();
    await delay(150);
    new_line();
  }
});

app.addEventListener("click", function(event){
  const input = document.querySelector("input");
  input.focus();
})


async function open_terminal(){
  createText("Welcome");
  await delay(700);
  createText("Booting...");
  await delay(1500);
  createText("You can run several commands:");
 
  createCode("about me", "Learn more about me.");
  createCode("projects", "Check out my projects.");
  createCode("contact", "Get in touch with me.");
  createCode("resume -d", "Download my resume.");
  createCode("all", "See all commands.");

  await delay(500);
  new_line();
}


function new_line(){
  
  const p = document.createElement("p");
  p.setAttribute("class", "path")
  p.textContent = "user@h-shaheryar:~$";
  app.appendChild(p);
  const div = document.createElement("div");
  div.setAttribute("class", "type")
  const input = document.createElement("input");
  div.appendChild(p);
  div.appendChild(input);
  app.appendChild(div);
  input.focus();
}

function removeInput(){
  const div = document.querySelector(".type");
  app.removeChild(div);
}

async function getInputValue(){
  
  const value = document.querySelector("input").value;
  if(value === "all"){
    trueValue(value);
    
    createCode("about me", "Learn more about me.");
    createCode("projects", "Check out my projects.");
    createCode("contact", "Get in touch with me.");
    createCode("resume -d", "Download my resume.");
    createCode("clear", "Clear the terminal.");
    
  }
  else if(value === "projects"){
    trueValue(value);
    createText("<a href='https://github.com/HadiS05'>Click here to view my GitHub.</a>")
  }
  else if(value === "about me"){
    trueValue(value);
    createText("Name: Hadi Shaheryar");
    createText("Location: Ontario, Canada");
    createText("Education: McMaster University, Honours Computer Science, 2023-2027");
    createText("Awards: McMaster Award of Excellence, Dean's Honour List, McMaster EMBER Hackathon Winner");
    const p = document.createElement("hr");
    app.appendChild(p);
    createText("Technical Skills");
    createText("<i>Proficient Languages</i>: Python, Java, C, Elm");
    createText("<i>Familiar Languages</i>: Javascript, Flutter/Dart, SQL");
    createText("<i>Frameworks</i>: Flask, Node.js, Kivy, JUnit, Bootstrap");
    createText("<i>Hobbies</i>: Poetry, History, Philosophy, Literature, Movies, European Football, Cricket, Video Games")
  }
  else if(value === "resume -d"){
    trueValue(value);
    createText("Downloading resume...");
    const url = "./assets/Hadi_Shaheryar_Resume.pdf";
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  else if(value === "resume"){
    trueValue(value);
    createText("Did you mean 'resume -d'?");
  }
  else if(value === "clear"){
    document.querySelectorAll("p").forEach(e => e.parentNode.removeChild(e));
    document.querySelectorAll("hr").forEach(e => e.parentNode.removeChild(e));
    document.querySelectorAll("section").forEach(e => e.parentNode.removeChild(e));
  } else if(value === "contact"){
    trueValue(value);
    createText("You can contact me at <a href='mailto:haditutoring@gmail.com'>haditutoring@gmail.com<a/>");
    createText("Or reach out to me on <a href='https://www.linkedin.com/in/hadi-shaheryar'>LinkedIn</a>");
  }
  else{
    falseValue(value);
    createText(`command not found: ${value}`)
  }
}

function trueValue(value){
  const div = document.createElement("section");
  div.setAttribute("class", "type2")
  const previouscommand = document.createElement("p");
  previouscommand.setAttribute("class", "success")
  previouscommand.textContent = `user@h-shaheryar:~$ ${value}`;
  div.appendChild(previouscommand);
  app.appendChild(div);
}

function falseValue(value){
    const div = document.createElement("section");
    div.setAttribute("class", "type2")
    const previouscommand = document.createElement("p");
    previouscommand.setAttribute("class", "error")
    previouscommand.textContent = `user@h-shaheryar:~$ ${value}`;
    div.appendChild(previouscommand);
    app.appendChild(div);
}

function createText(text, classname){
  const p = document.createElement("p");
  p.innerHTML = text;
  app.appendChild(p);
}

function createCode(code, text){
  const p = document.createElement("p");
  p.setAttribute("class", "code");
  p.innerHTML =`${code} <br/><span class='text'> ${text} </span>`;
  app.appendChild(p);
}

open_terminal();