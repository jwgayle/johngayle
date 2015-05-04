// JavaScript Document
//var COL = ["#829eb4", "#e46f29", "#134368", "#acd17a" ];
var COL = ["#e46f29", "#02456a", "#b10021", "#6a8535", "#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed", "#afcf7b", "#89aaaa" ];

var COST_COL = "#96968C"; //COL[0];
var PROFIT_CORRECT_COL = "#26617F"; //"#CDC90F"; //COL[7];//#4da74d
var PROFIT_LOW_COL = "#AA0532"; //COL[2];
var PROFIT_HIGH_COL = "#9ACFD0"; //COL[1];
var LOSS_COL = "rgba(170, 5, 50, 0.85)";
//var GAIN_COL = "rgba(154, 207, 208, 0.4)"; #9ACFD0
var GAIN_COL = "rgba(87, 139, 41, 0.85)";
var TEXT_COL = "#FFFFFF";//"#5A5A4B";
var TEXT_COL_NEG = "#000000";

var PROFIT_CORRECT_COL_15 = "#d9e2e8";

var MIN_PRICE = 1;
var MAX_PRICE = 30;
var DEF_PRICE = 16;
var STEP_PRICE = 0.5;
var price1 = DEF_PRICE;
var price2 = DEF_PRICE;

var MIN_QUANTITY = 1;
var MAX_QUANTITY = 200;
var DEF_QUANTITY = 100;
var STEP_QUANTITY = 1;
var quantity1 = DEF_QUANTITY;
var quantity2 = DEF_QUANTITY;

var LOW_MARGIN = 20;
var HIGH_MARGIN = 80;
var margin = LOW_MARGIN;

var ELASTICITY_1 = 0.5;
var ELASTICITY_2 = 1;
var ELASTICITY_3 = 2;
var elasticity = ELASTICITY_2;

var MIN_X = 0;
var MAX_X = 200;
var MIN_Y = 0;
var MAX_Y = 30;
var MIN_LEFT;
var MAX_LEFT;
var MIN_TOP;
var MAX_TOP;

var STATE1 = 0;
var STATE2 = 1;
var currState = STATE2;
var targetProfit = 0;

var bracket
var plot;
var plot_grid;

var graphParams1 =
{
    xaxis:
    {
        min:MIN_X,
        max:MAX_X,
        show:false,
        reserveSpace:true,
        axisLabel:' ',
        axisLabelUseCanvas: true,
        axisLabelFontFamily:'Arial, sans-serif',
        axisLabelFontSizePixels:14,
        axisLabelPadding: 4
    },
    yaxis:
    {
        min:MIN_Y,
        max:MAX_Y,
        show:false,
        reserveSpace:true,
        axisLabel:' ',
        axisLabelUseCanvas: true,
        axisLabelFontFamily:'Arial, sans-serif',
        axisLabelFontSizePixels:14
    },
    series:
    {
        stack:true,
        bars: { show: true, barWidth: 1, align:"left", fill: 0.5, lineWidth:0 },
        lines: { show: false }
    },
    grid:
    {
        borderWidth: 1,
        color: '#5A5A4B'
    }
}

var graphGridParams =
{
    xaxis:
    {
        min:MIN_X,
        max:MAX_X,
        show:true,
        reserveSpace:true,
        axisLabel:'Units Sold',
        axisLabelUseCanvas: true,
        axisLabelFontFamily:'Arial, sans-serif',
        axisLabelFontSizePixels:14,
        axisLabelPadding: 4
    },
    yaxis:
    {
        min:MIN_Y,
        max:MAX_Y,
        show:true,
        axisLabel:'Price ($)',
        axisLabelUseCanvas: true,
        axisLabelFontFamily:'Arial, sans-serif',
        axisLabelFontSizePixels:14
    },
    series:
    {
        bars: { show: false },
        lines: { show: false }
    },
    legend:
    {
        container: null,
        noColumns:1,
        margin:10
    },
    grid:
    {
        borderWidth: 1,
        color: '#5A5A4B'
    }
}

