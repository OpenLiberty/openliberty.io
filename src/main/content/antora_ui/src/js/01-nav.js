$(document).ready(function() {
  if((window.location.pathname).includes("/ja/")||(window.location.pathname).includes("/zh-Hans/")){
     $('.doc_select.language_select .components .version a').each(function() {
      var $this = $(this);
      href= $this.attr('href');
      if (href.includes("../../")) {
        var newHref = $this.attr('href').replace(/^(\.\.\/)+/, '');      
        // Ensure the URL starts with a leading slash
        if (!newHref.startsWith('/')) {
          newHref = '/' + newHref;
        }       
        $this.attr('href', newHref);
      }
    });
  }
});


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
    if($referenceNav.length > 0) {
      var $addTo = $referenceNav.next();
      var $start = $referenceNav.parent().next();
      while($start.length > 0){
        var $temp = $start.next();
        $start.appendTo($addTo);
        $start = $temp;
      }
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

    if((window.location.pathname).includes("/ja/")){
      $(".doc_select.language_select .context .version").text("日本語");
      $('.doc_select.language_select .components .version.is-current').removeClass("is-current");
      $('.doc_select.language_select .components .version a:contains("日本語")').parent().addClass("is-current");
    } else if ((window.location.pathname).includes("/zh-Hans/")){
      $(".doc_select.language_select .context .version").text("中文（简体)");
      $('.doc_select.language_select .components .version.is-current').removeClass("is-current");
      $('.doc_select.language_select .components .version a:contains("中文（简体)")').parent().addClass("is-current");
    } else {
      $(".doc_select.language_select .context .version").text("English");
      $('.doc_select.language_select .components .version.is-current').removeClass("is-current");
      $('.doc_select.language_select .components .version a:contains("English")').parent().addClass("is-current");
    }

    $($menuPanel).on("click", ".nav-item-toggle", function (){
      $(this).parent().toggleClass('is-active');
    })

    $($menuPanel).on("click", ".nav-text", function (){
      $(this).parent().toggleClass('is-active');
    })

    if($('.components .version').length === 1){
      $('.nav-panel-explore .context').css('pointer-events', 'none');
    }

    $('.nav-container .nav .context').on('click', function () {
      var $other = $(this).parent().siblings().eq(0)
      if($other.hasClass('is-active')){
        $other.removeClass('is-active');
      }
      $(this).parent().addClass('is-active');
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

  };

  $('.components .versions li a').on('click', function(e){
    e.stopPropagation();
    window.location.replace($(this)[0].href);
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
    if($('.context')[0].contains(e.target) || $('.context')[1].contains(e.target)){
      return;
    }
    if($('.components:visible').length > 0){
      if(!$('.components')[0].contains(e.target)){
        closeVersionPicker();
      }
    }

  }


  function closeVersionPicker (e) {
    $(".doc_select").each(function(){
      if($(this).hasClass('is-active')){
        $(this).removeClass('is-active');
      }
    });
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

  return {
    init: init,
    activateCurrentPath: activateCurrentPath,
    scrollItemToMidpoint: scrollItemToMidpoint
  };
})();
navigation.init();
