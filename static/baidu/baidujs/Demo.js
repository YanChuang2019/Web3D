
$(document).ready(function() {



$('#Notice-4').click(function() {
  
  new jBox('Notice', {
    attributes: {
      x: 'right',
      y: 'bottom'
    },
    stack: false,
    animation: {
      open: 'tada',
      close: 'zoomIn'
    },
    color: getColor(),
    title: 'Tadaaa! I\'m single',
    content: 'Open another notice, I won\'t stack'
  });
  
});

var colors = ['red', 'green', 'blue', 'yellow'], index = 0;
var getColor = function () {
  (index >= colors.length) && (index = 0);
  return colors[index++];
};
});

