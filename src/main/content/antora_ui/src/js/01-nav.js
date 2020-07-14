var navigation = (function(){
  'use strict';
  var init = function(){
    var navContainer = document.querySelector('.nav-container');
    var navToggle = document.querySelector('.nav-toggle');

    if (!navContainer) return;

    navToggle.addEventListener('click', showNav);
    navContainer.addEventListener('click', handlePageClick);

    var menuPanel = navContainer.querySelector('[data-panel=menu]');
    if (!menuPanel) return;

    var currentPageItem = menuPanel.querySelector('.is-current-page');
    if (currentPageItem) {
      activateCurrentPath(currentPageItem);
      scrollItemToMidpoint(currentPageItem.querySelector('.nav-link'));
    } else {
      menuPanel.scrollTop = 0;
    }

    find(menuPanel, '.nav-item-toggle').forEach(function (btn) {
      var li = btn.parentElement;
      btn.addEventListener('click', toggleActive.bind(li));
      var navItemSpan = findNextElement(btn, '.nav-text');
      if (navItemSpan) {
        navItemSpan.style.cursor = 'pointer';
        navItemSpan.addEventListener('click', toggleActive.bind(li));
      }
    });

    document.querySelector('.nav-container .nav .context').addEventListener('click', function () {	
      var currentPanel = document.querySelector('.nav .is-active[data-panel]');
      var activatePanel = currentPanel.dataset.panel === 'menu' ? 'explore' : 'menu';	
      currentPanel.classList.toggle('is-active');
      document.querySelector('.nav [data-panel=' + activatePanel + ']').classList.toggle('is-active');
    });

    document.addEventListener('click', handlePageClick);

    $('.nav-menu > .nav-list').on('scroll', function(e){
      concealEvent(e);
    });

    document.addEventListener('keydown', function(e){
        if(e.which === 27){
          closeVersionPicker();
        }
    });

    // NOTE prevent text from being selected by double click
    menuPanel.addEventListener('mousedown', function (e) {
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

  function find (from, selector) {
    return [].slice.call(from.querySelectorAll(selector))
  }

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
    var ancestorClasses;
    var ancestor = navItem.parentNode;
    while (!(ancestorClasses = ancestor.classList).contains('nav-menu')) {
      if (ancestor.tagName === 'LI' && ancestorClasses.contains('nav-item')) {
        ancestorClasses.add('is-active', 'is-current-path');
      }
      ancestor = ancestor.parentNode;
    }
    navItem.classList.add('is-active', 'is-current-page');
  }

  function toggleActive () {
    this.classList.toggle('is-active');
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
    var navToggle = document.querySelector('.nav-toggle');
    var navContainer = document.querySelector('.nav-container');
    if (navToggle.classList.contains('is-active')) return hideNav(e)
    var html = document.documentElement;
    html.classList.add('is-clipped--nav');
    navToggle.classList.add('is-active');
    navContainer.classList.add('is-active');
    html.addEventListener('click', hideNav);
    concealEvent(e);
  }

  function hideNav (e) {
    var navToggle = document.querySelector('.nav-toggle');
    var navContainer = document.querySelector('.nav-container');
    var html = document.documentElement;
    html.classList.remove('is-clipped--nav');
    navToggle.classList.remove('is-active');
    navContainer.classList.remove('is-active');
    html.removeEventListener('click', hideNav);
    concealEvent(e);
  }

  // NOTE don't let event get picked up by window click listener
  function concealEvent (e) {
    e.stopPropagation();
  }

  function scrollItemToMidpoint (el) {
    var nav = document.querySelector('.nav-container nav');
    var panel = document.querySelector('.nav-container [data-panel=menu]');
    var rect = panel.getBoundingClientRect();
    var effectiveHeight = rect.height;
    var navStyle = window.getComputedStyle(nav);
    if (navStyle.position === 'sticky') effectiveHeight -= rect.top - parseFloat(navStyle.top);
    panel.scrollTop = Math.max(0, (el.getBoundingClientRect().height - effectiveHeight) * 0.5 + el.offsetTop);
  }

  return {
    init: init,
    activateCurrentPath: activateCurrentPath,
    scrollItemToMidpoint: scrollItemToMidpoint
  };
})();
navigation.init();