$(document).ready( function() 
{
    $( "#priceSlider1" ).hbp_slider( {min:MIN_PRICE, max:MAX_PRICE, step:STEP_PRICE, value:price1, slide:onPrice1Change, stop:onPrice1Change, minText:'$'+MIN_PRICE, maxText:'$'+MAX_PRICE, valueFormat:'0.00', valueWidth:60, valuePrefix:'$'});
    $( "#quantitySlider1" ).hbp_slider( {min:MIN_QUANTITY, max:MAX_QUANTITY, step:STEP_QUANTITY, value:quantity1, slide:onQuantity1Change, stop:onQuantity1Change, minText:MIN_QUANTITY, maxText:MAX_QUANTITY, valueFormat:'#', valueWidth:40});
    $( "#priceSlider2" ).hbp_slider( {min:MIN_PRICE, max:MAX_PRICE, step:STEP_PRICE, value:price2, slide:onPrice2Change, stop:onPrice2Change, minText:'$'+MIN_PRICE, maxText:'$'+MAX_PRICE, valueFormat:'0.00', valueWidth:60, valuePrefix:'$'});
    $( "#quantitySlider2" ).hbp_slider( {min:MIN_QUANTITY, max:MAX_QUANTITY, step:STEP_QUANTITY, value:quantity2, slide:onQuantity2Change, stop:onQuantity2Change, minText:MIN_QUANTITY, maxText:MAX_QUANTITY, valueFormat:'#', valueWidth:40});

    $('input:radio').customButtons({
        image: "url(assets/checkbox.png)",
        width:	 37,
        height:	 34
    });
    $("#chk0").customButtons("check");
    $("#chk3").customButtons("check");
    $('input:radio').change(onSelect);

    $("#btnSet").on("click", onSet);
    $("#btnReset").on("click", onReset);

    initGraph();
    updateTable();
    setState( STATE1 );
});



