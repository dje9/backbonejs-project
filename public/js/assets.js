function start() {

  var items = document.getElementsByTagName('li');


  function xmlHttpRequest(id, data) {

    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = onreadystatechange;

    function onreadystatechange() {
      if (ajax.readyState === 4) {
        //alert(ajax.response);
      }
    }



    ajax.open('PUT', '/admin/pies/' + id, true, 'piechef', '12345');
    ajax.setRequestHeader('Content-type', 'application/json');

    var json = JSON.stringify(data);

    ajax.send(json);
  }

  var i;

  for (i = 0; i < items.length; i++) {
    var li = items.item(i);


    var divs = li.getElementsByClassName('status');
    var j;

    for (j = 0; j < divs.length; j++) {

      divs.item(j).onclick = function (e) {

        var ctp = e.currentTarget.parentElement;
        var id = ctp.getAttribute('data-id');
        var css = ctp.className;
        var p = e.target;

        var data = {
          state: p.innerText,
          type: css
        }


        xmlHttpRequest(id, data);
      };
    }

  }

}

function startSocket(){
  var socket = io.connect('http://localhost:3000');
  socket.on('task:welcome', function (data) {
    alert(data);
    //socket.emit('my other event', { my: 'data' });
  });
}

startSocket();
start();