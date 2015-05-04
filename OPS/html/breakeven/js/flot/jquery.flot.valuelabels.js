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
(function ($) 
{
    var options = {
        valueLabels: {
	    show: false,
            showAsHtml: false, // Set to true if you wanna switch back to DIV usage (you need plot.css for this)
            showLastValue: false, // Use this to show the label only for the last value in the series
			format:null, //RGH format the display
            prefix:''
        }
    };
    
    function init(plot) 
	{
        plot.hooks.draw.push(function (plot, ctx) 
		{
	    	if (!plot.getOptions().valueLabels.show) return;
            
            var showLastValue = plot.getOptions().valueLabels.showLastValue;
            var showAsHtml = plot.getOptions().valueLabels.showAsHtml;
            var format = plot.getOptions().valueLabels.format;
            var prefix = plot.getOptions().valueLabels.prefix;
            var maxDisplayY = plot.getOptions().yaxis.maxToDisplay;
            var minDisplayY = plot.getOptions().yaxis.minToDisplay;
            var ctx = plot.getCanvas().getContext("2d");
			$.each(plot.getData(), function(ii, series) 
			{
				// Workaround, since Flot doesn't set this value anymore
				series.seriesIndex = ii;
				if (showAsHtml) plot.getPlaceholder().find("#valueLabels"+ii).remove();
				var html = '<div id="valueLabels' + series.seriesIndex + '" class="valueLabels">';
						
				for (var i = 0; i < series.data.length; ++i)
				{
					if (series.data[i] == null || (showLastValue && i != series.data.length-1))  continue;
		
					var x = Math.round(series.data[i][0]*10)/10, y = Math.round(series.data[i][1]*100)/100;
					if (x < series.xaxis.min || x > series.xaxis.max)  continue;
					//var val = y;
                    var val = "";
                    if( y < 0 )
                    {
                        val = "&#8722;" + prefix + $.format.number( Math.abs(y), "#,###,###" );
                    }
                    else
                    {
                        val = prefix + $.format.number( y, "#,###,###" );
                    }
                    var xx = series.xaxis.p2c(x) + plot.getPlotOffset().left;

                    if( maxDisplayY && y > maxDisplayY )
                    {
                        var yy = series.yaxis.p2c(series.yaxis.max) + plot.getPlotOffset().top;

                        var div = '<div style="left:' + Math.round(xx - 35) + 'px;top:' + Math.round(yy) + 'px;text-align:center" class="valueLabel">' + val + '</div>';
                        //draw hash
                        ctx.fillStyle = '#E6E6DC';
                        ctx.beginPath();
                        ctx.moveTo(xx - 28, yy + 35);
                        ctx.lineTo(xx + 28, yy + 25);
                        ctx.lineTo(xx + 28, yy + 20);
                        ctx.lineTo(xx - 28, yy + 30);
                        ctx.closePath();
                        ctx.fill();
                        //draw parallel lines
                        ctx.strokeStyle = "#96968C";
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(xx - 30, yy + 35);
                        ctx.lineTo(xx + 30, yy + 25);
                        ctx.closePath();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(xx + 30, yy + 20);
                        ctx.lineTo(xx - 30, yy + 30);
                        ctx.closePath();
                        ctx.stroke();
                    }
                    else if( minDisplayY && y < minDisplayY )
                    {
                        var yy = series.yaxis.p2c(series.yaxis.min) + plot.getPlotOffset().top;

                        var div = '<div style="left:' + Math.round(xx - 35) + 'px;top:' + Math.round(yy - 17) + 'px;text-align:center" class="valueLabel">' + val + '</div>';
                        //draw hash
                        ctx.fillStyle = '#E6E6DC';
                        ctx.beginPath();
                        ctx.moveTo(xx + 28, yy - 35);
                        ctx.lineTo(xx - 28, yy - 25);
                        ctx.lineTo(xx - 28, yy - 20);
                        ctx.lineTo(xx + 28, yy - 30);
                        ctx.closePath();
                        ctx.fill();
                        //draw parallel lines
                        ctx.strokeStyle = "#96968C";
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(xx + 30, yy - 35);
                        ctx.lineTo(xx - 30, yy - 25);
                        ctx.closePath();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(xx - 30, yy - 20);
                        ctx.lineTo(xx + 30, yy - 30);
                        ctx.closePath();
                        ctx.stroke();
                    }
                    else
                    {
                        var yy = series.yaxis.p2c(y) + plot.getPlotOffset().top;

                        if( y < 0 ) var div = '<div style="left:' + Math.round(xx - 35) + 'px;top:' + Math.round(yy) + 'px;text-align:center" class="valueLabel">' + val + '</div>';
                        else var div = '<div style="left:' + Math.round(xx - 35) + 'px;top:' + Math.round(yy - 17) + 'px;text-align:center" class="valueLabel">' + val + '</div>';
                    }


                    html += div;
				}
						
				if (showAsHtml) 
				{
					html+= "</div>";
					plot.getPlaceholder().append(html);
				}
			});
        });
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'valueLabels',
        version: '1.1'
    });
})(jQuery);

