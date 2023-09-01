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
      concealEvent(e);
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

  function findNextElement (from, selector) {
    var el;
    if ('nextElementSibling' in from) {
      el = from.nextElementSibling;
    } else {
      el = from;
      while ((el = el.nextSibling) && el.nodeType !== 1);
    }
    return el && selector ? el[el.matches ? 'matches' : 'msMatchesSelector'](selector) && el : el;
  }

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

  function toggleActive () {
    $(this).toggleClass('is-active');
  }

  // Detect if the version switcher is open to close it when clicking somewhere else.
  function handlePageClick (e) {
    concealEvent(e);
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
    concealEvent(e);
  }

  function hideNav (e) {
    $('.nav-toggle').removeClass('is-active');
    $('.nav-container').removeClass('is-active');
    $('html').removeClass('is-clipped--nav');
    $('html').off('click', hideNav);
    concealEvent(e);
  }

  // NOTE don't let event get picked up by window click listener
  function concealEvent (e) {
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
      $panel.scrollTop(Math.max(0, (elementHeight - effectiveHeight) * 0.5 + el.offsetTop));
    } else {
      // Else, just leave the user on the initial TOC (at the top) with the element highlighted.
      $panel.scrollTop(0);
    }
  }

  return {
    init: init,
    activateCurrentPath: activateCurrentPath,
    scrollItemToMidpoint: scrollItemToMidpoint
  };
})();
navigation.init();
