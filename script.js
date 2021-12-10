const Cam = document.getElementById("Cam");
const video = document.querySelector("#Webcam");
const Switch = document.querySelector("#btn");

const widthmax = 2000;
const heightmax = 500;
const LVoffset = 0;
const LVratio = 1;

var SwitchState = 0;
var children = [];

cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
});

function LVadjust(x) {
  res = parseInt((x + LVoffset) * LVratio);
  if (res < 0) res = 0;
  if (res > widthmax) res = widthmax;

  return res;
}
//prediction:
function predictWebcam() {
  model.detect(video).then(function (predictions) {
    for (let i = 0; i < children.length; i++) {
      Cam.removeChild(children[i]);
    }

    children.splice(0);

    for (let n = 0; n < predictions.length; n++) {
      if (predictions[n].score > 0.66) {
        const p = document.createElement("p");
        p.innerText =
          predictions[n].class +
          " - with " +
          Math.round(parseFloat(predictions[n].score) * 100) +
          "% confidence.";
        p.style =
          "margin-left: " +
          predictions[n].bbox[0] +
          "px; margin-top: " +
          LVadjust(predictions[n].bbox[1] - 10) +
          "px; width: " +
          LVadjust(predictions[n].bbox[2] - 10) +
          "px; top: 0; left: 0;";

        const highlighter = document.createElement("div");
        highlighter.setAttribute("class", "highlighter");
        highlighter.style =
          "left: " +
          LVadjust(predictions[n].bbox[0]) +
          "px; top: " +
          LVadjust(predictions[n].bbox[1]) +
          "px; width: " +
          LVadjust(predictions[n].bbox[2]) +
          "px; height: " +
          LVadjust(predictions[n].bbox[3]) +
          "px;";

        Cam.appendChild(highlighter);
        Cam.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }

    window.requestAnimationFrame(predictWebcam);
  });
}

Switch.addEventListener("click", function (event) {
  if (SwitchState == 0) {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
          video.srcObject = stream;
        })
        .catch(function (err0r) {
          alert("Something went wrong!");
        });

      Switch.style.backgroundColor = "red";
      SwitchState = 1;

      video.addEventListener("loadeddata", predictWebcam);
    }
  } else {
    for (let i = 0; i < children.length; i++) {
      Cam.removeChild(children[i]);
    }
    children.splice(0);

    Switch.style.backgroundColor = "green";
    SwitchState = 0;
  }
  video.srcObject = null;
});
