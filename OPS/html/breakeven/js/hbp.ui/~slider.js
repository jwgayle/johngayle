/**
 * ...
 * @author Richard Huntley
 */

$.widget( "ui.hbp_slider", $.ui.slider, 
	{

		_create: function()
		{
			//add the necessary styles
			$("<style type='text/css'>.ui-slider-horizontal { height: 6px; background-color:#eee; border-color:#aaa  } </style>").appendTo("head");
			$("<style type='text/css'>.ui-slider-horizontal .ui-state-default { width: 35px; height: 36px; background: url('assets/slider_handle.png') no-repeat scroll 50% 50%; position: absolute; top: -15px; margin-left:-17px; border-style: none; } </style>").appendTo("head");
				
			$("<style type='text/css'>.slider_text { font-family: 'Verdana'; color: #999; font-size: 10; position:absolute } </style>").appendTo("head");
			$("<style type='text/css'>.slider_min { margin-top: 15px; left:0px } </style>").appendTo("head");
			$("<style type='text/css'>.slider_max { margin-top: 15px; right:0px } </style>").appendTo("head");
			$("<style type='text/css'>.slider_callout { width: " + this.options.valueWidth + "px; margin-left: -25px; position: absolute; top: -30px; text-align: center;  -moz-border-radius: 6px; border-radius: 6px; background:#EEE; left:0px  } </style>").appendTo("head");
				
			//add the minimun, maximum and callout div's
			this.minDisplay = $("<div class='slider_text slider_min'>" + this.options.minText + "</div>")
			this.maxDisplay = $("<div class='slider_text slider_max'>" + this.options.maxText + "</div>")
			this.valueDisplay = $("<div class='slider_text slider_callout'>$" + $.format.number( this.options.value, this.options.valueFormat ) + "</div>")
			this.element.append( this.minDisplay );
			this.element.append( this.maxDisplay );
			this.element.append( this.valueDisplay );
			
			//call the prototype _create method to set up the slider
			var result = $.ui.slider.prototype._create.apply( this, arguments );
			
			//now that the slider is set up we can adjust the valueDisplay
			/*
			jQuery issue:
			handle.css('left') returns a % amount in chrome but a pixel amount in firefox
			thus it can't be used so we need to resort to the native style.left method
			*/
			var handle = $(this.handles[ 0 ]);
			//var pos = parseInt(handle.css('left')); different result in firefox and chrome
			this.valueDisplay.css( 'left', handle[0].style.left);
			
			return result;
		},

		_slide: function( event, index, newVal )
		{
			//custom code here
			var handle = $(this.handles[ index ]);
			this.valueDisplay.text( "$" + $.format.number( newVal, this.options.valueFormat ) );
			//var pos = parseInt( handle[0].style.left ); //see comment above
			this.valueDisplay.css( 'left', handle[0].style.left );
			
			return $.ui.slider.prototype._slide.apply( this, arguments );
		},

		_stop: function( event, index )
		{
			//custom code here
			var handle = $(this.handles[ index ]);
			this.valueDisplay.text( "$" + $.format.number( this.value(), this.options.valueFormat ) );
			//var pos = parseInt( handle[0].style.left );
			this.valueDisplay.css( 'left', handle[0].style.left );
			
			return $.ui.slider.prototype._stop.apply( this, arguments );
		}
	}
);	
	
	
