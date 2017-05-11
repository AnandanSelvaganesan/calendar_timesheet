/*!
 * TimeSheet v1.0.0
 * Docs & License: https://github.com/AnandanSelvaganesan
 * (c) 2017 Anandan Selvaganesan
 */


(function($) {

	//I recommend this
    'use strict';
    
	$.fn.timeSheet = function( options ) {

		// Establish our default settings
		var settings = $.extend({
			text         : 'Hello, World!',
			color        : null,
			fontStyle    : null,
			complete	 : null
		}, options);

		return this.each( function() {
			$(this).text( settings.text );

			if ( settings.color ) {
				$(this).css( 'color', settings.color );
			}

			if ( settings.fontStyle ) {
				$(this).css( 'font-style', settings.fontStyle );
			}

			if ( $.isFunction( settings.complete ) ) {
				settings.complete.call(this);
			}
			
			
			
		});

	};

}(jQuery));

