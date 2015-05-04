// JavaScript Document
var LINE_COL = "#CDC90F";
var COGS_COL = "#6E1400";
var PROD_COL = "#E66E1E";
var MARK_COL = "#004669";
var OBJ_COL = "#9ACFD0";
var TEXT_COL = "#5A5A4B";
var TEXT_COL_NEG = "#AA0532";
var BRACKET_COL = "#E6E6DC";

var cogs = 2;
var productPrice = 4;
var marketing = 6
var marketingRate = 60;
var bracket;
var bracket_red;
var OBJECTIVE_VALUE = 10;
var imgCount = 0;


$(document).ready( function() 
{

    $( "#valueSlider" ).hbp_slider( {min:0, max:15, step:0.1, value:OBJECTIVE_VALUE, slide:onValueChange, stop:onValueStop, minText:'$0', maxText:'$15', valueFormat:'0.00', valueWidth:50, valuePrefix:'$'});
    $( "#cogsSlider" ).hbp_slider( {min:1, max:15, step:0.1, value:cogs, slide:onCogsChange, stop:onCogsStop, minText:'$1', maxText:'$15', valueFormat:'0.00', valueWidth:50, valuePrefix:'$'});
    $( "#productPriceSlider" ).hbp_slider( {min:2, max:15, step:0.2, value:productPrice, slide:onProductPriceChange, stop:onProductPriceStop, minText:'$2', maxText:'$15', valueFormat:'0.00', valueWidth:50, valuePrefix:'$'});
    //$( "#marketingSlider" ).hbp_slider( {min:0.5, max:15, step:0.1, value:marketing, slide:onMarketingChange, stop:onMarketingStop, minText:'LOW', maxText:'HIGH', showValue:false, valueFormat:'', valueWidth:0, valuePrefix:'$', sliderMax:OBJECTIVE_VALUE});
    $( "#marketingSlider" ).hbp_slider( {min:0, max:100, step:1, value:marketingRate, slide:onMarketingChange, stop:onMarketingStop, minText:'LOW', maxText:'HIGH', showValue:false, valueFormat:'', valueWidth:0, valuePrefix:'$'});

    /*bracket_red = new Image();
    bracket_red.onload = $.proxy( checkLoad, this );
    bracket_red.src = "assets/bracket_calibri_red.png";

    bracket = new Image();
    bracket.onload = $.proxy( checkLoad, this );
    bracket.src = "assets/bracket_calibri.png";*/
    setTimeout( update, 100 );
});
function checkLoad()
{
    imgCount++;
    if( imgCount > 1 ) update();
}

function onValueChange( event, ui )
{
    OBJECTIVE_VALUE = ui.value;
    /*$( "#marketingSlider" ).hbp_slider( "option", "sliderMax", OBJECTIVE_VALUE );
    if( marketing > OBJECTIVE_VALUE )
    {
        marketing = OBJECTIVE_VALUE;
        $( "#marketingSlider" ).hbp_slider( "value", marketing );
    }*/
    marketing = marketingRate * OBJECTIVE_VALUE / 100;
    update();
}

function onCogsChange( event, ui )
{
    cogs = ui.value;
    update();
}

function onProductPriceChange( event, ui )
{
    productPrice = ui.value;
    update();
}

function onMarketingChange( event, ui )
{
    marketingRate = ui.value;
    marketing = marketingRate * OBJECTIVE_VALUE / 100;
    update();
}

function onValueStop( event, ui )
{
    //round to the nearest multiple of 0.1
    OBJECTIVE_VALUE = Math.round(ui.value*10)/10;
    $( "#valueSlider" ).hbp_slider( "value", OBJECTIVE_VALUE );
    marketing = marketingRate * OBJECTIVE_VALUE / 100;
    /*$( "#marketingSlider" ).hbp_slider( "option", "sliderMax", OBJECTIVE_VALUE );
     if( marketing > OBJECTIVE_VALUE )
     {
         marketing = OBJECTIVE_VALUE;
         $( "#marketingSlider" ).hbp_slider( "value", marketing );
     }*/

    update();
}

