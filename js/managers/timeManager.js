// timeManager.js

export function _rand(min, max) {
    if (min === 0 && max === 1) {
        return Math.random() >= 0.5 ? 1 : 0;
    }
    return Math.floor(Math.random() * (max - min)) + min;
}

export function _removeItem(array, value) {
    const index = array.indexOf(value);
    if (index > -1) { // only splice array when item is found
        array.splice(index, 1); // 2nd parameter means remove one item only
    }
}

export function _getTicks(s) {
    // base tick is 5000 ms but there needs to be jitter so not everything is run at the same time thus preventing waves of visitors
    if (_rand(0, 1) === 0) {
        return 500 * s - _rand(0, 75);
    }
    return 500 * s + _rand(0, 75);
}

export function _between(num, min, max) {
    return num >= min && num <= max;
}

export const activeIntervals = new Map();
export class TimeManager {
    constructor() {
        this._nextId = 1;
        this._intervals = new Map(); // id → { timer, runs, maxRuns, fn, delay }
        this._timeouts  = new Map(); // id → { timer, fn }
    }

    // schedule an interval; options.maxRuns will auto-clear after that many calls
    setInterval(fn, delay, options = {}) {
        const id = this._nextId++;
        const meta = {
            fn,
            delay,
            runs: 0,
            maxRuns: options.maxRuns ?? Infinity,   // ?? basically sets default --> if left is falsy (that includes "" null or undefined and more but not important) then give right
            timer: null
        };
        const wrapped = () => {
            // stops interval if there is a limit of repeats
            meta.runs++;
            fn();
            if (meta.runs >= meta.maxRuns) {
                this.clearInterval(id);
            }
        };
        meta.timer = setInterval(wrapped, delay);
        this._intervals.set(id, meta);
        return id;
    }

    clearInterval(id) {
        const meta = this._intervals.get(id);
        if (meta) {
            clearInterval(meta.timer);
            this._intervals.delete(id);
        }
    }

    // schedule a one‑off timeout
    setTimeout(fn, delay) {
        const id = this._nextId++;
        const timer = setTimeout(() => {
            fn();
            this._timeouts.delete(id);
        }, delay);
        this._timeouts.set(id, { timer, fn });
        return id;
    }

    clearTimeout(id) {
        const meta = this._timeouts.get(id);
        if (meta) {
            clearTimeout(meta.timer);
            this._timeouts.delete(id);
        }
    }

    // clear everything
    clearAll() {
        for (let id of this._intervals.keys()) this.clearInterval(id);
        for (let id of this._timeouts.keys())  this.clearTimeout(id);
    }
}
