// JavaScript Document
var COLORS = ["#FAB441", "#9ACFD0", "#004469", "#b20022", "#6a8534"];
var BACK_CORRECT_COL = "#d7fea3";
var BACK_INCORRECT_COL = "#F4EAF4";
var TEXT_CORRECT_COL = "#578B29"; //"#CDC90F";
var TEXT_INCORRECT_COL = "#AA0532"; //"#af102a";


var MIN_X = 0.5;
var MAX_X = 3.5;
var MIN_Y = -700000;
var MAX_Y = 550000;
var MIN_X2 = 0.5;
var MAX_X2 = 2.5;
var MIN_Y2 = 0;
var MAX_Y2 = 22000;//110000;
var MAX_DISPLAY_Y2 = 20000;//110000;
var MAX_DISPLAY_Y = 500000;
var MIN_DISPLAY_Y = -650000;
var INIT_FIXED_COST = 1000;
var INIT_VARCOST = 10;
var INIT_REVENUE = 100;
var INIT_OUTPUT = 50;

var graph, graph2;
var varcost = INIT_VARCOST;
var fixedcost = INIT_FIXED_COST;
var revenue = INIT_REVENUE;
var output = INIT_OUTPUT;

var graph2Params =
{
	xaxis:
	{
        ticks:[[1,"Breakeven"], [2, "Actual Units Sold"]],
        tickLength:0,
		min:MIN_X2,
		max:MAX_X2,
		show:true,
		reserveSpace:true
	},
	yaxis: 
	{
		show:true,
		reserveSpace:true,
        min:MIN_Y2,
        max:MAX_Y2,
        maxToDisplay: MAX_DISPLAY_Y2,
        tickFormatter:graphYLabel2,
        labelWidth:35,
        axisLabel:"Units of Output",
		axisLabelUseCanvas: true,
		axisLabelFontFamily:'Arial, sans-serif',
		axisLabelFontSizePixels:12
	},
    series:
    {
        stack:false,
        bars: { show: true, barWidth: 0.8, align:"center", fill: 1 },
        lines: { show: false }
    },
	grid:
	{
		show:true,
        borderWidth: 1,
        backgroundColor: '#E6E6DC',
        color: '#5A5A4B',
		markingsLineWidth:1
	},
    valueLabels:
    {
        show: true,
        showAsHtml: true,
        showTotal: true,
        format: '##'
    }
	
}

var graphParams =
{
    xaxis:
    {
        ticks:[[1,"Revenue"], [2,"Cost"], [3,"Profit"]],
        tickLength:0,
        min:MIN_X,
        max:MAX_X,
        show:true,
        reserveSpace:true
    },
    yaxis:
    {
        show:true,
        tickFormatter:graphYLabel1,
        min:MIN_Y,
        max:MAX_Y,
        maxToDisplay: MAX_DISPLAY_Y,
        minToDisplay: MIN_DISPLAY_Y,
        reserveSpace:true,
        axisLabelUseCanvas: true,
        axisLabelFontFamily:'Arial, sans-serif',
        axisLabelFontSizePixels:14
    },
    series:
    {
        stack:false,
        bars: { show: true, barWidth: 0.8, align:"center", fill: 1 },
        lines: { show: false }
    },
    grid:
    {
        show:true,
        borderWidth: 0,
        backgroundColor: '#E6E6DC',
        color: '#5A5A4B',
        /*backgroundColor: '#e4e4dd',*//*'#fff'*//*
        border:null,*/
        markingsLineWidth:2,
        markings:[{ color: '#5A5A4B', lineWidth: 2, yaxis: { from: 0, to: 0 } }]
    },
    valueLabels:
    {
        show: true,
        showAsHtml: true,
        showTotal: true,
        format: '##',
        prefix: '$'
    }

}

function graphYLabel1( val )
{
    //if( val == 0 ) return "Break-even<br/>quantity";
    if( val < 0 ) return "$(" + $.format.number( -val, "#,###,###") + ")";
    return "$" + $.format.number( val, "#,###,###");
}
function graphYLabel2( val )
{
    if( val < 0 ) return "(" + $.format.number( -val, "#,###,###") + ")";
    return $.format.number( val, "#,###,###");
}

$(document).ready( function() 
{
	$( "#outputSlider" ).hbp_slider( {min:0, max:5000, step:5, value:output, slide:onOutputChange, stop:onOutputChange, minText:'0', maxText:'5,000', valueFormat:'#,###', valueWidth:60});
	$( "#varcostSlider" ).hbp_slider( {min:0, max:500, step:1, value:varcost, slide:onVarcostChange, stop:onVarcostChange, minText:'$0', maxText:'$500', valueFormat:'#', valueWidth:40, valuePrefix:"$"});
	$( "#revenueSlider" ).hbp_slider( {min:0, max:500, step:1, value:revenue, slide:onRevenueChange, stop:onRevenueChange, minText:'$0', maxText:'$500', valueFormat:'#', valueWidth:40, valuePrefix:"$"});
	$( "#fixedcostSlider" ).hbp_slider( {min:0, max:100000, step:50, value:fixedcost, slide:onFixedcostChange, stop:onFixedcostChange, minText:'$0', maxText:'$100,000', valueFormat:'#,###,###', valueWidth:60, valuePrefix:"$"});

	initGraph( );
});

