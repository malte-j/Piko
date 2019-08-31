const LZString = require('lz-string')
const textarea = document.querySelector("textarea")

const app = {
  toExec: null,
  save: () => {
    // reset time since last function call
    clearTimeout(this.toExec)

    // start new function to be executed
    this.toExec = setTimeout(()=>{
      if (textarea.value == '') {
        history.replaceState({}, "Malteditor", `/`);
      } else {
        let text = LZString.compressToEncodedURIComponent(textarea.value) 
        history.replaceState({}, "Malteditor", `?text=${text}`);
      }
    }, 800)
  },
  load: () => {
    let text = document.location.search.split('=')[1]
    if (text) {
      text = LZString.decompressFromEncodedURIComponent(text)
    } else {
      text = ''
    }
    textarea.value = text
    textarea.focus()

  },
  resize: () => {
    // resize input 
    textarea.style.height = "";
    textarea.style.height = textarea.scrollHeight + "px";
  },
  onInput: () => {
    app.resize()
    app.save()
  },
}


textarea.oninput = app.onInput
window.onload = app.load()
window.onresize = app.resize