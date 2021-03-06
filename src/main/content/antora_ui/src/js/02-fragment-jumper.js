(function () {
  'use strict'

  var article = document.querySelector('article.doc')
  var toolbar = document.querySelector('.toolbar')

  function computePosition (el, sum) {
    var position;
    if (article.contains(el)) {
      position = computePosition(el.offsetParent, el.offsetTop + sum)
    } else {
      position = sum    
    }
    return position;
  }

  function jumpToAnchor (e) {
    if (e) {
      window.location.hash = '#' + this.id
      e.preventDefault()
    }    
    navScroll.preventScrolling();
    window.scrollTo(0, computePosition(this, 0) - $(".toolbar").outerHeight() - 15);
    navScroll.allowScrolling();
  }

  window.addEventListener('load', function jumpOnLoad (e) {
    var hash, target
    if ((hash = window.location.hash) && (target = document.getElementById(hash.slice(1)))) {
      jumpToAnchor.bind(target)()
      setTimeout(jumpToAnchor.bind(target), 0)
    }
    window.removeEventListener('load', jumpOnLoad)
  })

  Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (el) {
    var hash, target
    if ((hash = el.hash.slice(1)) && (target = document.getElementById(hash))) {
      el.addEventListener('click', jumpToAnchor.bind(target))
    }
  })
})()