function updateTable()
{
    var origPrice = price1;
    var origQuantity = quantity1;
    var origRevenue = price1 * quantity1;
    var origMargin = margin;
    var origCOGS = ( 1 - margin/100 ) * origPrice;
    var origCost = ( 1 - margin/100 ) * origRevenue;
    var origProfit = margin/100 * origRevenue;
    var origUnitMargin = origPrice - origCOGS;

    if( currState == STATE1 )
    {
        $("#origPrice").html( "$" + $.format.number( origPrice, "#.00") );
        $("#newPrice").html( "&mdash;" );
        $("#changePrice").html( "&mdash;" );

        $("#origQuantity").html( origQuantity );
        $("#newQuantity").html( "&mdash;" );
        $("#changeQuantity").html( "&mdash;" );

        $("#origRevenue").html( "$" + $.format.number( origRevenue, "#,###.00") );
        $("#newRevenue").html( "&mdash;" );
        $("#changeRevenue").html( "&mdash;" );

        $("#origCOGS").html( "$" + $.format.number( origCOGS, "#.00") );
        $("#newCOGS").html( "&mdash;" );
        $("#changeCOGS").html( "&mdash;" );

        $("#origCost").html( "$" + $.format.number( origCost, "#,###.00") );
        $("#newCost").html( "&mdash;" );
        $("#changeCost").html( "&mdash;" );

        $("#origProfit").html( "$" + $.format.number( origProfit, "#,###.00") );
        $("#newProfit").html( "&mdash;" );
        $("#changeProfit").html( "&mdash;" );

        $("#origMargin").html( $.format.number( origMargin, "#.0") + "%" );
        $("#newMargin").html( "&mdash;" );
        $("#changeMargin").html( "&mdash;" );

        $("#origUnitMargin").html( "$" + $.format.number( origUnitMargin, "#.00") );
        $("#newUnitMargin").html( "&mdash;" );
        $("#changeUnitMargin").html( "&mdash;" );

    }
    else
    {
        var newPrice = price2;
        var newQuantity = quantity2;
        var newRevenue = price2 * quantity2;
        var newCost = origCost + origCost * ((newQuantity - origQuantity)/origQuantity);
        //var newCost = origCost;
        var newProfit = newRevenue - newCost;
        //how to handle newRevenue = 100
        var newMargin = newProfit/newRevenue * 100;
        var newCOGS = newCost/newQuantity; //( 1 - margin/100 ) * newPrice;
        //var newCOGS = origCOGS;
        var newUnitMargin = newPrice - newCOGS;

        var changePrice = Math.round((newPrice - origPrice)/origPrice * 100 );
        var changeQuantity = Math.round((newQuantity - origQuantity)/origQuantity * 100 );
        var changeRevenue = Math.round((newRevenue - origRevenue)/origRevenue * 100 );
        var changeCOGS = Math.round((newCOGS - origCOGS)/origCOGS * 100 );
        var changeCost = Math.round((newCost - origCost)/origCost * 100 );
        var changeProfit = Math.round((newProfit - origProfit)/origProfit * 100 );
        var changeMargin = Math.round((newMargin - origMargin)/origMargin * 100 );
        var changeUnitMargin = Math.round((newUnitMargin - origUnitMargin)/origUnitMargin * 100 );

        $("#origPrice").html( "$" + $.format.number( origPrice, "#.00") );
        $("#newPrice").html( "$" + $.format.number( newPrice, "#.00") );
        $("#changePrice").html( $.format.number( changePrice, "#") + "%" );

        $("#origQuantity").html( origQuantity );
        $("#newQuantity").html( $.format.number( newQuantity, "#") );
        $("#changeQuantity").html( $.format.number( changeQuantity, "#") + "%" );

        $("#origRevenue").html( "$" + $.format.number( origRevenue, "#,###.00") );
        //$("#newRevenue").html( "$" + $.format.number( newRevenue, "#.00") );
        if( newRevenue < 0 ) $("#newRevenue").html( "&#8722;$" + $.format.number( -1*newRevenue, "#,###.00") );
        else $("#newRevenue").html( "$" + $.format.number( newRevenue, "#,###.00") );
        $("#changeRevenue").html( $.format.number( changeRevenue, "#") + "%" );

        $("#origCOGS").html( "$" + $.format.number( origCOGS, "#.00") );
        $("#newCOGS").html( "$" + $.format.number( newCOGS, "#.00") );
        $("#changeCOGS").html( $.format.number( changeCOGS, "#") + "%" );

        $("#origCost").html( "$" + $.format.number( origCost, "#,###.00") );
        //$("#newCost").html( "$" + $.format.number( newCost, "#.00") );
        if( newCost < 0 ) $("#newCost").html( "&#8722;$" + $.format.number( -1*newCost, "#,###.00") );
        else $("#newCost").html( "$" + $.format.number( newCost, "#,###.00") );
        $("#changeCost").html( $.format.number( changeCost, "#") + "%" );

        $("#origProfit").html( "$" + $.format.number( origProfit, "#,###.00") );
        //if( newProfit < 0 ) $("#newProfit").html( "-$" + $.format.number( -1*newProfit, "#.00") );
        if( newProfit < 0 ) $("#newProfit").html( "&#8722;$" + $.format.number( -1*newProfit, "#,###.00") );
        else $("#newProfit").html( "$" + $.format.number( newProfit, "#,###.00") );
        $("#changeProfit").html( $.format.number( changeProfit, "#") + "%" );

        $("#origMargin").html( $.format.number( origMargin, "#.0") + "%" );
        if( newRevenue == 0 )
        {
            $("#newMargin").html( "undefined" );
            $("#changeMargin").html( "undefined" );
        }
        else
        {
            $("#newMargin").html( $.format.number( newMargin, "#.0") + "%" );
            $("#changeMargin").html( $.format.number( changeMargin, "#") + "%" );
        }

        $("#origUnitMargin").html( "$" + $.format.number( origUnitMargin, "#.00") );
        //$("#newUnitMargin").html( "$" + $.format.number( newUnitMargin, "#.00") );
        if( newUnitMargin < 0 ) $("#newUnitMargin").html( "&#8722;$" + $.format.number( -1*newUnitMargin, "#.00") );
        else $("#newUnitMargin").html( "$" + $.format.number( newUnitMargin, "#.00") );
        $("#changeUnitMargin").html( $.format.number( changeUnitMargin, "#") + "%" );
    }
}

