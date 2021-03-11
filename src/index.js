const LZString = require('lz-string')
const textarea = document.querySelector("textarea")

const app = {
  toExec: null,
  save: () => {
    // reset time since last function call
    clearTimeout(this.toExec)

    // start new function to be executed
    this.toExec = setTimeout(()=>{
      let urlParams = new URLSearchParams(window.location.search);

      if (textarea.value == '') {
        urlParams.set('text', '');
      } else {
        let text = LZString.compressToEncodedURIComponent(textarea.value) 
        urlParams.set('text', text);
      }

      history.replaceState({}, "Malteditor", '?' + urlParams.toString());
    }, 800)
  },
  load: () => {
    // Load dark mode from localStorage
    if(localStorage.getItem("darkMode") === "true") {
      document.querySelector("body").classList.add("dark")
    }

    let urlParams = new URLSearchParams(window.location.search);

    if(urlParams.get('font') == 'monospace') {
      document.querySelector('body').classList.add('monospace')
    }

    // Load text from URL
    let text = document.location.search.split('=')[1]
    if (text) {
      text = LZString.decompressFromEncodedURIComponent(text)
    } else {
      text = ''
    }
    textarea.value = text
    app.resize()
    textarea.focus()

    // setup event listener for tab
    textarea.addEventListener("keydown", app.handleTab)
  },
  resize: () => {
    // resize input field 
    const parent = document.querySelector('body');
    parent.clientHeight - parseFloat(getComputedStyle(parent).paddingTop) - parseFloat(getComputedStyle(parent).paddingTop)
    textarea.style.height = "";
    textarea.style.height = textarea.scrollHeight + "px";
  },
  onInput: () => {
    app.resize()
    app.save()
  },
  toggleDarkMode: () => {
    let toggled = document.querySelector("body").classList.toggle("dark")
    localStorage.setItem("darkMode", toggled)
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
    
    if(toggled) {
      urlParams.set('font', 'monospace');
    } else {
      urlParams.set('font', 'serif');
    }
    history.replaceState({}, "Malteditor", '?' + urlParams.toString());
  },
  handleTab: (e) => {
    console.log("tab")
    if(e.key === 'Tab') {
       if (textarea.selectionStart || textarea.selectionStart == '0') {
          var startPos = textarea.selectionStart;
          var endPos = textarea.selectionEnd;
          textarea.value = textarea.value.substring(0, startPos)
              + "  "
              + textarea.value.substring(endPos, textarea.value.length);
      } else {
        textarea.value += "  ";
      }
      e.preventDefault();
    }
  }
}

let interactables = [
  {
    el: ".darkSwitch",
    onclick: app.toggleDarkMode
  },
  {
    el: ".toggleFullscreen",
    onclick: app.toggleFullScreen
  },
  {
    el: ".switchFont",
    onclick: app.toggleFont
  }
]


textarea.oninput = app.onInput
window.onload = app.load()
window.onresize = app.resize

interactables.map(i => document.querySelector(i.el).addEventListener("click", i.onclick))

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    const x = "sw.js";
    navigator.serviceWorker.register(x)
    .then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}