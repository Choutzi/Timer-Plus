const currentTimer = document.getElementById("current_timer");
const currentName = document.getElementById("current_name");
const nextTimer = document.getElementById("next_timer");
const nextName = document.getElementById("next_name");
const pauseElement = document.getElementById("pause");
const paramBtn = document.getElementById("display_param");
const divTimer = document.getElementById("timer");
const divParam = document.getElementById("param");
const listVue = document.getElementById("list-actions");
let isPaused = true;
const listActions = new Array();
let idCollapseCount = 0;

/**
 * Une Action définie par son nom et son temps en secondes.
 * Une Action peut être composée de sous-actions
 */
class Action {
    constructor(name, time) {
        this.name = name;
        this.time = time;
        this.actions = new Array();
    }
    toString() { return `${this.name}` }
}

/**
 * Buffer d'une Action permettant de mettre à jour les objets graphique du timer
 */
class ActionTimer {
    constructor(action, parent) {
        this.action = action;
        this.parent = parent;
        this.currentIndex = 0;
    }

    /**
     * Lance le décompte de l'action ou des subActions
     */
    launch() {
        if (this.currentIndex < this.action.actions.length - 1) {
            let nxtChild = this.getNextChild();
            this.currentIndex++;
            new ActionTimer(nxtChild, this).launch();
        } else {
            currentName.innerText = this.action.name;
            let preced = this.parent;
            while (preced != null) {
                currentName.innerText = preced.action.name + " - " + currentName.innerText;
                preced = preced.parent;
            }
            if (this.parent != null) {
                let nextBrother = this.parent.getNextChild()
                if (nextBrother != null) {
                    nextName.innerText = nextBrother.name;
                    nextTimer.innerText = getTimer(nextBrother.time);
                } else {
                    nextName.innerText = this.parent.action.name;
                    nextTimer.innerText = getTimer(this.parent.action.time);
                }
            } else {
                nextName.innerText = "END";
                nextTimer.innerText = "";
            }
            this.launchInterval();
        }
    }

    /**
     * Lance le décompte et modifi les objets graphiques liés
     */
    launchInterval() {
        let temps = this.action.time;
        let interval = setInterval(() => {
            if (!isPaused) {
                currentTimer.innerText = getTimer(temps);
                if (temps <= 0) {
                    clearInterval(interval);
                    if (this.parent != null)
                        this.parent.launch();
                } else
                    temps = temps - 1;
            }
        }, 1000)
    }

    /**
     * Récupère le nextChild
     * @returns {Action} next child
     */
    getNextChild() { return this.action.actions[this.currentIndex] }
}

/**
 * Permet de formater des secondes au format HH:mm
 * @param {int} temps le temps en secondes 
 * @returns {String} de format HH:mm
 */
function getTimer(temps) {
    let minutes = parseInt(temps / 60, 10);
    let secondes = parseInt(temps % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    secondes = secondes < 10 ? "0" + secondes : secondes;

    return `${minutes}:${secondes}`;
}

/**
 * Met en pause ou reprend le décompte sélectionné
 */
function onPause() {
    isPaused = !isPaused;
    pauseElement.innerText = isPaused ? "Start" : "Pause";
}

/**
 * Charge la liste d'actions sélectionnable
 */
function loadListe() {
    listActions.forEach(action => listVue.appendChild(htmlAction(action)))
}

/**
 * Génère la partie graphique de modification des actions
 * @param {Action} action 
 * @returns {div} la div cotenant les input de modification de l'action et ses sub actions
 */
function htmlAction(action) {
    let div = document.createElement("div");
    div.setAttribute("class", "list-group-item");
    div.setAttribute("draggable", "true");
    let inputName = document.createElement("input");
    inputName.setAttribute("type", "text");
    inputName.value = action.name;
    let inputTime = document.createElement("input");
    inputTime.setAttribute("type", "time");
    inputTime.value = getTimer(action.time);
    div.appendChild(inputName);
    div.appendChild(inputTime);
    if (action.actions.length > 0) {
        let idCollapse = "collapse_" + `${idCollapseCount++}`;
        let btnCollapse = document.createElement("button");
        btnCollapse.setAttribute("class", "btn btn-primary");
        btnCollapse.setAttribute("type", "button");
        btnCollapse.setAttribute("data-bs-toggle", "collapse");
        btnCollapse.setAttribute("data-bs-target", "#" + idCollapse)
        btnCollapse.setAttribute("aria-expanded", "false");
        btnCollapse.setAttribute("aria-controls", idCollapse);
        btnCollapse.innerText = "\\/";
        let divCollapse = document.createElement("div");
        divCollapse.setAttribute("class", "collapse");
        divCollapse.setAttribute("id", idCollapse);
        let divCard = document.createElement("div");
        divCard.setAttribute("class", "card card-body")
        divCollapse.appendChild(divCard);

        div.appendChild(btnCollapse);
        div.appendChild(divCollapse);

        action.actions.forEach(subAction => divCard.appendChild(htmlAction(subAction)));
    }
    return div;
}

let pause = new Action("Pause", 5);
let pompes = new Action("Pompes", 10);
let cycle = new Action("Cycle", 0);
cycle.actions.push(pompes, pause, pompes, pause, pompes, pause);
pompes.actions.push(pause);
listActions.push(cycle, pompes);
loadListe();

new ActionTimer(cycle, null).launch();