function setState( state )
{
    //console.log("setState " + state );
    currState = state;

    switch( state )
    {
        case STATE1:

            //reset values
            price2 = price1 = DEF_PRICE;
            quantity2 = quantity1 = DEF_QUANTITY;
            elasticity = ELASTICITY_2;
            $("#chk3").customButtons("check");
            $("#legend_holder").hide();

            //hasChanged = false;

            $( "#priceSlider1" ).hbp_slider("value", price1);
            $( "#quantitySlider1" ).hbp_slider("value", quantity1);
            $( "#priceSlider2" ).hbp_slider("value", price2);
            $( "#quantitySlider2" ).hbp_slider("value", quantity2);

            $( "#priceSlider1" ).hbp_slider( "option", "disabled", false );
            $( "#quantitySlider1" ).hbp_slider( "option", "disabled", false );
            $( "#priceSlider2" ).hbp_slider( "option", "disabled", true );
            $( "#quantitySlider2" ).hbp_slider( "option", "disabled", true );

            $("#chk0").customButtons("enable");
            $("#chk1").customButtons("enable");
            $("#chk2").customButtons("disable");
            $("#chk3").customButtons("disable");
            $("#chk4").customButtons("disable");

            $("#slider_container_1 > .row_title").removeClass("inactive");
            $("#slider_container_2 > .row_title").addClass("inactive");
            $("#btnSet").removeClass("img_btn_disabled");

            break;
        case STATE2:
            //hasChanged = true;


            $("#chk0").customButtons("disable");
            $("#chk1").customButtons("disable");
            $("#chk2").customButtons("enable");
            $("#chk3").customButtons("enable");
            $("#chk4").customButtons("enable");

            $( "#priceSlider1" ).hbp_slider( "option", "disabled", true );
            $( "#quantitySlider1" ).hbp_slider( "option", "disabled", true );
            $( "#priceSlider2" ).hbp_slider( "option", "disabled", false );
            $( "#quantitySlider2" ).hbp_slider( "option", "disabled", false );

            $("#slider_container_1 > .row_title").addClass("inactive");
            $("#slider_container_2 > .row_title").removeClass("inactive");

            $("#btnSet").addClass("img_btn_disabled");
            $("#legend_holder").show();

            break;
    }

    updateGrid();
    updateTable();
}


function onPrice1Change( event, ui )
{
    price2 = price1 = ui.value;
    $( "#priceSlider2" ).hbp_slider("value", price1);
    updateGraph();
    updateTable();
}

function onQuantity1Change( event, ui )
{
    quantity2 = quantity1 = ui.value;
    $( "#quantitySlider2" ).hbp_slider("value", quantity1);
    updateGraph();
    updateTable();
}

function onPrice2Change( event, ui )
{
    price2 = ui.value;
    //change quantity based on elasticity
    var t = elasticity * ((price1 - price2)/price1) * quantity1 + quantity1;
    //quantity2 = Math.round(elasticity * ((price1 - price2)/price1) * quantity1 + quantity1);
    quantity2 = (t <= 1)?(1):(t);
    $( "#quantitySlider2" ).hbp_slider("value", quantity2);

    updateGraph();
    updateTable();
}

function onQuantity2Change( event, ui )
{
    quantity2 = ui.value;
    //round price to nearest 50 cent
    //price2 = Math.round( 2 * (price1 - price1 * (quantity2 - quantity1)/(elasticity * quantity1))) / 2;
    price2 = Math.round( (price1 + price1 * ((quantity1 - quantity2)/quantity1)/elasticity));

    $( "#priceSlider2" ).hbp_slider("value", price2);

    updateGraph();
    updateTable();
}

