const LZString = require("lz-string");
const textarea = document.querySelector("textarea");

const app = {
  toExec: null,
  save: () => {
    // reset time since last function call
    clearTimeout(this.toExec);

    // start new function to be executed
    this.toExec = setTimeout(() => {
      let urlParams = new URLSearchParams(window.location.search);

      if (textarea.value == "") {
        urlParams.set("text", "");
      } else {
        let text = LZString.compressToEncodedURIComponent(textarea.value);
        urlParams.set("text", text);
      }

      history.replaceState({}, "Malteditor", "?" + urlParams.toString());
    }, 800);
  },
  load: () => {
    // Load dark mode from localStorage
    if (localStorage.getItem("darkMode") === "true") {
      document.querySelector("body").classList.add("dark");
    }

    let urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("font") == "monospace") {
      document.querySelector("body").classList.add("monospace");
    }

    // Load text from URL
    let text = urlParams.get("text");
    if (text) {
      text = LZString.decompressFromEncodedURIComponent(text);
    } else {
      text = "";
    }
    textarea.value = text;

    // @TODO: fix size on load
    // app.resize()

    textarea.focus();
    app.initResize();

    // setup event listener for tab
    textarea.addEventListener("keydown", app.handleTab);
  },
  initResize: () => {
    const textareaWrapper = document.querySelector(".grow-wrap");
    const textarea = textareaWrapper.querySelector("textarea");
    textareaWrapper.dataset.replicatedValue = textarea.value;

    textarea.addEventListener("input", () => {
      textareaWrapper.dataset.replicatedValue = textarea.value;
    });
  },
  // resize: () => {
  //   // resize input field
  //   const parent = document.querySelector('body');
  //   parent.clientHeight - parseFloat(getComputedStyle(parent).paddingTop) - parseFloat(getComputedStyle(parent).paddingTop)
  //   textarea.style.height = "";
  //   textarea.style.height = textarea.scrollHeight + "px";
  // },
  onInput: () => {
    // app.resize();
    app.save();
  },
  toggleDarkMode: () => {
    let toggled = document.querySelector("body").classList.toggle("dark");
    localStorage.setItem("darkMode", toggled);
  },
  toggleFullScreen: () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  },
  toggleFont: () => {
    let toggled = document.querySelector("body").classList.toggle("monospace");
    let urlParams = new URLSearchParams(window.location.search);

    if (toggled) {
      urlParams.set("font", "monospace");
    } else {
      urlParams.set("font", "serif");
    }
    history.replaceState({}, "Malteditor", "?" + urlParams.toString());
  },
  handleTab: (e) => {
    // Tab key?
    if (e.keyCode === 9) {
      e.preventDefault();

      // selection?
      if (textarea.selectionStart == textarea.selectionEnd) {
        // These single character operations are undoable
        if (!e.shiftKey) {
          document.execCommand("insertText", false, "  ");
        } else {
          var text = textarea.value;
          for (let i = 0; i < 2; i++)
            if (
              textarea.selectionStart > 0 &&
              text[textarea.selectionStart - 1] == " "
            )
              document.execCommand("delete");
        }
      } else {
        // Block indent/unindent trashes undo stack.
        // @TODO: refactor and use document.execCommand to delete
        // Select whole lines
        let selStart = textarea.selectionStart;
        let selEnd = textarea.selectionEnd;
        const text = textarea.value;

        while (selStart > 0 && text[selStart - 1] != "\n") selStart--;
        while (selEnd > 0 && text[selEnd - 1] != "\n" && selEnd < text.length)
          selEnd++;

        // Get selected text
        let lines = text.substr(selStart, selEnd - selStart).split("\n");

        // Insert tabs
        for (let i = 0; i < lines.length; i++) {
          // Don't indent last line if cursor at start of line
          if (i == lines.length - 1 && lines[i].length == 0) continue;

          // Tab or Shift+Tab?
          if (e.shiftKey) {
            if (lines[i].startsWith("  ")) lines[i] = lines[i].substr(2);
          } else {
            lines[i] = "  " + lines[i];
          }
        }

        lines = lines.join("\n");

        // Update the text area
        textarea.value = text.substr(0, selStart) + lines + text.substr(selEnd);
        textarea.selectionStart = selStart;
        textarea.selectionEnd = selStart + lines.length;
      }

      return false;
    }

    // enabled = true;
    return true;
  },
};

let interactables = [
  {
    el: ".darkSwitch",
    onclick: app.toggleDarkMode,
  },
  {
    el: ".toggleFullscreen",
    onclick: app.toggleFullScreen,
  },
  {
    el: ".switchFont",
    onclick: app.toggleFont,
  },
];

textarea.oninput = app.onInput;
window.onload = app.load();
window.onresize = app.resize;

interactables.map((i) =>
  document.querySelector(i.el).addEventListener("click", i.onclick)
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    const x = "sw.js";
    navigator.serviceWorker.register(x).then(
      function (registration) {
        // Registration was successful
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      function (err) {
        // registration failed :(
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}
