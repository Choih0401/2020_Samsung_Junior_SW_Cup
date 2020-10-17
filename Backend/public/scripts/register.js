var current = null;
document.querySelector('#LoginId').addEventListener('focus', function(e) {
  one();
  if (current) current.pause();
  current = anime({
    targets: '.one',
    strokeDashoffset: {
      value: 0,
      duration: 700,
      easing: 'easeOutQuart'
    },
    strokeDasharray: {
      value: '240 1386',
      duration: 700,
      easing: 'easeOutQuart'
    }
  });
});
document.querySelector('#LoginPasswd').addEventListener('focus', function(e) {
  if($('.two').css('visibility') == 'hidden'){
    one();
    if (current) current.pause();
    current = anime({
        targets: '.one',
        strokeDashoffset: {
        value: -336,
        duration: 700,
        easing: 'easeOutQuart'
        },
        strokeDasharray: {
        value: '240 1386',
        duration: 700,
        easing: 'easeOutQuart'
        }
    });
  }else{
    two();
    if (current) current.pause();
    current = anime({
        targets: '.two',
        strokeDashoffset: {
        value: 0,
        duration: 700,
        easing: 'easeOutQuart'
        },
        strokeDasharray: {
        value: '240 1386',
        duration: 700,
        easing: 'easeOutQuart'
        }
    });
  }
});
document.querySelector('#username').addEventListener('focus', function(e) {
    if($('.three').css('visibility') == 'hidden'){
        two();
        if (current) current.pause();
        current = anime({
            targets: '.two',
            strokeDashoffset: {
            value: -336,
            duration: 700,
            easing: 'easeOutQuart'
            },
            strokeDasharray: {
            value: '240 1386',
            duration: 700,
            easing: 'easeOutQuart'
            }
        });
      }else{
        three();
        if (current) current.pause();
        current = anime({
            targets: '.three',
            strokeDashoffset: {
            value: 0,
            duration: 700,
            easing: 'easeOutQuart'
            },
            strokeDasharray: {
            value: '240 1386',
            duration: 700,
            easing: 'easeOutQuart'
            }
        });
      }
  });

  document.querySelector('#resident').addEventListener('focus', function(e) {
    
        three();
        if (current) current.pause();
        current = anime({
            targets: '.three',
            strokeDashoffset: {
            value: -336,
            duration: 700,
            easing: 'easeOutQuart'
            },
            strokeDasharray: {
            value: '240 1386',
            duration: 700,
            easing: 'easeOutQuart'
            }
        });
  });

document.querySelector('#submit').addEventListener('focus', function(e) {
  three();
  if (current) current.pause();
  current = anime({
    targets: '.three',
    strokeDashoffset: {
      value: -730,
      duration: 700,
      easing: 'easeOutQuart'
    },
    strokeDasharray: {
      value: '530 1386',
      duration: 700,
      easing: 'easeOutQuart'
    }
  });
});

function one(){
    if($('.one').css('visibility') == 'hidden'){
        $('.one').css('visibility', 'visible')
        $('.two').css('visibility', 'hidden')
        $('.three').css('visibility', 'hidden')
    }
}

function two(){
    if($('.two').css('visibility') == 'hidden'){
        $('.two').css('visibility', 'visible')
        $('.one').css('visibility', 'hidden')
        $('.three').css('visibility', 'hidden')
    }
}

function three(){
    if($('.three').css('visibility') == 'hidden'){
        $('.three').css('visibility', 'visible')
        $('.one').css('visibility', 'hidden')
        $('.two').css('visibility', 'hidden')
    }
}