function onSelect( evt )
{
    //console.log("onSelect " + $(evt.target).val())
    switch( parseInt($(evt.target).val()) )
    {
        case 0:
            margin = LOW_MARGIN;
            break;
        case 1:
            margin = HIGH_MARGIN;
            break;
        case 2:
            elasticity = ELASTICITY_1;
            //recalculate quantity based on price
            quantity2 = Math.round(elasticity * ((price1 - price2)/price1) * quantity1 + quantity1);
            $( "#quantitySlider2" ).hbp_slider("value", quantity2);
            break;
        case 3:
            elasticity = ELASTICITY_2;
            //recalculate quantity based on price
            quantity2 = Math.round(elasticity * ((price1 - price2)/price1) * quantity1 + quantity1);
            $( "#quantitySlider2" ).hbp_slider("value", quantity2);
            break;
        case 4:
            elasticity = ELASTICITY_3;
            //recalculate quantity based on price
            quantity2 = Math.round(elasticity * ((price1 - price2)/price1) * quantity1 + quantity1);
            $( "#quantitySlider2" ).hbp_slider("value", quantity2);
            break;
    }
    //updateGrid();
    updateGraph();
    updateTable();
}

function onSet()
{
    //console.log("onSet");
    setState( STATE2 );
}

function onReset( evt )
{
    setState( STATE1 );
    initGraph( );
}

function initGraph( )
{
    cost1 = (100 - margin)/100 * price1;
    var a1 = [ [0, cost1] ];
    var a2 = [ [0, price1 - cost1] ];
    graphParams1.series.bars.barWidth = quantity1;

    var graph = $("#graph1");
    var graph_grid = $("#graph_grid1");
    plot = $.plot( graph, [
        { data:a1, color:COST_COL, suffix:"" },
        { data:a2, color:PROFIT_CORRECT_COL, suffix:"" }
    ],
        graphParams1);

    plot_grid = $.plot( graph_grid, [
        { data:[], color:COST_COL },
        { data:[], color:PROFIT_CORRECT_COL }
    ],
        graphGridParams);

    MAX_LEFT = plot_grid.pointOffset({ x: 200, y: 0}).left;
    MIN_LEFT = plot_grid.pointOffset({ x: 0, y: 0}).left;
    MAX_TOP = plot_grid.pointOffset({ x: 0, y: 0}).top;
    MIN_TOP = plot_grid.pointOffset({ x: 0, y: 30}).top;

};

