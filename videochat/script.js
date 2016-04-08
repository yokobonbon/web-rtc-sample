function VideoviewController() {
  var myvideo = document.getElementById('myvideo');
  var yourvideo = document.getElementById('yourvideo');

  return {
    setMyVideo:function(stream) {
      myvideo.src = window.URL.createObjectURL(stream);
    },
    setYourVideo:function(stream) {
      yourvideo.src = window.URL.createObjectURL(stream);
    }
  }
}

function MediaController(view_controller) {
  var localStream = null;

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  navigator.getUserMedia({video: true, audio: true},
    function(stream) {
      view_controller.setMyVideo(stream);
      localStream = stream;
    },
    function(error) {
      alert(error);
    }
  );

  return {
    getLocalStream : function() { return localStream; },
  };
}

function PeerController(view_controller, media_controller) {
  var peer = new Peer({key: '<your API key>', debug: 3});
  var dataConnection = null;

  peer.on('open', function(id){
    var peerid = document.getElementById('peerid');
    peerid.innerHTML = 'Peer ID: ' + id;
  });

  peer.on('call', function(media){
    media.answer(media_controller.getLocalStream());
    media.on('stream', function(stream) {
      view_controller.setYourVideo(stream);
    });
  });

  peer.on('close', function(){
    peer.destory();
  });

  peer.on('error', function(err){
    alert(err);
  });

  function call(peerid) {
    var media = peer.call(peerid, media_controller.getLocalStream());
    media.on('stream', function(stream) {
      view_controller.setYourVideo(stream);
    });
  }

  return {
    startCall : function() {
      peer.listAllPeers(function(remoteIds) {
        if (remoteIds.length > 0) {
          call(remoteIds[0]);
        } else {
          alert("remote not found");
        }
      });
    }
  }
}

function initialize() {
  var view_controller = new VideoviewController();
  var media_controller = new MediaController(view_controller);
  peer_controller = new PeerController(view_controller, media_controller);

  var call_button = document.getElementById('callbtn');
  call_button.onclick = peer_controller.startCall;
}

window.addEventListener('load', initialize);