function onCogsStop( event, ui )
{
    //round to the nearest multiple of 0.1
    cogs = Math.round(ui.value*10)/10;
    $( "#cogsSlider" ).hbp_slider( "value", cogs );
    update();
}

function onProductPriceStop( event, ui )
{
    productPrice = Math.round(ui.value*5)/5;
    $( "#productPriceSlider" ).hbp_slider( "value", productPrice );
    update();
}

function onMarketingStop( event, ui )
{
    marketingRate = Math.round(ui.value*10)/10;
    $( "#marketingSlider" ).hbp_slider( "value", marketingRate );
    marketing = marketingRate * OBJECTIVE_VALUE / 100;
    update();
}

var BRACKET_TEXT_OFFSET = 16;

function update( )
{
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var WIDTH = 40;
    var SCALE = 28;//45;
    var BOTTOM_PADDING = 15;
    var X = 250, h, h2, H=BAR_HEIGHT;
    var Y0 = canvas.height - BOTTOM_PADDING;
    var Y = Y0;
    var descY, dY;

    //calculate the left hand text positions
    //note adding to array in reverse order of display - this is to ensure that items of equal value are displayed with top value on top
    var arrLeftLabel = [];
    var TEXT_DY = 11, TEXT_DX = 10;
    Y = canvas.height - OBJECTIVE_VALUE*SCALE - BOTTOM_PADDING;
    arrLeftLabel.push( {idx:4, labelX:X-TEXT_DX, y:Y, labelY:Y+TEXT_DY} );
    Y = Y0 - marketing*SCALE;
    arrLeftLabel.push( {idx:3, labelX:X-TEXT_DX, y:Y, labelY:Y+TEXT_DY} );
    Y = Y0 - productPrice*SCALE;
    arrLeftLabel.push( {idx:2, labelX:X-TEXT_DX, y:Y, labelY:Y+TEXT_DY} );
    Y = Y0 - cogs*SCALE;
    arrLeftLabel.push( {idx:1, labelX:X-TEXT_DX, y:Y, labelY:Y+TEXT_DY} );

    //sort by y position
    arrLeftLabel.sort( function(a,b)
    {
        //if(a.idx == 0 || b.idx == 0 ) return 0;
        if(a.y == b.y ) return 0;
        if(a.y > b.y ) return 1;
        return -1;
    } );

    //now loop through and adjust label positions if necessary
    var lastY = arrLeftLabel[arrLeftLabel.length-1].labelY;
    for( var i = arrLeftLabel.length - 2; i >= 0; i-- )
    {
        dY = lastY - arrLeftLabel[i].labelY;
        if( dY < 20 ) arrLeftLabel[i].labelY += (dY - 20);
        lastY = arrLeftLabel[i].labelY;
    }
    //add the zero label here to prevent it from being included in the sorting or re-positioning
    Y = canvas.height - BOTTOM_PADDING;
    arrLeftLabel.push( {idx:0, labelX:X-TEXT_DX, y:Y, labelY:Y+8} );

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = LINE_COL;
    ctx.fillRect( X+17, 20, 10, canvas.height);
    //draw arrow
    ctx.beginPath();
    ctx.moveTo(X+22, 0);
    ctx.lineTo(X+34, 20);
    ctx.lineTo(X+10, 20);
    ctx.fill();
    //draw base
    ctx.fillRect( X-150, canvas.height - 2, 334, 2);

    //draw labels and boxes
    for( var i = 0; i < arrLeftLabel.length; i++ )
    {
        var item = arrLeftLabel[i];
        switch( item.idx )
        {
            case 0:
                ctx.font = VALUE_FONT;
                ctx.textAlign = 'right';
                ctx.fillStyle = TEXT_COL;
                ctx.fillText( "$0", item.labelX, item.labelY );
                break;
            case 1:
                ctx.fillStyle = COGS_COL;
                ctx.fillRect( X, item.y, WIDTH, H);
                ctx.font = VALUE_FONT;
                ctx.textAlign = 'right';
                ctx.fillStyle = TEXT_COL;
                ctx.fillText( "$" + $.format.number(cogs, "##.00"), item.labelX, item.labelY );
                ctx.font = LABEL_FONT;
                ctx.fillText( "COGS", item.labelX - 50, item.labelY );
                break;
            case 2:
                ctx.fillStyle = PROD_COL;
                ctx.fillRect( X, item.y, WIDTH, H);
                ctx.font = VALUE_FONT;
                ctx.textAlign = 'right';
                ctx.fillStyle = TEXT_COL;
                ctx.fillText( "$" + $.format.number(productPrice, "##.00"), item.labelX, item.labelY );
                ctx.font = LABEL_FONT;
                ctx.fillText( "Product price", item.labelX - 50, item.labelY );
                break;
            case 3:
                ctx.fillStyle = MARK_COL;
                ctx.fillRect( X, item.y, WIDTH, H);
                ctx.font = VALUE_FONT;
                ctx.textAlign = 'right';
                ctx.fillStyle = TEXT_COL;
                ctx.fillText( "$" + $.format.number(marketing, "##.00"), item.labelX, item.labelY );
                ctx.font = LABEL_FONT;
                ctx.fillText( "Perceived value", item.labelX - 50, item.labelY );
                break;
            case 4:
                ctx.fillStyle = OBJ_COL;
                ctx.fillRect( X, item.y, WIDTH, H);
                ctx.font = VALUE_FONT;
                ctx.textAlign = 'right';
                ctx.fillStyle = TEXT_COL;
                ctx.fillText( "$" + $.format.number(OBJECTIVE_VALUE, "##.00"), item.labelX, item.labelY );
                ctx.font = LABEL_FONT;
                ctx.fillText( "True economic value", item.labelX - 50, item.labelY );
                break;
        }
    }

    Y = Y0 - cogs*SCALE;
    h = (productPrice - cogs)*SCALE;
    Y -= h;
    descY = Y + h/2;

    if( h >= 0 )
    {
        drawBracket(ctx, BRACKET_X_POS2, Y, h);
        ctx.fillStyle = TEXT_COL;
        ctx.font = DESC_VALUE_FONT;
        ctx.textAlign = 'left';
        ctx.fillText( "+$" + $.format.number(productPrice - cogs, "##.00"), BRACKET_X_POS2 + BRACKET_TEXT_OFFSET, descY + DESC_POS[0] );
        ctx.font = DESC_FONT;
        ctx.fillText( "Firm's", BRACKET_X_POS2 + BRACKET_TEXT_OFFSET, descY + DESC_POS[1] );
        ctx.fillText( "incentive", BRACKET_X_POS2 + BRACKET_TEXT_OFFSET, descY + DESC_POS[2] );
        ctx.fillText( "to sell", BRACKET_X_POS2 + BRACKET_TEXT_OFFSET, descY + DESC_POS[3] );
    }
    else
    {
        drawBracket(ctx, BRACKET_X_POS2, Y+h, -h, true);
        ctx.fillStyle = TEXT_COL_NEG;
        ctx.font = DESC_VALUE_FONT;
        ctx.textAlign = 'left';
        ctx.fillText( "-$" + $.format.number(cogs - productPrice, "##.00"), BRACKET_X_POS2 + BRACKET_TEXT_OFFSET, descY + DESC_POS[0] );
        ctx.font = DESC_FONT;
        ctx.fillText( "Firm's", BRACKET_X_POS2 + BRACKET_TEXT_OFFSET, descY + DESC_POS[1] );
        ctx.fillText( "incentive", BRACKET_X_POS2 + BRACKET_TEXT_OFFSET, descY + DESC_POS[2] );
        ctx.fillText( "to sell", BRACKET_X_POS2 + BRACKET_TEXT_OFFSET, descY + DESC_POS[3] );
    }

    Y = Y0 - (marketing)*SCALE;
    h2 = (marketing - productPrice) *SCALE;
    descY = Y + h2/2;

    if( h2 >= 0 )
    {
        drawBracket(ctx, BRACKET_X_POS1, Y, h2);
        ctx.fillStyle = TEXT_COL;
        ctx.font = DESC_VALUE_FONT;
        ctx.textAlign = 'left';
        ctx.fillText( "+$" + $.format.number(marketing - productPrice, "##.00"), BRACKET_X_POS1 + BRACKET_TEXT_OFFSET , descY + DESC_POS[0] );
        ctx.font = DESC_FONT;
        ctx.fillText( "Consumer's", BRACKET_X_POS1 + BRACKET_TEXT_OFFSET, descY + DESC_POS[1] );
        ctx.fillText( "incentive", BRACKET_X_POS1 + BRACKET_TEXT_OFFSET , descY + DESC_POS[2] );
        ctx.fillText( "to purchase", BRACKET_X_POS1 + BRACKET_TEXT_OFFSET , descY + DESC_POS[3] );
    }
    else
    {
        drawBracket(ctx, BRACKET_X_POS1, Y + h2, -h2, true);
        ctx.fillStyle = TEXT_COL_NEG;
        ctx.font = DESC_VALUE_FONT;
        ctx.textAlign = 'left';
        ctx.fillText( "-$" + $.format.number(productPrice - marketing, "##.00"), BRACKET_X_POS1 + BRACKET_TEXT_OFFSET , descY + DESC_POS[0] );
        ctx.font = DESC_FONT;
        ctx.fillText( "Consumer's", BRACKET_X_POS1 + BRACKET_TEXT_OFFSET, descY + DESC_POS[1] );
        ctx.fillText( "incentive", BRACKET_X_POS1 + BRACKET_TEXT_OFFSET, descY + DESC_POS[2] );
        ctx.fillText( "to purchase", BRACKET_X_POS1 + BRACKET_TEXT_OFFSET, descY + DESC_POS[3] );
    }
}