function updateGraph( )
{
    var price = (currState == STATE1)?price1:Math.min(price2, price1);
    var quantity = (currState == STATE1)?quantity1:Math.min(quantity2, quantity1);
    var cost = (100 - margin)/100 * price1; //cost is static - based on price1
    //var cost = cost1;
    var a1 = [ [0, cost] ];
    var a2 = [ [0, price - cost] ];
    graphParams1.series.bars.barWidth = quantity;
    var col = PROFIT_CORRECT_COL;
    //var labelCol = PROFIT_CORRECT_COL_15;
    //var suffix = "";


    var graph = $("#graph1");
    plot = $.plot( graph, [
        { data:a1, color:COST_COL },
        { data:a2, color:col }
    ],
        graphParams1);

    //if state 2 then show profit and loss overlays
    if( currState == STATE2 )
    {
        var ctx = plot.getCanvas().getContext("2d");
        var offset = plot.getPlotOffset();
        ctx.font="bold 14px Arial";

        //draw outline of current price/quantity
        var o1 = plot.pointOffset({ x: 0, y: price2});
        var o2 = plot.pointOffset({ x: quantity2, y: price2});
        var o3 = plot.pointOffset({ x: quantity2, y: 0});
        //console.log("m = " + m.left + ", " + m.top);
        //constrain values to graph
        o1.left = Math.max(MIN_LEFT, Math.min(MAX_LEFT, o1.left));
        o1.top = Math.max(MIN_TOP, Math.min(MAX_TOP, o1.top));
        o2.left = Math.max(MIN_LEFT, Math.min(MAX_LEFT, o2.left));
        o2.top = Math.max(MIN_TOP, Math.min(MAX_TOP, o2.top));
        o3.left = Math.max(MIN_LEFT, Math.min(MAX_LEFT, o3.left));
        o3.top = Math.max(MIN_TOP, Math.min(MAX_TOP, o3.top));

        drawDottedLine(o1.left, o1.top, o2.left, o2.top, ctx );
        drawDottedLine(o2.left, o2.top, o3.left, o3.top, ctx );

        $("#graph1").append('<div class="axis_number2" style="left:' + (o1.left - 48) + 'px;top:' + (o1.top - 9) + 'px;">$' + $.format.number(price2,"#.00") + '</div>');
        $("#graph1").append('<div class="axis_number2" style="left:' + (o3.left - 21) + 'px;top:' + (o3.top + 4) + 'px;">' + $.format.number(quantity2,"#") + '</div>');

        //change by price
        //ctx.fillStyle = (price2 > price1)?GAIN_COL:LOSS_COL;
        if( price2 > price1 )
        {
            ctx.fillStyle = GAIN_COL;
            $("#priceChange").html("gain in profit");
            $("#priceChangeBox").removeClass("loss");
            $("#priceChangeBox").addClass("gain");
        }
        else
        {
            ctx.fillStyle = LOSS_COL;
            $("#priceChange").html("loss in profit");
            $("#priceChangeBox").removeClass("gain");
            $("#priceChangeBox").addClass("loss");
        }
        var pt1 = plot.pointOffset( {x:0, y:price2} );
        var pt2 = plot.pointOffset( {x:quantity, y:price1} );
        pt1.left = Math.max(MIN_LEFT, Math.min(MAX_LEFT, pt1.left));
        pt1.top = Math.max(MIN_TOP, Math.min(MAX_TOP, pt1.top));
        pt2.left = Math.max(MIN_LEFT, Math.min(MAX_LEFT, pt2.left));
        pt2.top = Math.max(MIN_TOP, Math.min(MAX_TOP, pt2.top));

        ctx.fillRect( pt1.left, pt1.top, pt2.left - pt1.left, pt2.top - pt1.top );

        //write the letter A in the middle of this rectangle
        var xsmall = Math.abs(pt2.left - pt1.left) < 10;
        var ysmall = Math.abs(pt2.top - pt1.top) < 10;
        var xoff = xsmall?0:-5;
        var yoff = ysmall?0:6;
        var xpos = Math.min((pt2.left + pt1.left)/2 + xoff, 410);
        var ypos = Math.max((pt2.top + pt1.top)/2 + yoff, 20);
        ctx.fillStyle = (xsmall || ysmall)?TEXT_COL_NEG:TEXT_COL;
        ctx.fillText("A", xpos, ypos);


        //change by quantity
        //ctx.fillStyle = (quantity2 > quantity1 && price2 > cost)?GAIN_COL:LOSS_COL;
        if( quantity2 > quantity1 && price2 > cost )
        {
            ctx.fillStyle = GAIN_COL;
            $("#quantityChange").html("gain in profit");
            $("#quantityChangeBox").removeClass("loss");
            $("#quantityChangeBox").addClass("gain");
        }
        else
        {
            ctx.fillStyle = LOSS_COL;
            $("#quantityChange").html("loss in profit");
            $("#quantityChangeBox").removeClass("gain");
            $("#quantityChangeBox").addClass("loss");
        }
        var pt1 = plot.pointOffset( {x:quantity1, y:price} );
        var pt2 = plot.pointOffset( {x:quantity2, y:cost} );
        pt1.left = Math.max(MIN_LEFT, Math.min(MAX_LEFT, pt1.left));
        pt1.top = Math.max(MIN_TOP, Math.min(MAX_TOP, pt1.top));
        pt2.left = Math.max(MIN_LEFT, Math.min(MAX_LEFT, pt2.left));
        pt2.top = Math.max(MIN_TOP, Math.min(MAX_TOP, pt2.top));

        ctx.fillRect( pt1.left, pt1.top, pt2.left - pt1.left, pt2.top - pt1.top );
        //write the letter B in the middle of this rectangle
        var xsmall = Math.abs(pt2.left - pt1.left) < 10;
        var ysmall = Math.abs(pt2.top - pt1.top) < 10;
        var xoff = xsmall?0:-5;
        var yoff = ysmall?0:6;
        var xpos = Math.min((pt2.left + pt1.left)/2 + xoff, 410);
        var ypos = Math.max((pt2.top + pt1.top)/2 + yoff, 20);
        ctx.fillStyle = (xsmall || ysmall)?TEXT_COL_NEG:TEXT_COL;
        ctx.fillText("B", xpos, ypos);
        //ctx.fillStyle = (xsmall || ysmall)?TEXT_COL_NEG:TEXT_COL;
        //ctx.fillText("B", (pt2.left + pt1.left)/2 + xoff, (pt2.top + pt1.top)/2 + yoff);

    }

};

