var navigation = (function(){
  'use strict';
  var init = function(){
    var $navContainer = $('.nav-container');
    var $navToggle = $('.nav-toggle');

    if ($navContainer.length <= 0) return;

    $navToggle.on('click', showNav);
    $navContainer.on('click', handlePageClick);

    var $menuPanel = $navContainer.find('[data-panel=menu]').eq(0);
    if ($menuPanel.length <= 0) return;

    // fix TOC reference section from html minification changes
    var $referenceNav = $("span:contains(Reference)");
    if($referenceNav.length <= 0) return;
    var $addTo = $referenceNav.next();
    var $start = $referenceNav.parent().next();
    while($start.length > 0){
      var $temp = $start.next();
      $start.appendTo($addTo);
      $start = $temp;
    }

    // Expand all first level doc categories
    $(".nav-menu > .nav-list > .nav-item").addClass('is-active');

    var $currentPageItem = $menuPanel.find('.is-current-page').eq(0);
    if ($currentPageItem.length > 0) {
      activateCurrentPath($currentPageItem);
      scrollItemToMidpoint($currentPageItem.find('.nav-link').eq(0));
    } else {
      $menuPanel.scrollTop(0);
    }

    $($menuPanel).on("click", ".nav-item-toggle", function (){
      $(this).parent().toggleClass('is-active');
    })

    $($menuPanel).on("click", ".nav-text", function (){
      $(this).parent().toggleClass('is-active');
    })

    if($('.components .version').length === 1){
      $('.nav-panel-explore .context .version').addClass('hide-after');
      $('.nav-panel-explore .context').css('pointer-events', 'none');
    }

    $('.nav-container .nav .context').on('click', function () {
      var $currentPanel = $('.nav .is-active[data-panel]');
      var activatePanel = $currentPanel[0].dataset.panel === 'menu' ? 'explore' : 'menu';
      $currentPanel.toggleClass('is-active');
      $('.nav [data-panel=' + activatePanel + ']').toggleClass('is-active');
    });

    $(document).on('click', handlePageClick);

    $('.nav-menu > .nav-list').on('scroll', function(e){
      e.stopPropagation();
    });

    $(document).on('keydown', function(e){
        if(e.which === 27){
          closeVersionPicker();
        }
    });

    // NOTE prevent text from being selected by double click
    $menuPanel.on('mousedown', function (e) {
      if (e.detail > 1) e.preventDefault();
    });

    $('#filter_titles').on('keyup', filterNavTitles);

    $('#clear_filter').on("click", function () {
      $('#filter_titles').val('');
      filterNavTitles();
    })
  };

  $('.components .versions li a').on('click', function(e){
    e.stopPropagation();
    location.href = $(this)[0].href;
    closeVersionPicker();
  });

  $('.components .versions li').on('click', function(e) {
    e.stopPropagation();
    var li = $(this);
    var anchor = li.find('a');
    anchor.click();
  });

  function activateCurrentPath (navItem) {
    var ancestor = navItem.parent();
    while (!(ancestor.hasClass('nav-menu'))) {
      if (ancestor.prop('tagName') === 'LI' && ancestor.hasClass('nav-item')) {
        ancestor.addClass('is-active is-current-path');
      }
      ancestor = ancestor.parent();
    }
    navItem.addClass('is-active is-current-page');
  }

  // Detect if the version switcher is open to close it when clicking somewhere else.
  function handlePageClick (e) {
    e.stopPropagation();
    if($('.context')[0].contains(e.target)){
      return;
    }
    if($('.components:visible').length > 0){
      if(!$('.components')[0].contains(e.target)){
        closeVersionPicker();
      }
    }
  }


  function closeVersionPicker (e) {
    if($('.nav-panel-explore').hasClass('is-active')){
      $('.nav-panel-explore').toggleClass('is-active');
      $('.nav-panel-menu').toggleClass('is-active'); // Change active panel to the nav menu
    }
  }

  function showNav (e) {
    if ($('.nav-toggle').hasClass('is-active')) return hideNav(e);
    $('html').addClass('is-clipped--nav');
    $('.nav-toggle').addClass('is-active');
    $('.nav-container').addClass('is-active');
    $('html').on('click', hideNav);
    e.stopPropagation();
  }

  function hideNav (e) {
    $('.nav-toggle').removeClass('is-active');
    $('.nav-container').removeClass('is-active');
    $('html').removeClass('is-clipped--nav');
    $('html').off('click', hideNav);
    e.stopPropagation();
  }

  function scrollItemToMidpoint (el) {
    var $nav = $('.nav-container nav');
    var $panel = $('.nav-container [data-panel=menu]');
    var rect = $panel[0].getBoundingClientRect();
    var effectiveHeight = rect.height;
    if ($nav.css("position") === 'sticky') effectiveHeight -= rect.top - parseFloat($nav.css("top"));

    var elementHeight = el[0].getBoundingClientRect().height;
    if ((el.offset().top + elementHeight) > effectiveHeight) {
      // If you must scroll to see the TOC element, then move TOC so that the element
      // is displayed about the middle of the TOC.
      $panel.scrollTop(Math.max(0, (elementHeight - effectiveHeight) * 0.5 + el.offset().top));
    } else {
      // Else, just leave the user on the initial TOC (at the top) with the element highlighted.
      $panel.scrollTop(0);
    }
  }

  //Filter article titles in TOC using text input
  function filterNavTitles(){
    let input = $('#filter_titles').val().toLowerCase();
    let title_match=false;
    if(input==='' ){
      $('#clear_filter, .no-results-container').hide();
      $(".nav-menu > .nav-list > .nav-item").addClass('is-active');
      $('.nav-menu > .nav-list >.nav-item .nav-item').has('.nav-item-toggle').removeClass('is-active');
      $('.nav-item').each(function() {
        if ($(this).css('display') === 'none') {
            $(this).css('display', '');
        }
      });
      return;
    } 
    $('#clear_filter').show();
    let articles = $('.nav-link , .nav-menu .nav-text');
    articles.parent().hide();
    articles.each(function() {
      let article = $(this);
      let title = article.text().toLowerCase();
      if (title.includes(input)) {
        title_match=true;
        $('.no-results-container').hide();
        article.parent().show();
        article.parent().has('.nav-item-toggle').removeClass('is-active');
        showAncestors(article.parent());
        showDescendants(article.parent());
      }
    });
    if(!title_match){
      $('.no-results-container').show();
    }
  }

  function showAncestors(item){
    let parent = item.parents('.nav-item');
    parent.each(function() {
      $(this).show();
      $(this).has('.nav-item-toggle').addClass('is-active');
    });
  }

  function showDescendants(item) {
    let children = item.find('.nav-item');
    children.each(function() {
      $(this).show();
      $(this).has('.nav-item-toggle').removeClass('is-active');
    });
  }

  return {
    init: init,
    activateCurrentPath: activateCurrentPath,
    scrollItemToMidpoint: scrollItemToMidpoint
  };
})();
navigation.init();
