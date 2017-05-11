var FC = $.fullCalendar; // a reference to FullCalendar's root namespace
var View = FC.View;      // the class that all views must inherit from
var CustomView;          // our subclass

CustomView = View.extend({ // make a subclass of View

    initialize: function () {
        // called once when the view is instantiated, when the user switches to the view.
        // initialize member variables or do other setup tasks.
    },
    render: function () {
        // responsible for displaying the skeleton of the view within the already-defined
        // this.el, a jQuery element.
    	this.el = this.renderEl();
		this.applyOverflow();
    },
    setHeight: function (height, isAuto) {
        // responsible for adjusting the pixel-height of the view. if isAuto is true, the
        // view may be its natural height, and `height` becomes merely a suggestion.
    },
    renderEvents: function (events) {
        // reponsible for rendering the given Event Objects
        //console.dir(events);
    	
    	var bgEvents = [];
		var fgEvents = [];
		var i;

		for (i = 0; i < events.length; i++) {
			(isBgEvent(events[i]) ? bgEvents : fgEvents).push(events[i]);
		}

		this.segs = [].concat( // record all segs
			this.renderBgEvents(bgEvents),
			this.renderFgEvents(fgEvents)
		);
    },
    destroyEvents: function () {
        // responsible for undoing everything in renderEvents
    },
    renderSelection: function (range) {
        // accepts a {start,end} object made of Moments, and must render the selection
    },
    destroySelection: function () {
        // responsible for undoing everything in renderSelection
    }

});

// call this what you like, for this example it's just called 'custom'
FC.views.custom = CustomView; // register our class with the view system