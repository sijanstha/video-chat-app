let Peer = require('simple-peer')
let socket = io()
const localVideo = document.getElementById('local-video')

// every thing related with other person
let client = {}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const username = urlParams.get('username');
const roomId = urlParams.get('roomid');

// get stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        socket.emit('NewClient', ({ username, roomId }))
        localVideo.srcObject = stream
        localVideo.play()

        showWaitingMessage();

        // used to initialize a peer
        function initPeer(type) {
            // initiator specifies that whether peer will by itself call the signal function or not
            // trickle: multiple signal function
            let peer = new Peer({ initiator: (type == 'init') ? true : false, stream: stream, trickle: false })

            // we get stream from another user
            peer.on('stream', (stream) => {
                removeWaitingMessage();
                createVideo(stream);
            })

            // when our peer is closed
            peer.on('close', () => {
                document.getElementById("remote-video").remove()
                peer.destroy()
            })

            return peer
        }

        function removeVideo() {
            document.getElementById("remote-video").remove()
            showWaitingMessage();
        }

        // for peer of type init, it will send the offer itself
        function makePeer() {

            // this is because when we send offer we will wait for anser till then we have said false
            client.gotAnswer = false
            let peer = initPeer('init')

            // calls automatically no need to call
            peer.on('signal', (data) => {
                if (!client.gotAnswer) {
                    socket.emit('Offer', { roomId: roomId, data: data })
                }
            })

            client.peer = peer
        }

        // for peer of type not init, we won't send offer, we will wait for offer and send answer 
        // used when we get offer from another client
        function frontAnswer(offer) {
            console.log('inside front answer-->', offer);

            let peer = initPeer('notinit')

            // don't run automatically we have to call it
            peer.on('signal', (data) => {
                socket.emit('Answer', { roomId: roomId, data: data })
            })
            peer.signal(offer)
        }


        // this function will handle when answer comes from backend
        function signalAnswer(answer) {
            client.gotAnswer = true
            let peer = client.peer
            peer.signal(answer)
        }


        function createVideo(stream) {
            let remoteVideo = document.createElement('video')
            remoteVideo.srcObject = stream
            remoteVideo.className = 'remote-video'
            remoteVideo.id = 'remote-video'
            remoteVideo.muted = true
            remoteVideo.play()
            document.getElementById('video-container').appendChild(remoteVideo)
        }

        function sessionActive() {
            document.write('Session Active, Please come back later')
        }

        function showWaitingMessage() {
            let waitingMessage = document.createElement('p');
            waitingMessage.id = 'waiting-msg';
            waitingMessage.innerText = 'Waiting for another person to join....';
            document.getElementById('video-container').appendChild(waitingMessage);
        }

        function removeWaitingMessage() {
            document.getElementById('waiting-msg').remove();
        }

        socket.on('BackOffer', frontAnswer)
        socket.on('BackAnswer', signalAnswer)
        socket.on('SessionActive', sessionActive)
        socket.on('CreatePeer', makePeer)
        socket.on('RemoveVideo', removeVideo)

    })
    .catch(err => document.write(err))