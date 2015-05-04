/**
 * ...
 * @author Richard Huntley
 */

$.widget( "ui.hbp_slider", $.ui.slider, 
	{

		_create: function()
		{
            var s = this.options.valueWidth;
            this.showValue = (this.options.showValue != undefined && !this.options.showValue)?false:true;
            this.sliderMax = (this.options.sliderMax != undefined)?this.options.sliderMax : this.options.max;

            var callout_class = "slider_callout" + s;
            //add the necessary styles - only add if doesn't already exist
            if( $("style:contains('ui-slider-horizontal')").length < 1 )
                $("<style type='text/css'>.ui-slider-horizontal { height: 6px; background-color:#eee; border-color:#aaa  } </style>").appendTo("head");
            if( $("style:contains('.ui-slider-horizontal .ui-state-default')").length < 1 )
                $("<style type='text/css'>.ui-slider-horizontal .ui-state-default { width: 35px; height: 36px; background: url('assets/slider_handle.png') no-repeat scroll 50% 50%; position: absolute; top: -15px; margin-left:-17px; border-style: none; } </style>").appendTo("head");

            if( $("style:contains('slider_text')").length < 1 )
                $("<style type='text/css'>.slider_text { font-family: 'Arial'; color: #FFFFFF; font-size: 10; position:absolute } </style>").appendTo("head");
            if( $("style:contains('slider_min')").length < 1 )
                $("<style type='text/css'>.slider_min { margin-top: 15px; left:0px; color: #58574b } </style>").appendTo("head");
            if( $("style:contains('slider_max')").length < 1 )
                $("<style type='text/css'>.slider_max { margin-top: 15px; right:0px; color: #58574b } </style>").appendTo("head");
            if( $("style:contains('" + callout_class + "')").length < 1 )
                //$("<style type='text/css'>." + callout_class + " { width: " + s + "px; margin-left: -" + Math.floor(s/2) + "px; position: absolute; top: -30px; text-align: center;  -moz-border-radius: 6px; border-radius: 6px; background:#EEE; left:0px  } </style>").appendTo("head");
                $("<style type='text/css'>." + callout_class + " { width: " + s + "px; margin-left: -" + Math.floor(s/2) + "px; position: absolute; top: 22px; height:16px; text-align: center;  -moz-border-radius: 6px; border-radius: 6px; background:#58574b; left:0px; color:#FFFFFF; font-weight:bold; font-family: Arial; font-size: 9pt; } </style>").appendTo("head");

            //add the minimun, maximum and callout div's
            this.prefix = this.options.valuePrefix?this.options.valuePrefix:'';
            this.suffix = this.options.valueSuffix?this.options.valueSuffix:'';
            this.minDisplay = $("<div class='slider_text slider_min'>" + this.options.minText + "</div>")
            this.maxDisplay = $("<div class='slider_text slider_max'>" + this.options.maxText + "</div>")
            this.valueDisplay = $("<div class='slider_text " + callout_class + "'>" + this.prefix + $.format.number( Math.abs(this.options.value), this.options.valueFormat ) + this.suffix + "</div>")
			this.element.append( this.minDisplay );
			this.element.append( this.maxDisplay );
			if( this.showValue ) this.element.append( this.valueDisplay );
			
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
            if( newVal > this.sliderMax )
            {
                $.ui.slider.prototype._slide.apply( this, [event, index, this.sliderMax] );
                return;
            }

			//custom code here
            if( this.showValue )
            {
                var handle = $(this.handles[ index ]);
                this.valueDisplay.text( this.prefix + $.format.number( Math.abs(newVal), this.options.valueFormat ) + this.suffix );
                //var pos = parseInt( handle[0].style.left ); //see comment above
                this.valueDisplay.css( 'left', handle[0].style.left );
            }
			
			return $.ui.slider.prototype._slide.apply( this, arguments );
		},

		_stop: function( event, index )
		{
			//custom code here
            if( this.showValue )
            {
                var handle = $(this.handles[ index ]);
                this.valueDisplay.text( this.prefix + $.format.number( Math.abs(this.value()), this.options.valueFormat ) + this.suffix );
                //var pos = parseInt( handle[0].style.left );
                this.valueDisplay.css( 'left', handle[0].style.left );
            }
			return $.ui.slider.prototype._stop.apply( this, arguments );
		},

        _setOption: function( key, value )
        {
            $.ui.slider.prototype._setOption.apply( this, arguments );

            switch ( key ) {
                case "min":
                    this.minDisplay.text( '$' + $.format.number( value, this.options.valueFormat ) );
                    break;
                case "max":
                    this.maxDisplay.text( '$' + $.format.number( value, this.options.valueFormat ) );
                    break;
                case "sliderMax":
                    this.sliderMax = value;
                    break;
            }
        },
        _refreshValue: function()
        {
            $.ui.slider.prototype._refreshValue.apply( this, arguments );
            if( this.showValue )
            {
                var handle = $(this.handles[ 0 ]);
                this.valueDisplay.text( '$' + $.format.number( this.value(), this.options.valueFormat ) );
                this.valueDisplay.css( 'left', handle[0].style.left );
            }
        }
    }
);	
	
	
