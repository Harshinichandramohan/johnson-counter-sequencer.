const eventMap = {
  "0000": "Traffic system ready",
  "1000": "Red light ON - Stop",
  "1100": "Red + Yellow - Prepare",
  "1110": "Green light ON - Go",
  "1111": "Green + Pedestrian crossing",
  "0111": "Green light OFF",
  "0011": "Yellow light ON - Slow down",
  "0001": "Red light ON - Cycle reset"
};

const validStates = Object.keys(eventMap);
let state = "0000";
let clock = 0;
let trace = [];

function nextState(value) {
  return `${1 - Number(value[3])}${value.slice(0, 3)}`;
}

function render() {
  const valid = Object.hasOwn(eventMap, state);

  document.querySelector("#state").textContent = state;

  document.querySelector("#feedback").textContent =
    1 - Number(state[3]);

  document.querySelector("#event").textContent =
    eventMap[state] || "FAULT: illegal state";

  const status = document.querySelector("#status");

  status.textContent = valid ? "VALID" : "FAULT DETECTED";
  status.className = valid ? "pass" : "fault";

  document.querySelector("#statePath").innerHTML =
    validStates
      .map(
        s =>
          `<span class="state-node ${s === state ? "current" : ""}">${s}</span>`
      )
      .join("") +
    (valid ? "" : `<span class="state-node invalid">${state}</span>`);

  document.querySelector("#traceBody").innerHTML =
    trace
      .map(
        row =>
          `<tr>
            <td>${row.clock}</td>
            <td>${row.state}</td>
            <td>${row.feedback}</td>
            <td>${row.next}</td>
            <td>${row.event}</td>
            <td class="${row.valid ? "pass" : "fault"}">
              ${row.valid ? "VALID" : "FAULT"}
            </td>
          </tr>`
      )
      .reverse()
      .join("");
}

function step(injectFault = false) {
  const current = state;
  const feedback = 1 - Number(current[3]);

  let next = nextState(current);

  if (injectFault) {
    next = `${next.slice(0, 3)}${1 - Number(next[3])}`;
  }

  trace.push({
    clock: clock,
    state: current,
    feedback: feedback,
    next: next,
    event: eventMap[current] || "FAULT: illegal state",
    valid: Object.hasOwn(eventMap, current)
  });

  state = next;
  clock += 1;

  render();
}

document.querySelector("#stepButton").onclick = () => step();

document.querySelector("#faultButton").onclick = () => step(true);

document.querySelector("#runButton").onclick = () => {
  for (let i = 0; i < 8; i++) {
    step();
  }
};

document.querySelector("#resetButton").onclick = () => {
  state = "0000";
  clock = 0;
  trace = [];
  render();
};

render();