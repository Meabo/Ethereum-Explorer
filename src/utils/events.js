const events = {};
const hOP = events.hasOwnProperty;

export default {
	subscribe(event, listener) {
		if (!hOP.call(events, event)) events[event] = [];
		const index = events[event].push(listener) - 1;
		return {
			remove() {
				delete events[event][index];
			}
		};
	},

	publish(event, args) {
		if (!hOP.call(events, event)) return;
		events[event].forEach((fn) => {
			fn(args);
		});
	}
};
