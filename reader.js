var PageCollection = {};
var IDCollection = {};
var ChapterCollection = {}; /* keep track of the chapter and what page it starts with for links that don't have hash */
var ImageURLForPopup = '';

var Controller = {
  pageCount: 0,
  currentPage: 1,
  filePathList: [],
  fileTitleList: [],
  init: function() {

    this.bindEvents();
    this.loadTOC();
  },

  bindEvents: function() {
    $('#toc-button').click(function(e) {
      e.stopPropagation();
      Controller.toggleTOC();
      if ($('#navigation-jump-menu').is(":visible")) { Controller.toggleJump() } 
    });

    $('#navigation-jump').click(function(e) {
      $('#pageNumber').focus();
      e.stopPropagation();
      Controller.toggleJump();
      if ($('#toc-menu').is(":visible")) { Controller.hideTOC() } 
    });

    $('#navigation-previous').click(function() {
      Controller.previousPage();
    });

    $('#navigation-next').click(function() {
      Controller.nextPage();
    });


    $("body").on("keydown", function(e){
      if(e.keyCode === 37) {
        Controller.previousPage();
      }
      else if(e.keyCode === 39) {
        Controller.nextPage();     
      }

    });
	
	$('#ie-close').click(function() {
	      $('#ie-upgrade').fadeToggle();
	    });
  },
  hideTOC: function() {
    $('#toc-menu').hide();
  },
  toggleTOC: function() {
    $('#toc-menu').toggle();
  },
  toggleJump: function() {
    $('#navigation-jump-menu').toggle();
    if ($('#navigation-jump-menu').is(":visible")) {
      $('#navigation-jump-menu #pageNumber').focus();
    } else {
      $('#navigation-jump-menu #pageNumber').blur();
    }
  },

  loadTOC: function() {

    /* if (console && console.clear) console.clear(); */


    $.get( "OPS/html/nav.xhtml", function(xmlDoc) {
      Controller.xmlDocTOC = xmlDoc;

      $('#toc a', xmlDoc).each(function() {
        var url = $(this).attr('href');

        if (url.indexOf('#') > -1) {
          url = url.substring(0, url.indexOf('#'));
        }

        if ($.inArray(url, Controller.filePathList) === -1) {
          Controller.filePathList.push(url);
          Controller.fileTitleList.push($(this).text());
        }

      });

      for (var i = 0; i < Controller.filePathList.length; i++) {
        var filePath = Controller.filePathList[i];
        var fileTitle = Controller.fileTitleList[i];

        $.ajax({
          url: 'OPS/html/' + filePath,
          dataType: 'xml',
          async: false
        }).done(function(chapterDoc) {
          var $divPages = $('div[class=page]', chapterDoc);

          if (typeof ChapterCollection[filePath] === 'undefined') {
            /* keep track of the chapter and what page it starts with for links that don't have hash */
            ChapterCollection[filePath] = {
              pageNumber: Controller.pageCount + 1
            }
          }

          $divPages.each(function() {

            var pageCount = ++Controller.pageCount;

            if (typeof PageCollection[pageCount] === 'undefined') {
              PageCollection[pageCount] = {};
            }

            var xmlDom = this;

            /* repoint image paths */
            $('img', xmlDom).each(function(index) {
              /* getAttribute returns pathname instead of full URL */
              this.src = this.getAttribute('src').replace('../', 'OPS/');
            });

            $('video', xmlDom).each(function(index) {
              /* getAttribute returns pathname instead of full URL */
              this.setAttribute('poster', this.getAttribute('poster').replace('../', 'OPS/'));
            });

            PageCollection[pageCount].xmlDom = xmlDom;
            PageCollection[pageCount].title = fileTitle;

            $('[id]', this).each(function() {
              var id = this.id;
              if (typeof IDCollection[id] === 'undefined') {
                IDCollection[id] = {};
              }
              IDCollection[id].xmlDom = xmlDom;
              IDCollection[id].pageNumber = pageCount;
            });

          });

        });		    

      }


      Controller.handleHashChange(); /* hash change navigation */

      $('#toc-menu').append(xmlDoc.getElementById('toc').cloneNode(true));

      $('#toc-menu a').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        Controller.handleAnchorClick(this);
        Controller.toggleTOC();
      });

      $('#navigation-jump-menu-header form').submit(function(e) {
        e.preventDefault();
      })


      $('#navigation-jump-menu-header form #pageNumber').keyup(function(e){
        if(e.keyCode == 13) {
          var pageNumber = parseInt($.trim($(this).val()), 10);

          if ($.isNumeric(pageNumber)) {
            if (pageNumber > 0 && pageNumber <= Controller.pageCount) {
              location.hash = 'reader-page-' + pageNumber;
              Controller.toggleJump();
            } else {
              alert('Page number out of range!');
            }
          } else {
            alert('Not a valid page number!');
          };
        }
      });

    }, 'xml');
  },

  loadPage: function(pageNumber) {
    /* console.log('load page ' + pageNumber); */
    var page = PageCollection[pageNumber];

    if (page) {
      var currentPage = Controller.currentPage = pageNumber;
      Controller.updatePagingInfo();

      if (pageNumber == 1) {
        $('#navigation-previous').addClass('navigation-disable');
      } else {
        $('#navigation-previous').removeClass('navigation-disable');
      }

      if (pageNumber == Controller.pageCount) {
        $('#navigation-next').addClass('navigation-disable');
      } else {
        $('#navigation-next').removeClass('navigation-disable');
      }

      var $content = $('#content');
      $content.empty().append(page.xmlDom.cloneNode(true));

      var $div = $('<div>').addClass('bottom-paging');
      var $previous = $('<a>').addClass('previous').text('Previous').click(function() { Controller.previousPage() });
      var $divider = $('<span>').addClass('divider').text(' | ');
      var $next = $('<a>').addClass('next').text('Next').click(function() { Controller.nextPage() });

      if (currentPage != 1) {
        $div.append($previous);
      }
      if (currentPage != 1 && currentPage != Controller.pageCount ) {
        $div.append($divider);
      }
      if (currentPage < Controller.pageCount) {
        $div.append($next);
      }
      $content.append($div);

      setTimeout(function() {
        Controller.fixAnchors();
        Controller.fixImages();
        Controller.fixInteractiveURL();
      }, 300);
    }
  },
  previousPage: function() {
    var currentPage = Controller.currentPage;
    var previousPage = currentPage - 1;
    if (previousPage >= 1) {
      location.hash = 'reader-page-' + previousPage;
    }

  },
  nextPage: function() {
    var currentPage = Controller.currentPage;
    var nextPage = currentPage + 1;
    if (nextPage <= Controller.pageCount) {
      location.hash = 'reader-page-' + nextPage;
    }
  },
  updatePagingInfo: function() {
    $('#navigation-paging span').text('Page ' + Controller.currentPage + ' of ' + Controller.pageCount);
  },
  setPageTitle: function(title) {
    $('#navigation-title span').text(title);
  },

  handleAnchorClick: function(anchor) {
    var hash = anchor.hash;
    if (hash && hash.length > 0) {
      /* console.log('handle anchor click - ' + hash); */
      var id = hash.replace('#', '');
      var pageReference = IDCollection[id];

      if (pageReference) {
        location.hash = hash;
      }
    } else {
      /* no hash in link so get file name */
      var fileName = anchor.getAttribute('href'); /* this.pathname returns full path */

      var chapterReference = ChapterCollection[fileName];

      if (chapterReference) { /* if file name is in the ChapterCollection then load it */
        Controller.loadPage(chapterReference.pageNumber);
      } else {
        /* nothing found just go to the link */  

        if (fileName.indexOf('https://') > -1) {
          window.open(fileName);
        } else if (fileName.indexOf('http://') > -1) {
          window.open(fileName);
        } else {
          /* removed 10/10/15 window.open(location = 'OPS/html/' + fileName); */
          window.open(fileName);
        }

      }
    }
  },


  fixInteractiveURL: function() {
    var $a = $('#content .interactive-small-screen figure a');
    var newPath = location.pathname.substr(0, location.pathname.lastIndexOf('/') + 1) + $a.attr('href');
    $a.attr('href', newPath);
  },

  fixAnchors: function() {
    $('#content a').click(function(e) {
      e.preventDefault();
      Controller.handleAnchorClick(this);
    });
  },

  fixImages: function() {
    $('#content img').click(function(e) {
      e.preventDefault();
      var imageURL = window.ImageURLForPopup = this.src;

      if (Controller.inImageIgnoreList(imageURL) === false && this.parentNode.tagName != 'A') {

        var w = window.open('image-viewer.html', '_blank');

      }


    });

  },
  inImageIgnoreList: function(imageURL) {

    var imageIgnoreList = [
      'titlepage_epubversion.png',
      'icon_both.png',
      'icon_interactive.png',
      'video-icon.png',
      'icons_both.png',
      'titlepg.png'
    ];

    var url = imageURL.toLowerCase();

    for (var i = 0; i < imageIgnoreList.length; i++) {
      if (url.indexOf(imageIgnoreList[i]) > -1) return true;
    }

    return false;
  },

  handleHashChange: function() {
    var hashId = location.hash.replace('#', '');

    /* console.log('Hash Change ' + hashId); */

    if (hashId.indexOf('reader-page-') > -1) {
      /* navigate to a page */
      var pageNumber = hashId.replace('reader-page-', '');
      Controller.loadPage(parseInt(pageNumber, 10));
      window.scrollTo(0,0); /* scroll to top when navigating by page */

    } else {
      var pageReference = IDCollection[hashId];

      if (hashId.length > 0 && pageReference) {
        Controller.loadPage(pageReference.pageNumber); /* load the page where that element ID exist */


        setTimeout(function() { //scroll to the element into view
          $('html, body').animate({ scrollTop: ($('#' + hashId).offset().top - 70) },200); // 70 is the adjustment height to account for the topnav
        }, 200);


      } else {
        Controller.loadPage(1);
      }

    }

  }


}


$(document).ready(function() {

  Controller.init();

  $('#navigation-jump-menu').click(function(e) {e.stopPropagation()});
  $('#toc-menu').click(function(e) {e.stopPropagation()});

  $(document).click( function(e) {
    if ($('#toc-menu').is(":visible")) { Controller.hideTOC() } 
    if ($('#navigation-jump-menu').is(":visible")) { Controller.toggleJump() }
  });


  window.addEventListener("hashchange", Controller.handleHashChange, false);


});
