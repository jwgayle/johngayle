/**
 * ...
 * @author Richard Huntley
 */

$.widget( "ui.hbp_slider", $.ui.slider,
    {

        _create: function()
        {
            var show = true;
            if( this.options.showCallout != undefined ) show = this.options.showCallout;
            var s = this.options.valueWidth;
            var callout_class = "slider_callout" + s;
            //add the necessary styles - only add if doesn't already exist
            if( $("style:contains('shadowed')").length < 1 )
                $("<style type='text/css'>.shadowed { -moz-box-shadow: 0px 3px 3px #CCC; -webkit-box-shadow: 0px 3px 3px #CCC; box-shadow: 0px 3px 3px #CCC; } </style>").appendTo("head");

            if( $("style:contains('ui-slider-horizontal')").length < 1 )
                $("<style type='text/css'>.ui-slider-horizontal { height: 6px; background-color:#eee; border-color:#aaa  } </style>").appendTo("head");
            if( $("style:contains('.ui-slider-horizontal .ui-state-default')").length < 1 )
                $("<style type='text/css'>.ui-slider-horizontal .ui-state-default { width: 35px; height: 36px; background: url('assets/slider_handle.png') no-repeat scroll 50% 50%; position: absolute; top: -15px; margin-left:-17px; border-style: none; } </style>").appendTo("head");

            if( $("style:contains('slider_text')").length < 1 )
                $("<style type='text/css'>.slider_text { font-family: 'Arial'; color: #666; font-size: 10; position:absolute } </style>").appendTo("head");
            if( $("style:contains('slider_min')").length < 1 )
                $("<style type='text/css'>.slider_min { margin-top: 15px; left:0px; color: #999 } </style>").appendTo("head");
                //$("<style type='text/css'>.slider_min { margin-top: -7px; left:-50px; color: #999; text-align: right; width: 30px;  } </style>").appendTo("head");

            if( $("style:contains('slider_max')").length < 1 )
                $("<style type='text/css'>.slider_max { margin-top: 15px; right:0px; color: #999 } </style>").appendTo("head");
            if( $("style:contains('" + callout_class + "')").length < 1 )
                $("<style type='text/css'>." + callout_class + " { width: " + s + "px; margin-left: -" + Math.floor(s/2) + "px; position: absolute; top: -30px; height:16px; text-align: center; left:0px; color:#5A5A4B; font-weight:bold; font-family: Arial; font-size: 9pt; } </style>").appendTo("head");

            //add the minimun, maximum and callout div's
            this.prefix = this.options.valuePrefix?this.options.valuePrefix:'';
            this.suffix = this.options.valueSuffix?this.options.valueSuffix:'';
            this.minDisplay = $("<div class='slider_text slider_min'>" + this.options.minText + "</div>")
            this.maxDisplay = $("<div class='slider_text slider_max'>" + this.options.maxText + "</div>")
            this.element.append( this.minDisplay );
            this.element.append( this.maxDisplay );
            if( show )
            {
//                this.valueDisplay = $("<div class='slider_text " + callout_class + " shadowed'>" + this.prefix + $.format.number( this.options.value, this.options.valueFormat ) + this.suffix + "</div>")
                this.valueDisplay = $("<div class='slider_text " + callout_class + "'>" + this.prefix + $.format.number( this.options.value, this.options.valueFormat ) + this.suffix + "</div>")
                this.element.append( this.valueDisplay );
            }

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
            if( show ) this.valueDisplay.css( 'left', handle[0].style.left);

            return result;
        },

        _slide: function( event, index, newVal )
        {
            //custom code here
            if( this.options.showCallout == undefined || this.options.showCallout )
            {
                var handle = $(this.handles[ index ]);
                this.valueDisplay.text( this.prefix + $.format.number( newVal , this.options.valueFormat ) + this.suffix );
                this.valueDisplay.css( 'left', handle[0].style.left );
            }
            return $.ui.slider.prototype._slide.apply( this, arguments );
        },

        _stop: function( event, index )
        {
            //custom code here
            if( this.options.showCallout == undefined || this.options.showCallout )
            {
                var handle = $(this.handles[ index ]);
                this.valueDisplay.text( this.prefix + $.format.number( this.value(), this.options.valueFormat ) + this.suffix );
                this.valueDisplay.css( 'left', handle[0].style.left );
            }

            return $.ui.slider.prototype._stop.apply( this, arguments );
        },
        _setOption: function( key, value )
        {
            $.ui.slider.prototype._setOption.apply( this, arguments );

            switch ( key )
            {
                case "min":
                    this.minDisplay.text( '$' + $.format.number( value, this.options.valueFormat ) );
                    break;
                case "max":
                    this.maxDisplay.text( '$' + $.format.number( value, this.options.valueFormat ) );
                    break;
            }
        },
        _refreshValue: function()
        {
            $.ui.slider.prototype._refreshValue.apply( this, arguments );
            if( this.options.showCallout == undefined || this.options.showCallout )
            {
                var handle = $(this.handles[ 0 ]);
                this.valueDisplay.text( this.prefix + $.format.number( this.value(), this.options.valueFormat ) + this.suffix );
                this.valueDisplay.css( 'left', handle[0].style.left );
            }
        }
    }
);	
	
	
