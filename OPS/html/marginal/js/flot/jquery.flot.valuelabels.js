/**
 * Value Labels Plugin for flot.
 * http://leonardoeloy.github.com/flot-valuelabels
 * http://wiki.github.com/leonardoeloy/flot-valuelabels/
 *
 * Using canvas.fillText instead of divs, which is better for printing - by Leonardo Eloy, March 2010.
 * Tested with Flot 0.6 and JQuery 1.3.2.
 *
 * Original homepage: http://sites.google.com/site/petrsstuff/projects/flotvallab
 * Released under the MIT license by Petr Blahos, December 2009.
 */
(function ($) {
    var options = {
        valueLabels: {
	    show: false,
            showAsHtml: false, // Set to true if you wanna switch back to DIV usage (you need plot.css for this)
            showLastValue: false, // Use this to show the label only for the last value in the series
            showTotal: false // Use this to show the label only for the last value in the series
        }
    };
    
    function init(plot) 
	{
        plot.hooks.draw.push(function (plot, ctx) 
		{
			if (!plot.getOptions().valueLabels.show) return;
				
				var showLastValue = plot.getOptions().valueLabels.showLastValue;
				var showAsHtml = plot.getOptions().valueLabels.showAsHtml;
				var showTotal = plot.getOptions().valueLabels.showTotal;
            //var opts = plot.getOptions().series.bars;
            //for( var o in opts ) console.log( "options[ " + o + " ] = " + opts[o]);
                var barWidth = plot.getOptions().series.bars.barWidth;
				var ctx = plot.getCanvas().getContext("2d");
				var lastYPos = [-1000, -1000, -1000, -1000, -1000, -1000, -1000];
				var total = [];
				var lastSeries;
			$.each(plot.getData(), function(ii, series) 
			{
						// Workaround, since Flot doesn't set this value anymore
						series.seriesIndex = ii;
						lastSeries = series;
				if (showAsHtml) plot.getPlaceholder().find("#valueLabels"+ii).remove();
				var html = '<div id="valueLabels' + series.seriesIndex + '" class="valueLabels">';
						
				var last_val = null;
				var last_x = -1000;
				var last_y = -1000;
				
				var points = series.datapoints.points;
				var ps = series.datapoints.pointsize;
				for (var i = 0; i < series.data.length; ++i)
				{
					if (series.data[i] == null || (showLastValue && i != series.data.length-1))  continue;
		
					var x = series.data[i][0];
					//var y = series.data[i][1];
					//var val = series.data[i][1];
					var val = series.data[i][1] * barWidth;
                    //console.log("series.data[i][0] = " + series.data[i][0]);
                    //console.log("barWidth = " + barWidth);
                    //console.log("ii = " + ii + ", val = " + val);

					if( total[i] == null ) total[i] = [x,0];
					if( val != null ) total[ i ][1] += val;
                    var label = (ii == 0 )?"Cost: ":"Profit: ";
                    var suffix = "";
                    if( ii == 1 )
                    {
                        suffix = series.suffix;
                    }
					
					var y = Math.ceil((points[ i*ps + 1 ] + points[ i*ps + 2 ])/2);
                    //console.log("points[ i*ps + 1 ] = " + (points[ i*ps + 1 ]) + ", points[ i*ps + 2 ] = " + (points[ i*ps + 2 ]) + ", y = " + y );
					//var x = series.data[i][0], y = series.datapoints.points[i];
					if (x < series.xaxis.min || x > series.xaxis.max || y < series.yaxis.min || y > series.yaxis.max)  continue;
					//var val = y;
		
					//if (series.valueLabelFunc) val = series.valueLabelFunc({ series: series, seriesIndex: ii, index: i });
					//val = (val == 0)?(""):("$" + $.format.number(val, "#,###,###"));
//					val = (val == 0 || val == null)?(""):( "$" + $.format.number(val, "0.00"));
					val = (val == null)?(""):( "$" + $.format.number(val, "0.00"));
                    //console.log("val = " + val);

					if (val!=last_val || i==series.data.length-1) 
					{
						//var xx = series.xaxis.p2c(x) + plot.getPlotOffset().left - Math.round(val.length/2)*5;
						//var xx = series.xaxis.p2c(x - 0.5) + plot.getPlotOffset().left;
						var xx = Math.round(series.xaxis.p2c(barWidth + 0.5) + plot.getPlotOffset().left);
						//var yy = series.yaxis.p2c(y)-12+plot.getPlotOffset().top;
						var yy = Math.round(series.yaxis.p2c(y) + plot.getPlotOffset().top - 8);
						//console.log("yy = " + yy + ", last_y = " + last_y + ", val = " + val + ", lastYPos["+i+"] = " + lastYPos[i]);
                        //make sure that there is enough space between this value label and the last so that they don't overlap
						if( lastYPos[i] && Math.abs(yy - lastYPos[i]) < 24 ) yy = lastYPos[i] - 26;
						if (Math.abs(yy-last_y) > 20 || last_x < xx) 
						{
							last_val = val;
							last_x = xx + val.length*8;
							last_y = yy;
							lastYPos[i] = yy;

                            //RGH if label is not going to be displayed then don't use it to adjust next label
                            if( val == "" ) lastYPos[i] = false;
							
							if (!showAsHtml) 
							{
								// Little 5 px padding here helps the number to get
								// closer to points
								x_pos = xx;
								y_pos = yy+6;

								// If the value is on the top of the canvas, we need
								// to push it down a little
								if (yy <= 0) y_pos = 18;
								// The same happens with the x axis
								if (xx >= plot.width()) x_pos = plot.width();

								ctx.fillText(val, x_pos, y_pos);                
							} 
							else 
							{
								var width = 220;
								//var width = Math.floor(lastSeries.xaxis.p2c(1) - 20);
								//var head = '<div style="left:' + xx + 'px;top:' + yy + 'px;width:' + width + 'px;" class="valueLabel';
								//var head = '<div style="left:' + xx + 'px;top:' + yy + 'px;" class="valueLabel';
								//var tail = '">' + val + '</div>';
								//html+= head + "Light" + tail + head + tail;
								var clazz = "value" + ii;
								//var h = '<div style="left:' + xx + 'px;top:' + yy + 'px;width:' + width + 'px;background-color:' + series.labelColor + ';" class="valueLabel ' + clazz +'">' + label + val + suffix + '</div>';
								var h = '<div style="left:' + xx + 'px;top:' + yy + 'px;width:' + width + 'px;background-color:' + series.labelColor + ';" class="valueLabel ' + clazz +'"><table class="valueTable"><tr><td class="col1">' + label + '</td><td class="col2">' + val + '</td><td class="col3">' + suffix + '</td></tr></table></div>';
								//h += '<div style="left:' + xx + 'px;top:' + yy + 'px;" class="valueLabel">' + val + '</div>';
								html += h;
							}
						}
					}
				}
				if (showAsHtml) 
				{
					html+= "</div>";
					plot.getPlaceholder().append(html);
				}
			});
			if( showTotal )
			{
				//console.log("total = " + total);
				for (var i = 0; i < total.length; ++i) 
				{
					if (showAsHtml) plot.getPlaceholder().find("#valueLabelTotal"+i).remove();
					var html = '<div id="valueLabelTotal' + i + '" class="valueLabels">';
		
					var x = total[i][0];
					var y = total[i][1];
					var val = y;
                    y = y / barWidth;
		
					//val = (val == 0)?(""):("$" + $.format.number(val, "#,###,###"));
					val = (val == 0)?(""):( "$" + $.format.number(val, "0.00"));

					//var xx = lastSeries.xaxis.p2c(x-0.5) + plot.getPlotOffset().left;
                    var xx = Math.round(lastSeries.xaxis.p2c(barWidth + 0.5) + plot.getPlotOffset().left);
					var yy = lastSeries.yaxis.p2c(y) + plot.getPlotOffset().top - 18;
                    console.log("lasYPos = " + lastYPos);
                    if( lastYPos[0] && (Math.abs(yy - lastYPos[0]) < 24 || yy > lastYPos[0] ) ) yy = lastYPos[0] - 26;
					//var yy = lastSeries.yaxis.p2c(y/2) + plot.getPlotOffset().top - 18;

					if (!showAsHtml) 
					{
						// Little 5 px padding here helps the number to get
						// closer to points
						x_pos = xx;
						y_pos = yy+6;

						// If the value is on the top of the canvas, we need
						// to push it down a little
						if (yy <= 0) y_pos = 18;
						// The same happens with the x axis
						if (xx >= plot.width()) x_pos = plot.width();

						ctx.fillText(val, x_pos, y_pos);                
					} 
					else 
					{
						//var width = lastSeries.xaxis.p2c(1) + 20;
                        width = 220;//barWidth;
						//var head = '<div style="left:' + xx + 'px;top:' + yy + 'px;width:' + width + 'px;" class="valueLabelTotal';
						//var tail = '">' + val + '</div>';
						//var h = '<div style="left:' + (xx) + 'px;top:' + yy + 'px;width:' + width + 'px;" class="valueLabelTotal">Revenue: ' + val + '</div>';
						var h = '<div style="left:' + (xx) + 'px;top:' + yy + 'px;width:' + width + 'px;" class="valueLabelTotal"><table class="valueTable"><tr><td class="col1">Revenue:</td><td class="col2">' + val + '</td><td class="col3">&nbsp;</td></tr></table></div>';
						html += h;
						plot.getPlaceholder().append(html);
					}
				}
			}
			
        });
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'valueLabels',
        version: '1.1'
    });
})(jQuery);