function updateGrid( )
{
    if( currState == STATE1 )
    {
        //redraw grid
        var graph_grid = $("#graph_grid1");
        plot_grid = $.plot( graph_grid, [
            { data:[], color:COST_COL },
            { data:[], color:PROFIT_CORRECT_COL }
        ],
            graphGridParams);
    }
    else
    {
        //draw outline of current price/quantity
        var o1 = plot_grid.pointOffset({ x: 0, y: price1});
        var o2 = plot_grid.pointOffset({ x: quantity1, y: price1});
        var o3 = plot_grid.pointOffset({ x: quantity1, y: 0});


        var ctx = plot_grid.getCanvas().getContext("2d");
        drawDottedLine(o1.left, o1.top, o2.left, o2.top, ctx );
        drawDottedLine(o2.left, o2.top, o3.left, o3.top, ctx );

        $("#graph_grid1").append('<div class="axis_number" style="left:' + (o1.left - 48) + 'px;top:' + (o1.top - 9) + 'px;">$' + $.format.number(price1,"#.00") + '</div>');
        $("#graph_grid1").append('<div class="axis_number" style="left:' + (o3.left - 21) + 'px;top:' + (o3.top + 4) + 'px;">' + $.format.number(quantity1,"#") + '</div>');
    }

};

var DOT_SPACING = 8;

function drawDottedLine(x1,y1,x2,y2,ctx){
    var dx = x2-x1;
    var dy = y2-y1;
    if( dy == 0 )
    {
        var dotCount = dx/DOT_SPACING;
        var spaceX = DOT_SPACING;
        var spaceY = 0;
        var newX = x1;
        var newY = y1;
        for (var i=0;i<dotCount;i++)
        {
            drawHorizontalDash(newX,newY,ctx);
            newX += spaceX;
            newY += spaceY;
        }
    }
    else
    {
        var dotCount = dy/DOT_SPACING;
        var spaceX = 0;
        var spaceY = DOT_SPACING;
        var newX = x1;
        var newY = y1;
        for (var i=0;i<dotCount;i++)
        {
            drawVerticalDash(newX,newY,ctx);
            newX += spaceX;
            newY += spaceY;
        }
    }
}
var DOT_RADIUS = 1;
var DASH_RADIUS = 2;
var DOT_COLOUR = "#333333";
function drawDot(x,y,ctx)
{
    ctx.beginPath();
    ctx.arc(x,y, DOT_RADIUS, 0, 2 * Math.PI, false);
    ctx.fillStyle = DOT_COLOUR;
    ctx.fill();
}
function drawHorizontalDash(x,y,ctx)
{
    ctx.beginPath();
    ctx.rect( x, y, DOT_SPACING/2, DASH_RADIUS );
    ctx.fillStyle = DOT_COLOUR;
    ctx.fill();
}
function drawVerticalDash(x,y,ctx)
{
    ctx.beginPath();
    ctx.rect( x, y, DASH_RADIUS, DOT_SPACING/2 );
    ctx.fillStyle = DOT_COLOUR;
    ctx.fill();
}