var DESC_POS = [ -8, 6, 18, 30 ];
var BAR_HEIGHT = 12;
var BRACKET_WIDTH = 70;
var BRACKET_ARM_WIDTH = 10;
var BRACKET_ARM_HEIGHT = 3;
var MIN_BRACKET_HEIGHT = 42;

function drawBracket(ctx, xPos, yPos, height, negative)
{
    ctx.fillStyle = BRACKET_COL;
    //top arm
    ctx.fillRect( xPos, yPos, BRACKET_ARM_WIDTH, BRACKET_ARM_HEIGHT);
    //bottom arm
    ctx.fillRect( xPos, yPos + height - BRACKET_ARM_HEIGHT + BAR_HEIGHT, BRACKET_ARM_WIDTH, BRACKET_ARM_HEIGHT);
    //main rect
    if( height > MIN_BRACKET_HEIGHT )
    {
        ctx.fillRect( xPos + BRACKET_ARM_WIDTH, yPos, BRACKET_WIDTH, height + BAR_HEIGHT);
    }
    else
    {
        var dh = (MIN_BRACKET_HEIGHT - height)/2;
        ctx.fillRect( xPos + BRACKET_ARM_WIDTH, yPos - dh, BRACKET_WIDTH, MIN_BRACKET_HEIGHT + BAR_HEIGHT);

    }

}


var BRACKET_X_POS1 = 300;
var BRACKET_X_POS2 = 390;
//var VALUE_FONT = "bold 10pt Arial";
var VALUE_FONT = "10pt Arial";
var LABEL_FONT = "10pt Arial";
var DESC_VALUE_FONT = "9pt Arial";
var DESC_FONT = "8pt Arial";

var IMG_W = 12;
