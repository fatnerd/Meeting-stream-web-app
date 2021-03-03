// const { text } = require("express");

const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

// leave
// const peers = {}

var peer = new Peer(undefined,{
    path:'/peerjs',
    host:'/',
    port:'3030'
}); 

let videoStream;
let start = document.getElementsByClassName('.record');
let stop = document.getElementsByClassName('.stop');
let buffer;
let mediaRecorder;
let option = {
    type:'video/mp4'
};

navigator.mediaDevices.getUserMedia({
    video : true,
    audio : true,

}).then(stream =>{
    videoStream = stream;
    addVideoStream(myVideo,stream);
    // recordrtc start
    // let recorder = RecordRTC(stream,{
    //     type:'video/mp4'
    // });
    // recorder.startRecording();
    

    peer.on('call',call =>{
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream =>{
            addVideoStream(video,userVideoStream)
        })
        
    }) 
    socket.on('user-connected',(userId) =>{
        console.log(userId)
        connectToNewUser(userId,stream);
    })
    
    let msg = $('input');

    $('html').keydown((e) =>{
        if (e.which == 13 && msg.val().length != 0) {
            console.log(msg.val())
            socket.emit('message',msg.val());
            msg.val('');
        }
    });

    socket.on('createMessage',message =>{
        $('.message').append(`<li class="message"><b>user</b><br/>${message}</li>`);
    })
    // recordrtc timer
    // const sleep = m => new Promise(r => setTimeout(r, m));
    // sleep(3000);
    
    // recordrtc stop
    // recorder.stopRecording(function() {
    //     let blob = recorder.getBlob();
    //     invokeSaveAsDialog(blob);
    // });
})
// leave
// socket.on('user-disconnected', userId =>{
//     if(peers[userId]) peers[userId].close()
// })



peer.on('open',id =>{
    socket.emit('join-room',Room_Id,id);
})

const connectToNewUser = (userId,stream) =>{
    const call = peer.call(userId,stream)
    const video = document.createElement('video')
    call.on('stream',userVideoStream =>{
        addVideoStream(video,userVideoStream)
    })
    // leave
    // call.on('close',()=>{
    //     video.remove()
    // })
    // peers[userId] = call
}

const addVideoStream = (video,stream) =>{
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',() =>{
        video.play()
    })
    videoGrid.append(video)
}

const scrollToBottom = () =>{
    let d = $('.chat_message');
    d.scrollTop(d.drop("scrollHeight"));
}

const muteUnmute =() =>{
    console.log(videoStream)
    const enabled = videoStream.getAudioTracks()[0].enabled;
    if (enabled){
        videoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else{
        setMuteButton();
        videoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () =>{
    const html = `<i class=" mute fas fa-microphone"></i>
    <span>Mute</span>
    `
    document.querySelector('.mute_btn').innerHTML = html;
}

const setUnmuteButton = () =>{
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `
    document.querySelector('.mute_btn').innerHTML = html;
}

const playStop = () =>{
    let enabled = videoStream.getVideoTracks()[0].enabled;
    if (enabled){
        videoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    }
    else{
        setStopVideo()
        videoStream.getVideoTracks()[0].enabled= true;
    }
}

const setPlayVideo = () =>{
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play</span>
    `
    document.querySelector('.video_btn').innerHTML = html;
}

const setStopVideo = () =>{
    const html =`
    <i class="fas fa-video"></i>
    <span>Stop</span>
    `
    document.querySelector('.video_btn').innerHTML= html;
}

function isDataAvailable(e){
    if (e && e.data && e.data.size > 0){
        buffer.push(e.data);
    }
}

function startRecord(){
    buffer = [];
    let options = {
        mimeType:'video/webm;codecs=vp8'
    };
    if(!MediaRecorder.isTypeSupported(options.mimeType)){
        console.log(`$(options.mimetype) is not supported`);
        return
    }
    try {
        mediaRecorder = new MediaRecorder(videoStream,options)
    } catch (error) {
        console.log('Create MediaRecorder fail.',error) 
    }
    mediaRecorder.ondataavailable = isDataAvailable;
    mediaRecorder.start(10);
    console.log('recording');
};

function stopRecord(){
    mediaRecorder.stop();
}

const recordStop = () => {
    let enabled = videoStream.getTracks()[0].enabled; 
    if(enabled){
        videoStream.getTracks()[0].enabled= false;
        startRecord();
        setRecord();
        
    }
    else{
        stopRecord();
        setstopRecord();
        videoStream.getTracks()[0].stop()
        videoStream.getTracks()[0].enabled= true;
    }
};

const setRecord = () =>{
    const html = `
    <i class="fas fa-record-vinyl"></i>
    <span class="record">Record</span>

    `
    document.querySelector('.record_btn').innerHTML = html;
}

const setstopRecord = () =>{
    const html =`
    <i class="fas fa-stop"></i>
    <span class="stop">Stop record</span>
    `
    document.querySelector('.record_btn').innerHTML = html;
}

const downloadVideo = () =>{
    let blob = new Blob(buffer,option);
    let url = window.URL.createObjectURL(blob);
    let file = document.createElement('a');
    file.href = url;
    file.style.display = 'none';
    file.download = 'f.webm';
    file.click();
}

// const leave = ()=>{
//     const html = `
//     <i class="fas fa-sign-out-alt"></i>
//     <span class="leave_meeting">Leave Meeting</span>
//     `
// }