function onOutputChange( event, ui )
{
	output = ui.value;
	updateGraph(  );
}

function onFixedcostChange( event, ui )
{
	fixedcost = ui.value;
	updateGraph(  );
}

function onVarcostChange( event, ui )
{
	varcost = ui.value;

	updateGraph(  );
}

function onRevenueChange( event, ui )
{
	revenue = ui.value;
	updateGraph(  );
}

function initGraph(  )
{
    var totalRevenue = output * revenue;
    var totalCost = -1 * (output * varcost + fixedcost);
    var totalProfit = totalRevenue + totalCost;

    var beq = "<font color='#b20022'>none</font>";
    var beqVal = 0;
    if( revenue > varcost )
    {
        beqVal = Math.ceil(fixedcost/(revenue - varcost))
        beq = $.format.number( beqVal, "#,###,###" ) + " units";
    }
    var txt =   '<table cellpadding="0px" cellspacing="5px" >\
            	<tr class="row1">\
                	<td class="col1"><span class="var">BEV</span></td>\
                    <td class="colEqual">=</td>\
                	<td class="col2"><div class="fraction"><div class="numerator"><span class="var">C</span></div><div class="denominator">(&nbsp;<span class="var">r</span> &#8722; <span class="var">v</span>&nbsp;)</div></div></td>\
                    <td class="colEqual">=</td>\
                	<td class="col3"><div class="fraction"><div class="numerator">' + $.format.number(fixedcost, "#,###,###") + '</div><div class="denominator">(' + revenue + ' &#8722; ' + varcost + ')</div></div></td>\
                    <td class="colEqual">=</td>\
                	<td class="col4">' + beq + '</td>\
                </tr>';

    $('#output_text1').html( txt );

    //console.log(data)
    graph = $.plot($("#graph"), [
        { data:[[ 3, totalProfit ]], color:(totalProfit<0?TEXT_INCORRECT_COL:TEXT_CORRECT_COL) },
        { data:[[ 1, totalRevenue ]], color:(totalRevenue<0?TEXT_INCORRECT_COL:TEXT_CORRECT_COL) },
        { data:[[ 2, totalCost ]], color:(totalCost<0?TEXT_INCORRECT_COL:TEXT_CORRECT_COL) }
    ], graphParams);

    graph2 = $.plot($("#graph2"), [
        { data:[ [ 1, beqVal ] ], color:COLORS[0] },
        { data:[ [ 2, output ] ], color:COLORS[1] }
    ], graph2Params);

}
var canUpdate = true;
function resetUpdate()
{
    canUpdate = true;
}

function updateGraph(  )
{
    if( !canUpdate ) return;
    canUpdate = false;
    setTimeout( resetUpdate, 100 );
//    var totalRevenue = output * (revenue - varcost) - fixedcost;
    var totalRevenue = output * revenue;
    var totalCost = -1 * (output * varcost + fixedcost);
    var totalProfit = totalRevenue + totalCost;

    var beq = "<font color='#b20022'>infeasible</font>";
    var beqVal = 0;
    if( revenue > varcost && fixedcost > 0 )
    {
        beqVal = Math.ceil(fixedcost/(revenue - varcost))
        beq = $.format.number( beqVal, "#,###,###" ) + " units";
    }
    var txt =   '<table cellpadding="0px" cellspacing="5px" >\
            	<tr class="row1">\
                	<td class="col1"><span class="var">BEV</span></td>\
                    <td class="colEqual">=</td>\
                	<td class="col2"><div class="fraction"><div class="numerator"><span class="var">C</span></div><div class="denominator">(&nbsp;<span class="var">r</span> &#8722; <span class="var">v</span>&nbsp;)</div></div></td>\
                    <td class="colEqual">=</td>\
                	<td class="col3"><div class="fraction"><div class="numerator">' + $.format.number(fixedcost, "#,###,###") + '</div><div class="denominator">(' + revenue + ' &#8722; ' + varcost + ')</div></div></td>\
                    <td class="colEqual">=</td>\
                	<td class="col4">' + beq + '</td>\
                </tr>';

    $('#output_text1').html( txt );

    graph = $.plot($("#graph"), [
        { data:[[ 3, totalProfit ]], color:(totalProfit<0?TEXT_INCORRECT_COL:TEXT_CORRECT_COL) },
        { data:[[ 1, totalRevenue ]], color:(totalRevenue<0?TEXT_INCORRECT_COL:TEXT_CORRECT_COL) },
        { data:[[ 2, totalCost ]], color:(totalCost<0?TEXT_INCORRECT_COL:TEXT_CORRECT_COL) }
    ], graphParams);

    graph2 = $.plot($("#graph2"), [
        { data:[ [ 1, beqVal ] ], color:COLORS[0] },
        { data:[ [ 2, output ] ], color:COLORS[1] }
    ], graph2Params);

    if( beqVal == 0 ) $("#graph2 #valueLabels0 .valueLabel").html("infeasible");

}
